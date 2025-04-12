import React, { useEffect, useState, useRef, useMemo } from "react";
import { SafeAreaView, Text, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { GOOGLE_API_KEY } from "../../secrets";
import { doc, updateDoc, getDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import ConfettiCannon from 'react-native-confetti-cannon';
import { updateUserStatsOnQuestComplete } from "../utils/userStats";
import { updateDistanceStat } from "../utils/updateDistanceStat";
import { Alert, TouchableOpacity } from "react-native";
import AbandonQuestModal from "../utils/AbandonQuestModal";

const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#8ec3b9" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1a3646" }],
  },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334e87" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3C7680" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const JourneyScreen = ({ route }) => {
  const { destination, quest } = route.params;
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const [showConfetti, setShowConfetti] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(null);
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  // Memoize user origin and destination to prevent unnecessary re-renders
  const origin = useMemo(() => {
    if (!location) return null;
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }, [location]);

  const memoizedDestination = useMemo(() => {
    if (!destination) return null;
    return {
      latitude: destination.geometry.location.lat,
      longitude: destination.geometry.location.lng,
    };
  }, [destination]);

  // Request location permissions and start tracking user's location
  useEffect(() => {
    let subscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation);
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            });
          }
        }
      );
    };

    startTracking();
    return () => subscription?.remove(); // Clean up on unmount
  }, []);

  // Utility function to calculate distance (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Trigger quest completion when user is within 100 meters of destination
  useEffect(() => {
    if (location && destination && !questCompleted) {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        destination.geometry.location.lat,
        destination.geometry.location.lng
      );

      if (distance <= 0.1) {
        setQuestCompleted(true);
        setShowConfetti(true);
        completeRunQuest();
      }
    }
  }, [location]);

  // After showing completion message, navigate back to home screen
  useEffect(() => {
    if (completionMessage) {
      setTimeout(() => {
        setShowConfetti(false);
        navigation.navigate("Home");
      }, 2500);
    }
  }, [completionMessage]);

  // Complete quest and update XP, calories, and distance stats
  const completeRunQuest = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userQuestRef = doc(db, "userQuests", `${userId}_${quest.id}`);
      await updateDoc(userQuestRef, {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      const questRef = doc(db, "quests", quest.id);
      const questSnap = await getDoc(questRef);
      if (questSnap.exists()) {
        const questData = questSnap.data();
        await updateUserStatsOnQuestComplete(userId, questData);

         // Estimate distance from quest goal (km or steps)
        let distanceInKm = 0;
        if (quest.goal.toLowerCase().includes("km")) {
          distanceInKm = parseFloat(quest.goal.toLowerCase().replace("km", "").trim());
        } else {
          distanceInKm = parseFloat(quest.goal) * 0.000762;
        }

        // Update distance stats for cycling or running
        if (quest.title.toLowerCase().includes("cycle")) {
          await updateDistanceStat(userId, distanceInKm, "cyclingDistance");
        } else if (quest.title.toLowerCase().includes("run")) {
          await updateDistanceStat(userId, distanceInKm, "runningDistance");
        }

        setCompletionMessage(`+${questData.xp} XP · ${questData.calories} kcal burned`);
      }
    } catch (error) {
      console.error("❌ Error completing run quest:", error);
    }   
  };

  // Abandon quest and delete from Firestore
  const handleAbandonQuest = async () => {
    try {
      const userId = auth.currentUser?.uid;
      const userQuestRef = doc(db, "userQuests", `${userId}_${quest.id}`);
      await deleteDoc(userQuestRef);
      setShowAbandonModal(false);
      alert("Quest abandoned. It'll return to the available quests.");
      navigation.navigate("Home", { screen: "Quests" }); 
    } catch (error) {
      console.error("Error abandoning quest:", error);
      Alert.alert("Error", "Could not abandon quest. Try again.");
    }
  }; 

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Quest title overlay */}
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>{quest.title}</Text>
      </View>

      {/* Map rendering */}
      {location && region ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          customMapStyle={darkMapStyle}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        >
          {/* Current location marker */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            description="You are here"
          />
          {/* Destination marker */}
          {destination && (
            <Marker
              coordinate={{
                latitude: destination.geometry.location.lat,
                longitude: destination.geometry.location.lng,
              }}
              title={destination.name}
              description="Your destination"
            />
          )}
          {/* Route between origin and destination */}
          {origin && memoizedDestination && (
            <MapViewDirections
              origin={origin}
              destination={memoizedDestination}
              apikey={GOOGLE_API_KEY}
              strokeWidth={3}
              strokeColor="cyan"
            />
          )}
        </MapView>
      ) : (
        <Text style={styles.mapPlaceholder}>Loading map...</Text>
      )}

      {/* Confetti animation */}
      {showConfetti && (
        <ConfettiCannon
          count={150}
          origin={{ x: 200, y: 0 }}
          fallSpeed={3000}
          fadeOut={true}
        />
      )}

      {/* Completion banner */}
      {completionMessage && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🎉 Quest Complete! {completionMessage}</Text>
        </View>
      )}
      {/* Abandon quest button */}
      {!questCompleted && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 100,
            left: 20,
            right: 20,
            backgroundColor: '#cc3333',
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
          }}
          onPress={() => setShowAbandonModal(true)}
        >
          <Text style={{ color: 'white', fontSize: 15, fontWeight: '500' }}>Abandon Quest</Text>
        </TouchableOpacity>
      )}

      {/* Reusable abandon confirmation modal */}
      <AbandonQuestModal
        visible={showAbandonModal}
        questTitle={quest?.title}
        onCancel={() => setShowAbandonModal(false)}
        onConfirm={handleAbandonQuest}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#aaa",
    backgroundColor: "#0d0d0d",
  },
  overlay: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    zIndex: 999,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  banner: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  bannerText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default JourneyScreen;
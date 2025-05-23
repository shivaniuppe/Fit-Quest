import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { GOOGLE_API_KEY } from "../../secrets";

const MapQuestScreen = ({ route }) => {
  const { quest } = route.params;
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const navigation = useNavigation();

  // Get user’s current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // Convert quest goal (steps/km) to distance in meters
  const getDistanceFromGoal = (goal) => {
    if (goal.toLowerCase().includes("km")) {
      return parseFloat(goal.replace("km", "")) * 1000;
    } else {
      const steps = parseInt(goal);
      return Math.round(steps * 0.762); // average stride length
    }
  };

  // Estimate duration in minutes based on goal and activity type
  const estimateDurationFromGoal = (goal, icon) => {
    let pacePerKm;

    switch (icon) {
      case "running":
        pacePerKm = 4.5;
        break;
      case "bicycle":
        pacePerKm = 2.0;
        break;
      case "shoe-prints":
        pacePerKm = 6.0;
        break;
      default:
        pacePerKm = 6.0;
    }

    if (goal.toLowerCase().includes("km")) {
      const km = parseFloat(goal.replace("km", ""));
      return Math.round(km * pacePerKm);
    } else {
      const steps = parseInt(goal);
      const avgStepsPerMin = icon === "running" ? 160 : icon === "shoe-prints" ? 80 : 0;
      return avgStepsPerMin ? Math.round(steps / avgStepsPerMin) : 0;
    }
  };

  // Haversine formula to compute distance between two lat/lng points
  const getDistanceBetweenPoints = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Fetch nearby destinations using Google Places API
  const fetchNearbyDestinations = async (latitude, longitude, radius) => {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${GOOGLE_API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Error fetching places:", error);
      return [];
    }
  };

  // Select a destination near the target distance
  const pickDestination = async () => {
    if (!location) {
      alert("Location not available yet.");
      return;
    }

    setDestination(null); // Clear any previous destination

    const targetDistance = getDistanceFromGoal(quest.goal);
    const searchRadius = Math.max(targetDistance + 1000, 5000); // Adjusted radius for better results

    try {
      const places = await fetchNearbyDestinations(
        location.coords.latitude,
        location.coords.longitude,
        searchRadius
      );

      if (!places.length) {
        alert("No places found nearby.");
        return;
      }

      // Filter places within ±200m of target distance
      const allDistances = places.map((place) => ({
        place,
        dist: getDistanceBetweenPoints(
          location.coords.latitude,
          location.coords.longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
      }));

      const filtered = allDistances
        .filter(d => Math.abs(d.dist - targetDistance) <= 200)
        .map(d => d.place);

      // Randomly choose from filtered or all if no close match
      const chosen =
        filtered.length > 0
          ? filtered[Math.floor(Math.random() * filtered.length)]
          : places[Math.floor(Math.random() * places.length)];

      setDestination(chosen);
    } catch (err) {
      console.error("Error picking destination:", err);
      alert("Something went wrong picking a destination.");
    }
  };

  // Navigate to the JourneyScreen with chosen destination
  const startJourney = () => {
    if (!destination) {
      alert("Please pick a destination first.");
      return;
    }
    navigation.navigate("JourneyScreen", { destination, quest });
  };

  const estimatedTime = estimateDurationFromGoal(quest.goal, quest.icon); 

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>{quest.title}</Text>

      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
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
        </MapView>
      ) : (
        <Text style={styles.mapPlaceholder}>Loading map...</Text>
      )}

      {/* Quest card with challenge info */}
      <View style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <Text style={styles.goalText}>
            {destination ? `Head to ${destination.name} (${quest.goal})` : `Distance: ${quest.goal}`}
          </Text>
          <MaterialIcons name="directions-run" size={20} color="white" />
        </View>

        {/* XP, time, and calorie stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.stat}>
            <FontAwesome5 name="fire" color="white" /> {quest.calories} cal
          </Text>
          <Text style={styles.stat}>
            <MaterialIcons name="schedule" color="white" /> {estimatedTime} min
          </Text>
          <Text style={styles.stat}>
            <FontAwesome5 name="medal" color="white" /> {quest.xp} pts
          </Text>
        </View>

        {/* Buttons to pick destination or start journey */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.pickDestinationButton} onPress={pickDestination}>
            <Text style={styles.buttonText}>Pick Destination</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startButton} onPress={startJourney}>
            <Text style={styles.buttonText}>Start Journey</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MapQuestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
  },
  map: {
    flex: 1,
    marginBottom: 10,
  },
  mapPlaceholder: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#aaa",
    backgroundColor: "#0d0d0d",
  },
  challengeCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    color: "#ccc",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  stat: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  pickDestinationButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  startButton: {
    backgroundColor: "cyan",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "#0d0d0d",
    fontWeight: "bold",
    fontSize: 16,
  },
});

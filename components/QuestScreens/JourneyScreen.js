import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { GOOGLE_API_KEY } from '/Users/shivaniuppe/Desktop/Fit-Quest/secrets.js';

const JourneyScreen = ({ route }) => {
  const { destination, quest } = route.params; // Get destination and quest data
  const [location, setLocation] = useState(null); // User's current location
  const [errorMsg, setErrorMsg] = useState(null); // Error message for location
  const [region, setRegion] = useState(null); // Map region (initial region only)
  const mapRef = useRef(null); // Reference to the MapView
  const navigation = useNavigation();

  // Memoize the origin and destination to avoid unnecessary re-renders
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

  // Fetch the user's location and subscribe to updates
  useEffect(() => {
    let subscription;

    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // Get the initial location
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Set the initial map region with a zoomed-in view
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005, // Smaller value for zoomed-in view
        longitudeDelta: 0.005, // Smaller value for zoomed-in view
      });

      // Subscribe to location updates
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, // High accuracy for better tracking
          timeInterval: 1000, // Update every 1 second
          distanceInterval: 1, // Update every 1 meter
        },
        (newLocation) => {
          setLocation(newLocation); // Update the user's location in state

          // Smoothly animate the map to the new location (optional)
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              latitudeDelta: 0.005, // Keep the zoom level consistent
              longitudeDelta: 0.005, // Keep the zoom level consistent
            });
          }
        }
      );
    };

    startTracking();

    // Clean up the subscription when the component unmounts
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Track progress towards the destination
  useEffect(() => {
    if (location && destination) {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        destination.geometry.location.lat,
        destination.geometry.location.lng
      );

      if (distance <= 0.1) {
        // If the user is within 100 meters of the destination
        Alert.alert(
          "Congratulations!",
          "You've reached your destination!",
          [
            {
              text: "OK",
              onPress: () => {
                // Redirect to the home screen
                navigation.navigate("Home", { quest }); // Pass the quest data to the home screen
              },
            },
          ]
        );
      }
    }
  }, [location]);

  return (
    <View style={styles.container}>
      {/* Map View */}
      {location && region ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region} // Set the initial region only
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)} // Allow user to manually move the map
        >
          {/* Marker for the user's current location */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            description="You are here"
          />

          {/* Marker for the destination */}
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

          {/* Display the route */}
          {origin && memoizedDestination && (
            <MapViewDirections
              origin={origin}
              destination={memoizedDestination}
              apikey={GOOGLE_API_KEY}
              strokeWidth={3}
              strokeColor="blue"
            />
          )}
        </MapView>
      ) : (
        <Text style={styles.mapPlaceholder}>Loading map...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    color: "gray",
  },
});

export default JourneyScreen;
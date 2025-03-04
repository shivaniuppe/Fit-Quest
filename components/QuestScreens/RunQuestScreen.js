import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ProgressBar, Card, IconButton } from "react-native-paper";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { GOOGLE_API_KEY } from '/Users/shivaniuppe/Desktop/Fit-Quest/secrets.js';



const RunQuestScreen = ({ route }) => {
  const { quest } = route.params; // Get quest data from route params
  const [location, setLocation] = useState(null); // User's current location
  const [errorMsg, setErrorMsg] = useState(null); // Error message for location
  const [destination, setDestination] = useState(null); // Selected destination
  const [nearbyDestinations, setNearbyDestinations] = useState([]); // List of nearby destinations
  const navigation = useNavigation();

  // Fetch the user's location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // Fetch nearby destinations
  const fetchNearbyDestinations = async (latitude, longitude) => {
    const apiKey = GOOGLE_API_KEY;
    const radius = 500; // Search within 2 km
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.results; // Array of nearby places
    } catch (error) {
      console.error("Error fetching nearby destinations:", error);
      return [];
    }
  };

  // Filter valid destinations
  const filterValidDestinations = (places) => {
    return places.filter((place) => {
      // Example: Only include parks, cafes, and landmarks
      const validTypes = ["park", "cafe", "point_of_interest"];
      return place.types.some((type) => validTypes.includes(type));
    });
  };

  // Pick a destination
  const pickDestination = async () => {
    if (!location) return;

    const nearbyPlaces = await fetchNearbyDestinations(
      location.coords.latitude,
      location.coords.longitude
    );
    const validDestinations = filterValidDestinations(nearbyPlaces);

    if (validDestinations.length > 0) {
      const randomIndex = Math.floor(Math.random() * validDestinations.length);
      setDestination(validDestinations[randomIndex]);
    } else {
      alert("No valid destinations found nearby.");
    }
  };

  // Start the journey
  const startJourney = () => {
    if (!destination) {
      alert("Please pick a destination first.");
      return;
    }
    navigation.navigate("JourneyScreen", { destination, quest });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          <FontAwesome5 name="dumbbell" size={20} /> FitQuest
        </Text>
        <IconButton icon="cog" size={24} onPress={() => {}} />
      </View>

      {/* Progress Card */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <Text style={styles.progressTitle}>Progress</Text>
          <View style={styles.progressContainer}>
            <ProgressBar progress={0.5} color="black" style={styles.progressBar} />
            <Text style={styles.progressText}>50%</Text>
          </View>
          <Text style={styles.checkpointText}>2/4 Checkpoints</Text>
        </Card.Content>
      </Card>

      {/* Compass Icon */}
      <TouchableOpacity style={styles.compassButton}>
        <MaterialIcons name="explore" size={28} color="black" />
      </TouchableOpacity>

      {/* Map View */}
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
        </MapView>
      ) : (
        <Text style={styles.mapPlaceholder}>Loading map...</Text>
      )}

      {/* Challenge Card */}
      <Card style={styles.challengeCard}>
        <Card.Content>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>{quest.title}</Text>
            <MaterialIcons name="directions-run" size={20} />
          </View>
          {destination ? (
            <Text style={styles.distanceText}>
              Head to {destination.name} ({quest.distance} km)
            </Text>
          ) : (
            <Text style={styles.distanceText}>1.2km to next checkpoint</Text>
          )}

          <View style={styles.statsContainer}>
            <Text style={styles.stat}>
              <FontAwesome5 name="fire" /> 320 cal
            </Text>
            <Text style={styles.stat}>
              <MaterialIcons name="schedule" /> 25 min
            </Text>
            <Text style={styles.stat}>
              <FontAwesome5 name="medal" /> 50 pts
            </Text>
          </View>
        </Card.Content>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.pickDestinationButton} onPress={pickDestination}>
            <Text style={styles.buttonText}>Pick Destination</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startButton} onPress={startJourney}>
            <Text style={styles.buttonText}>Start Journey</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    elevation: 3,
  },
  progressTitle: {
    fontWeight: "bold",
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
  },
  progressText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  checkpointText: {
    fontSize: 12,
    color: "gray",
    marginTop: 3,
  },
  compassButton: {
    position: "absolute",
    top: 90,
    right: 20,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
  map: {
    flex: 1,
    marginVertical: 10,
  },
  mapPlaceholder: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    color: "gray",
  },
  challengeCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  distanceText: {
    fontSize: 14,
    color: "gray",
    marginTop: 3,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  stat: {
    fontSize: 14,
    fontWeight: "bold",
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  pickDestinationButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 50,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 50,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default RunQuestScreen;
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome5";

const WeatherScreen = () => {
  return (
    <View style={styles.container}>
      {/* Weather Section */}
      <View style={styles.weatherCard}>
        <Text style={styles.weatherTitle}>Current Weather</Text>
        <View style={styles.weatherRow}>
          <Text style={styles.temperature}>23°C</Text>
          <Icon name="sun" size={30} color="#000" />
        </View>
        <Text style={styles.location}>San Francisco, CA</Text>
      </View>

      {/* Workout Suggestion */}
      <Text style={styles.sectionTitle}>Today's Workout Suggestion</Text>
      <View style={styles.suggestionCard}>
        <Icon name="running" size={20} color="#000" />
        <View style={styles.suggestionText}>
          <Text style={styles.suggestionTitle}>Outdoor Run</Text>
          <Text style={styles.suggestionSubtitle}>
            Perfect weather for a 2km run!
          </Text>
          <View style={styles.suggestionDetails}>
            <Icon name="clock" size={14} color="#000" />
            <Text style={styles.detailText}> 20 mins </Text>
            <Icon name="fire" size={14} color="#000" />
            <Text style={styles.detailText}> 180 kcal</Text>
          </View>
        </View>
      </View>

      {/* Alternative Activities */}
      <Text style={styles.sectionTitle}>Alternative Activities</Text>
      <TouchableOpacity style={styles.activityCard}>
        <Icon name="dumbbell" size={18} color="#000" />
        <Text style={styles.activityText}> Home Strength Training</Text>
        <Icon name="chevron-right" size={14} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.activityCard}>
        <Icon name="spa" size={18} color="#000" />
        <Text style={styles.activityText}> Indoor Yoga</Text>
        <Icon name="chevron-right" size={14} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

// Bottom Tab Navigation
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Home") iconName = "home";
            else if (route.name === "Quests") iconName = "tasks";
            else if (route.name === "Leaderboard") iconName = "trophy";
            else if (route.name === "Profile") iconName = "user";
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#000",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={WeatherScreen} />
        <Tab.Screen name="Quests" component={WeatherScreen} />
        <Tab.Screen name="Leaderboard" component={WeatherScreen} />
        <Tab.Screen name="Profile" component={WeatherScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  weatherCard: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  weatherTitle: {
    fontSize: 14,
    color: "gray",
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  temperature: {
    fontSize: 32,
    fontWeight: "bold",
    marginRight: 8,
  },
  location: {
    fontSize: 14,
    color: "gray",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  suggestionText: {
    marginLeft: 10,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  suggestionSubtitle: {
    fontSize: 14,
    color: "gray",
  },
  suggestionDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#000",
    marginHorizontal: 4,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  activityText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
});

export default App;

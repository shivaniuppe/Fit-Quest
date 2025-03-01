import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { Pedometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import QuestsScreen from "./QuestsScreen"; 
import LeaderboardScreen from "./LeaderboardScreen"; 
import ProfileScreen from "./ProfileScreen"; 


const quests = [
  { id: "1", title: "Morning Run", description: "Complete 5km run", progress: 2.5 / 5, value: "2.5km / 5km", xp: "+50 XP" },
  { id: "2", title: "Push-ups Challenge", description: "50 push-ups today", progress: 40 / 50, value: "40 / 50", xp: "+30 XP" },
  { id: "3", title: "Plank Master", description: "Hold plank for 5 minutes", progress: 100 / 300, value: "1:40 / 5:00", xp: "+40 XP" },
];

const MainHomeScreen = () => {
  const [steps, setSteps] = useState(0);
  const stepsGoal = 10000; // Daily goal

  useEffect(() => {
    const loadSteps = async () => {
      const storedSteps = await AsyncStorage.getItem("stepsToday");
      if (storedSteps) {
        setSteps(parseInt(storedSteps));
      }
    };

    loadSteps();

    const subscribe = Pedometer.watchStepCount((result) => {
      setSteps(result.steps);
      AsyncStorage.setItem("stepsToday", result.steps.toString());
    });

    return () => subscribe.remove();
  }, []);
  
  

  return (
    <View style={styles.container}>
      <View style={styles.levelContainer}>
        <Image source={{ uri: "https://via.placeholder.com/50" }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.levelText}>Level 23 ⭐</Text>
          <Progress.Bar progress={0.7} width={150} color="black" unfilledColor="#E5E5E5" borderWidth={0} />
        </View>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Steps Counter */}
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsText}>Steps Today</Text>
        <Progress.Bar progress={steps / stepsGoal} width={250} color="black" unfilledColor="#E5E5E5" borderWidth={0} />
        <Text style={styles.stepsCount}>{steps} / {stepsGoal} steps</Text>
      </View>

      <FlatList
        data={quests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.questCard}>
            <Text style={styles.questTitle}>{item.title}</Text>
            <Text style={styles.questDesc}>{item.description}</Text>
            <Progress.Bar progress={item.progress} width={250} color="black" unfilledColor="#E5E5E5" borderWidth={0} />
            <Text style={styles.questValue}>{item.value}</Text>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>{item.xp}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};
const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar }}>
      <Tab.Screen name="Dashboard" component={MainHomeScreen} options={{ tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} /> }} />
      <Tab.Screen name="Quests" component={QuestsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={24} color={color} /> }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarIcon: ({ color }) => <FontAwesome name="trophy" size={24} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} /> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  levelText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stepsContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
    alignItems: "center",
  },
  stepsText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  stepsCount: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
  },
  questCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  questDesc: {
    color: "gray",
    fontSize: 14,
    marginBottom: 5,
  },
  questValue: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
  xpBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "black",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  xpText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  tabBar: {
    backgroundColor: "white",
    borderTopColor: "#E5E5E5",
    borderTopWidth: 1,
    paddingBottom: 10,
    paddingTop: 5,
  },
});


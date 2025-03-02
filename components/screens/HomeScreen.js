import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { Pedometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { collection, getDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";
import QuestsScreen from "./QuestsScreen";
import LeaderboardScreen from "./LeaderboardScreen";
import ProfileScreen from "./ProfileScreen";

const MainHomeScreen = () => {
  const [steps, setSteps] = useState(0);
  const [level, setLevel] = useState(1);
  const [acceptedQuests, setAcceptedQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const user = auth.currentUser;
  const stepsGoal = 10000;

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

  useEffect(() => {
    if (!user) return;
  
    const userDocRef = doc(db, "users", user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setLevel(userData.level || 1);
  
        if (userData.acceptedQuests && userData.acceptedQuests.length > 0) {
          // Fetch additional quest details from the quests collection
          const questsPromises = userData.acceptedQuests.map(async (acceptedQuest) => {
            const questDocRef = doc(db, "quests", acceptedQuest.id);
            const questDoc = await getDoc(questDocRef);
            if (questDoc.exists()) {
              return {
                ...questDoc.data(), // Quest details from the quests collection
                id: acceptedQuest.id, // Ensure the ID is included
                status: acceptedQuest.status, // Status from the user's acceptedQuests array
                totalXP: acceptedQuest.totalXP, // Total XP from the user's acceptedQuests array
              };
            }
            return null;
          });
  
          const fetchedQuests = await Promise.all(questsPromises);
          console.log("Fetched Quests:", fetchedQuests); // Debugging line
          setAcceptedQuests(fetchedQuests.filter(Boolean)); // Remove null values
        } else {
          setAcceptedQuests([]);
        }
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [user]);
    
  if (loading) {
    return <ActivityIndicator size="large" color="black" style={{ flex: 1 }} />;
  }
  
  const handleStartQuest = async (questId) => {
    if (!auth.currentUser) return;
  
    const userId = auth.currentUser.uid;
    const userRef = doc(db, "users", userId);
  
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedQuests = userData.acceptedQuests.map((quest) =>
          quest.id === questId ? { ...quest, status: "in-progress" } : quest
        );
  
        await updateDoc(userRef, { acceptedQuests: updatedQuests });
        setAcceptedQuests(updatedQuests); // Update local state
        alert("Quest started!");
      }
    } catch (error) {
      console.error("Error starting quest:", error);
    }
  };
  const handleCompleteQuest = async (questId) => {
    if (!auth.currentUser) return;
  
    const userId = auth.currentUser.uid;
    const userRef = doc(db, "users", userId);
  
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedQuests = userData.acceptedQuests.map((quest) =>
          quest.id === questId ? { ...quest, status: "completed" } : quest
        );
  
        // Find the completed quest to get its totalXP
        const completedQuest = userData.acceptedQuests.find((quest) => quest.id === questId);
        if (!completedQuest) {
          console.error("Completed quest not found");
          return;
        }
  
        // Calculate the new XP and level
        const newXP = (userData.xp || 0) + completedQuest.totalXP;
        const newLevel = Math.floor(newXP / 100) + 1; // Each level requires 100 XP
  
        // Update the user's document with the new XP, level, and completed quests
        await updateDoc(userRef, {
          acceptedQuests: updatedQuests,
          xp: newXP,
          level: newLevel,
        });
  
        // Update local state
        setAcceptedQuests(updatedQuests);
        setLevel(newLevel); // Update the level in the UI
        alert("Quest completed! You gained " + completedQuest.totalXP + " XP.");
      }
    } catch (error) {
      console.error("Error completing quest:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.levelContainer}>
        <Image source={{ uri: "https://via.placeholder.com/50" }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.levelText}>Level {level} ⭐</Text>
          <Progress.Bar progress={level / 100} width={150} color="black" unfilledColor="#E5E5E5" borderWidth={0} />
        </View>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.stepsContainer}>
        <Text style={styles.stepsText}>Steps Today</Text>
        <Progress.Bar progress={steps / stepsGoal} width={250} color="black" unfilledColor="#E5E5E5" borderWidth={0} />
        <Text style={styles.stepsCount}>{steps} / {stepsGoal} steps</Text>
      </View>

      {acceptedQuests.length > 0 ? (
        <FlatList
        data={acceptedQuests}
        keyExtractor={(item) => {
          // Debugging: Log the key for each item
          console.log("Key for item:", item.id);
          return item.id; // Ensure this is unique
        }}
        renderItem={({ item }) => {
          console.log("Quest Item:", item); // Debugging
          console.log("Quest Status:", item.status); // Debugging
      
          return (
            <View style={styles.questCard}>
              <View style={styles.questHeader}>
                <Text style={styles.questTitle}>{item.title}</Text>
                <View style={styles.xpBadge}>
                  <Text style={styles.xpText}>+{item.totalXP} XP</Text>
                </View>
              </View>
              <Text style={styles.questDesc}>{item.description}</Text>
              <Progress.Bar progress={item.progress} width={250} color="black" unfilledColor="#E5E5E5" borderWidth={0} />
              <Text style={styles.questValue}>{item.value} / {item.goal}</Text>
      
              {/* Debugging: Display the status as text */}
              <Text style={{ color: "black", marginBottom: 10 }}>Status: {item.status}</Text>
      
              {/* Buttons for Start Quest and Mark as Completed */}
              <View style={styles.buttonsContainer}>
                {item.status === "accepted" ? (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartQuest(item.id)}
                  >
                    <Text style={styles.buttonText}>Start Quest</Text>
                  </TouchableOpacity>
                ) : item.status === "in-progress" ? (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleCompleteQuest(item.id)}
                  >
                    <Text style={styles.buttonText}>Mark as Completed</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: "black" }}>No buttons to display (Status: {item.status})</Text>
                )}
              </View>
            </View>
          );
        }}
      />
      ) : (
        <View style={styles.noQuestsContainer}>
          <Text style={styles.noQuestsText}>No quests accepted yet.</Text>
          <TouchableOpacity style={styles.questButton} onPress={() => navigation.navigate("Quests")}>
            <Text style={styles.questButtonText}>Check Quests</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar }}>
      <Tab.Screen name="Dashboard" component={MainHomeScreen} options={{ tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} /> }} />
      <Tab.Screen name="Quests" component={QuestsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={24} color={color} /> }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarIcon: ({ color }) => <FontAwesome name="trophy" size={24} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} /> }} />
    </Tab.Navigator>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 20 },
  levelContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  levelText: { fontSize: 18, fontWeight: "bold" },
  stepsContainer: { alignItems: "center", marginBottom: 20 },
  stepsText: { fontSize: 16, fontWeight: "bold" },
  stepsCount: { fontSize: 14, color: "gray" },
  tabBar: { backgroundColor: "white", borderTopColor: "#E5E5E5", borderTopWidth: 1 },
  questCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questTitle: { fontSize: 16, fontWeight: "bold" },
  questDesc: { fontSize: 14, color: "gray", marginBottom: 10 },
  questValue: { fontSize: 12, color: "gray", marginTop: 5 },
  xpBadge: { backgroundColor: "black", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
  xpText: { color: "white", fontSize: 12, fontWeight: "bold" },
  questStatus: {
    fontSize: 14,
    color: "gray",
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  startButton: {
    backgroundColor: "#4CAF50", // Green color for Start Quest
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  completeButton: {
    backgroundColor: "#FF5722", // Orange color for Mark as Completed
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

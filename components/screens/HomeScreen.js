import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { Pedometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { collection, getDoc, doc, onSnapshot, updateDoc, query, where, serverTimestamp } from "firebase/firestore";
import { auth, db } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";
import QuestsScreen from "./QuestsScreen";
import LeaderboardScreen from "./LeaderboardScreen";
import ProfileScreen from "./ProfileScreen";
import RunQuestScreen from "../QuestScreens/RunQuestScreen";

const MainHomeScreen = () => {
  const [steps, setSteps] = useState(0);
  const [level, setLevel] = useState(1);
  const [acceptedQuests, setAcceptedQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const user = auth.currentUser;
  const stepsGoal = 10000;

  // Function to load steps and reset if it's a new day
  const loadSteps = async () => {
    const today = new Date().toLocaleDateString(); // Get today's date as a string
    const lastResetDate = await AsyncStorage.getItem("lastResetDate");
    const storedSteps = await AsyncStorage.getItem("stepsToday");

    if (lastResetDate !== today) {
      // If the last reset date is not today, reset the steps
      await AsyncStorage.setItem("stepsToday", "0");
      await AsyncStorage.setItem("lastResetDate", today);
      setSteps(0);
    } else if (storedSteps) {
      // If the last reset date is today, load the stored steps
      setSteps(parseInt(storedSteps));
    }
  };

  useEffect(() => {
    loadSteps(); // Load steps and reset if necessary

    // Watch for step count changes
    const subscribe = Pedometer.watchStepCount((result) => {
      setSteps(result.steps);
      AsyncStorage.setItem("stepsToday", result.steps.toString());
    });

    return () => subscribe.remove(); // Cleanup subscription
  }, []);

  useEffect(() => {
    if (!user) return;
  
    // Fetch accepted quests from the userQuests collection
    const userQuestsRef = collection(db, "userQuests");
    const userQuestsQuery = query(
      userQuestsRef, 
      where("userId", "==", user.uid), 
      where("status", "in", ["accepted", "in-progress"])
    );
  
    const unsubscribe = onSnapshot(userQuestsQuery, async (querySnapshot) => {
      if (querySnapshot.empty) {
        setAcceptedQuests([]); // No quests found
        setLoading(false);
        return;
      }
  
      const fetchQuests = querySnapshot.docs.map(async (questDoc) => {
        const questData = questDoc.data();
        const questId = questData.questId;
  
        try {
          const questDocRef = doc(db, "quests", questId);
          const questDocSnap = await getDoc(questDocRef);
  
          if (questDocSnap.exists()) {
            return {
              ...questDocSnap.data(), // Quest details from the quests collection
              id: questId, // Quest ID
              status: questData.status, // Status from the userQuests collection
              progress: questData.progress || 0, // Progress from the userQuests collection
            };
          }
        } catch (error) {
          console.error("Error fetching quest details:", error);
        }
        return null;
      });
  
      // Wait for all promises to resolve
      const acceptedQuestsData = (await Promise.all(fetchQuests)).filter(Boolean);
  
      setAcceptedQuests(acceptedQuestsData);
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
    const userQuestRef = doc(db, "userQuests", `${userId}_${questId}`);

    try {
      await updateDoc(userQuestRef, { status: "in-progress" });

      // Update local state
      setAcceptedQuests((prevQuests) =>
        prevQuests.map((quest) =>
          quest.id === questId ? { ...quest, status: "in-progress" } : quest
        )
      );

      // Find the quest details
      const quest = acceptedQuests.find((q) => q.id === questId);
      if (quest) {
        // Navigate to RunQuestScreen with quest data
        navigation.navigate("RunQuestScreen", { quest });
      }
    } catch (error) {
      console.error("Error starting quest:", error);
    }
  };

  const handleCompleteQuest = async (questId) => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const userQuestRef = doc(db, "userQuests", `${userId}_${questId}`);

    try {
      // Update the quest status to "completed"
      await updateDoc(userQuestRef, { 
        status: "completed",
        completedAt: serverTimestamp() // This ensures Firestore assigns the correct timestamp
      });
      

      // Fetch the quest details to calculate XP
      const questDocRef = doc(db, "quests", questId);
      const questDoc = await getDoc(questDocRef);

      if (questDoc.exists()) {
        const questData = questDoc.data();
        const xpEarned = questData.xp;

        // Update the user's XP and level in the users collection
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const newXP = (userData.xp || 0) + xpEarned;
          const newLevel = Math.floor(newXP / 100) + 1; // Each level requires 100 XP

          await updateDoc(userRef, {
            xp: newXP,
            level: newLevel,
          });

          // Update local state
          setLevel(newLevel);
          setAcceptedQuests((prevQuests) =>
            prevQuests.filter((quest) => quest.id !== questId)
          );

          alert("Quest completed! You gained " + xpEarned + " XP.");
        }
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.questCard}>
              <View style={styles.questHeader}>
                <Text style={styles.questTitle}>{item.title}</Text>
                <View style={styles.xpBadge}>
                  <Text style={styles.xpText}>+{item.xp} XP</Text>
                </View>
              </View>
              <Text style={styles.questDesc}>{item.description}</Text>
              <Progress.Bar progress={item.progress} width={250} color="black" unfilledColor="#E5E5E5" borderWidth={0} />
              <Text style={styles.questValue}>{item.progress * 100}%</Text>

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
                ) : null}
              </View>
            </View>
          )}
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
  noQuestsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noQuestsText: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  questButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  questButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { Pedometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { collection, getDoc, doc, onSnapshot, updateDoc, query, where, serverTimestamp, setDoc, getDocs, limit } from "firebase/firestore";
import { auth, db } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";
import QuestsScreen from "./QuestsScreen";
import LeaderboardScreen from "./LeaderboardScreen";
import ProfileScreen from "./ProfileScreen";
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getWeatherData, getWeatherIcon, getWorkoutSuggestion } from '/Users/shivaniuppe/Desktop/Fit-Quest/components/utils/weatherService.js';
import { deleteDoc } from "firebase/firestore";

const MainHomeScreen = () => {
  const [steps, setSteps] = useState(0);
  const [level, setLevel] = useState(1);
  const [acceptedQuests, setAcceptedQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const user = auth.currentUser;
  const stepsGoal = 10000;
  const [weather, setWeather] = useState({
    temp: '--',
    condition: 'Loading...',
    suggestion: 'Fetching weather...',
    icon: 'cloud'
  });
  const [suggestedQuest, setSuggestedQuest] = useState(null);
  const [loadingQuest, setLoadingQuest] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [questToAbandon, setQuestToAbandon] = useState(null);
  const [stepsTodayBase, setStepsTodayBase] = useState(0);


  // Function to load steps and reset if it's a new day
  const loadSteps = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const firestoreStepsToday = userSnap.data().stepsToday || 0;
        const firestoreTotalSteps = userSnap.data().totalSteps || 0;
        
        setSteps(firestoreStepsToday); // UI state
        setStepsTodayBase(firestoreStepsToday); // for tracking delta
        
        console.log("🔥 stepsToday loaded from Firestore:", firestoreStepsToday);
      }
    } catch (err) {
      console.error("🚨 Error loading Firestore stepsToday:", err);
    }
  };
  
useEffect(() => {
  const now = new Date();
  const millisTillMidnight =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1) - now;

  const timeout = setTimeout(async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { stepsToday: 0 });

    setSteps(0);
    setStepsTodayBase(0);
    console.log("🌙 stepsToday reset at midnight");
  }, millisTillMidnight);

  return () => clearTimeout(timeout);
}, []);


useEffect(() => {
  let lastTrackedSteps = 0;
  let pedometerSubscription;

  const startTracking = async () => {
    await loadSteps(); // fetch stepsToday & set base

    pedometerSubscription = Pedometer.watchStepCount(async (result) => {
      const currentSteps = result.steps;
      const delta = currentSteps - lastTrackedSteps;

      if (delta > 0) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const currentStepsToday = userSnap.data().stepsToday || 0;
        const currentTotal = userSnap.data().totalSteps || 0;

        const newStepsToday = currentStepsToday + delta;
        const newTotal = currentTotal + delta;

        await updateDoc(userRef, {
          stepsToday: newStepsToday,
          totalSteps: newTotal,
        });

        setSteps(newStepsToday);
        setStepsTodayBase(newStepsToday);
        lastTrackedSteps = currentSteps;

        console.log("👟 Steps updated -> Today:", newStepsToday, "| Total:", newTotal);
      }
    });
  };

  startTracking();

  return () => {
    if (pedometerSubscription) {
      pedometerSubscription.remove();
    }
  };
}, []);


  
  
  useEffect(() => {
    if (!auth.currentUser) return;
  
    const checkAndUpdateStreak = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const lastActiveDate = new Date(userData.lastActive);
        const currentDate = new Date();
  
        // Get just the dates (no time)
        const lastDay = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
        const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
        const diffDays = Math.floor((currentDay - lastDay) / (1000 * 60 * 60 * 24));
  
        if (diffDays === 1) {
          // ✅ Consecutive day → increment streak
          const newStreak = (userData.streak || 0) + 1;
          await updateDoc(userRef, {
            streak: newStreak,
            lastActive: currentDate.toISOString(),
          });
          console.log("🔥 Streak incremented to:", newStreak);
        } else if (diffDays > 1) {
          // 🧊 Missed a day → reset streak
          await updateDoc(userRef, {
            streak: 1,
            lastActive: currentDate.toISOString(),
          });
          console.log("🔁 Streak reset to 1");
        } else {
          // 🤝 Already logged in today → just update lastActive
          await updateDoc(userRef, {
            lastActive: currentDate.toISOString(),
          });
          console.log("✅ Streak maintained");
        }
      }
    };
  
    checkAndUpdateStreak();
  }, []);
  
  
 
  
  
  
  

  const getNewSuggestedQuest = async (currentWeather) => {
    try {
      if (!auth.currentUser || !currentWeather || !currentWeather.condition) return null;
  
      const suggestion = getWorkoutSuggestion({
        main: currentWeather.condition,
        temp: currentWeather.temp,
      });
  
      console.log('Getting quests for environment:', suggestion.environment);
  
      const userQuestRef = collection(db, "userQuests");
      const userQuestQuery = query(userQuestRef, where("userId", "==", auth.currentUser.uid));
      const userQuestSnapshot = await getDocs(userQuestQuery);
  
      if (userQuestSnapshot.empty) {
        const q = query(
          collection(db, "quests"),
          where("status", "==", "active"),
          where("environment", "in", [suggestion.environment, 'Any']),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const availableQuests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        return availableQuests.length > 0
          ? availableQuests[Math.floor(Math.random() * availableQuests.length)]
          : null;
      }
  
      const completedQuestIds = userQuestSnapshot.docs.map(doc => doc.data().questId);
  
      const q = query(
        collection(db, "quests"),
        where("status", "==", "active"),
        where("environment", "in", [suggestion.environment, 'Any']),
        limit(20)
      );
  
      const querySnapshot = await getDocs(q);
      const availableQuests = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(quest => !completedQuestIds.includes(quest.id));
  
      return availableQuests.length > 0
        ? availableQuests[Math.floor(Math.random() * availableQuests.length)]
        : null;
  
    } catch (error) {
      console.error("Error in getNewSuggestedQuest:", error);
      return null;
    }
  };
  

  const fetchWeatherAndQuest = async () => {
    try {
      setLoadingQuest(true);
  
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setWeather({
          ...weather,
          condition: 'Location denied',
          suggestion: 'Enable location for weather',
        });
        return;
      }
  
      const location = await Location.getCurrentPositionAsync({});
      const weatherData = await getWeatherData(
        location.coords.latitude,
        location.coords.longitude
      );
  
      if (weatherData) {
        const iconCode = weatherData.weather[0].icon;
        const temp = Math.round(weatherData.main.temp);
        const condition = weatherData.weather[0].main;
  
        const suggestion = getWorkoutSuggestion({
          main: condition,
          temp: temp,
        });
  
        const updatedWeather = {
          temp: temp,
          condition: condition,
          icon: getWeatherIcon(iconCode),
          suggestion: suggestion.suggestion,
          environment: suggestion.environment,
        };
  
        setWeather(updatedWeather);
  
        // 👇 Call this after weather AND user are both ready
        if (auth.currentUser) {
          const newSuggestedQuest = await getNewSuggestedQuest(updatedWeather);
          setSuggestedQuest(newSuggestedQuest);
        }
      }
    } catch (error) {
      console.error("Error in fetchWeatherAndQuest:", error);
      setWeather({
        temp: '--',
        condition: 'Error',
        suggestion: 'Check connection',
        icon: 'exclamation-triangle',
      });
    } finally {
      setLoadingQuest(false);
    }
  };
  

 
  const handleAcceptSuggestedQuest = async () => {
    if (!user || !suggestedQuest) return;

    try {
      const userQuestRef = doc(db, "userQuests", `${user.uid}_${suggestedQuest.id}`);
      const questDoc = await getDoc(userQuestRef);
      
      if (questDoc.exists()) {
        alert("You've already accepted this quest!");
        return;
      }
      
      await setDoc(userQuestRef, {
        userId: user.uid,
        questId: suggestedQuest.id,
        status: "accepted",
        progress: 0,
        acceptedAt: serverTimestamp()
      });
      
      alert(`Quest "${suggestedQuest.title}" accepted!`);
      
      // Get a new suggested quest
      const newSuggestedQuest = await getNewSuggestedQuest(weather);
      setSuggestedQuest(newSuggestedQuest);

      
    } catch (error) {
      console.error("Error accepting quest:", error);
      alert("Failed to accept quest. Please try again.");
    }
  };
  const handleIgnoreSuggestedQuest = async () => {
    if (!weather) return;
  
    const newSuggestedQuest = await getNewSuggestedQuest(weather);
    if (newSuggestedQuest) {
      setSuggestedQuest(newSuggestedQuest);
    } else {
      alert("No other quests available at the moment.");
    }
  };
  

  useEffect(() => {
    if (!user) return;
  
    const userQuestsRef = collection(db, "userQuests");
    const userQuestsQuery = query(
      userQuestsRef, 
      where("userId", "==", user.uid), 
      where("status", "in", ["accepted", "in-progress"])
    );
  
    const unsubscribe = onSnapshot(userQuestsQuery, async (querySnapshot) => {
      if (querySnapshot.empty) {
        setAcceptedQuests([]);
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
              ...questDocSnap.data(),
              id: questId,
              status: questData.status,
              progress: questData.progress || 0,
            };
          }
        } catch (error) {
          console.error("Error fetching quest details:", error);
        }
        return null;
      });
  
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
      setAcceptedQuests((prevQuests) =>
        prevQuests.map((quest) =>
          quest.id === questId ? { ...quest, status: "in-progress" } : quest
        )
      );
  
      const quest = acceptedQuests.find((q) => q.id === questId);
      if (quest) {
        // ✅ Dynamic navigation based on activityType
        switch (quest.activityType) {
          case "Active":
            navigation.navigate("RunQuestScreen", { quest });
            break;
          case "Reps":
            navigation.navigate("RepsQuestScreen", { quest });
            break;
          case "Timed":
            navigation.navigate("TimedQuestScreen", { quest });
            break;
          case "Wellness":
            navigation.navigate("WellnessQuestScreen", { quest });
            break;
          default:
            alert("Unknown quest type.");
        }
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
      await updateDoc(userQuestRef, { 
        status: "completed",
        completedAt: serverTimestamp()
      });
      
      const questDocRef = doc(db, "quests", questId);
      const questDoc = await getDoc(questDocRef);
  
      if (questDoc.exists()) {
        const questData = questDoc.data();
        const xpEarned = questData.xp;
  
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const newXP = (userData.xp || 0) + xpEarned;
          const newLevel = Math.floor(newXP / 100) + 1;
  
          await updateDoc(userRef, {
            xp: newXP,
            level: newLevel,
            quests: newQuestCount
          });
  
          setLevel(newLevel);
          setAcceptedQuests((prevQuests) =>
            prevQuests.filter((quest) => quest.id !== questId)
          );
  
          // Refresh the suggested quest after completion
          const newSuggestedQuest = await getNewSuggestedQuest(weather);
          setSuggestedQuest(newSuggestedQuest);
  
          alert("Quest completed! You gained " + xpEarned + " XP.");
        }
      }
    } catch (error) {
      console.error("Error completing quest:", error);
    }
  };
  const handleAbandonQuest = async () => {
    if (!auth.currentUser || !questToAbandon) return;
  
    const userId = auth.currentUser.uid;
    const userQuestRef = doc(db, "userQuests", `${userId}_${questToAbandon.id}`);
  
    try {
      await deleteDoc(userQuestRef); // 🔥 delete instead of updating status
  
      setAcceptedQuests((prev) =>
        prev.filter((quest) => quest.id !== questToAbandon.id)
      );
      setShowAbandonModal(false);
      setQuestToAbandon(null);
  
      alert("Quest abandoned. It'll return to the available quests.");
      navigation.navigate("Quests"); // 👈 send user to Quests screen
  
    } catch (error) {
      console.error("Error abandoning quest:", error);
      alert("Failed to abandon quest. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Level and Settings */}
      <View style={styles.topBar}>
        <View style={styles.levelContainer}>
          <Image source={{ uri: "https://via.placeholder.com/50" }} style={styles.avatar} />
          <View style={styles.levelProgress}>
            <Text style={styles.levelText}>Level {level} ⭐</Text>
            <Progress.Bar 
              progress={level / 100} 
              width={150} 
              height={8}
              color="#4CAF50" 
              unfilledColor="#333"
              borderWidth={0} 
            />
          </View>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Steps Progress */}
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsText}>Steps Today</Text>
        <Progress.Bar 
          progress={steps / stepsGoal} 
          width={null} 
          height={10}
          color="#2196F3" 
          unfilledColor="#333"
          borderWidth={0} 
        />
        <Text style={styles.stepsCount}>{steps} / {stepsGoal} steps</Text>
      </View>

      {/* Combined Weather and Suggested Quest Card */}
      <View style={styles.weatherQuestCard}>
        {/* Weather Section */}
        <View style={styles.weatherSection}>
          <FontAwesome5 
            name={weather.icon} 
            size={20} 
            color="#FFA500" 
          />
          <View style={styles.weatherTextContainer}>
            <Text style={styles.weatherTemp}>{weather.temp}°C • {weather.condition}</Text>
            <Text style={styles.weatherSuggestionText}>{weather.suggestion}</Text>
          </View>
        </View>

        {/* Suggested Quest Section */}
        {loadingQuest ? (
          <ActivityIndicator size="small" color="#000" style={styles.loadingIndicator} />
        ) : suggestedQuest ? (
          <View style={styles.suggestedQuestSection}>
            <Text style={styles.sectionTitle}>Suggested for Today</Text>
            <View style={styles.questPreview}>
              <View style={styles.questPreviewHeader}>
                <FontAwesome5 
                  name={suggestedQuest.icon} 
                  size={16} 
                  color="#FFA500"
                  style={styles.questIcon}
                />
                <Text style={styles.questPreviewTitle} numberOfLines={1}>{suggestedQuest.title}</Text>
                <View style={styles.xpBadge}>
                  <Text style={styles.xpText}>+{suggestedQuest.xp} XP</Text>
                </View>
              </View>
              <View style={styles.suggestedButtonsContainer}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleAcceptSuggestedQuest}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ignoreButton}
                  onPress={handleIgnoreSuggestedQuest}
                >
                  <Text style={styles.buttonText}>Ignore</Text>
                </TouchableOpacity>
              </View>


            </View>
          </View>
        ) : (
          <Text style={styles.noQuestText}>
            {weather.environment === 'Outdoor' 
              ? 'No outdoor quests available right now'
              : 'No indoor quests available right now'}
          </Text>
        )}
      </View>

      {/* Accepted Quests List */}
      {acceptedQuests.length > 0 ? (
        <FlatList
          data={acceptedQuests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.questsList}
          renderItem={({ item }) => (
            <View style={styles.questCard}>
              <View style={styles.questHeader}>
                <Text style={styles.questTitle}>{item.title}</Text>
                <View style={styles.xpBadge}>
                  <Text style={styles.xpText}>+{item.xp} XP</Text>
                </View>
              </View>
              <Progress.Bar 
                progress={item.progress} 
                width={null} 
                height={6}
                color="#4CAF50" 
                unfilledColor="#333"
                borderWidth={0} 
              />
              <Text style={styles.questValue}>{Math.round(item.progress * 100)}%</Text>
          
              <View style={styles.buttonsContainer}>
                {item.status === "accepted" && (
                <>
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartQuest(item.id)}
                  >
                    <Text style={styles.buttonText}>Start</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.abandonButton}
                    onPress={() => {
                      setQuestToAbandon(item);
                      setShowAbandonModal(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Abandon</Text>
                  </TouchableOpacity>
                </>
              )}
              {item.status === "in-progress" && (
                <>
                  <TouchableOpacity
                    style={styles.resumeButton}
                    onPress={() => handleStartQuest(item.id)}
                  >
                    <Text style={styles.buttonText}>Resume</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.abandonButton}
                    onPress={() => {
                      setQuestToAbandon(item);
                      setShowAbandonModal(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Abandon</Text>
                  </TouchableOpacity>
                </>
              )}

              </View>
            </View>   
                   
          )}
        />
      ) : (
        <View style={styles.noQuestsContainer}>
          <Text style={styles.noQuestsText}>No quests accepted yet.</Text>
          <TouchableOpacity style={styles.questButton} onPress={() => navigation.navigate("Quests")}>
            <Text style={styles.questButtonText}>Browse Quests</Text>
          </TouchableOpacity>
        </View>
      )}
      {showAbandonModal && (
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalText}>
            Are you sure you want to abandon "{questToAbandon?.title}"?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAbandonModal(false);
                setQuestToAbandon(null);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmAbandonButton}
              onPress={handleAbandonQuest}
            >
              <Text style={styles.buttonText}>Yes, Abandon</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}

    </View>
  
  );
};


const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  return (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#1E1E1E", // Dark background
              borderTopColor: "#333",     // Optional: subtle border
            },
            tabBarActiveTintColor: "#4CAF50", // Active tab icon/text color
            tabBarInactiveTintColor: "#CCCCCC", // Inactive tab icon/text
          }}
        >
      <Tab.Screen name="Dashboard" component={MainHomeScreen} options={{ tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} /> }} />
      <Tab.Screen name="Quests" component={QuestsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={24} color={color} /> }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarIcon: ({ color }) => <FontAwesome name="trophy" size={24} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} /> }} />
    </Tab.Navigator>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212", 
    padding: 16 
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 12 
  },
  levelProgress: {
    flex: 1,
  },
  levelText: { 
    fontSize: 16, 
    fontWeight: "bold",
    marginBottom: 4,
    color: "#FFFFFF"
  },
  settingsButton: {
    padding: 8,
  },
  stepsContainer: { 
    marginBottom: 20,
  },
  stepsText: { 
    fontSize: 14, 
    fontWeight: "600",
    marginBottom: 6,
    color: '#AAAAAA'
  },
  stepsCount: { 
    fontSize: 12, 
    color: "#CCCCCC",
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  weatherQuestCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  weatherSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  weatherTemp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weatherSuggestionText: {
    fontSize: 13,
    color: '#CCCCCC',
    marginTop: 2,
  },
  suggestedQuestSection: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 8,
  },
  questPreview: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
  },
  questPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questPreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginHorizontal: 8,
    color: "#FFFFFF"
  },
  questIcon: {
    marginRight: 8,
  },
  xpBadge: { 
    backgroundColor: "#444", 
    paddingVertical: 3, 
    paddingHorizontal: 8, 
    borderRadius: 12 
  },
  xpText: { 
    color: "white", 
    fontSize: 11, 
    fontWeight: "bold" 
  },
  suggestedButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
  },
  ignoreButton: {
    backgroundColor: '#757575',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 6,
  },
  noQuestText: {
    textAlign: 'center',
    color: '#888888',
    fontSize: 13,
    marginVertical: 8,
  },
  questsList: {
    paddingBottom: 20,
  },
  questCard: {
    backgroundColor: "#1C1C1C",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  questTitle: { 
    fontSize: 14, 
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
    color: "#FFFFFF"
  },
  questValue: { 
    fontSize: 11, 
    color: "#AAAAAA", 
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  startButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
  },
  completeButton: {
    backgroundColor: "#FF5722",
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 6,
  },
  resumeButton: {
    backgroundColor: "#FFA000",
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
  },
  abandonButton: {
    backgroundColor: "#616161",
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 6,
  },
  buttonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  noQuestsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  noQuestsText: {
    fontSize: 14,
    color: "#AAAAAA",
    marginBottom: 16,
  },
  questButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    width: "70%",
    alignItems: "center",
  },
  questButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingIndicator: {
    marginVertical: 8
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalBox: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 20,
    textAlign: "center",
    color: "#FFFFFF"
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#757575",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 6,
    alignItems: "center",
  },
  confirmAbandonButton: {
    backgroundColor: "#FF5722",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 6,
    alignItems: "center",
  },
});

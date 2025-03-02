import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { ProgressBar } from "react-native-paper";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      const userRef = doc(db, "users", auth.currentUser.uid);

      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("User data not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "black", textAlign: "center" }}>No user data found.</Text>
      </View>
    );
  }

  // Destructure user data with default values
  const {
    username = "User",
    level = 1,
    title = "Beginner",
    xp = 0,
    xpGoal = 1000,
    achievements = [],
    workouts = 0,
    streak = 0,
    caloriesBurned = 0,
    profilePic = "https://via.placeholder.com/100",
  } = userData;

  // Calculate progress (ensure xpGoal is not zero)
  const progress = xpGoal > 0 ? xp / xpGoal : 0;

  const achievementData = [
    { title: "100 Workouts", icon: "🏅" },
    { title: "30 Day Streak", icon: "🔥" },
    { title: "Weight Master", icon: "🏋️" },
    { title: "Cardio King", icon: "❤️" },
    { title: "Marathon Pro", icon: "🏃" },
    { title: "Elite Status", icon: "🏆" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: profilePic }} style={styles.profileImage} />
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lvl {level}</Text>
          </View>
        </View>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.userTitle}>{title}</Text>
      </View>

      {/* XP Progress */}
      <View style={styles.xpContainer}>
        <Text style={styles.xpText}>XP Progress</Text>
        <Text style={styles.xpValue}>{xp} / {xpGoal}</Text>
      </View>
      <ProgressBar progress={progress} color="#4CAF50" style={styles.progressBar} />

      {/* Achievements */}
      <Text style={styles.sectionTitle}>Achievements</Text>
      <FlatList
        data={achievementData}
        keyExtractor={(item) => item.title}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>{item.icon}</Text>
            <Text style={styles.achievementText}>{item.title}</Text>
          </View>
        )}
      />

      {/* Workout Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{workouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{streak}</Text>
          <Text style={styles.statLabel}>Days Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{caloriesBurned}k</Text>
          <Text style={styles.statLabel}>Cal Burned</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  profileContainer: { alignItems: "center", marginBottom: 20 },
  profileImageContainer: { position: "relative", marginBottom: 10 },
  profileImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#ddd" },
  levelBadge: { position: "absolute", bottom: 0, backgroundColor: "black", borderRadius: 12, padding: 5 },
  levelText: { color: "white", fontSize: 12, fontWeight: "bold" },
  username: { fontSize: 18, fontWeight: "bold", color: "black" },
  userTitle: { fontSize: 14, color: "gray" },
  xpContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  xpText: { fontSize: 14, color: "gray" },
  xpValue: { fontSize: 14, fontWeight: "bold", color: "black" },
  progressBar: { height: 8, borderRadius: 5, backgroundColor: "#ddd", marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "black" },
  achievementItem: { flex: 1, alignItems: "center", marginBottom: 20 },
  achievementIcon: { fontSize: 24 },
  achievementText: { fontSize: 12, color: "gray", textAlign: "center" },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  statItem: { alignItems: "center", flex: 1 },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "black" },
  statLabel: { fontSize: 12, color: "gray" },
});

export default ProfileScreen;
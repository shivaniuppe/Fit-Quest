import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";
import { ProgressBar } from "react-native-paper";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      try {
        if (doc.exists()) {
          setUserData(doc.data());
        } else {
          console.log("User data not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
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
    profilePic,         // Old field name (URL)
    profilePicBase64, 
    bio = "",
  } = userData;

  const progress = xpGoal > 0 ? Math.min(xp / xpGoal, 1) : 0;
  const profilePicture = profilePicBase64 || profilePic || null;

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          {profilePicture ? (
            <Image 
              source={{ uri: profilePicture }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={[styles.profileImage, styles.profilePlaceholder]}>
              <FontAwesome name="user-circle" size={50} color="#aaa" />
            </View>
          )}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lvl {level}</Text>
          </View>
        </View>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.userTitle}>{title}</Text>
        {bio ? <Text style={styles.bioText}>{bio}</Text> : null}
      </View>

      <View style={styles.xpContainer}>
        <Text style={styles.xpText}>XP Progress</Text>
        <Text style={styles.xpValue}>
          {xp.toLocaleString()} / {xpGoal.toLocaleString()}
        </Text>
      </View>
      <ProgressBar progress={progress} color="#4CAF50" style={styles.progressBar} />

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
  container: { 
    flex: 1, 
    backgroundColor: "#121212", 
    padding: 20 
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 20 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#FFFFFF" 
  },
  profileContainer: { 
    alignItems: "center", 
    marginBottom: 20 
  },
  profileImageContainer: { 
    position: "relative", 
    marginBottom: 10 
  },
  profileImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 50 
  },
  profilePlaceholder: { 
    backgroundColor: "#333", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  levelBadge: { 
    position: "absolute", 
    bottom: 0, 
    right: 0,
    backgroundColor: "#4CAF50", 
    borderRadius: 12, 
    padding: 5,
    minWidth: 40,
    alignItems: "center"
  },
  levelText: { 
    color: "white", 
    fontSize: 12, 
    fontWeight: "bold" 
  },
  username: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#FFFFFF" 
  },
  userTitle: { 
    fontSize: 14, 
    color: "#AAAAAA", 
    marginBottom: 5 
  },
  bioText: { 
    fontSize: 14, 
    color: "#DDDDDD", 
    textAlign: "center", 
    maxWidth: "80%" 
  },
  xpContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 10 
  },
  xpText: { 
    fontSize: 14, 
    color: "#BBBBBB" 
  },
  xpValue: { 
    fontSize: 14, 
    fontWeight: "bold", 
    color: "#FFFFFF" 
  },
  progressBar: { 
    height: 8, 
    borderRadius: 5, 
    backgroundColor: "#333", 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 10, 
    color: "#FFFFFF" 
  },
  achievementItem: { 
    flex: 1, 
    alignItems: "center", 
    marginBottom: 20, 
    padding: 5 
  },
  achievementIcon: { 
    fontSize: 24, 
    marginBottom: 5 
  },
  achievementText: { 
    fontSize: 12, 
    color: "#BBBBBB", 
    textAlign: "center" 
  },
  statsContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 20, 
    paddingHorizontal: 20 
  },
  statItem: { 
    alignItems: "center", 
    flex: 1 
  },
  statNumber: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#FFFFFF" 
  },
  statLabel: { 
    fontSize: 12, 
    color: "#BBBBBB" 
  },
});


export default ProfileScreen;
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebaseConfig";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { ProgressBar } from "react-native-paper";
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLevelFromXP, getXPForNextLevel } from "../utils/levelUtils"; 
import { checkAndAwardAchievements } from "../utils/awardAchievements";
import { FontAwesome5 } from '@expo/vector-icons';
import { signOut, onAuthStateChanged } from "firebase/auth";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allAchievements, setAllAchievements] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let unsubscribeFirestore = () => {};
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setUserData(null);
      unsubscribeFirestore();

      if (!user) {
        setLoading(false);
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        unsubscribeFirestore = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            await checkAndAwardAchievements(userRef, data, data.achievements);
          }
          setLoading(false);
        }, (error) => {
          if (error.code === "permission-denied") {
            console.log("Access to user data denied");
            setUserData(null);
          }
          setLoading(false);
        });

        const snapshot = await getDocs(collection(db, "masterAchievements"));
        setAllAchievements(snapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error initializing profile:", error);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeFirestore();
      unsubAuth();
    };
  }, [navigation]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  };

  if (loading || !userData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const {
    username = "User",
    level = 1,
    title = "Beginner",
    xp = 0,
    achievements = {},
    quests = 0,
    streak = 0,
    caloriesBurned = 0,
    profilePic,
    profilePicBase64, 
    bio = "",
  } = userData;

  const currentLevel = getLevelFromXP(xp);
  const xpForNextLevel = getXPForNextLevel(currentLevel);
  const xpForCurrentLevel = currentLevel === 1 ? 0 : getXPForNextLevel(currentLevel - 1);

  const xpProgress = xpForNextLevel > xpForCurrentLevel
    ? (xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)
    : 0;

  const profilePicture = profilePicBase64 || profilePic || null;

  const achievementList = allAchievements
    .map((ach) => ({
      ...ach,
      unlocked: !!achievements[ach.title],
    }))
    .sort((a, b) => {
      if (a.unlocked === b.unlocked) return 0;
      return a.unlocked ? -1 : 1;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
     
      <View style={styles.header}>
        <FontAwesome5 name="running" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Adventurer's Stats</Text>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.profilePlaceholder]}>
              <Ionicons name="person-circle" size={50} color="#aaa" />
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
        <Text style={styles.xpValue}>{xp.toLocaleString()} / {xpForNextLevel.toLocaleString()}</Text>
      </View>
      <ProgressBar progress={xpProgress} color="#4CAF50" style={styles.progressBar} />

      <Text style={styles.sectionTitle}>Achievements</Text>
      <FlatList
        data={achievementList}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.achievementItem}>
            <FontAwesome5
              name={item.icon}
              size={24}
              color={item.unlocked ? "#4CAF50" : "#888"}
              style={styles.achievementIcon}
            />
            <Text style={[styles.achievementText, { opacity: item.unlocked ? 1 : 0.3 }]}>{item.title}</Text>
          </View>
        )}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{quests}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{streak}</Text>
          <Text style={styles.statLabel}>Days Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{caloriesBurned}</Text>
          <Text style={styles.statLabel}>Cal Burned</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  header: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  profileContainer: { alignItems: "center", marginBottom: 20 },
  profileImageContainer: { position: "relative", marginBottom: 10 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  profilePlaceholder: { backgroundColor: "#333", justifyContent: "center", alignItems: "center" },
  levelBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#4CAF50", borderRadius: 12, padding: 5, minWidth: 40, alignItems: "center" },
  levelText: { color: "white", fontSize: 12, fontWeight: "bold" },
  username: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  userTitle: { fontSize: 14, color: "#AAAAAA", marginBottom: 5 },
  bioText: { fontSize: 14, color: "#DDDDDD", textAlign: "center", maxWidth: "80%" },
  xpContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  xpText: { fontSize: 14, color: "#BBBBBB" },
  xpValue: { fontSize: 14, fontWeight: "bold", color: "#FFFFFF" },
  progressBar: { height: 8, borderRadius: 5, backgroundColor: "#333", marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#FFFFFF" },
  achievementItem: { flex: 1, alignItems: "center", marginBottom: 20, padding: 5 },
  achievementIcon: { fontSize: 24, marginBottom: 5 },
  achievementText: { fontSize: 12, color: "#BBBBBB", textAlign: "center" },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, paddingHorizontal: 20 },
  statItem: { alignItems: "center", flex: 1 },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  statLabel: { fontSize: 12, color: "#BBBBBB" },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#FF5252",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;

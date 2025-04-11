import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged } from "firebase/auth";

const LeaderboardScreen = () => {
  const [topPlayers, setTopPlayers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!auth.currentUser); // track login

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // true if user exists
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!isLoggedIn) return;
  
    setLoading(true);
    const usersQuery = query(collection(db, "users"), orderBy("xp", "desc"));
  
    const unsubscribe = onSnapshot(
      usersQuery,
      (querySnapshot) => {
        if (!auth.currentUser) return; // 🛡️ Prevent processing after logout
  
        try {
          const usersData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            isYou: doc.id === auth.currentUser?.uid,
          }));
  
          const formatXP = (xp) => xp?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  
          const rankedUsers = usersData.map((player, index) => ({
            ...player,
            xp: `${formatXP(player.xp)} XP`,
            rank: index + 1,
          }));
  
          const topPlayers = rankedUsers.slice(0, 3).map((player, index) => ({
            ...player,
            position: `${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : "rd"}`,
          }));
  
          const otherPlayers = rankedUsers.slice(3);
  
          setTopPlayers(topPlayers);
          setPlayers(otherPlayers);
          setLoading(false);
        } catch (error) {
          console.error("Error processing snapshot:", error);
          setLoading(false);
        }
      },
      (error) => {
        if (error.code === "permission-denied") {
          console.warn("❌ LeaderboardScreen snapshot blocked after logout");
          setTopPlayers([]);
          setPlayers([]);
          setLoading(false);
        } else {
          console.error("🔥 Snapshot error in leaderboard:", error);
          setLoading(false);
        }
      }
    );
  
    return () => unsubscribe();
  }, [isLoggedIn]);
  

  const onRefresh = async () => {
    setRefreshing(true);
    // The data will automatically update via the snapshot listener
    setRefreshing(false);
  };

  const renderProfilePicture = (player) => {
    if (player.profilePicBase64) {
      return <Image source={{ uri: player.profilePicBase64 }} style={styles.avatar} />;
    }
    if (player.profilePic) {
      return <Image source={{ uri: player.profilePic }} style={styles.avatar} />;
    }
    return (
      <View style={styles.defaultAvatar}>
        <FontAwesome name="user-circle" size={40} color="white" />
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="white" style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.headerCentered}>
        <FontAwesome name="trophy" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Top Adventurers</Text>
      </View>


      {/* Top 3 Players */}
      <View style={styles.topContainer}>
        {topPlayers.map((player) => (
          <View key={player.id} style={styles.topCard}>
            <Text style={styles.positionText}>{player.position}</Text>
            {renderProfilePicture(player)}
            <Text style={styles.playerName}>{player.username || 'Anonymous'}</Text>
            <Text style={styles.xpText}>{player.xp}</Text>
          </View>
        ))}
      </View>

      {/* Other Players List */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.playerRow, item.isYou && styles.highlighted]}>
            <Text style={styles.rankText}>{item.rank}</Text>
            {renderProfilePicture(item)}
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{item.name || 'Anonymous'}</Text>
              <Text style={styles.xpText}>{item.xp}</Text>
            </View>
            {item.isYou && <FontAwesome name="crown" size={16} color="white" style={styles.crownIcon} />}
          </View>
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  topCard: {
    backgroundColor: "#242424",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "30%",
  },
  positionText: {
    color: "#bbb",
    fontSize: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#333",
  },
  playerName: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  xpText: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#242424",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  highlighted: {
    backgroundColor: "#333",
  },
  rankText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    width: 30,
    marginRight: 10,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  crownIcon: {
    marginLeft: "auto",
  },
  headerCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },  
});

export default LeaderboardScreen;
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";

const LeaderboardScreen = () => {
  const [topPlayers, setTopPlayers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLoading(true);
    const usersQuery = query(collection(db, "users"), orderBy("xp", "desc"));
    
    // onSnapshot returns an unsubscribe function
    const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
      try {
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isYou: doc.id === auth.currentUser?.uid,
        }));

        // Format XP with commas
        const formatXP = (xp) => xp?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";

        // Assign ranks to all players
        const rankedUsers = usersData.map((player, index) => ({
          ...player,
          xp: `${formatXP(player.xp)} XP`,
          rank: index + 1,
        }));

        // Top 3 players
        const topPlayers = rankedUsers.slice(0, 3).map((player, index) => ({
          ...player,
          position: `${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : "rd"}`,
        }));

        // Other players
        const otherPlayers = rankedUsers.slice(3);

        setTopPlayers(topPlayers);
        setPlayers(otherPlayers);
        setLoading(false);
      } catch (error) {
        console.error("Error processing snapshot:", error);
        setLoading(false);
      }
    });

    // Return the cleanup function
    return () => {
      unsubscribe(); // Call the unsubscribe function
    };
  }, []);

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <FontAwesome name="trophy" size={18} color="white" />
        <Text style={styles.headerTitle}>Leaderboard</Text>
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
    </View>
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
    marginLeft: 10,
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
});

export default LeaderboardScreen;
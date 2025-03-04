import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";

const LeaderboardScreen = () => {
  const [topPlayers, setTopPlayers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          isYou: doc.id === auth.currentUser?.uid, // Highlight the current user
        }));

        // Sort users by XP in descending order
        const sortedUsers = usersData.sort((a, b) => b.xp - a.xp);

        // Format XP with commas (e.g., 28890 -> "28,890")
        const formatXP = (xp) => xp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        // Assign ranks to all players
        const rankedUsers = sortedUsers.map((player, index) => ({
          ...player,
          xp: `${formatXP(player.xp)} XP`,
          rank: index + 1, // Assign rank based on position in the sorted list
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
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
            {/* Display profile picture or default icon */}
            {player.profilePic ? (
              <Image source={{ uri: player.profilePic }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <FontAwesome name="user-circle" size={40} color="white" />
              </View>
            )}
            <Text style={styles.playerName}>{player.name}</Text>
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
            {/* Rank */}
            <Text style={styles.rankText}>{item.rank}</Text>

            {/* Profile Picture */}
            {item.profilePic ? (
              <Image source={{ uri: item.profilePic }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <FontAwesome name="user-circle" size={40} color="white" />
              </View>
            )}

            {/* Name and XP */}
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{item.name}</Text>
              <Text style={styles.xpText}>{item.xp}</Text>
            </View>

            {/* Crown Icon for Current User */}
            {item.isYou && <FontAwesome name="crown" size={16} color="white" style={styles.crownIcon} />}
          </View>
        )}
      />
    </View>
  );
};

export default LeaderboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },

  // Header
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

  // Top Players
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

  // Other Players List
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
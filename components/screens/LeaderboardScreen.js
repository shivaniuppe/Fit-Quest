import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
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

        // Top 3 players
        const topPlayers = sortedUsers.slice(0, 3).map((player, index) => ({
          ...player,
          xp: `${formatXP(player.xp)} XP`,
          position: `${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : "rd"}`,
        }));

        // Other players
        const otherPlayers = sortedUsers.slice(3).map((player) => ({
          ...player,
          xp: `${formatXP(player.xp)} XP`,
        }));

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
            <Text style={styles.avatar}>{player.avatar || "👤"}</Text>
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
            <Text style={styles.rankText}>{item.id}</Text>
            <Text style={styles.avatar}>{item.avatar || "👤"}</Text>
            <View>
              <Text style={styles.playerName}>{item.name}</Text>
              <Text style={styles.xpText}>{item.xp}</Text>
            </View>
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
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold", marginLeft: 10 },

  // Top Players
  topContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  topCard: { backgroundColor: "#242424", padding: 10, borderRadius: 10, alignItems: "center", width: "30%" },
  positionText: { color: "#bbb", fontSize: 14, marginBottom: 5 },
  avatar: { fontSize: 40, marginBottom: 5 },
  playerName: { color: "white", fontSize: 14, fontWeight: "bold" },
  xpText: { color: "#aaa", fontSize: 12 },

  // Other Players List
  playerRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#242424", padding: 15, borderRadius: 10, marginBottom: 10 },
  highlighted: { backgroundColor: "#333" },
  rankText: { color: "white", fontSize: 16, fontWeight: "bold", width: 30 },
  crownIcon: { marginLeft: "auto" },
});
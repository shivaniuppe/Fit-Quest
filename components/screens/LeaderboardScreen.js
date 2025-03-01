import React from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

const topPlayers = [
  { id: "1", name: "Mike R.", xp: "28,890 XP", position: "1st", avatar: "😎" },
  { id: "2", name: "Sarah K.", xp: "24,650 XP", position: "2nd", avatar: "😊" },
  { id: "3", name: "Alex M.", xp: "22,340 XP", position: "3rd", avatar: "😌" },
];

const players = [
  { id: "4", name: "You", xp: "21,450 XP", isYou: true, avatar: "😃" },
  { id: "5", name: "Emma S.", xp: "20,890 XP", avatar: "🙂" },
  { id: "6", name: "John D.", xp: "19,670 XP", avatar: "🖼️" }, // Placeholder for image
];

const LeaderboardScreen = () => {
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
            <Text style={styles.avatar}>{player.avatar}</Text>
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
            <Text style={styles.avatar}>{item.avatar}</Text>
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

  // Bottom Navigation
  bottomNav: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 15, backgroundColor: "#242424", borderRadius: 10 },
});

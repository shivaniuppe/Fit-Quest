import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from "react-native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged } from "firebase/auth";

const LeaderboardScreen = () => {
  // States to store top 3 players, rest of the players, loading status, refresh status and login status
  const [topPlayers, setTopPlayers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!auth.currentUser);

  // Watch auth state to update login status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to the leaderboard data when user is logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    setLoading(true);
    const usersQuery = query(collection(db, "users"), orderBy("xp", "desc"));

    const unsubscribe = onSnapshot(
      usersQuery,
      (querySnapshot) => {
        if (!auth.currentUser) return;

        try {
          // Get users and mark current user
          const usersData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            isYou: doc.id === auth.currentUser?.uid,
          }));

          // Format XP with commas
          const formatXP = (xp) => xp?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";

          // Add ranks and format XP
          const rankedUsers = usersData.map((player, index) => ({
            ...player,
            xp: `${formatXP(player.xp)} XP`,
            rank: index + 1,
          }));

          // Extract top 3 players
          const topPlayers = rankedUsers.slice(0, 3).map((player, index) => ({
            ...player,
            position: `${index + 1}${index === 0 ? "st" : index === 1 ? "nd" : "rd"}`,
          }));

          // Rest of the players
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
        // Handle snapshot errors, especially after logout
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

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  // Render profile picture or fallback
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

  // Show loading spinner until data is ready
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

      {/* Top 3 players displayed in cards */}
      <View style={styles.topContainer}>
        {topPlayers.map((player) => (
          <View
            key={player.id}
            style={[
              styles.topCard,
              player.isYou && styles.highlighted // Highlight if current user
            ]}
          >
            <Text style={styles.positionText}>{player.position}</Text>
            {renderProfilePicture(player)}
            <Text style={styles.playerName}>
              {player.isYou ? "You" : player.username || 'Anonymous'}
            </Text>
            <Text style={styles.xpText}>{player.xp}</Text>
            {/* Show crown for yourself if in top 3 */}
            {player.isYou && (
              <FontAwesome5 name="crown" size={18} color="white" style={{ marginTop: 6 }} />
            )}
          </View>
        ))}
      </View>

      {/* List of players from rank 4 onwards */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.playerRow, item.isYou && styles.highlighted]}>
            <Text style={styles.rankText}>{item.rank}</Text>
            {renderProfilePicture(item)}
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {item.isYou ? "You" : item.username || 'Anonymous'}
              </Text>
              <Text style={styles.xpText}>{item.xp}</Text>
            </View>
            {/* Crown for current user if not in top 3 */}
            {item.isYou && (
              <FontAwesome5 name="crown" size={16} color="white" style={styles.crownIcon} />
            )}
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

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    justifyContent: "center",
    width: "30%",
  },
  highlighted: {
    backgroundColor: "#333",
  },
  positionText: {
    color: "#bbb",
    fontSize: 14,
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
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
    marginTop: 4,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#242424",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
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
    marginLeft: 8,
  },
});

export default LeaderboardScreen;

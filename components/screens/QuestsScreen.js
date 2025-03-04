import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { db, auth } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";
import { collection, getDocs, doc, updateDoc, getDoc, setDoc, query, where, onSnapshot } from "firebase/firestore";

const QuestsScreen = ({ navigation }) => {
  const [quests, setQuests] = useState([]);
  const [acceptedQuests, setAcceptedQuests] = useState([]);
  const [activeTab, setActiveTab] = useState("available"); // State to manage active tab

  useEffect(() => {
    const fetchQuests = async () => {
      const querySnapshot = await getDocs(collection(db, "quests"));
      const questsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuests(questsData);
    };

    fetchQuests();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) {
      setAcceptedQuests([]); // Clear accepted quests if no user is logged in
      return;
    }

    const userId = auth.currentUser.uid;

    // Listen for real-time updates to the userQuests collection
    const userQuestsRef = collection(db, "userQuests");
    const userQuestsQuery = query(userQuestsRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(userQuestsQuery, (querySnapshot) => {
      const acceptedQuestsData = querySnapshot.docs.map((doc) => ({
        questId: doc.data().questId,
        status: doc.data().status, // Include the status of the quest
      }));
      setAcceptedQuests(acceptedQuestsData);
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [auth.currentUser]);

  // Separate quests into available and accepted
  const availableQuests = quests.filter(
    (quest) => !acceptedQuests.some((acceptedQuest) => acceptedQuest.questId === quest.id)
  );
  const acceptedQuestsList = quests.filter((quest) =>
    acceptedQuests.some((acceptedQuest) => acceptedQuest.questId === quest.id)
  );

  // Render the appropriate list based on the active tab
  const renderQuests = () => {
    if (activeTab === "available") {
      return (
        <FlatList
          data={availableQuests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.questCard}>
              <View style={styles.questInfo}>
                {item.iconType === "FontAwesome5" && (
                  <FontAwesome5 name={item.icon} size={20} color="white" style={styles.questIcon} />
                )}
                <View>
                  <Text style={styles.questTitle}>{item.title}</Text>
                  <Text style={styles.questCategory}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.questXP}>⭐ {item.xp} XP</Text>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={async () => {
                  if (!auth.currentUser || acceptedQuests.some((acceptedQuest) => acceptedQuest.questId === item.id)) return;

                  const userId = auth.currentUser.uid;
                  const userQuestRef = doc(db, "userQuests", `${userId}_${item.id}`);

                  try {
                    // Add the quest to the userQuests collection
                    await setDoc(userQuestRef, {
                      userId,
                      questId: item.id,
                      status: "accepted",
                      progress: 0, // Initial progress
                      startedAt: new Date().toISOString(),
                      completedAt: null,
                    });

                    // Update the local state
                    setAcceptedQuests([...acceptedQuests, { questId: item.id, status: "accepted" }]);
                    alert("Quest accepted!");
                  } catch (error) {
                    console.error("Error accepting quest:", error);
                  }
                }}
                disabled={acceptedQuests.some((acceptedQuest) => acceptedQuest.questId === item.id)}
              >
                <Text style={styles.acceptButtonText}>Accept Quest</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      );
    } else {
      return (
        <FlatList
          data={acceptedQuestsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            // Find the status of the quest
            const questStatus = acceptedQuests.find(
              (acceptedQuest) => acceptedQuest.questId === item.id
            )?.status;

            return (
              <View style={styles.questCard}>
                <View style={styles.questInfo}>
                  {item.iconType === "FontAwesome5" && (
                    <FontAwesome5 name={item.icon} size={20} color="white" style={styles.questIcon} />
                  )}
                  <View>
                    <Text style={styles.questTitle}>{item.title}</Text>
                    <Text style={styles.questCategory}>{item.category}</Text>
                  </View>
                </View>
                <Text style={styles.questXP}>⭐ {item.xp} XP</Text>
                <TouchableOpacity
                  style={[styles.acceptButton, { backgroundColor: questStatus === "completed" ? "#4CAF50" : "gray" }]}
                  disabled
                >
                  <Text style={styles.acceptButtonText}>
                    {questStatus === "completed" ? "Completed" : "Accepted"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <Text style={styles.xpText}>💎 2,450</Text>
          <Image source={{ uri: "https://via.placeholder.com/40" }} style={styles.avatar} />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Select Your Quest</Text>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "available" && styles.activeTab]}
          onPress={() => setActiveTab("available")}
        >
          <Text style={styles.tabText}>Available Quests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "accepted" && styles.activeTab]}
          onPress={() => setActiveTab("accepted")}
        >
          <Text style={styles.tabText}>Accepted Quests</Text>
        </TouchableOpacity>
      </View>

      {/* Quest List */}
      {renderQuests()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  xpText: { color: "white", fontSize: 16, fontWeight: "bold", marginRight: 10 },
  avatar: { width: 35, height: 35, borderRadius: 17.5 },
  title: { color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "white",
  },
  tabText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  questCard: { backgroundColor: "#242424", padding: 15, borderRadius: 10, marginBottom: 15 },
  questInfo: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  questIcon: { marginRight: 10 },
  questTitle: { color: "white", fontSize: 16, fontWeight: "bold" },
  questCategory: { color: "#aaa", fontSize: 14 },
  questXP: { color: "white", alignSelf: "flex-end", fontSize: 14, marginBottom: 10 },
  acceptButton: { backgroundColor: "#3A3A3A", padding: 10, borderRadius: 5, alignItems: "center" },
  acceptButtonText: { color: "white", fontSize: 14, fontWeight: "bold" },
});

export default QuestsScreen;
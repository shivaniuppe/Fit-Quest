import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { auth, db } from "../../firebaseConfig";
import { collection, getDocs, doc, setDoc, query, where, onSnapshot } from "firebase/firestore";
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged } from "firebase/auth";

const QuestsScreen = ({ navigation }) => {
  const [quests, setQuests] = useState([]); // All quests from master list
  const [acceptedQuests, setAcceptedQuests] = useState([]); // User's accepted quests
  const [activeTab, setActiveTab] = useState("available"); // Tab state
  const [isLoggedIn, setIsLoggedIn] = useState(!!auth.currentUser); // Auth status

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); 
    });

    return () => unsubscribe();
  }, []);

  // Fetch all available quests from Firestore
  useEffect(() => {
    const fetchQuests = async () => {
      const querySnapshot = await getDocs(collection(db, "quests"));
      const questsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuests(questsData);
    };

    fetchQuests();
  }, []);

  // Listen for real-time updates to user's accepted quests
  useEffect(() => {
    if (!isLoggedIn) {
      setAcceptedQuests([]); 
      return;
    }
  
    const userId = auth.currentUser.uid;
    const userQuestsRef = collection(db, "userQuests");
    const userQuestsQuery = query(userQuestsRef, where("userId", "==", userId));
  
    const unsubscribe = onSnapshot(
      userQuestsQuery,
      (querySnapshot) => {
        if (!auth.currentUser) return; 
        const acceptedQuestsData = querySnapshot.docs.map((doc) => ({
          questId: doc.data().questId,
          status: doc.data().status,
        }));
        setAcceptedQuests(acceptedQuestsData);
      },
      (error) => {
        if (error.code === "permission-denied") {
          console.warn("❌ QuestsScreen snapshot blocked after logout");
          setAcceptedQuests([]);
        } else {
          console.error("🔥 QuestsScreen snapshot error:", error);
        }
      }
    );
  
    return () => unsubscribe();
  }, [isLoggedIn]);
  
  // Filter logic for tabs
  const availableQuests = quests.filter(
    (quest) => !acceptedQuests.some((acceptedQuest) => acceptedQuest.questId === quest.id)
  );
  const acceptedQuestsList = quests.filter((quest) =>
    acceptedQuests.some((acceptedQuest) => acceptedQuest.questId === quest.id)
  );

  // Render quests based on selected tab
  const renderQuests = () => {
    if (activeTab === "available") {
      return (
        <FlatList
          data={availableQuests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.questCard}>
              {/* Quest info display */}
              <View style={styles.questInfo}>
                {item.iconType === "FontAwesome5" && (
                  <FontAwesome5 name={item.icon} size={20} color="white" style={styles.questIcon} />
                )}
                <View>
                  <Text style={styles.questTitle}>{item.title}</Text>
                  <Text style={styles.questCategory}>{item.category}</Text>
                </View>
              </View>

              {/* XP value */}
              <Text style={styles.questXP}>⭐ {item.xp} XP</Text>

              {/* Accept quest button */}
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={async () => {
                  if (!auth.currentUser || acceptedQuests.some((q) => q.questId === item.id)) return;

                  const userId = auth.currentUser.uid;
                  const userQuestRef = doc(db, "userQuests", `${userId}_${item.id}`);

                  try {
                    await setDoc(userQuestRef, {
                      userId,
                      questId: item.id,
                      status: "accepted",
                      startedAt: new Date().toISOString(),
                      completedAt: null,
                    });

                    setAcceptedQuests([...acceptedQuests, { questId: item.id, status: "accepted" }]);
                    alert("Quest accepted!");
                  } catch (error) {
                    console.error("Error accepting quest:", error);
                  }
                }}
                disabled={acceptedQuests.some((q) => q.questId === item.id)}
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
            const questStatus = acceptedQuests.find((q) => q.questId === item.id)?.status;

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

                {/* Accepted or completed status button (disabled) */}
                <TouchableOpacity
                  style={[
                    styles.acceptButton,
                    { backgroundColor: questStatus === "completed" ? "#4CAF50" : "gray" },
                  ]}
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.headerCentered}>
        <FontAwesome5 name="scroll" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.title}>Select Your Quest</Text>
      </View>

      {/* Tab bar for Available vs Accepted */}
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

      {/* Render quest list */}
      {renderQuests()}
    </SafeAreaView>
  );
};

// Styles 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  xpText: { color: "white", fontSize: 16, fontWeight: "bold", marginRight: 10 },
  avatar: { width: 35, height: 35, borderRadius: 17.5 },
  title: { color: "white", fontSize: 20, fontWeight: "bold" },
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
  headerCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
});

export default QuestsScreen;

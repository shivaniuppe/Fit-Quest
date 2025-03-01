import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { db } from "/Users/shivaniuppe/Desktop/FitQuest/firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";

const QuestsScreen = ({ navigation }) => {
  const [quests, setQuests] = useState([]);

  useEffect(() => {
    const fetchQuests = async () => {
      const querySnapshot = await getDocs(collection(db, "quests"));
      const questsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuests(questsData);
    };

    fetchQuests();
  }, []);

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

      {/* Quest List */}
      <FlatList
        data={quests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.questCard}>
            <View style={styles.questInfo}>
              {item.iconType === "FontAwesome5" && <FontAwesome5 name={item.icon} size={20} color="white" style={styles.questIcon} />}
              <View>
                <Text style={styles.questTitle}>{item.title}</Text>
                <Text style={styles.questCategory}>{item.category}</Text>
              </View>
            </View>
            <Text style={styles.questXP}>⭐ {item.xp} XP</Text>
            <TouchableOpacity style={styles.acceptButton}>
              <Text style={styles.acceptButtonText}>Accept Quest</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121212", padding: 20 },
    
    // Header
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    headerIcons: { flexDirection: "row", alignItems: "center" },
    xpText: { color: "white", fontSize: 16, fontWeight: "bold", marginRight: 10 },
    avatar: { width: 35, height: 35, borderRadius: 17.5 },
  
    // Background Placeholder
    backgroundText: { color: "#555", textAlign: "center", marginBottom: 15, fontSize: 14 },
  
    // Title
    title: { color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  
    // Quest Cards
    questCard: { backgroundColor: "#242424", padding: 15, borderRadius: 10, marginBottom: 15 },
    questInfo: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    questIcon: { marginRight: 10 },
    questTitle: { color: "white", fontSize: 16, fontWeight: "bold" },
    questCategory: { color: "#aaa", fontSize: 14 },
    questXP: { color: "white", alignSelf: "flex-end", fontSize: 14, marginBottom: 10 },
  
    // Accept Button
    acceptButton: { backgroundColor: "#3A3A3A", padding: 10, borderRadius: 5, alignItems: "center" },
    acceptButtonText: { color: "white", fontSize: 14, fontWeight: "bold" },
  });
  

export default QuestsScreen;

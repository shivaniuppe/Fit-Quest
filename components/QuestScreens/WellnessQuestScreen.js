import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";

const WellnessQuestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quest } = route.params;

  const [checkedOff, setCheckedOff] = useState(false);
  const [wasResumed, setWasResumed] = useState(false);

  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const saved = await AsyncStorage.getItem(`wellnessState_${quest.id}`);
        if (saved === 'true') {
          setCheckedOff(true);
          setWasResumed(true);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    };

    loadSavedState();
  }, [quest.id]);

  useEffect(() => {
    if (checkedOff) {
      AsyncStorage.setItem(`wellnessState_${quest.id}`, 'true');
    }
  }, [checkedOff, quest.id]);

  const handleCompleteQuest = async () => {
    if (!auth.currentUser) return;
  
    const userId = auth.currentUser.uid;
    const userQuestRef = doc(db, 'userQuests', `${userId}_${quest.id}`);
    const userRef = doc(db, 'users', userId);
    const questRef = doc(db, 'quests', quest.id);
  
    try {
      await updateDoc(userQuestRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        progress: 1,
      });
  
      await AsyncStorage.removeItem(`wellnessState_${quest.id}`);
  
      const questSnap = await getDoc(questRef);
      const userSnap = await getDoc(userRef);
  
      if (questSnap.exists() && userSnap.exists()) {
        const xpEarned = questSnap.data().xp || 0;
        const userData = userSnap.data();
        const prevXP = userData.xp || 0;
        const prevQuests = userData.quests || 0; // ✅ track quests
        const newXP = prevXP + xpEarned;
        const newLevel = Math.floor(newXP / 100) + 1;
  
        await updateDoc(userRef, {
          xp: newXP,
          level: newLevel,
          quests: prevQuests + 1, // ✅ increment quests field
        });
  
        Alert.alert('Quest Complete!', `You earned ${xpEarned} XP!`, [
          { text: 'Great!', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error completing wellness quest:', error);
      Alert.alert('Error', 'Could not complete quest. Please try again.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quest.title}</Text>
      <View style={styles.infoRow}>
        <FontAwesome5 name={quest.icon} size={20} color="#FFA500" style={styles.icon} />
        <Text style={styles.goalText}>Goal: {quest.goal}</Text>
      </View>

      <Text style={styles.instruction}>
        Once you've completed this wellness goal, tap the button below to mark it as done.
      </Text>

      <TouchableOpacity
        style={[styles.checkButton, checkedOff && styles.checked]}
        onPress={() => setCheckedOff(!checkedOff)}
      >
        <Text style={styles.checkButtonText}>
          {checkedOff ? (wasResumed ? '✔ Resumed - Marked as Done' : '✔ Marked as Done') : 'Mark as Done'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.completeButton, !checkedOff && styles.disabledButton]}
        onPress={handleCompleteQuest}
        disabled={!checkedOff}
      >
        <Text style={styles.buttonText}>Complete Quest</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WellnessQuestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  checkButton: {
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  checked: {
    backgroundColor: '#4CAF50',
  },
  checkButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
});

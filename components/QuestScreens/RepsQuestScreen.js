import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";

const RepsQuestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quest } = route.params;

  const totalReps = parseInt(quest.goal); // e.g. 30
  const repsPerSet = 10;
  const totalSets = Math.ceil(totalReps / repsPerSet);

  const [setsCompleted, setSetsCompleted] = useState(0);
  const repsDone = setsCompleted * repsPerSet;
  const progress = Math.min(repsDone / totalReps, 1); // cap at 100%

  const handleCompleteSet = () => {
    if (repsDone < totalReps) {
      setSetsCompleted(setsCompleted + 1);
    }
  };

  const handleCompleteQuest = async () => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const userQuestRef = doc(db, 'userQuests', `${userId}_${quest.id}`);
    const userRef = doc(db, 'users', userId);
    const questRef = doc(db, 'quests', quest.id);

    try {
      // Mark quest as completed
      await updateDoc(userQuestRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        progress: 1,
      });

      const questSnap = await getDoc(questRef);
      const userSnap = await getDoc(userRef);

      if (questSnap.exists() && userSnap.exists()) {
        const xpEarned = questSnap.data().xp || 0;
        const prevXP = userSnap.data().xp || 0;
        const newXP = prevXP + xpEarned;
        const newLevel = Math.floor(newXP / 100) + 1;

        await updateDoc(userRef, {
          xp: newXP,
          level: newLevel,
        });

        Alert.alert('Quest Complete!', `You earned ${xpEarned} XP!`, [
          { text: 'Awesome!', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error completing reps quest:', error);
      Alert.alert('Error', 'Could not complete quest. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quest.title}</Text>
      <View style={styles.infoRow}>
        <FontAwesome5 name={quest.icon} size={20} color="#FFA500" style={styles.icon} />
        <Text style={styles.goalText}>Goal: {totalReps} reps ({totalSets} sets)</Text>
      </View>

      <View style={styles.progressSection}>
        <Progress.Bar
          progress={progress}
          width={null}
          height={10}
          color="#4CAF50"
          unfilledColor="#E5E5E5"
          borderWidth={0}
        />
        <Text style={styles.progressText}>{repsDone} / {totalReps} reps ({setsCompleted} sets)</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.setButton,
          repsDone >= totalReps && styles.disabledButton
        ]}
        onPress={handleCompleteSet}
        disabled={repsDone >= totalReps}
      >
        <Text style={styles.buttonText}>Complete Set (+{repsPerSet} reps)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.completeButton,
          repsDone < totalReps && styles.disabledButton
        ]}
        onPress={handleCompleteQuest}
        disabled={repsDone < totalReps}
      >
        <Text style={styles.buttonText}>Complete Quest</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RepsQuestScreen;

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
  progressSection: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  setButton: {
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

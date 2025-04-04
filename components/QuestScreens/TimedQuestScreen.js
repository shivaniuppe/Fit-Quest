import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { auth, db } from '/Users/shivaniuppe/Desktop/Fit-Quest/secrets.js';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TimedQuestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quest } = route.params;

  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [wasResumed, setWasResumed] = useState(false); // ✅ NEW
  const timerRef = useRef(null);

  // Load or restore timer state
  useEffect(() => {
    const loadSavedTimer = async () => {
      try {
        const saved = await AsyncStorage.getItem(`timerState_${quest.id}`);
        if (saved) {
          const { timeLeft: savedTime, timestamp } = JSON.parse(saved);
          const secondsSinceLeft = Math.floor((Date.now() - timestamp) / 1000);
          const newTimeLeft = savedTime - secondsSinceLeft;

          if (newTimeLeft > 0) {
            setTimeLeft(newTimeLeft);
            setInitialTime(newTimeLeft);
            setWasResumed(true); // ✅ NEW
            return;
          }
        }
      } catch (error) {
        console.error('Error loading saved timer:', error);
      }

      // If no saved state or expired, initialize normally
      const parts = quest.goal.split(':');
      const totalSeconds = parts.length === 2
        ? parseInt(parts[0]) * 60 + parseInt(parts[1])
        : parseInt(parts[0]);
      setTimeLeft(totalSeconds);
      setInitialTime(totalSeconds);
    };

    loadSavedTimer();
  }, [quest.goal]);

  // Save timer state on unmount
  useEffect(() => {
    return () => {
      if (isRunning && timeLeft > 0) {
        AsyncStorage.setItem(
          `timerState_${quest.id}`,
          JSON.stringify({ timeLeft, timestamp: Date.now() })
        );
      }
    };
  }, [isRunning, timeLeft]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleStartTimer = () => {
    setIsRunning(true);
  };

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

      await AsyncStorage.removeItem(`timerState_${quest.id}`); // ✅ Cleanup

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
      console.error('Error completing timed quest:', error);
      Alert.alert('Error', 'Could not complete quest. Please try again.');
    }
  };

  const progress = 1 - timeLeft / initialTime;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quest.title}</Text>
      <View style={styles.infoRow}>
        <FontAwesome5 name={quest.icon} size={20} color="#FFA500" style={styles.icon} />
        <Text style={styles.goalText}>Duration: {quest.goal}</Text>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Progress.Bar
          progress={progress}
          width={null}
          height={10}
          color="#4CAF50"
          unfilledColor="#E5E5E5"
          borderWidth={0}
          style={{ marginTop: 16 }}
        />
      </View>

      {!isRunning ? (
        <TouchableOpacity style={styles.startButton} onPress={handleStartTimer}>
          <Text style={styles.buttonText}>
            {wasResumed ? "Resume Timer" : "Start Timer"}
          </Text>
        </TouchableOpacity>
      ) : timeLeft === 0 ? (
        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteQuest}>
          <Text style={styles.buttonText}>Complete Quest</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.runningText}>Timer is running...</Text>
      )}
    </View>
  );
};

export default TimedQuestScreen;

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
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  startButton: {
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
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
  runningText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { auth, db } from "../../firebaseConfig";
import { doc, updateDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { updateUserStatsOnQuestComplete } from "../utils/userStats";
import { updateActiveMinutes } from '../utils/updateActiveMinutes';
import ConfettiCannon from 'react-native-confetti-cannon';
import AbandonQuestModal from "../utils/AbandonQuestModal";

const TimedQuestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quest } = route.params;

  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(null);
  const timerRef = useRef(null);
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  useEffect(() => {
    const loadSavedTimer = async () => {
      try {
        const parts = quest.goal.split(':');
        const totalSeconds = parts.length === 2
          ? parseInt(parts[0]) * 60 + parseInt(parts[1])
          : parseInt(parts[0]);
        setTimeLeft(totalSeconds);
        setInitialTime(totalSeconds);
      } catch (error) {
        console.error('Error loading saved timer:', error);
      }
    };

    loadSavedTimer();
  }, [quest.goal]);

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
    const questRef = doc(db, 'quests', quest.id);

    try {
      await updateDoc(userQuestRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
      });

      const questSnap = await getDoc(questRef);
      if (questSnap.exists()) {
        const questData = questSnap.data();
        await updateUserStatsOnQuestComplete(userId, questData);
        await updateActiveMinutes(userId, quest.goal);

        setCompletionMessage(`+${questData.xp} XP · ${questData.calories} kcal burned`);
        setShowConfetti(true);

        setTimeout(() => {
          navigation.navigate("Home");
        }, 2500);
      }
    } catch (error) {
      console.error('❌ Error completing timed quest:', error);
    }
  };

  const progress = 1 - timeLeft / initialTime;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{quest.title}</Text>
  
        <View style={styles.infoRow}>
          <FontAwesome5 name={quest.icon} size={20} color="#FFD700" style={styles.icon} />
          <Text style={styles.goalText}>Duration: {quest.goal}</Text>
        </View>
  
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Progress.Bar
            progress={progress}
            width={null}
            height={10}
            color="#00FFB2"
            unfilledColor="#2c2c2c"
            borderWidth={0}
            style={{ marginTop: 16 }}
          />
        </View>
  
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStartTimer}>
            <Text style={styles.buttonText}>Start Timer</Text>
          </TouchableOpacity>
        ) : timeLeft === 0 ? (
          <TouchableOpacity style={styles.completeButton} onPress={handleCompleteQuest}>
            <Text style={styles.buttonText}>Complete Quest</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.runningText}>Timer is running...</Text>
        )}
  
          {timeLeft > 0 && (
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: "#cc3333", marginTop: 20 }]}
            onPress={() => setShowAbandonModal(true)}
          >
            <Text style={styles.buttonText}>Abandon Quest</Text>
          </TouchableOpacity>
        )}

      </View>
  
      {showConfetti && (
        <ConfettiCannon count={80} origin={{ x: 180, y: -20 }} fadeOut />
      )}
  
      {completionMessage && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🎉 Quest Complete! {completionMessage}</Text>
        </View>
      )}
  
      <AbandonQuestModal
        visible={showAbandonModal}
        questTitle={quest?.title}
        onCancel={() => setShowAbandonModal(false)}
        onConfirm={async () => {
          try {
            const userId = auth.currentUser?.uid;
            const userQuestRef = doc(db, "userQuests", `${userId}_${quest.id}`);
            await updateDoc(userQuestRef, { status: "abandoned" });
            await deleteDoc(userQuestRef); 
            setShowAbandonModal(false);
            alert("Quest abandoned. It'll return to the available quests.");
            navigation.navigate("Home", { screen: "Quests" }); 
          } catch (err) {
            console.error("Error abandoning timed quest:", err);
          }
        }}
      />
    </SafeAreaView>
  );
};

export default TimedQuestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 16,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#ffffff',
    textAlign: 'center',
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
    color: '#cccccc',
  },
  timerContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00FFB2',
  },
  startButton: {
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  runningText: {
    textAlign: 'center',
    color: '#aaaaaa',
    fontSize: 14,
    marginTop: 10,
  },
  banner: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  bannerText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});

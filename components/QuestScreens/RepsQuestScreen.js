import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { doc, updateDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { auth, db } from "../../firebaseConfig";
import { updateUserStatsOnQuestComplete } from "../utils/userStats";
import ConfettiCannon from 'react-native-confetti-cannon';
import AbandonQuestModal from "../utils/AbandonQuestModal";

const RepsQuestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quest } = route.params;

  // Total reps goal from quest data
  const totalReps = parseInt(quest.goal);
  const repsPerSet = 10;
  const totalSets = Math.ceil(totalReps / repsPerSet);

  // State tracking sets and UI
  const [setsCompleted, setSetsCompleted] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(null);
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  const repsDone = setsCompleted * repsPerSet;
  const progress = Math.min(repsDone / totalReps, 1); // Clamp progress to 1

  // Called each time user completes a set
  const handleCompleteSet = () => {
    if (repsDone < totalReps) {
      setSetsCompleted((prev) => prev + 1);
    }
  };

  // Complete quest: update Firestore, show confetti, navigate home
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

        setCompletionMessage(`+${questData.xp} XP · ${questData.calories} kcal burned`);
        setShowConfetti(true);

        setTimeout(() => {
          navigation.navigate("Home");
        }, 2500);
      }
    } catch (error) {
      console.error('Error completing reps quest:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{quest.title}</Text>

        {/* Goal Display */}
        <View style={styles.infoRow}>
          <FontAwesome5 name={quest.icon} size={20} color="#FFD700" style={styles.icon} />
          <Text style={styles.goalText}>Goal: {totalReps} reps ({totalSets} sets)</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <Progress.Bar
            progress={progress}
            width={null}
            height={10}
            color="#4CAF50"
            unfilledColor="#2c2c2c"
            borderWidth={0}
          />
          <Text style={styles.progressText}>
            {repsDone} / {totalReps} reps ({setsCompleted} sets)
          </Text>
        </View>

        {/* Complete Set Button */}
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

        {/* Show 'Complete Quest' if done, otherwise show 'Abandon' */}
        {repsDone >= totalReps ? (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteQuest}
          >
            <Text style={styles.buttonText}>Complete Quest</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.setButton, { backgroundColor: '#cc3333' }]}
            onPress={() => setShowAbandonModal(true)}
          >
            <Text style={styles.buttonText}>Abandon Quest</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Confetti animation when quest is completed */}
      {showConfetti && (
        <ConfettiCannon count={80} origin={{ x: 180, y: -20 }} fadeOut />
      )}

      {/* XP and calories completion banner */}
      {completionMessage && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🎉 Quest Complete! {completionMessage}</Text>
        </View>
      )}

      {/* Modal to confirm quest abandonment */}
      <AbandonQuestModal
        visible={showAbandonModal}
        questTitle={quest?.title}
        onCancel={() => setShowAbandonModal(false)}
        onConfirm={async () => {
          try {
            const userId = auth.currentUser?.uid;
            const userQuestRef = doc(db, "userQuests", `${userId}_${quest.id}`);
            await deleteDoc(userQuestRef);
            setShowAbandonModal(false);
            alert("Quest abandoned. It'll return to the available quests.");
            navigation.navigate("Home", { screen: "Quests" }); 
          } catch (error) {
            console.error("Error abandoning quest:", error);
            Alert.alert("Error", "Could not abandon quest. Try again.");
          }
        }}
      />
    </SafeAreaView>
  );
};

export default RepsQuestScreen;

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
    color: '#fff',
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
    color: '#ccc',
  },
  progressSection: {
    width: '100%',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  setButton: {
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
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
  disabledButton: {
    opacity: 0.5,
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

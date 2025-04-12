import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { doc, updateDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from "../../firebaseConfig";
import { updateUserStatsOnQuestComplete } from "../utils/userStats";
import ConfettiCannon from 'react-native-confetti-cannon';
import AbandonQuestModal from "../utils/AbandonQuestModal";

const WellnessQuestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quest } = route.params;

  const [checkedOff, setCheckedOff] = useState(false); // Track if user marked as done
  const [showConfetti, setShowConfetti] = useState(false); // Show celebration animation
  const [completionMessage, setCompletionMessage] = useState(null); // Message after completion
  const [showAbandonModal, setShowAbandonModal] = useState(false); // Modal for abandoning
  const [isCompleting, setIsCompleting] = useState(false); // Prevent double submit

  // Mark quest as completed and update stats in Firestore
  const handleCompleteQuest = async () => {
    if (!auth.currentUser || isCompleting) return;

    setIsCompleting(true);
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

        setShowConfetti(true); // Trigger confetti
        setTimeout(() => {
          navigation.navigate("Home");
        }, 2500);      

        setCompletionMessage(`+${questData.xp} XP · ${questData.calories} kcal burned`);
      }
    } catch (error) {
      console.error('❌ Error completing wellness quest:', error);
      Alert.alert('Error', 'Could not complete quest. Please try again.');
      setIsCompleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{quest.title}</Text>

        {/* Goal and icon display */}
        <View style={styles.infoRow}>
          <FontAwesome5 name={quest.icon} size={20} color="#FFD700" style={styles.icon} />
          <Text style={styles.goalText}>Goal: {quest.goal}</Text>
        </View>

        {/* Instructions */}
        <Text style={styles.instruction}>
          Once you've completed this wellness goal, tap the button below to mark it as done.
        </Text>

        {/* Mark as done button */}
        <TouchableOpacity
          style={[styles.checkButton, checkedOff && styles.checked]}
          onPress={() => setCheckedOff(true)}
          disabled={checkedOff}
        >
          <Text style={styles.buttonText}>
            {checkedOff ? '✔ Marked as Done' : 'Mark as Done'}
          </Text>
        </TouchableOpacity>

        {/* Show complete button only after marking done */}
        {checkedOff && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteQuest}
            disabled={isCompleting}
          >
            <Text style={styles.buttonText}>Complete Quest</Text>
          </TouchableOpacity>
        )}

        {/* Show abandon button only if not marked done */}
        {!checkedOff && (
          <TouchableOpacity 
            style={styles.abandonButton} 
            onPress={() => setShowAbandonModal(true)}
          >
            <Text style={styles.buttonText}>Abandon Quest</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Confetti animation on quest completion */}
      {showConfetti && (
        <ConfettiCannon count={80} origin={{ x: 180, y: -20 }} fadeOut />
      )}

      {/* Completion reward message */}
      {completionMessage && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🎉 Quest Complete! {completionMessage}</Text>
        </View>
      )}

      {/* Confirmation modal for abandoning quest */}
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

export default WellnessQuestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#fff',
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
  instruction: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
  },
  checkButton: {
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  checked: {
    backgroundColor: '#4CAF50',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
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
  abandonButton: {
    backgroundColor: '#cc3333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
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
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  }
});

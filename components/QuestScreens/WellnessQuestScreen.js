import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from "../../firebaseConfig";
import { updateUserStatsOnQuestComplete } from "../utils/userStats";
import ConfettiCannon from 'react-native-confetti-cannon';

const WellnessQuestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quest } = route.params;

  const [checkedOff, setCheckedOff] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(null);


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

        setShowConfetti(true); 

        setTimeout(() => {
          navigation.navigate("Home");
        }, 2500);      
        
        setCompletionMessage(`+${questData.xp} XP · ${questData.calories} kcal burned`);

      }
    } catch (error) {
      console.error('❌ Error completing wellness quest:', error);
      Alert.alert('Error', 'Could not complete quest. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{quest.title}</Text>

        <View style={styles.infoRow}>
          <FontAwesome5 name={quest.icon} size={20} color="#FFD700" style={styles.icon} />
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
            {checkedOff ? '✔ Marked as Done' : 'Mark as Done'}
          </Text>
        </TouchableOpacity>

        {checkedOff && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteQuest}
          >
            <Text style={styles.buttonText}>Complete Quest</Text>
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
    backgroundColor: '#00CC99',
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
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
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
  completeButton: {
    backgroundColor: '#00CC99',
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

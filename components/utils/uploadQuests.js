import { db } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const sampleQuests = [
    // Cardio Challenges
    { 
      title: "Run 2km", 
      category: "Cardio Challenge",
      environment: "Outdoor", 
      activityType: "Active", 
      fitnessCategory: "Cardio",
      xp: 200, 
      icon: "running", 
      iconType: "FontAwesome5", 
      status: "active", 
      goal: "2km" 
    },
    { 
      title: "Cycle 5km", 
      category: "Cardio Challenge", 
      environment: "Outdoor",
      activityType: "Active",
      fitnessCategory: "Cardio",
      xp: 250, 
      icon: "bicycle", 
      iconType: "FontAwesome5", 
      status: "active", 
      goal: "5km"
    },
    { 
      title: "Walk 5,000 Steps", 
      category: "Cardio Challenge",
      environment: "Any",
      activityType: "Active",
      fitnessCategory: "Cardio", 
      xp: 100, 
      icon: "shoe-prints", 
      iconType: "FontAwesome5", 
      status: "active", 
      goal: "5000"
    },
    { 
      title: "Jump Rope 100 Times", 
      category: "Cardio Challenge",
      environment: "Any",
      activityType: "Reps",
      fitnessCategory: "Cardio", 
      xp: 180, 
      icon: "skipping-rope", 
      iconType: "FontAwesome5", 
      status: "active", 
      goal: "100" 
    },
  
    // Strength Challenges
    { 
      title: "Do 50 Squats", 
      category: "Strength Challenge",
      environment: "Indoor",
      activityType: "Reps",
      fitnessCategory: "Strength", 
      xp: 150, 
      icon: "dumbbell", 
      iconType: "FontAwesome5", 
      status: "active", 
      goal: "50" 
    },
    { 
      title: "Push-ups 30 Times", 
      category: "Strength Challenge",
      environment: "Indoor",
      activityType: "Reps",
      fitnessCategory: "Strength", 
      xp: 170, 
      icon: "hand-rock", 
      iconType: "FontAwesome5", 
      status: "active", 
      goal: "30" 
    },
  
    // Core Challenges
    { 
      title: "Plank for 1 Minute", 
      category: "Core Challenge",
      environment: "Indoor",
      activityType: "Timed",
      fitnessCategory: "Strength", 
      xp: 120, 
      icon: "stopwatch", 
      iconType: "FontAwesome5", 
      status: "active", 
      goal: "1:00" 
    },
  
    // Health Challenges
    { 
      title: "Drink 2L of Water", 
      category: "Health Challenge",
      environment: "Indoor",
      activityType: "Wellness",
      fitnessCategory: "Health", 
      xp: 50, 
      icon: "tint", 
      iconType: "FontAwesome5", 
      status: "active", 
      goal: "2L" 
    },
  
    // Wellness Challenges
    { 
      title: "Sleep 8 Hours", 
      category: "Wellness Challenge",
      environment: "Indoor",
      activityType: "Wellness",
      fitnessCategory: "Health", 
      xp: 80, 
      icon: "bed", 
      iconType: "FontAwesome5", 
      status: "active", 
      goal: "8h" 
    },
  
    // Mindfulness Challenges
    { 
      title: "Meditate for 10 Minutes", 
      category: "Mindfulness Challenge",
      environment: "Indoor",
      activityType: "Timed",
      fitnessCategory: "Mindfulness", 
      xp: 90, 
      icon: "om", 
      iconType: "FontAwesome5", 
      status: "active", 
      goal: "10:00" 
    }
];

export const uploadQuests = async () => {
  try {
    const questsRef = collection(db, "quests");

    for (const quest of sampleQuests) {
      // Check if the quest already exists
      const querySnapshot = await getDocs(query(questsRef, where("title", "==", quest.title)));
      
      if (!querySnapshot.empty) {
        console.log(`Quest "${quest.title}" already exists. Skipping.`);
        continue;
      }

      // Add the quest if it does not exist
      await addDoc(questsRef, quest);
      console.log(`Quest "${quest.title}" added successfully!`);
    }
  } catch (error) {
    console.error("Error uploading quests:", error);
  }
};

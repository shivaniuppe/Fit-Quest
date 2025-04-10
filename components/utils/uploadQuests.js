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
      title: "Plank for 10 Seconds", 
      category: "Core Challenge",
      environment: "Indoor",
      activityType: "Timed",
      fitnessCategory: "Strength", 
      xp: 120, 
      icon: "stopwatch", 
      iconType: "FontAwesome5", 
      status: "active", 
      goal: "0:10" 
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
    },
    {
      title: "Run 5km",
      category: "Cardio Challenge",
      environment: "Outdoor",
      activityType: "Active",
      fitnessCategory: "Cardio",
      xp: 300,
      icon: "running",
      iconType: "FontAwesome5",
      status: "active",
      goal: "5km"
    },
    {
      title: "Walk 10,000 Steps",
      category: "Cardio Challenge",
      environment: "Any",
      activityType: "Active",
      fitnessCategory: "Cardio",
      xp: 150,
      icon: "shoe-prints",
      iconType: "FontAwesome5",
      status: "active",
      goal: "10000"
    },
    {
      title: "Cycle 10km",
      category: "Cardio Challenge",
      environment: "Outdoor",
      activityType: "Active",
      fitnessCategory: "Cardio",
      xp: 350,
      icon: "bicycle",
      iconType: "FontAwesome5",
      status: "active",
      goal: "10km"
    },
    {
      title: "Do 100 Lunges",
      category: "Strength Challenge",
      environment: "Indoor",
      activityType: "Reps",
      fitnessCategory: "Strength",
      xp: 180,
      icon: "dumbbell",
      iconType: "FontAwesome5",
      status: "active",
      goal: "100"
    },
    {
      title: "Do 40 Push-ups",
      category: "Strength Challenge",
      environment: "Indoor",
      activityType: "Reps",
      fitnessCategory: "Strength",
      xp: 190,
      icon: "hand-rock",
      iconType: "FontAwesome5",
      status: "active",
      goal: "40"
    },
    {
      title: "Do 60 Squats",
      category: "Strength Challenge",
      environment: "Indoor",
      activityType: "Reps",
      fitnessCategory: "Strength",
      xp: 160,
      icon: "dumbbell",
      iconType: "FontAwesome5",
      status: "active",
      goal: "60"
    },
    {
      title: "Breathe Deeply for 5 Minutes",
      category: "Mindfulness Challenge",
      environment: "Indoor",
      activityType: "Timed",
      fitnessCategory: "Mindfulness",
      xp: 60,
      icon: "om",
      iconType: "FontAwesome5",
      status: "active",
      goal: "5:00"
    },
    {
      title: "Gratitude Meditation for 15 Minutes",
      category: "Mindfulness Challenge",
      environment: "Indoor",
      activityType: "Timed",
      fitnessCategory: "Mindfulness",
      xp: 100,
      icon: "om",
      iconType: "FontAwesome5",
      status: "active",
      goal: "15:00"
    },
    {
      title: "Plank for 2 Minutes",
      category: "Core Challenge",
      environment: "Indoor",
      activityType: "Timed",
      fitnessCategory: "Strength",
      xp: 150,
      icon: "stopwatch",
      iconType: "FontAwesome5",
      status: "active",
      goal: "2:00"
    },
    {
      title: "Do 50 Crunches",
      category: "Core Challenge",
      environment: "Indoor",
      activityType: "Reps",
      fitnessCategory: "Strength",
      xp: 130,
      icon: "dumbbell",
      iconType: "FontAwesome5",
      status: "active",
      goal: "50"
    },
    {
      title: "Stretch for 10 Minutes",
      category: "Health Challenge",
      environment: "Indoor",
      activityType: "Timed",
      fitnessCategory: "Health",
      xp: 70,
      icon: "child",
      iconType: "FontAwesome5",
      status: "active",
      goal: "10:00"
    },
    {
      title: "Drink 3L of Water",
      category: "Health Challenge",
      environment: "Indoor",
      activityType: "Wellness",
      fitnessCategory: "Health",
      xp: 70,
      icon: "tint",
      iconType: "FontAwesome5",
      status: "active",
      goal: "3L"
    },
    {
      title: "Sleep 7 Hours",
      category: "Wellness Challenge",
      environment: "Indoor",
      activityType: "Wellness",
      fitnessCategory: "Health",
      xp: 70,
      icon: "bed",
      iconType: "FontAwesome5",
      status: "active",
      goal: "7h"
    },
    {
      title: "No Sugar for a Day",
      category: "Health Challenge",
      environment: "Any",
      activityType: "Wellness",
      fitnessCategory: "Health",
      xp: 90,
      icon: "ban",
      iconType: "FontAwesome5",
      status: "active",
      goal: "1d"
    },
    {
      title: "Journal for 10 Minutes",
      category: "Mindfulness Challenge",
      environment: "Indoor",
      activityType: "Timed",
      fitnessCategory: "Mindfulness",
      xp: 80,
      icon: "book",
      iconType: "FontAwesome5",
      status: "active",
      goal: "10:00"
    },
    {
      title: "Eat 3 Servings of Vegetables",
      category: "Health Challenge",
      environment: "Any",
      activityType: "Wellness",
      fitnessCategory: "Health",
      xp: 60,
      icon: "carrot",
      iconType: "FontAwesome5",
      status: "active",
      goal: "3"
    },                    
    
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

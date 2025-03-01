import { db } from "/Users/shivaniuppe/Desktop/FitQuest/firebaseConfig.js";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const sampleQuests = [
  { title: "Run 2km", category: "Daily Challenge", xp: 200, icon: "running", iconType: "FontAwesome5", status: "active" },
  { title: "Do 50 Squats", category: "Strength Challenge", xp: 150, icon: "dumbbell", iconType: "FontAwesome5", status: "active" },
  { title: "Walk 5,000 Steps", category: "Walking Challenge", xp: 100, icon: "shoe-prints", iconType: "FontAwesome5", status: "active" },
  { title: "Plank for 1 Minute", category: "Core Challenge", xp: 120, icon: "stopwatch", iconType: "FontAwesome5", status: "active" },
  { title: "Cycle 5km", category: "Cardio Challenge", xp: 250, icon: "bicycle", iconType: "FontAwesome5", status: "active" },
  { title: "Drink 2L of Water", category: "Health Challenge", xp: 50, icon: "tint", iconType: "FontAwesome5", status: "active" },
  { title: "Sleep 8 Hours", category: "Wellness Challenge", xp: 80, icon: "bed", iconType: "FontAwesome5", status: "active" },
  { title: "Jump Rope 100 Times", category: "Endurance Challenge", xp: 180, icon: "skipping-rope", iconType: "FontAwesome5", status: "active" },
  { title: "Push-ups 30 Times", category: "Strength Challenge", xp: 170, icon: "hand-rock", iconType: "FontAwesome5", status: "active" },
  { title: "Meditate for 10 Minutes", category: "Mindfulness Challenge", xp: 90, icon: "om", iconType: "FontAwesome5", status: "active" }
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

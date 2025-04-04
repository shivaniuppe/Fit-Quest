import { db } from "/Users/shivaniuppe/Desktop/Fit-Quest/firebaseConfig.js";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const achievements = [
  {
    id: "walk_10k",
    title: "Step Master",
    description: "Walk 10,000 steps in a single day",
    type: "steps",
    value: 10000,
    icon: "shoe-prints",
    xp: 100
  },
  {
    id: "complete_5_quests_week",
    title: "Quest Grinder",
    description: "Complete 5 quests in a week",
    type: "quests_week",
    value: 5,
    icon: "list-check",
    xp: 150
  },
  {
    id: "complete_10_quests_total",
    title: "Rising Hero",
    description: "Complete 10 total quests",
    type: "quests_total",
    value: 10,
    icon: "medal",
    xp: 200
  },
  {
    id: "streak_7_days",
    title: "Consistency Champ",
    description: "Maintain a 7-day streak",
    type: "streak",
    value: 7,
    icon: "calendar-check",
    xp: 200
  },
  {
    id: "active_30_min",
    title: "Half-Hour Hero",
    description: "Be active for 30 minutes in a day",
    type: "active_minutes",
    value: 30,
    icon: "clock",
    xp: 80
  },
  {
    id: "drink_2l",
    title: "Hydration Pro",
    description: "Drink 2 liters of water",
    type: "wellness",
    value: "2L",
    icon: "tint",
    xp: 50
  },
  {
    id: "sleep_8h",
    title: "Sleep Star",
    description: "Sleep 8 hours in one night",
    type: "wellness",
    value: "8h",
    icon: "bed",
    xp: 60
  },
  {
    id: "plank_2min",
    title: "Core Crusher",
    description: "Hold a plank for 2 minutes",
    type: "timed",
    value: "2:00",
    icon: "stopwatch",
    xp: 100
  },
  {
    id: "cycle_5km",
    title: "Pedal Power",
    description: "Cycle 5 km",
    type: "distance",
    value: "5km",
    icon: "bicycle",
    xp: 120
  },
  {
    id: "meditate_10m",
    title: "Zen Mode",
    description: "Meditate for 10 minutes",
    type: "timed",
    value: "10:00",
    icon: "om",
    xp: 90
  },
  {
    id: "sugar_free_day",
    title: "Clean Eater",
    description: "Avoid sugar for a day",
    type: "wellness",
    value: "1d",
    icon: "ban",
    xp: 75
  },
  {
    id: "log_3_days",
    title: "Habit Builder",
    description: "Log workouts 3 days in a row",
    type: "log_days",
    value: 3,
    icon: "clipboard-list",
    xp: 90
  },
  {
    id: "stretch_10m",
    title: "Flex Master",
    description: "Stretch for 10 minutes",
    type: "timed",
    value: "10:00",
    icon: "child",
    xp: 60
  },
  {
    id: "1000_xp",
    title: "XP Milestone",
    description: "Reach 1000 XP",
    type: "xp",
    value: 1000,
    icon: "star",
    xp: 0 // milestone only, no reward
  },
  {
    id: "profile_complete",
    title: "Profile Pro",
    description: "Complete your profile setup",
    type: "profile",
    value: true,
    icon: "user-check",
    xp: 50
  },
];

export const uploadAchievements = async () => {
  try {
    const achievementsRef = collection(db, "masterAchievements");

    for (const achievement of achievements) {
      const q = query(achievementsRef, where("id", "==", achievement.id));
      const existing = await getDocs(q);

      if (!existing.empty) {
        console.log(`Achievement "${achievement.title}" already exists. Skipping.`);
        continue;
      }

      await addDoc(achievementsRef, achievement);
      console.log(`✅ "${achievement.title}" added`);
    }

    console.log("🎉 All achievements uploaded!");
  } catch (error) {
    console.error("❌ Error uploading achievements:", error);
  }
};

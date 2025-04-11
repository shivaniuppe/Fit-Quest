import { db } from "../../firebaseConfig";
import { collection, setDoc, getDocs, query, where, doc } from "firebase/firestore";


const achievements = [
  {
    id: "walk_10k",
    title: "Step Master",
    description: "Walk 10,000 steps in a single day",
    type: "stepsToday",         
    value: 10000,
    icon: "shoe-prints",
    xp: 100
  },
  {
    id: "complete_5_quests_week",
    title: "Quest Grinder",
    description: "Complete 5 quests in a week",
    type: "questsThisWeek",    
    value: 5,
    icon: "tasks",
    xp: 150
  },
  {
    id: "complete_10_quests_total",
    title: "Rising Hero",
    description: "Complete 10 total quests",
    type: "quests",             
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
    description: "Be active for 30 minutes in a day for 1 week",
    type: "activeMinutes",      
    value: 30,
    icon: "clock",
    xp: 80
  },
  {
    id: "cycle_100km",
    title: "Pedal Power",
    description: "Cycle 100 km",
    type: "cyclingDistance",    
    value: 100,
    icon: "bicycle",
    xp: 120
  },
  {
    id: "log_3_days",
    title: "Habit Builder",
    description: "Log workouts 3 days in a row",
    type: "loggedDays",         
    value: 3,
    icon: "clipboard-list",
    xp: 90
  },
  {
    id: "1000_xp",
    title: "XP Milestone",
    description: "Reach 1000 XP",
    type: "xp",                 
    value: 1000,
    icon: "star",
    xp: 0                       
  },
  {
    id: "profile_complete",
    title: "Profile Pro",
    description: "Complete your profile setup",
    type: "profileComplete",    
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

      const docRef = doc(achievementsRef, achievement.id);
      await setDoc(docRef, achievement, { merge: true });
      console.log(`✅ "${achievement.title}" added`);
    }

    console.log("🎉 All achievements uploaded!");
  } catch (error) {
    console.error("❌ Error uploading achievements:", error);
  }
};

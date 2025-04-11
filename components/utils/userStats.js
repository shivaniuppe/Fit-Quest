import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getLevelFromXP } from "./levelUtils"; 
import { getCurrentWeekStart } from "./dateUtils";
import { updateLoggedDays } from "./updateLoggedDays";

export const updateUserStatsOnQuestComplete = async (userId, quest) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("User not found.");
      return;
    }

    const getTitleFromLevel = (level) => {
      if (level >= 1 && level < 5) return "Beginner";
      if (level >= 5 && level < 10) return "Explorer";
      if (level >= 10 && level < 15) return "Adventurer";
      if (level >= 15 && level < 20) return "Warrior";
      if (level >= 20) return "Champion";
      return "Rookie";
    };

    const userData = userSnap.data();
    const currentXP = userData.xp || 0;
    const currentCalories = userData.caloriesBurned || 0;
    const currentQuests = userData.quests || 0;

    const newXP = currentXP + (quest.xp || 0);
    const newCalories = currentCalories + (quest.calories || 0);
    const newLevel = getLevelFromXP(newXP);
    const newTitle = getTitleFromLevel(newLevel);

    const currentWeekStart = getCurrentWeekStart();
    const lastQuestReset = userData.lastQuestReset || "";
    const shouldReset = lastQuestReset !== currentWeekStart;

    const newQuestsThisWeek = shouldReset ? 1 : (userData.questsThisWeek || 0) + 1;
    

    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel,
      title: newTitle,
      caloriesBurned: newCalories,
      quests: currentQuests + 1,
      questsThisWeek: newQuestsThisWeek,
      lastQuestReset: currentWeekStart,
    });

    await updateLoggedDays(userId);
    console.log(`✅ Updated stats: +${quest.xp} XP, +${quest.calories} kcal, +1 quest (weekly: ${newQuestsThisWeek})`);

  } catch (error) {
    console.error("🔥 Error updating stats:", error);
  }
};
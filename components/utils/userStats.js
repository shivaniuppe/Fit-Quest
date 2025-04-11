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

    const userData = userSnap.data();
    const currentXP = userData.xp || 0;
    const currentCalories = userData.caloriesBurned || 0;
    const currentQuests = userData.quests || 0;

    const newXP = currentXP + (quest.xp || 0);
    const newCalories = currentCalories + (quest.calories || 0);
    const newLevel = getLevelFromXP(newXP);

    // 🔁 Weekly quest tracking
    const currentWeekStart = getCurrentWeekStart();
    const lastQuestReset = userData.lastQuestReset || "";
    const shouldReset = lastQuestReset !== currentWeekStart;

    const newQuestsThisWeek = shouldReset ? 1 : (userData.questsThisWeek || 0) + 1;

    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel,
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
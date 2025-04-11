// utils/achievementUtils.js
import { collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export const checkAndAwardAchievements = async (userRef, stats, currentAchievements = {}) => {
  try {
    const snapshot = await getDocs(collection(db, "masterAchievements"));
    const newAchievements = { ...currentAchievements };

    snapshot.forEach((doc) => {
      const ach = doc.data();
      const { title, type, value } = ach;
      const statValue = stats[type];

      if (statValue != null && !newAchievements[title]) {
        if (typeof value === "number" && statValue >= value) {
          newAchievements[title] = true;
        } else if (value === true && statValue === true) {
          newAchievements[title] = true;
        }
      }
    });

    await updateDoc(userRef, { achievements: newAchievements });
  } catch (error) {
    console.error("Error awarding achievements:", error);
  }
};

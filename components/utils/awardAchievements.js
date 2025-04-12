import { collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Checks user's current stats against master achievements list and updates unlocked achievements.
 * 
 * @param {DocumentReference} userRef - Reference to the user's Firestore document
 * @param {Object} stats - User's current stat values (e.g., stepsToday, quests, streak)
 * @param {Object} currentAchievements - Already unlocked achievements (default: {})
 */
export const checkAndAwardAchievements = async (userRef, stats, currentAchievements = {}) => {
  try {
    // Fetch all achievements from the master collection
    const snapshot = await getDocs(collection(db, "masterAchievements"));

    // Create a copy of current achievements
    const newAchievements = { ...currentAchievements };

    // Loop through each master achievement
    snapshot.forEach((doc) => {
      const ach = doc.data();
      const { title, type, value } = ach;  // 'type' refers to stat field like "quests", "stepsToday", etc.
      const statValue = stats[type];       // Get user's stat value for this type

      // If the user has this stat and hasn't unlocked this achievement yet
      if (statValue != null && !newAchievements[title]) {
        // For numeric milestones (e.g., 10000 steps)
        if (typeof value === "number" && statValue >= value) {
          newAchievements[title] = true;
        }
        // For boolean-based achievements (e.g., profileComplete)
        else if (value === true && statValue === true) {
          newAchievements[title] = true;
        }
      }
    });

    // Update the user's achievements field in Firestore
    await updateDoc(userRef, { achievements: newAchievements });
  } catch (error) {
    console.error("Error awarding achievements:", error);
  }
};

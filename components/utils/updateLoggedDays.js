import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Updates the user's loggedDays streak.
 * - Increments streak if the user logged yesterday.
 * - Resets streak to 1 if it's been more than a day.
 * - Does nothing if already logged today.
 *
 * @param {string} userId - The user's UID
 */
export const updateLoggedDays = async (userId) => {
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const lastDay = data.lastLoggedDay || "";
  const currentStreak = data.loggedDays || 0;

  let newStreak = currentStreak;

  // If already logged today, exit early
  if (lastDay === today) {
    console.log("🔁 Already logged today");
    return;
  }

  // Get yesterday's date in the same format
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split("T")[0];

  // If last logged day was yesterday, continue the streak
  if (lastDay === yesterdayString) {
    newStreak += 1;
  } else {
    newStreak = 1; // Reset streak
  }

  // Update Firestore with new streak and today's date
  await updateDoc(userRef, {
    loggedDays: newStreak,
    lastLoggedDay: today,
  });

  console.log(`📆 Workout logged → ${newStreak} day streak`);
};

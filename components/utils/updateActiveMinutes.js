import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Updates the user's active minutes and active day streak in Firestore.
 * Only updates if a valid time goal string is provided (e.g., "10:30").
 *
 * @param {string} userId - The current user's UID.
 * @param {string} goalString - A time string in the format "mm:ss".
 */
export const updateActiveMinutes = async (userId, goalString) => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date as YYYY-MM-DD

  // Convert goal string (e.g., "10:30") into total minutes (as float)
  const convertTimeGoalToMinutes = (goal) => {
    if (!goal || !goal.includes(":")) return 0;
    const [minutes, seconds] = goal.split(":").map(Number);
    return minutes + (seconds / 60);
  };

  const minutes = convertTimeGoalToMinutes(goalString);
  if (minutes === 0) return; // Skip update if goal is invalid

  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const user = snap.data();
  const lastDay = user.lastActiveDay || "";
  const currentMinutes = user.activeMinutesToday || 0;
  const currentStreak = user.activeDaysStreak || 0;

  let newStreak = currentStreak;
  let newMinutes = currentMinutes;

  if (lastDay !== today) {
    // New day: if yesterday met 30 min goal, continue streak; else reset
    newStreak = currentMinutes >= 30 ? currentStreak + 1 : 0;
    newMinutes = minutes;
  } else {
    // Same day: accumulate minutes
    newMinutes = currentMinutes + minutes;

    // If crossing 30-minute threshold for the first time today, increase streak
    if (newMinutes >= 30 && currentMinutes < 30) {
      newStreak += 1;
    }
  }

  // Update Firestore user document with new values
  await updateDoc(userRef, {
    activeMinutesToday: newMinutes,
    activeDaysStreak: newStreak,
    lastActiveDay: today,
  });

  // Debug output for visibility
  console.log(`📈 +${minutes.toFixed(2)} active mins → total: ${newMinutes.toFixed(2)}, streak: ${newStreak}`);
};

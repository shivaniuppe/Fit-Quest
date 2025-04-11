import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export const updateActiveMinutes = async (userId, goalString) => {
  const today = new Date().toISOString().split("T")[0];

  // ⏱️ Convert "10:00" → 10.0
  const convertTimeGoalToMinutes = (goal) => {
    if (!goal || !goal.includes(":")) return 0;
    const [minutes, seconds] = goal.split(":").map(Number);
    return minutes + (seconds / 60);
  };

  const minutes = convertTimeGoalToMinutes(goalString);
  if (minutes === 0) return; // Don't update if invalid goal

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
    // New day
    newStreak = currentMinutes >= 30 ? currentStreak + 1 : 0;
    newMinutes = minutes;
  } else {
    // Same day
    newMinutes = currentMinutes + minutes;
    if (newMinutes >= 30 && currentMinutes < 30) {
      newStreak += 1;
    }
  }

  await updateDoc(userRef, {
    activeMinutesToday: newMinutes,
    activeDaysStreak: newStreak,
    lastActiveDay: today,
  });

  console.log(`📈 +${minutes.toFixed(2)} active mins → total: ${newMinutes.toFixed(2)}, streak: ${newStreak}`);
};

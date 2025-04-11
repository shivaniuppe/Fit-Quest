import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export const updateLoggedDays = async (userId) => {
  const today = new Date().toISOString().split("T")[0];
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const lastDay = data.lastLoggedDay || "";
  const currentStreak = data.loggedDays || 0;

  let newStreak = currentStreak;

  if (lastDay === today) {
    console.log("🔁 Already logged today");
    return; 
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split("T")[0];

  if (lastDay === yesterdayString) {
    newStreak += 1; 
  } else {
    newStreak = 1; 
  }

  await updateDoc(userRef, {
    loggedDays: newStreak,
    lastLoggedDay: today,
  });

  console.log(`📆 Workout logged → ${newStreak} day streak`);
};

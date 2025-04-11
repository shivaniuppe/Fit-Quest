import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// type should be either "cyclingDistance" or "runningDistance"
export const updateDistanceStat = async (userId, distanceInKm, type) => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const current = snap.data()[type] || 0;
  const newValue = current + distanceInKm;

  await updateDoc(userRef, {
    [type]: newValue,
  });

  console.log(`🚴‍♂️ Updated ${type}: +${distanceInKm} → ${newValue.toFixed(2)} km`);
};

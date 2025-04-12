import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Updates a user's distance stat (e.g., runningDistance or cyclingDistance) in Firestore.
 *
 * @param {string} userId - UID of the user
 * @param {number} distanceInKm - Distance to add (in kilometers)
 * @param {string} type - Field name in the user doc to update ("runningDistance" or "cyclingDistance")
 */
export const updateDistanceStat = async (userId, distanceInKm, type) => {
  const userRef = doc(db, "users", userId);         // Reference to user document
  const snap = await getDoc(userRef);               // Fetch the document snapshot
  if (!snap.exists()) return;                       // Exit if user doc doesn't exist

  const current = snap.data()[type] || 0;           // Get current distance (default to 0 if missing)
  const newValue = current + distanceInKm;          // Add new distance to total

  await updateDoc(userRef, {
    [type]: newValue,                               // Update the correct field (dynamic key)
  });

  // Debug log
  console.log(`🚴‍♂️ Updated ${type}: +${distanceInKm} → ${newValue.toFixed(2)} km`);
};

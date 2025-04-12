/**
 * Calculates the user's level based on current XP.
 * Uses a predefined threshold for levels 1–10.
 * Beyond level 10, XP required increases progressively.
 * 
 * @param {number} xp - The user's current XP.
 * @returns {number} - The calculated level.
 */
export const getLevelFromXP = (xp) => {
  const xpThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700]; // XP needed for levels 1–10

  // Check if XP is within predefined levels (1–10)
  if (xp < xpThresholds[xpThresholds.length - 1]) {
    for (let i = xpThresholds.length - 1; i >= 0; i--) {
      if (xp >= xpThresholds[i]) return i + 1;
    }
    return 1; // Fallback in case xp < 0
  }

  // Start from level 11 and increase based on a progressive formula
  let level = 11;

  while (true) {
    // Dynamic XP required for each level after 10
    const xpForLevel = 2700 + (level - 10) * (500 + (level - 10) * 50);
    if (xp < xpForLevel) return level;
    level++;
  }
};

/**
 * Returns the total XP required to reach the *next* level.
 * 
 * @param {number} level - The level for which XP is needed.
 * @returns {number} - XP required to reach that level.
 */
export const getXPForNextLevel = (level) => {
  const xpThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700]; // Thresholds for level 1–10

  // If within predefined levels
  if (level <= 10) {
    return xpThresholds[level] || 2700; // Handle case where level == 10
  }

  // Formula for level 11 and beyond
  return 2700 + (level - 10) * (500 + (level - 10) * 50);
};

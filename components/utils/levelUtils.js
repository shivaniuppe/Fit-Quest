// utils/levelUtils.js

export const getLevelFromXP = (xp) => {
    const xpThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];
  
    if (xp < xpThresholds[xpThresholds.length - 1]) {
      for (let i = xpThresholds.length - 1; i >= 0; i--) {
        if (xp >= xpThresholds[i]) return i + 1;
      }
      return 1;
    }
  
    // For levels > 10
    let level = 11;
  
    while (true) {
      const xpForLevel = 2700 + (level - 10) * (500 + (level - 10) * 50);
      if (xp < xpForLevel) return level;
      level++;
    }
  };
  
  export const getXPForNextLevel = (level) => {
    const xpThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];
  
    if (level <= 10) {
      return xpThresholds[level] || 2700;
    }
  
    return 2700 + (level - 10) * (500 + (level - 10) * 50);
  };
  
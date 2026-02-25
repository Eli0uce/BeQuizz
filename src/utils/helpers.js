export const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i) * (i + 1);
  return hash.toString(36);
};

export const getLevelFromXP = (xp, XP_LEVELS) => {
  let level = 1;
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i]) {
      level = i + 1;
      break;
    }
  }
  const nextXP = XP_LEVELS[level] || XP_LEVELS[XP_LEVELS.length - 1];
  const currentLevelXP = XP_LEVELS[level - 1];
  const progress = level >= 15 ? 100 : ((xp - currentLevelXP) / (nextXP - currentLevelXP)) * 100;
  return { level, nextXP, progress, currentLevelXP };
};

export const getAvatarStyle = (username) => {
  const colors = ['#c8aa6e', '#0ac8b9', '#f0e6d2', '#3c3c41', '#0070ba', '#ff4655', '#45d31c', '#9a33ff', '#ffb11f', '#00e1ff'];
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash += username.charCodeAt(i);
  const color = colors[hash % colors.length];
  return color;
};

import { XP_LEVELS, GAME_UNLOCKS, DIFF_UNLOCKS } from './data/constants.js';

export const simpleHash = str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i) * (i + 1);
  return hash.toString(36);
};

export const getUsers = () => JSON.parse(localStorage.getItem('bq_users') || '[]');
export const saveUsers = users => localStorage.setItem('bq_users', JSON.stringify(users));

export const getCurrentUser = () => {
  const username = localStorage.getItem('bq_current_user');
  return username ? getUsers().find(u => u.username === username) : null;
};

export const getLevelFromXP = xp => {
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
  return { level, nextXP, progress };
};

export const isGameUnlocked = (gameId, level) => level >= (GAME_UNLOCKS[gameId] || 1);
export const isDifficultyUnlocked = (diff, level) => level >= (DIFF_UNLOCKS[diff] || 1);

export const logout = () => {
  localStorage.removeItem('bq_current_user');
  location.reload();
};

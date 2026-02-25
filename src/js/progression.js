import { BADGES } from './data/constants.js';
import { saveUsers, getUsers, getLevelFromXP } from './auth.js';
import { gamesData } from './data/games.js';

export function checkAndGrantBadges(user) {
  const newlyEarned = [];
  const levelData = getLevelFromXP(user.xp);
  
  BADGES.forEach(badge => {
    if (user.badges.includes(badge.id)) return;
    
    let earned = false;
    switch(badge.id) {
      case 'first_quiz': earned = user.quizzesPlayed >= 1; break;
      case 'perfect_score': earned = (user.perfectScoresCount || 0) >= 1; break;
      case 'level_5': earned = levelData.level >= 5; break;
      case 'level_10': earned = levelData.level >= 10; break;
      case 'level_max': earned = levelData.level >= 15; break;
      case 'explorer': earned = Object.keys(user.bestScores || {}).length >= 6; break;
      case 'collector': earned = Object.keys(user.bestScores || {}).length >= Object.keys(gamesData).length; break;
      case 'hardcore_fan': earned = user.hardcorePlayed >= 1; break;
      case 'hardcore_master': earned = user.hardcorePerfect >= 1; break;
      case 'polyglot': earned = user.difficultiesPlayed && Object.keys(user.difficultiesPlayed).length >= 4; break;
      case 'fast': earned = user.quizzesPlayed >= 50; break;
      case 'sniper': earned = (user.perfectScoresCount || 0) >= 5; break;
    }
    
    if (earned) {
      user.badges.push(badge.id);
      newlyEarned.push(badge);
    }
  });
  
  if (newlyEarned.length > 0) {
    const allUsers = getUsers();
    const idx = allUsers.findIndex(u => u.username === user.username);
    allUsers[idx] = user;
    saveUsers(allUsers);
  }
  
  return newlyEarned;
}

import { gamesData } from './data/games.js';
import { getLevelFromXP, isGameUnlocked, isDifficultyUnlocked, getCurrentUser } from './auth.js';
import { GAME_UNLOCKS, DIFF_UNLOCKS } from './data/constants.js';

const selectScreen = document.getElementById("select-screen");
const difficultyScreen = document.getElementById("difficulty-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const profileScreen = document.getElementById("profile-screen");
const leaderboardScreen = document.getElementById("leaderboard-screen");
const authScreen = document.getElementById("auth-screen");

export function hideAllScreens() {
  [selectScreen, difficultyScreen, quizScreen, resultScreen, 
   authScreen, profileScreen, leaderboardScreen].forEach(s => s?.classList.add('hidden'));
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--primary-color", theme.primary);
  root.style.setProperty("--secondary-color", theme.secondary);
  root.style.setProperty("--bg-start", theme.bgStart);
  root.style.setProperty("--bg-end", theme.bgEnd);
  root.style.setProperty("--font-title", theme.fontTitle);
  root.style.setProperty("--font-main", theme.fontMain);
}

export function showXpNotification(xpEarned, levelUp = false, newLevel = 1, unlockedGame = null) {
  const notif = document.getElementById('xp-notification');
  document.getElementById('xp-amount').innerText = `+${xpEarned} XP`;
  
  const lvUpEl = document.getElementById('xp-levelup');
  if (levelUp) {
    lvUpEl.classList.remove('hidden');
    document.getElementById('xp-newlevel').innerText = `Niveau ${newLevel}`;
  } else {
    lvUpEl.classList.add('hidden');
  }

  const unlockEl = document.getElementById('xp-unlocked');
  if (unlockedGame) {
    unlockEl.classList.remove('hidden');
  } else {
    unlockEl.classList.add('hidden');
  }

  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 3000);
}

export function updateGameCards() {
  const user = getCurrentUser();
  if (!user) return;
  const userLevel = getLevelFromXP(user.xp).level;
  
  Object.keys(GAME_UNLOCKS).forEach(gameId => {
    const card = document.getElementById(`game-${gameId}`);
    if (card) {
      const unlocked = isGameUnlocked(gameId, userLevel);
      card.classList.toggle('locked', !unlocked);
      const reqLvl = card.querySelector('.req-lvl');
      if (reqLvl) reqLvl.innerText = GAME_UNLOCKS[gameId];
    }
  });
}

export function updateDifficultyButtons(userLevel) {
  Object.keys(DIFF_UNLOCKS).forEach(diff => {
    const btn = document.getElementById(`diff-${diff}`);
    if (btn) {
      const unlocked = isDifficultyUnlocked(diff, userLevel);
      btn.disabled = !unlocked;
      btn.classList.toggle('disabled-btn', !unlocked);
      
      const lockIcon = btn.querySelector('.fa-lock');
      if (!unlocked && !lockIcon) {
        const i = document.createElement('i');
        i.className = 'fas fa-lock ml-2 text-xs opacity-50';
        btn.querySelector('.text-2xl')?.appendChild(i);
      } else if (unlocked && lockIcon) {
        lockIcon.remove();
      }
    }
  });
}

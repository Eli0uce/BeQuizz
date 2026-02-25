import { getCurrentUser, getUsers, saveUsers, simpleHash, getLevelFromXP, logout } from './auth.js';
import { hideAllScreens, applyTheme, updateGameCards, updateDifficultyButtons } from './ui.js';
import { gamesData } from './data/games.js';
import { BADGES } from './data/constants.js';
import { startQuiz } from './quiz.js';

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  
  // Setup des listeners globaux
  document.getElementById('top-profile-btn')?.addEventListener('click', renderProfile);
  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('leaderboard-btn')?.addEventListener('click', renderLeaderboard);
  
  // Auth tabs
  document.getElementById('tab-login')?.addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tab-signup')?.addEventListener('click', () => switchAuthTab('signup'));
});

function initApp() {
  const user = getCurrentUser();
  if (!user) {
    hideAllScreens();
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('top-profile-btn').classList.add('hidden');
    return;
  }

  document.getElementById('top-profile-btn').classList.remove('hidden');
  goHome();
}

// --- NAVIGATION ---
window.goHome = function() {
  hideAllScreens();
  document.getElementById('select-screen').classList.remove('hidden');
  applyTheme({
    primary: "#c8aa6e", secondary: "#0ac8b9",
    bgStart: "#091428", bgEnd: "#010a13",
    fontTitle: "'Cinzel', serif", fontMain: "'Roboto', sans-serif"
  });
  updateGameCards();
};

window.initGame = function(gameId) {
  const user = getCurrentUser();
  const levelData = getLevelFromXP(user.xp);
  
  // On pourrait réutiliser la logique de ui.js ici
  const game = gamesData[gameId];
  applyTheme(game.theme);
  
  document.getElementById('diff-game-title').innerText = game.title.toUpperCase();
  updateDifficultyButtons(levelData.level);
  
  hideAllScreens();
  document.getElementById('difficulty-screen').classList.remove('hidden');
  window.currentGameId = gameId; // Global temporaire pour la sélection de difficulté
};

window.selectDifficulty = function(diff) {
  startQuiz(window.currentGameId, diff);
};

window.restartQuiz = function() {
  const state = window.getGameState ? window.getGameState() : { currentGameId: window.currentGameId, currentDifficulty: 'medium' };
  startQuiz(state.currentGameId, state.currentDifficulty);
};

// --- AUTH UI ---
function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
}

window.handleLogin = function(e) {
  e.preventDefault();
  const user = document.getElementById('l-user').value;
  const pass = document.getElementById('l-pass').value;
  const hash = simpleHash(pass);
  
  const all = getUsers();
  const found = all.find(u => u.username === user && u.passwordHash === hash);
  
  if (found) {
    localStorage.setItem('bq_current_user', user);
    initApp();
  } else {
    const err = document.getElementById('auth-error');
    err.innerText = "Utilisateur ou mot de passe incorrect";
    err.classList.remove('hidden');
  }
};

window.handleSignup = function(e) {
  e.preventDefault();
  const user = document.getElementById('s-user').value;
  const pass = document.getElementById('s-pass').value;
  
  const all = getUsers();
  if (all.find(u => u.username === user)) {
    alert("Ce nom d'utilisateur existe déjà");
    return;
  }
  
  const newUser = {
    username: user,
    passwordHash: simpleHash(pass),
    xp: 0,
    quizzesPlayed: 0,
    bestScores: {},
    badges: [],
    createdAt: new Date().toISOString()
  };
  
  all.push(newUser);
  saveUsers(all);
  localStorage.setItem('bq_current_user', user);
  initApp();
};

// --- PROFILE & LEADERBOARD ---
function renderProfile() {
  const user = getCurrentUser();
  const levelData = getLevelFromXP(user.xp);
  
  hideAllScreens();
  document.getElementById('profile-screen').classList.remove('hidden');
  
  document.getElementById('prof-user').innerText = user.username;
  document.getElementById('prof-lvl').innerText = `Lv. ${levelData.level}`;
  document.getElementById('prof-xp-text').innerText = `${user.xp} XP`;
  document.getElementById('prof-xp-fill').style.width = `${levelData.progress}%`;
  document.getElementById('prof-stats-quizzes').innerText = user.quizzesPlayed;
  document.getElementById('prof-stats-xp').innerText = user.xp;
  document.getElementById('prof-stats-games').innerText = Object.keys(user.bestScores || {}).length;
  
  // Badges
  const badgeGrid = document.getElementById('prof-badges-grid');
  badgeGrid.innerHTML = '';
  BADGES.forEach(badge => {
    const isOwned = user.badges.includes(badge.id);
    const div = document.createElement('div');
    div.className = `badge-card ${isOwned ? '' : 'locked'}`;
    div.innerHTML = `
      <i class="fas ${badge.icon} ${isOwned ? 'theme-text-primary' : 'text-gray-600'}"></i>
      <div class="text-[10px] font-bold uppercase mt-1">${badge.name}</div>
    `;
    badgeGrid.appendChild(div);
  });
}

function renderLeaderboard() {
  const users = getUsers().sort((a, b) => b.xp - a.xp);
  const currentUser = getCurrentUser();
  
  hideAllScreens();
  document.getElementById('leaderboard-screen').classList.remove('hidden');
  
  const body = document.getElementById('leaderboard-body');
  body.innerHTML = '';
  
  users.slice(0, 10).forEach((u, i) => {
    const isMe = u.username === currentUser.username;
    const tr = document.createElement('tr');
    tr.className = `border-b border-gray-800 ${isMe ? 'bg-primary/10' : ''}`;
    tr.innerHTML = `
      <td class="py-4 px-4 font-bold">${i + 1}</td>
      <td class="py-4 px-4">${u.username}</td>
      <td class="py-4 px-4 text-center">${getLevelFromXP(u.xp).level}</td>
      <td class="py-4 px-4 text-right theme-text-primary">${u.xp}</td>
      <td class="py-4 px-4 text-right">${u.quizzesPlayed}</td>
    `;
    body.appendChild(tr);
  });
}

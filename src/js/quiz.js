import { gamesData } from './data/games.js';
import { XP_PER_ANSWER, XP_BONUS_COMPLETION, BADGES } from './data/constants.js';
import { getCurrentUser, saveUsers, getUsers, getLevelFromXP, isGameUnlocked } from './auth.js';
import { showXpNotification, hideAllScreens } from './ui.js';
import { checkAndGrantBadges } from './progression.js';

let currentGameId = null;
let currentDifficulty = "medium";
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let isAnswering = false;

export function getGameState() {
  return { currentGameId, currentDifficulty, currentQuestions, currentQuestionIndex, score, isAnswering };
}

export function startQuiz(gameId, difficulty) {
  currentGameId = gameId;
  currentDifficulty = difficulty;
  const questions = gamesData[gameId].questions[difficulty];
  
  // Mélange des questions (Fisher-Yates)
  currentQuestions = [...questions].sort(() => Math.random() - 0.5).slice(0, 5);
  currentQuestionIndex = 0;
  score = 0;
  isAnswering = true;
  
  hideAllScreens();
  document.getElementById("quiz-screen").classList.remove("hidden");
  loadQuestion();
}

export function loadQuestion() {
  isAnswering = true;
  const q = currentQuestions[currentQuestionIndex];
  
  document.getElementById("question-text").innerText = q.q;
  document.getElementById("current-q-num").innerText = currentQuestionIndex + 1;
  document.getElementById("progress-bar").style.width = `${((currentQuestionIndex) / currentQuestions.length) * 100}%`;
  document.getElementById("feedback-msg").style.opacity = "0";
  
  const container = document.getElementById("options-container");
  container.innerHTML = "";
  
  let shuffledOptions = q.options.map((opt, i) => ({ text: opt, originalIndex: i }));
  shuffledOptions.sort(() => Math.random() - 0.5);
  
  shuffledOptions.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "theme-btn p-4 text-left rounded w-full font-medium flex items-center";
    btn.innerHTML = `<span class="inline-block w-6 h-6 border border-current rounded-full text-center text-xs leading-[20px] mr-3 opacity-70">${String.fromCharCode(65 + idx)}</span>${opt.text}`;
    btn.dataset.originalIndex = opt.originalIndex;
    btn.onclick = () => checkAnswer(opt.originalIndex, btn);
    container.appendChild(btn);
  });
}

function checkAnswer(selectedIndex, btn) {
  if (!isAnswering) return;
  isAnswering = false;
  
  const q = currentQuestions[currentQuestionIndex];
  const buttons = document.getElementById("options-container").children;
  
  for (let b of buttons) b.classList.add("disabled-btn");
  
  const feedback = document.getElementById("feedback-msg");
  if (selectedIndex === q.correct) {
    btn.classList.add("correct-answer");
    score++;
    document.getElementById("score-display").innerText = score;
    feedback.innerHTML = '<span style="color:#00ff00"><i class="fas fa-check"></i> Bonne réponse !</span>';
  } else {
    btn.classList.add("wrong-answer");
    for (let b of buttons) {
      if (parseInt(b.dataset.originalIndex) === q.correct) {
        b.classList.add("correct-answer");
        break;
      }
    }
    feedback.innerHTML = '<span style="color:#ff0000"><i class="fas fa-times"></i> Raté !</span>';
  }
  
  feedback.style.opacity = "1";
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
      loadQuestion();
    } else {
      finishQuiz();
    }
  }, 1200);
}

function finishQuiz() {
  hideAllScreens();
  document.getElementById("result-screen").classList.remove("hidden");
  document.getElementById("final-score").innerText = score;
  
  const percentage = score / currentQuestions.length;
  let rankTitle = "Débutant";
  if (percentage === 1) rankTitle = "LÉGENDE";
  else if (percentage >= 0.8) rankTitle = "Maître";
  else if (percentage >= 0.5) rankTitle = "Initié";
  
  document.getElementById("end-title").innerText = rankTitle.toUpperCase();
  document.getElementById("end-rank").innerText = `Difficulté : ${currentDifficulty.toUpperCase()}`;
  
  saveQuizResult(score, currentQuestions.length, currentDifficulty, currentGameId);
}

function saveQuizResult(score, total, difficulty, gameId) {
  const user = getCurrentUser();
  if (!user) return;
  
  const oldLevel = getLevelFromXP(user.xp).level;
  const percentage = score / total;
  
  let xpEarned = score * XP_PER_ANSWER[difficulty];
  if (percentage >= 0.6) xpEarned += XP_BONUS_COMPLETION[difficulty];
  if (percentage === 1) {
    xpEarned += 50;
    user.perfectScoresCount = (user.perfectScoresCount || 0) + 1;
    if (difficulty === 'hardcore') user.hardcorePerfect = (user.hardcorePerfect || 0) + 1;
  }
  
  user.xp += xpEarned;
  user.quizzesPlayed = (user.quizzesPlayed || 0) + 1;
  if (difficulty === 'hardcore') user.hardcorePlayed = (user.hardcorePlayed || 0) + 1;
  
  if (!user.difficultiesPlayed) user.difficultiesPlayed = {};
  user.difficultiesPlayed[difficulty] = true;
  
  if (!user.bestScores) user.bestScores = {};
  if (!user.bestScores[gameId] || score > user.bestScores[gameId].score) {
    user.bestScores[gameId] = { score, difficulty, date: new Date().toISOString() };
  }
  
  const levelData = getLevelFromXP(user.xp);
  const levelUp = levelData.level > oldLevel;
  
  let newlyUnlockedGame = null;
  if (levelUp) {
    Object.keys(GAME_UNLOCKS).forEach(gId => {
      if (GAME_UNLOCKS[gId] === levelData.level) newlyUnlockedGame = gamesData[gId].title;
    });
  }
  
  const users = getUsers();
  const idx = users.findIndex(u => u.username === user.username);
  users[idx] = user;
  saveUsers(users);
  
  checkAndGrantBadges(user);
  showXpNotification(xpEarned, levelUp, levelData.level, newlyUnlockedGame);
}

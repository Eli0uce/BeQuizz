import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { gamesData } from '../data/games';
import { XP_PER_ANSWER, XP_BONUS_COMPLETION, BADGES_DATA, XP_LEVELS } from '../data/constants';
import { getLevelFromXP } from '../utils/helpers';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const { user, updateUserData } = useAuth();
  
  // Quiz State
  const [currentGameId, setCurrentGameId] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // UI State
  const [showNotification, setShowNotification] = useState(null);

  const startQuiz = useCallback((gameId, diff) => {
    setCurrentGameId(gameId);
    setDifficulty(diff);
    setQuestions([...gamesData[gameId].questions[diff]].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setIsAnswering(false);
    setQuizFinished(false);
  }, []);

  const submitAnswer = (optionIndex) => {
    if (isAnswering) return;
    setIsAnswering(true);
    
    const correct = questions[currentIndex].correct === optionIndex;
    if (correct) setScore(s => s + 1);
    
    return correct;
  };

  const nextQuestion = () => {
    setIsAnswering(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(c => c + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    const total = questions.length;
    const percentage = score / total;
    
    // XP
    let xpEarned = score * XP_PER_ANSWER[difficulty];
    let reason = `${score} bonnes réponses × ${XP_PER_ANSWER[difficulty]} XP`;
    
    if (percentage >= 0.6) {
      const bonus = XP_BONUS_COMPLETION[difficulty];
      xpEarned += bonus;
      reason += ` + ${bonus} Bonus de complétion`;
    }
    
    if (percentage === 1) {
      xpEarned += 50;
      reason += ` + 50 Score Parfait`;
    }

    const newUser = { ...user };
    const oldLevel = getLevelFromXP(newUser.xp, XP_LEVELS).level;
    newUser.xp += xpEarned;
    newUser.quizzesPlayed++;
    
    if (!newUser.playedGames.includes(currentGameId)) newUser.playedGames.push(currentGameId);
    if (!newUser.playedDiffs.includes(difficulty)) newUser.playedDiffs.push(difficulty);
    
    if (!newUser.bestScores[currentGameId]) newUser.bestScores[currentGameId] = {};
    const prevBest = newUser.bestScores[currentGameId][difficulty] || 0;
    if (score > prevBest) {
      newUser.bestScores[currentGameId][difficulty] = score;
    }
    
    if (percentage === 1) {
      newUser.perfectScoresCount = (newUser.perfectScoresCount || 0) + 1;
    }

    // Badge Check
    const newBadges = checkBadges(newUser);
    newUser.badges = [...new Set([...newUser.badges, ...newBadges])];
    
    const { level: newLevel } = getLevelFromXP(newUser.xp, XP_LEVELS);
    const levelUp = newLevel > oldLevel;
    newUser.level = newLevel;

    updateUserData(newUser);
    
    setShowNotification({
      xp: xpEarned,
      reason,
      levelUp,
      newLevel,
      newBadges: newBadges.length > 0 ? newBadges : null
    });
    
    setTimeout(() => setShowNotification(null), 5000);
  };

  const checkBadges = (u) => {
    const earned = [];
    const has = (id) => u.badges.includes(id);
    
    if (u.quizzesPlayed >= 1 && !has('first_quiz')) earned.push('first_quiz');
    if (score / questions.length === 1 && !has('perfect_score')) earned.push('perfect_score');
    if (u.level >= 5 && !has('level_5')) earned.push('level_5');
    if (u.level >= 10 && !has('level_10')) earned.push('level_10');
    if (u.level >= 15 && !has('level_max')) earned.push('level_max');
    if (u.playedGames.length >= 6 && !has('explorer')) earned.push('explorer');
    if (u.playedGames.length >= Object.keys(gamesData).length && !has('collector')) earned.push('collector');
    if (difficulty === 'hardcore' && !has('hardcore_fan')) earned.push('hardcore_fan');
    if (difficulty === 'hardcore' && score / questions.length === 1 && !has('hardcore_master')) earned.push('hardcore_master');
    if (u.playedDiffs.length >= 4 && !has('polyglot')) earned.push('polyglot');
    if (u.quizzesPlayed >= 50 && !has('fast')) earned.push('fast');
    if (u.perfectScoresCount >= 5 && !has('sniper')) earned.push('sniper');
    
    return earned;
  };

  const resetQuiz = () => {
    setQuizFinished(false);
    setCurrentGameId(null);
  };

  return (
    <GameContext.Provider value={{
      currentGameId, difficulty, questions, currentIndex, score, isAnswering, quizFinished, showNotification,
      startQuiz, submitAnswer, nextQuestion, resetQuiz
    }}>
      {children}
    </GameContext.Provider>
  );
};

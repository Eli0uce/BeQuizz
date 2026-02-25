import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Button, Card, ProgressBar } from './Neumorphism';

export const QuizScreen = () => {
  const { 
    questions, currentIndex, score, isAnswering, submitAnswer, nextQuestion, quizFinished, resetQuiz, difficulty, currentGameId
  } = useGame();
  
  const [feedback, setFeedback] = useState(null); // { correct, selected }

  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index) => {
    if (isAnswering) return;
    const isCorrect = submitAnswer(index);
    setFeedback({ correct: currentQuestion.correct, selected: index });
    
    setTimeout(() => {
      setFeedback(null);
      nextQuestion();
    }, 1500);
  };

  if (quizFinished) {
    return <ResultScreen />;
  }

  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4 py-12">
      <header className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <div className="font-black uppercase text-indigo-500">{difficulty}</div>
          <div className="font-black text-sm opacity-50">QUESTION {currentIndex + 1} / {questions.length}</div>
        </div>
        <ProgressBar progress={progress} />
      </header>

      <Card className="p-8 md:p-12 mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-center mb-0 leading-tight">
          {currentQuestion.q}
        </h2>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentQuestion.options.map((option, index) => {
          let variant = 'flat';
          let textColor = '';
          
          if (feedback) {
            if (index === feedback.correct) {
              variant = 'flat';
              textColor = 'text-green-500 border-2 border-green-500/20';
            } else if (index === feedback.selected) {
              variant = 'inset';
              textColor = 'text-red-500';
            } else {
              variant = 'inset';
              textColor = 'opacity-30';
            }
          }

          return (
            <Button 
              key={index}
              variant={variant}
              onClick={() => handleOptionClick(index)}
              className={`py-6 px-8 text-lg font-bold normal-case justify-start ${textColor}`}
              disabled={isAnswering}
            >
              <span className="w-8 h-8 nm-inset rounded-full flex items-center justify-center text-xs mr-4">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </Button>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="nm-inset inline-flex items-center gap-4 px-6 py-3 rounded-2xl font-black uppercase text-sm">
          <span className="opacity-50">SCORE ACTUEL :</span>
          <span className="text-indigo-500 text-xl">{score}</span>
        </div>
      </div>
    </div>
  );
};

const ResultScreen = () => {
  const { score, questions, resetQuiz, showNotification } = useGame();
  const percentage = score / questions.length;
  
  let title = "PAS MAL !";
  let icon = "smile";
  if (percentage === 1) { title = "LÉGENDAIRE !"; icon = "crown"; }
  else if (percentage >= 0.8) { title = "EXCELLENT !"; icon = "star"; }
  else if (percentage < 0.5) { title = "DOMMAGE..."; icon = "frown"; }

  return (
    <div className="max-w-2xl mx-auto p-4 py-12 text-center">
      <div className="w-32 h-32 nm-flat rounded-full mx-auto flex items-center justify-center text-5xl text-indigo-500 mb-8">
        <i className={`fas fa-${icon}`}></i>
      </div>
      
      <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">{title}</h2>
      <p className="font-bold opacity-50 mb-12 uppercase tracking-widest">Quiz Terminé</p>
      
      <Card className="mb-12 py-10">
        <div className="text-6xl font-black text-indigo-500 mb-2">{score} <span className="text-2xl opacity-30 text-gray-500">/ {questions.length}</span></div>
        <div className="font-bold opacity-70 uppercase text-sm">Bonnes Réponses</div>
      </Card>

      <div className="space-y-4">
        <Button onClick={resetQuiz} variant="primary" className="w-full py-4 uppercase font-black">
          RETOURNER AU MENU
        </Button>
      </div>

      {showNotification && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <Card className="nm-flat border-2 border-indigo-500/50 p-6 flex flex-col items-center">
             <div className="text-2xl font-black text-indigo-500">+{showNotification.xp} XP</div>
             <div className="text-xs font-bold opacity-70 mb-2 uppercase">{showNotification.reason}</div>
             {showNotification.levelUp && (
               <div className="bg-yellow-500 text-black px-4 py-1 rounded-full font-black text-xs animate-pulse">
                 LEVEL UP ! NIV. {showNotification.newLevel}
               </div>
             )}
          </Card>
        </div>
      )}
    </div>
  );
};

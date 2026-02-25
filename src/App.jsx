import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider, useGame } from './context/GameContext';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { QuizScreen } from './components/QuizScreen';
import './styles/neumorphism.css';

const AppContent = () => {
  const { user } = useAuth();
  const { currentGameId } = useGame();

  if (!user) {
    return <AuthScreen />;
  }

  if (currentGameId) {
    return <QuizScreen />;
  }

  return <HomeScreen />;
};

const App = () => {
  return (
    <AuthProvider>
      <GameProvider>
        <div className="min-h-screen">
          <AppContent />
        </div>
      </GameProvider>
    </AuthProvider>
  );
};

export default App;

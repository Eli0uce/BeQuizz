import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { gamesData } from '../data/games';
import { GAME_UNLOCKS, DIFF_UNLOCKS } from '../data/constants';
import { Button, Card } from './Neumorphism';

import { ProfileScreen } from './ProfileScreen';

export const HomeScreen = () => {
  const { user, logout } = useAuth();
  const { startQuiz } = useGame();
  const [selectedGame, setSelectedGame] = useState(null);
  const [view, setView] = useState('games'); // 'games' or 'difficulty' or 'profile' or 'leaderboard'

  const handleGameSelect = (gameId) => {
    if (user.level < GAME_UNLOCKS[gameId]) return;
    setSelectedGame(gameId);
    setView('difficulty');
  };

  const handleDifficultySelect = (diff) => {
    if (user.level < DIFF_UNLOCKS[diff]) return;
    startQuiz(selectedGame, diff);
  };

  if (view === 'profile') {
    return <ProfileScreen onBack={() => setView('games')} />;
  }

  if (view === 'difficulty') {
    return (
      <div className="max-w-4xl mx-auto p-4 py-12">
        <Button onClick={() => setView('games')} variant="inset" className="mb-8">
          <i className="fas fa-arrow-left"></i> RETOUR
        </Button>
        <h2 className="text-3xl font-black mb-12 text-center uppercase tracking-tighter">
          CHOISIR LA DIFFICULTÉ - <span className="text-indigo-500">{gamesData[selectedGame].title}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.keys(DIFF_UNLOCKS).map(diff => {
            const unlocked = user.level >= DIFF_UNLOCKS[diff];
            return (
              <Button 
                key={diff}
                disabled={!unlocked}
                onClick={() => handleDifficultySelect(diff)}
                className="py-10 text-xl flex-col"
              >
                <span className="uppercase">{diff}</span>
                {!unlocked && <span className="text-xs opacity-50">NIVEAU {DIFF_UNLOCKS[diff]} REQUIS</span>}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      <header className="flex justify-between items-center mb-12 p-4 nm-inset rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full nm-flat flex items-center justify-center text-indigo-500 font-bold border-2 border-indigo-500/20">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <div className="font-black text-sm uppercase opacity-50">BIENVENUE,</div>
            <div className="font-black text-lg text-indigo-500 uppercase">{user.username}</div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setView('profile')} className="w-12 h-12 p-0 rounded-full">
            <i className="fas fa-user"></i>
          </Button>
          <Button onClick={logout} className="w-12 h-12 p-0 rounded-full text-red-500">
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </header>

      <h2 className="text-4xl font-black mb-12 text-center uppercase tracking-tighter">
        SÉLECTIONNE TON <span className="text-indigo-500">DÉFI</span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {Object.keys(gamesData).map(gameId => {
          const game = gamesData[gameId];
          const unlocked = user.level >= GAME_UNLOCKS[gameId];
          return (
            <Card 
              key={gameId} 
              onClick={() => handleGameSelect(gameId)}
              className={`group cursor-pointer aspect-square flex flex-col items-center justify-center p-6 text-center transition-all hover:scale-105 ${!unlocked ? 'opacity-50 grayscale' : ''}`}
            >
              <div className="w-20 h-20 nm-inset rounded-2xl flex items-center justify-center mb-4 text-3xl group-hover:nm-flat transition-all text-indigo-500">
                <i className={`fas fa-${getGameIcon(gameId)}`}></i>
              </div>
              <h3 className="font-black uppercase text-sm tracking-widest">{game.title}</h3>
              {!unlocked && (
                <div className="mt-2 text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded">
                   <i className="fas fa-lock mr-1"></i> NIV. {GAME_UNLOCKS[gameId]}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

function getGameIcon(id) {
  const icons = {
    minecraft: 'cube', mario: 'mushroom', pokemon: 'bolt', fortnite: 'parachute-box',
    gta: 'car', valorant: 'crosshairs', lol: 'shield-halved', zelda: 'sword',
    ac: 'mask', tekken: 'hand-fist', ratchet: 'wrench', gow: 'fire'
  };
  return icons[id] || 'gamepad';
}

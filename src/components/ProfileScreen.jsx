import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BADGES_DATA, XP_LEVELS } from '../data/constants';
import { getLevelFromXP, getAvatarStyle } from '../utils/helpers';
import { Button, Card, ProgressBar } from './Neumorphism';

export const ProfileScreen = ({ onBack }) => {
  const { user, deleteAccount, logout } = useAuth();
  const { level, nextXP, progress } = getLevelFromXP(user.xp, XP_LEVELS);
  const avatarColor = getAvatarStyle(user.username);

  return (
    <div className="max-w-4xl mx-auto p-4 py-12">
      <Button onClick={onBack} variant="inset" className="mb-8">
        <i className="fas fa-arrow-left"></i> RETOUR
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="flex flex-col items-center p-8">
            <div 
              className="w-24 h-24 rounded-full nm-inset flex items-center justify-center text-4xl mb-4 border-4"
              style={{ borderColor: avatarColor, color: avatarColor }}
            >
              <i className="fas fa-user"></i>
            </div>
            <h2 className="text-2xl font-black uppercase text-indigo-500">{user.username}</h2>
            <div className="bg-indigo-500 text-white px-4 py-1 rounded-full font-black text-xs mt-2">
              NIVEAU {level}
            </div>
          </Card>

          <Card className="p-6">
            <ProgressBar 
              progress={progress} 
              label="Progression XP" 
              sublabel={`${user.xp} / ${nextXP} XP`} 
            />
          </Card>

          <div className="space-y-4">
             <Button onClick={logout} className="w-full text-red-500">
               <i className="fas fa-sign-out-alt"></i> DÉCONNEXION
             </Button>
             <Button onClick={deleteAccount} variant="inset" className="w-full text-red-500 text-xs">
               SUPPRIMER MON COMPTE
             </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <Card className="p-8">
            <h3 className="font-black uppercase text-indigo-500 mb-6 flex items-center gap-2">
              <i className="fas fa-medal"></i> Badges Obtenus
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {BADGES_DATA.map(badge => {
                const isEarned = user.badges.includes(badge.id);
                return (
                  <div 
                    key={badge.id}
                    title={badge.desc}
                    className={`flex flex-col items-center p-4 rounded-2xl transition-all ${isEarned ? 'nm-flat text-indigo-500' : 'opacity-20 grayscale'}`}
                  >
                    <i className={`fas ${badge.icon} text-2xl mb-2`}></i>
                    <span className="text-[10px] font-black uppercase text-center leading-tight">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="font-black uppercase text-indigo-500 mb-6 flex items-center gap-2">
              <i className="fas fa-chart-simple"></i> Statistiques
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="nm-inset p-4 rounded-xl text-center">
                <div className="text-2xl font-black">{user.quizzesPlayed}</div>
                <div className="text-[10px] font-bold opacity-50 uppercase">Quiz Joués</div>
              </div>
              <div className="nm-inset p-4 rounded-xl text-center">
                <div className="text-2xl font-black">{user.playedGames.length}</div>
                <div className="text-[10px] font-bold opacity-50 uppercase">Jeux Découverts</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input } from '../components/Neumorphism';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, signup } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    const result = isLogin ? login(username, password) : signup(username, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-widest text-indigo-500">
          BeQuizz
        </h1>
        
        <div className="flex mb-8 p-2 nm-inset rounded-xl">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${isLogin ? 'nm-flat text-indigo-500' : 'text-gray-500'}`}
          >
            CONNEXION
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${!isLogin ? 'nm-flat text-indigo-500' : 'text-gray-500'}`}
          >
            INSCRIPTION
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 opacity-70">NOM D'UTILISATEUR</label>
            <Input 
              placeholder="Pseudo" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 opacity-70">MOT DE PASSE</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
          
          <Button type="submit" className="w-full py-4 text-indigo-500">
            {isLogin ? 'SE CONNECTER' : 'CRÉER UN COMPTE'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

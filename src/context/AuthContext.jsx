import React, { createContext, useContext, useState, useEffect } from 'react';
import { simpleHash } from '../utils/helpers';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('bq_users');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const currentUsername = localStorage.getItem('bq_current_user');
    if (currentUsername) {
      const found = users.find(u => u.username === currentUsername);
      if (found) setUser(found);
    }
  }, [users]);

  const login = (username, password) => {
    const hash = simpleHash(password);
    const found = users.find(u => u.username === username && u.passwordHash === hash);
    if (found) {
      localStorage.setItem('bq_current_user', username);
      setUser(found);
      return { success: true };
    }
    return { success: false, error: 'Identifiants incorrects.' };
  };

  const signup = (username, password) => {
    if (users.find(u => u.username === username)) {
      return { success: false, error: 'Ce nom d\'utilisateur existe déjà.' };
    }

    const newUser = {
      username,
      passwordHash: simpleHash(password),
      xp: 0,
      level: 1,
      quizzesPlayed: 0,
      bestScores: {},
      badges: [],
      playedGames: [],
      playedDiffs: [],
      perfectScoresCount: 0,
      createdAt: new Date().toISOString()
    };

    const newUsers = [...users, newUser];
    setUsers(newUsers);
    localStorage.setItem('bq_users', JSON.stringify(newUsers));
    localStorage.setItem('bq_current_user', username);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('bq_current_user');
    setUser(null);
  };

  const updateUserData = (updatedUser) => {
    const newUsers = users.map(u => u.username === updatedUser.username ? updatedUser : u);
    setUsers(newUsers);
    localStorage.setItem('bq_users', JSON.stringify(newUsers));
    setUser(updatedUser);
  };

  const deleteAccount = () => {
    const newUsers = users.filter(u => u.username !== user.username);
    setUsers(newUsers);
    localStorage.setItem('bq_users', JSON.stringify(newUsers));
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, users, login, signup, logout, updateUserData, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

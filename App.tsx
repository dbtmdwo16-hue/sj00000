import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Target, Sparkles } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MentorChat from './components/MentorChat';
import GoalTracker from './components/GoalTracker';
import Inspiration from './components/Inspiration';
import { Goal, MoodEntry } from './types';

// Wrapper for Navigation to use useLocation hook
const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <Home size={24} />, label: '홈' },
    { path: '/goals', icon: <Target size={24} />, label: '목표' },
    { path: '/chat', icon: <MessageCircle size={24} />, label: '멘토' },
    { path: '/inspiration', icon: <Sparkles size={24} />, label: '영감' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 pb-6 md:pb-3 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all duration-300
                ${isActive ? 'text-indigo-600 -translate-y-2' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  // Persistent State (Simulated with localStorage for this demo structure, 
  // but implemented with useState + useEffect for clean code)
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('doyak_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem('doyak_mood');
    return saved ? JSON.parse(saved) : [
        { date: '2023-10-20', level: 3 },
        { date: '2023-10-21', level: 2 },
        { date: '2023-10-22', level: 4 },
        { date: '2023-10-23', level: 3 },
        { date: '2023-10-24', level: 5 },
    ]; // Mock initial data
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem('doyak_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('doyak_mood', JSON.stringify(moodHistory));
  }, [moodHistory]);

  const addMoodEntry = (level: number, note: string) => {
    const today = new Date().toISOString().split('T')[0];
    setMoodHistory(prev => {
      // Remove existing entry for today if exists to allow update
      const filtered = prev.filter(e => e.date !== today);
      return [...filtered, { date: today, level, note }];
    });
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex justify-center">
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative">
          <main className="p-6 h-full overflow-y-auto">
            <Routes>
              <Route 
                path="/" 
                element={<Dashboard moodHistory={moodHistory} goals={goals} userName="친구" />} 
              />
              <Route 
                path="/goals" 
                element={<GoalTracker goals={goals} setGoals={setGoals} />} 
              />
              <Route 
                path="/chat" 
                element={<MentorChat />} 
              />
              <Route 
                path="/inspiration" 
                element={<Inspiration addMoodEntry={addMoodEntry} />} 
              />
            </Routes>
          </main>
          <Navigation />
        </div>
      </div>
    </Router>
  );
};

export default App;
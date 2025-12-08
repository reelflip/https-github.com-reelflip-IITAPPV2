import React from 'react';
import { Screen, User } from '../lib/types';

interface NavigationProps {
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  logout: () => void;
  user: User;
}

interface NavItemProps {
  id: Screen;
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ id, icon, label, isActive, onClick, hasNotification }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-4 relative ${
      isActive 
        ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
        : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    <span className="text-lg w-6 text-center">{icon}</span>
    {label}
    {hasNotification && (
      <span className="absolute right-4 top-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
    )}
  </button>
);

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, setScreen, logout, user }) => {
  
  const hasNotifications = user.notifications && user.notifications.length > 0;

  const STUDENT_MENU: {id: Screen, icon: string, label: string}[] = [
    { id: 'dashboard', icon: "⊞", label: "Dashboard" },
    { id: 'syllabus', icon: "📖", label: "Syllabus" },
    { id: 'tests', icon: "🚀", label: "Tests" },
    { id: 'ai-tutor', icon: "🤖", label: "AI Tutor" },
    { id: 'focus', icon: "⏱️", label: "Focus" },
    { id: 'analytics', icon: "📊", label: "Analytics" },
    { id: 'timetable', icon: "📅", label: "Timetable" },
    { id: 'revision', icon: "🔄", label: "Revision" },
    { id: 'mistakes', icon: "📓", label: "Mistakes" },
    { id: 'flashcards', icon: "🗂️", label: "Flashcards" },
    { id: 'backlogs', icon: "🎒", label: "Backlogs" },
    { id: 'hacks', icon: "💡", label: "Hacks" },
    { id: 'wellness', icon: "🧘", label: "Wellness" },
    { id: 'profile', icon: "⚙️", label: "Profile" },
  ];

  const ADMIN_MENU: {id: Screen, icon: string, label: string}[] = [
    { id: 'overview', icon: "⊞", label: "Overview" },
    { id: 'users', icon: "👥", label: "Users" },
    { id: 'tests', icon: "📄", label: "Tests" },
    { id: 'videos', icon: "📚", label: "Videos" },
    { id: 'content', icon: "📡", label: "Content" },
    { id: 'analytics', icon: "📊", label: "Analytics" },
    { id: 'diagnostics', icon: ">_", label: "Diagnostics" },
    { id: 'deployment', icon: "🚀", label: "Deploy" },
    { id: 'system', icon: "🗄️", label: "System" },
  ];

  const PARENT_MENU: {id: Screen, icon: string, label: string}[] = [
    { id: 'dashboard', icon: "⊞", label: "Overview" },
    { id: 'family', icon: "👨‍👩‍👦", label: "Family" },
    { id: 'analytics', icon: "📊", label: "Performance" },
    { id: 'timetable', icon: "📅", label: "Schedule" },
    { id: 'tests', icon: "🚀", label: "Test Results" },
  ];

  const getMenu = () => {
    switch(user.role) {
      case 'ADMIN': return ADMIN_MENU;
      case 'PARENT': return PARENT_MENU;
      default: return STUDENT_MENU;
    }
  };

  const menuItems = getMenu();

  return (
    <div className="w-64 bg-[#0f172a] h-screen flex flex-col fixed left-0 top-0 z-20 hidden md:flex overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-tight">IIT<span className="text-blue-500">JEE</span>Prep</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider">{user.role}</p>
          <span className="text-xs text-slate-600">• v6.0</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 pb-4">
        {menuItems.map(item => (
          <NavItem 
            key={item.id} 
            id={item.id} 
            icon={item.icon} 
            label={item.label} 
            isActive={currentScreen === item.id}
            onClick={() => setScreen(item.id)}
            hasNotification={item.id === 'profile' && hasNotifications}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  );
};
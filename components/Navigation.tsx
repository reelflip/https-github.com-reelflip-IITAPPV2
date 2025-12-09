import React, { useState } from 'react';
import { Screen, User } from '../lib/types';
import { Menu, X, MoreHorizontal, LogOut, LayoutDashboard, BookOpen, FileText, Bot, Timer, BarChart2, Calendar, RotateCw, AlertCircle, Layers, ListTodo, Lightbulb, Heart, User as UserIcon, Users, Inbox, Video, PenTool, Activity, Terminal, Settings, UploadCloud, Server } from 'lucide-react';

interface NavigationProps {
  currentScreen: Screen;
  setScreen: (s: Screen) => void;
  logout: () => void;
  user: User;
}

interface NavItemProps {
  id: Screen;
  icon: any; 
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

// --- Menu Definitions ---
const STUDENT_MENU: {id: Screen, icon: string, label: string}[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: "Dashboard" },
  { id: 'syllabus', icon: BookOpen, label: "Syllabus" },
  { id: 'tests', icon: FileText, label: "Tests" },
  { id: 'ai-tutor', icon: Bot, label: "AI Tutor" },
  { id: 'focus', icon: Timer, label: "Focus" },
  { id: 'analytics', icon: BarChart2, label: "Analytics" },
  { id: 'timetable', icon: Calendar, label: "Timetable" },
  { id: 'revision', icon: RotateCw, label: "Revision" },
  { id: 'mistakes', icon: AlertCircle, label: "Mistakes" },
  { id: 'flashcards', icon: Layers, label: "Flashcards" },
  { id: 'backlogs', icon: ListTodo, label: "Backlogs" },
  { id: 'hacks', icon: Lightbulb, label: "Hacks" },
  { id: 'wellness', icon: Heart, label: "Wellness" },
  { id: 'profile', icon: UserIcon, label: "Profile" },
];

const ADMIN_MENU: {id: Screen, icon: string, label: string}[] = [
  { id: 'overview', icon: LayoutDashboard, label: "Overview" },
  { id: 'users', icon: Users, label: "Users" },
  { id: 'inbox', icon: Inbox, label: "Inbox" },
  { id: 'syllabus_admin', icon: BookOpen, label: "Syllabus" },
  { id: 'tests', icon: FileText, label: "Tests" },
  { id: 'videos', icon: Video, label: "Videos" },
  { id: 'content', icon: Layers, label: "Content" },
  { id: 'blog_admin', icon: PenTool, label: "Blog" },
  { id: 'analytics', icon: Activity, label: "Analytics" },
  { id: 'diagnostics', icon: Terminal, label: "Diagnostics" },
  { id: 'deployment', icon: UploadCloud, label: "Deploy" },
  { id: 'system', icon: Server, label: "System" },
];

const PARENT_MENU: {id: Screen, icon: string, label: string}[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: "Overview" },
  { id: 'family', icon: Users, label: "Family" },
  { id: 'analytics', icon: BarChart2, label: "Performance" },
  { id: 'tests', icon: FileText, label: "Test Results" },
  { id: 'profile', icon: Settings, label: "Settings" },
];

const getMenu = (role: string) => {
  switch(role) {
    case 'ADMIN': return ADMIN_MENU;
    case 'PARENT': return PARENT_MENU;
    default: return STUDENT_MENU;
  }
};

const NavItem: React.FC<NavItemProps> = ({ id, icon: Icon, label, isActive, onClick, hasNotification }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-4 relative ${
      isActive 
        ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
        : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
    {hasNotification && (
      <span className="absolute right-4 top-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
    )}
  </button>
);

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, setScreen, logout, user }) => {
  const hasNotifications = user.notifications && user.notifications.length > 0;
  const menuItems = getMenu(user.role);

  return (
    <div className="w-64 bg-[#0f172a] h-screen flex flex-col fixed left-0 top-0 z-20 hidden md:flex overflow-y-auto custom-scrollbar">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-tight">IIT<span className="text-blue-500">JEE</span>Prep</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider">{user.role}</p>
          <span className="text-xs text-slate-600">• v9.8</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 pb-4">
        {menuItems.map((item: any) => (
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
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export const MobileNavigation: React.FC<NavigationProps> = ({ currentScreen, setScreen, logout, user }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuItems = getMenu(user.role);
  
  const showMore = menuItems.length > 4;
  const primaryCount = showMore ? 3 : 4;
  
  const primaryItems = menuItems.slice(0, primaryCount);
  const secondaryItems = menuItems.slice(primaryCount);

  return (
    <>
      {/* Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center px-1 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-pb">
        {primaryItems.map((item: any) => (
          <button
            key={item.id}
            onClick={() => { setScreen(item.id); setIsDrawerOpen(false); }}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all min-w-[60px] ${
              currentScreen === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'
            }`}
          >
            <item.icon className="w-6 h-6 mb-0.5" />
            <span className="text-[10px] font-bold truncate max-w-[64px]">{item.label}</span>
          </button>
        ))}
        
        {showMore && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all min-w-[60px] ${
              isDrawerOpen || secondaryItems.some((i: any) => i.id === currentScreen) ? 'text-blue-600 bg-blue-50' : 'text-slate-400'
            }`}
          >
            <MoreHorizontal className="w-6 h-6 mb-0.5" />
            <span className="text-[10px] font-bold">More</span>
          </button>
        )}

        {/* Exit Button */}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl transition-all min-w-[60px] text-red-400 hover:bg-red-50 active:scale-95"
        >
          <LogOut className="w-6 h-6 mb-0.5" />
          <span className="text-[10px] font-bold">Exit</span>
        </button>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && secondaryItems.length > 0 && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="bg-white rounded-t-2xl p-6 relative z-10 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Menu</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {secondaryItems.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => { setScreen(item.id); setIsDrawerOpen(false); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all active:scale-95 ${
                    currentScreen === item.id 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                    : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}
                >
                  <item.icon className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
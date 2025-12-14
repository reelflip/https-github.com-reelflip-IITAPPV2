
import React, { useState } from 'react';
import { Screen, User } from '../lib/types';
import { Menu, X, MoreHorizontal, LogOut, LayoutDashboard, BookOpen, FileText, Bot, Timer, BarChart2, Calendar, RotateCw, AlertCircle, Layers, ListTodo, Lightbulb, Heart, User as UserIcon, Users, Inbox, Video, PenTool, Activity, Terminal, Settings, UploadCloud, Brain, Star, GraduationCap } from 'lucide-react';

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
const STUDENT_MENU: {id: Screen, icon: any, label: string}[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: "Home" },
  { id: 'syllabus', icon: BookOpen, label: "Syllabus" },
  { id: 'ai-tutor', icon: Bot, label: "AI Tutor" },
  { id: 'tests', icon: FileText, label: "Tests" },
  { id: 'psychometric', icon: Brain, label: "Psychometric Test" },
  { id: 'focus', icon: Timer, label: "Focus" },
  { id: 'analytics', icon: BarChart2, label: "Analytics" },
  { id: 'timetable', icon: Calendar, label: "Timetable" },
  { id: 'revision', icon: RotateCw, label: "Revision" },
  { id: 'exams', icon: GraduationCap, label: "Exam Guide" }, // Added Exam Guide
  { id: 'mistakes', icon: AlertCircle, label: "Mistakes" },
  { id: 'flashcards', icon: Layers, label: "Cards" },
  { id: 'backlogs', icon: ListTodo, label: "Backlogs" },
  { id: 'hacks', icon: Lightbulb, label: "Hacks" },
  { id: 'wellness', icon: Heart, label: "Wellness" },
  { id: 'profile', icon: UserIcon, label: "Profile" },
];

const ADMIN_MENU: {id: Screen, icon: any, label: string}[] = [
  { id: 'overview', icon: LayoutDashboard, label: "Overview" },
  { id: 'users', icon: Users, label: "Users" },
  { id: 'inbox', icon: Inbox, label: "Inbox" },
  { id: 'syllabus_admin', icon: BookOpen, label: "Syllabus" },
  { id: 'tests', icon: FileText, label: "Tests" },
  { id: 'content', icon: Layers, label: "Content" },
  { id: 'blog_admin', icon: PenTool, label: "Blog" },
  { id: 'analytics', icon: BarChart2, label: "Analytics" },
  { id: 'diagnostics', icon: Activity, label: "Diagnostics" },
  { id: 'system', icon: Settings, label: "System" },
  { id: 'deployment', icon: UploadCloud, label: "Deploy" },
];

const PARENT_MENU: {id: Screen, icon: any, label: string}[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: "Overview" },
  { id: 'family', icon: Users, label: "Family" },
  { id: 'analytics', icon: BarChart2, label: "Performance" },
  { id: 'tests', icon: FileText, label: "Results" },
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
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all relative group ${
      isActive 
        ? 'bg-gradient-to-r from-blue-600/10 to-transparent border-l-4 border-blue-500 text-blue-400' 
        : 'border-l-4 border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
    <span className="tracking-wide">{label}</span>
    {hasNotification && (
      <span className="absolute right-4 top-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
    )}
  </button>
);

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, setScreen, logout, user }) => {
  const hasNotifications = user.notifications && user.notifications.length > 0;
  const menuItems = getMenu(user.role);

  return (
    <div className="w-64 bg-[#0f172a] h-screen flex flex-col fixed left-0 top-0 z-20 hidden md:flex overflow-y-auto custom-scrollbar shadow-xl">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            IIT<span className="text-blue-500">JEE</span>Prep
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1.5 py-0.5 bg-slate-800 rounded">{user.role}</p>
          <span className="text-[10px] text-slate-600">• v12.21</span>
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

      <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-all hover:shadow-inner"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export const MobileNavigation: React.FC<NavigationProps> = ({ currentScreen, setScreen, logout, user }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuItems = getMenu(user.role);
  
  const showMore = menuItems.length > 4;
  const primaryCount = showMore ? 4 : 5;
  
  const primaryItems = menuItems.slice(0, primaryCount);
  const secondaryItems = menuItems.slice(primaryCount);

  return (
    <>
      {/* Bottom Bar - Enhanced Glassmorphism */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/20 z-[50] flex justify-around items-end safe-area-pb shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
        {primaryItems.map((item: any) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setScreen(item.id); setIsDrawerOpen(false); }}
              className={`flex-1 flex flex-col items-center justify-center pt-3 pb-2 transition-all active:scale-95 touch-manipulation group relative ${
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {/* Active Indicator Top Border */}
              {isActive && <div className="absolute top-0 w-8 h-0.5 bg-blue-500 rounded-b-full shadow-[0_2px_8px_rgba(59,130,246,0.6)]"></div>}
              
              <div className={`relative p-1.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-50 -translate-y-1' : ''}`}>
                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px] drop-shadow-sm' : 'stroke-[1.5px]'}`} />
                {item.id === 'profile' && user.notifications && user.notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
                )}
              </div>
              <span className={`text-[10px] font-bold mt-0.5 max-w-[64px] truncate transition-colors ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>
                  {item.label}
              </span>
            </button>
          );
        })}
        
        {showMore && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center pt-3 pb-2 transition-all active:scale-95 touch-manipulation ${
              isDrawerOpen || secondaryItems.some((i: any) => i.id === currentScreen) ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <div className={`relative p-1.5 rounded-2xl ${isDrawerOpen ? 'bg-blue-50 -translate-y-1' : ''}`}>
              <MoreHorizontal className="w-6 h-6 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">More</span>
          </button>
        )}
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && secondaryItems.length > 0 && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="bg-white rounded-t-[2rem] p-6 relative z-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-10 shadow-2xl safe-area-pb ring-1 ring-black/5">
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
            
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">All Features</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
              {secondaryItems.map((item: any) => {
                 const isActive = currentScreen === item.id;
                 return (
                  <button
                    key={item.id}
                    onClick={() => { setScreen(item.id); setIsDrawerOpen(false); }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-90 touch-manipulation aspect-square shadow-sm ${
                      isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200' 
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-7 h-7 mb-2" />
                    <span className="text-[10px] font-bold text-center leading-tight line-clamp-2">{item.label}</span>
                  </button>
                 );
              })}
            </div>

            <div className="border-t border-slate-100 pt-6">
               <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold active:scale-95 transition-transform hover:bg-red-100 border border-red-100"
               >
                  <LogOut className="w-5 h-5" /> Sign Out
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

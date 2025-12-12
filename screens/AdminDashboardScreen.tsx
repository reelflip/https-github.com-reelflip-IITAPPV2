import React, { useState, useEffect } from 'react';
import { User } from '../lib/types';
import { StatCard } from '../components/StatCard';
import { Settings, ToggleLeft, ToggleRight, HelpCircle, BarChart3, Save, CheckCircle2, ArrowRight, Shield, Users, Layers, Server, BookOpen, FileText } from 'lucide-react';

interface Props {
  user: User;
  onNavigate?: (screen: any) => void;
  messageCount?: number;
  // Props no longer needed for config, removed to clean up interface usage in App.tsx later if strict typing enforced, 
  // but keeping them optional to avoid breaking existing calls immediately if not fully refactored.
  enableGoogleLogin?: boolean;
  onToggleGoogle?: () => void;
}

export const AdminDashboardScreen: React.FC<Props> = ({ user, onNavigate, messageCount = 0 }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="bg-[#0f172a] rounded-xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
           <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="h-full w-full">
             <path d="M0,50 L20,50 L30,20 L50,80 L70,50 L200,50" fill="none" stroke="white" strokeWidth="2" />
           </svg>
        </div>

        <div className="relative z-10">
           <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Command Center</h1>
           <p className="text-slate-400 text-sm md:text-base">Welcome back, Administrator. System is operational.</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <StatCard 
          label="Total Users" 
          value="5" 
          subValue="Registered Students & Parents"
          color="blue"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          onClick={() => onNavigate && onNavigate('users')}
        />

        <StatCard 
          label="Messages" 
          value={messageCount.toString()}
          subValue="Contact Form Inquiries"
          color="purple"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          onClick={() => onNavigate && onNavigate('inbox')}
        />

        <StatCard 
          label="Content" 
          value="Manage" 
          subValue="Tests, Quotes & Broadcasts"
          color="green"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          onClick={() => onNavigate && onNavigate('content')}
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Features Overview */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-6">
                <Layers className="w-6 h-6 text-slate-600" />
                <h3 className="text-lg font-bold text-slate-800">Admin Features & Capabilities</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold text-sm">
                        <Users size={16} /> User Management
                    </div>
                    <p className="text-xs text-slate-500">View registered users, verify accounts, and manage roles.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-purple-200 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold text-sm">
                        <BookOpen size={16} /> Syllabus & Videos
                    </div>
                    <p className="text-xs text-slate-500">Manage syllabus topics, attach chapter notes, and video lessons.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-green-700 font-bold text-sm">
                        <FileText size={16} /> Content Manager
                    </div>
                    <p className="text-xs text-slate-500">Update Flashcards, Memory Hacks, and publish Blog posts.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-orange-200 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-orange-700 font-bold text-sm">
                        <Server size={16} /> System Settings
                    </div>
                    <p className="text-xs text-slate-500">Configure OAuth, Analytics, and AI Tutor parameters.</p>
                </div>
            </div>
          </div>

          {/* System Docs Link */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl text-slate-600">🗄️</span>
                <h3 className="text-lg font-bold text-slate-800">System Documentation</h3>
            </div>
            <p className="text-slate-600 mb-6 text-sm">
                Access SQL schemas, PHP API files, and deployment guides for Hostinger.
                Use the System section to verify database connectivity and download the latest build artifacts.
            </p>
            <button 
                onClick={() => onNavigate && onNavigate('system')}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
                Open System Center <ArrowRight size={16} />
            </button>
          </div>
      </div>
    </div>
  );
};
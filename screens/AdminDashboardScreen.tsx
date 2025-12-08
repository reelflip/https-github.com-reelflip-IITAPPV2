
import React from 'react';
import { User } from '../lib/types';
import { StatCard } from '../components/StatCard';
import { Settings, ToggleLeft, ToggleRight, HelpCircle } from 'lucide-react';

interface Props {
  user: User;
  onNavigate?: (screen: any) => void;
  messageCount?: number;
  enableGoogleLogin?: boolean;
  onToggleGoogle?: () => void;
}

export const AdminDashboardScreen: React.FC<Props> = ({ user, onNavigate, messageCount = 0, enableGoogleLogin, onToggleGoogle }) => {
  return (
    <div className="space-y-8">
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
          {/* System Docs Section */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl text-slate-600">🗄️</span>
                <h3 className="text-lg font-bold text-slate-800">System Docs</h3>
            </div>
            <p className="text-slate-600 mb-4 text-sm">
                Access SQL schemas, PHP API files, and deployment guides for Hostinger.
                Use this section to download the latest build artifacts.
            </p>
            <button 
                onClick={() => onNavigate && onNavigate('system')}
                className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
            >
                Open Documentation <span>→</span>
            </button>
          </div>

          {/* Social Login Config */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col justify-between">
             <div>
                <div className="flex items-center gap-3 mb-4">
                    <Settings className="w-6 h-6 text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-800">Login Configuration</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 gap-4">
                    <div className="flex items-center gap-3">
                       <span className="text-2xl">G</span>
                       <div>
                          <p className="font-bold text-sm text-slate-800">Social Login (Google)</p>
                          <p className="text-xs text-slate-500">{enableGoogleLogin ? 'Active on Login Page' : 'Disabled'}</p>
                       </div>
                    </div>
                    <button 
                        onClick={onToggleGoogle}
                        className={`text-2xl transition-colors ${enableGoogleLogin ? 'text-green-500' : 'text-slate-300'}`}
                        title="Toggle Google Login"
                    >
                        {enableGoogleLogin ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                    </button>
                </div>
                
                {enableGoogleLogin && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex gap-2">
                        <HelpCircle className="w-4 h-4 shrink-0" />
                        <span>
                            To enable real authentication, update <code>YOUR_GOOGLE_CLIENT_ID</code> in <strong>AuthScreen.tsx</strong> with your Google Cloud credentials.
                        </span>
                    </div>
                )}
             </div>
          </div>
      </div>
    </div>
  );
};



import React, { useState, useEffect } from 'react';
import { User } from '../lib/types';
import { StatCard } from '../components/StatCard';
import { Settings, ToggleLeft, ToggleRight, HelpCircle, BarChart3, Save, CheckCircle2 } from 'lucide-react';

interface Props {
  user: User;
  onNavigate?: (screen: any) => void;
  messageCount?: number;
  enableGoogleLogin?: boolean;
  onToggleGoogle?: () => void;
}

export const AdminDashboardScreen: React.FC<Props> = ({ user, onNavigate, messageCount = 0, enableGoogleLogin, onToggleGoogle }) => {
  const [gaId, setGaId] = useState('');
  const [gaSaving, setGaSaving] = useState(false);
  const [gaSaved, setGaSaved] = useState(false);

  useEffect(() => {
      // Fetch GA ID on mount
      fetch('/api/manage_settings.php?key=google_analytics_id')
          .then(res => res.json())
          .then(data => {
              if (data.value) setGaId(data.value);
          })
          .catch(err => console.error("Failed to fetch GA settings", err));
  }, []);

  const handleSaveGA = async () => {
      setGaSaving(true);
      try {
          await fetch('/api/manage_settings.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: 'google_analytics_id', value: gaId })
          });
          setGaSaved(true);
          setTimeout(() => setGaSaved(false), 2000);
      } catch (err) {
          console.error("Failed to save GA settings", err);
      } finally {
          setGaSaving(false);
      }
  };

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

          {/* Analytics Configuration */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-bold text-slate-800">Analytics Configuration</h3>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Google Analytics Measurement ID</label>
                      <input 
                          type="text" 
                          value={gaId}
                          onChange={(e) => setGaId(e.target.value)}
                          placeholder="G-XXXXXXXXXX"
                          className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 font-mono"
                      />
                      <p className="text-xs text-slate-400 mt-2">
                          Enter your tag ID (starting with G-) to enable traffic tracking.
                      </p>
                  </div>
                  <button 
                      onClick={handleSaveGA}
                      disabled={gaSaving}
                      className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-orange-700 transition-all flex items-center gap-2 disabled:opacity-70 h-[46px]"
                  >
                      {gaSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {gaSaved ? 'Saved!' : 'Save ID'}
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};
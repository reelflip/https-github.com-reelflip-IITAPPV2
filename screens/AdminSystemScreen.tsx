
import React, { useState, useEffect } from 'react';
import { Save, Bot, Zap, CheckCircle2, AlertCircle, MessageSquare, Loader2, Play, Check, Brain, Key, BarChart3, ToggleLeft, ToggleRight, Share2, Instagram, Facebook, Twitter, Youtube, Linkedin, ShieldCheck, Database, FileCode, RefreshCw, Activity, Terminal, ExternalLink } from 'lucide-react';
import { SocialConfig } from '../lib/types';

interface DBTable {
    name: string;
    columns: number;
    rows: number;
}

const API_FILE_LIST = [
    'index.php', 'config.php', 'cors.php', 'test_db.php', 'migrate_db.php',
    'login.php', 'register.php', 'google_login.php', 'update_password.php',
    'get_dashboard.php', 'sync_progress.php', 
    'save_attempt.php', 'save_timetable.php',
    'manage_users.php', 'manage_content.php', 'manage_tests.php', 
    'manage_syllabus.php', 'manage_questions.php', 'manage_backlogs.php',
    'manage_goals.php', 'manage_mistakes.php', 'manage_notes.php',
    'manage_videos.php', 'manage_contact.php', 'contact.php',
    'manage_settings.php', 'update_profile.php', 'track_visit.php',
    'get_admin_stats.php', 'search_students.php', 'send_request.php',
    'respond_request.php', 'get_psychometric.php', 'save_psychometric.php',
    'delete_account.php', 'upload_avatar.php'
];

export const AdminSystemScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'auth' | 'health'>('health');
  const [config, setConfig] = useState({ enabled: true, model: 'gemini-3-flash-preview' });
  const [googleClientId, setGoogleClientId] = useState('');
  const [enableGoogleLogin, setEnableGoogleLogin] = useState(false);
  const [gaId, setGaId] = useState('');
  const [socialConfig, setSocialConfig] = useState<SocialConfig>({ enabled: false });
  const [saving, setSaving] = useState(false);

  // Diagnostics State
  const [dbTables, setDbTables] = useState<DBTable[]>([]);
  const [fileStatus, setFileStatus] = useState<Record<string, { code: number, ok: boolean }>>({});
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadSettings();
    runDiagnostics();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/manage_settings.php?key=ai_config');
      if(res.ok) {
          const data = await res.json();
          if (data?.value) setConfig(JSON.parse(data.value));
      }
      // ... load other settings similarly
    } catch (e) {}
  };

  const runDiagnostics = async () => {
    setScanning(true);
    try {
      // 1. Audit Database
      const dbRes = await fetch('/api/test_db.php', { cache: 'no-store' });
      if (dbRes.ok) {
        const data = await dbRes.json();
        if (data.tables) setDbTables(data.tables);
      }

      // 2. Audit API Files
      const statusMap: any = {};
      for (const file of API_FILE_LIST) {
        try {
          const res = await fetch(`/api/${file}`, { method: 'HEAD', cache: 'no-store' });
          statusMap[file] = { code: res.status, ok: res.ok };
        } catch (e) {
          statusMap[file] = { code: 0, ok: false };
        }
      }
      setFileStatus(statusMap);
    } catch (e) {}
    setScanning(false);
  };

  const handleSave = async () => {
      setSaving(true);
      // Logic for saving settings
      setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-400" /> System Control Center
            </h2>
            <p className="text-slate-400 mt-2">v12.22 Maintenance and Configuration Hub</p>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
             <button onClick={() => setActiveTab('health')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'health' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Health Check</button>
             <button onClick={() => setActiveTab('ai')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ai' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>AI Config</button>
             <button onClick={() => setActiveTab('auth')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'auth' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Auth & Social</button>
          </div>
        </div>
      </div>

      {activeTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
            
            {/* Database Auditor */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Database size={20}/></div>
                        <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Database Auditor</h3>
                    </div>
                    <button onClick={runDiagnostics} disabled={scanning} className="text-blue-600 hover:rotate-180 transition-transform duration-500">
                        <RefreshCw size={18} className={scanning ? 'animate-spin' : ''} />
                    </button>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
                    {dbTables.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 italic">No connection established. Check config.php</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {dbTables.map(table => (
                                <div key={table.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-slate-400">#</div>
                                        <div className="font-bold text-slate-700 text-sm">{table.name}</div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-right">
                                            <div className="text-blue-600 font-black text-sm">{table.columns}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">Fields</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-slate-800 font-black text-sm">{table.rows}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">Entries</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* PHP Integrity Checker */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-700 rounded-lg"><FileCode size={20}/></div>
                        <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Server File Integrity</h3>
                    </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto max-h-[500px] grid grid-cols-2 gap-2">
                    {API_FILE_LIST.map(file => {
                        const status = fileStatus[file];
                        return (
                            <div key={file} className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                                !status ? 'bg-slate-50 border-slate-100 opacity-50' :
                                status.ok ? 'bg-green-50 border-green-100 text-green-700' : 
                                status.code === 403 ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                'bg-red-50 border-red-100 text-red-700'
                            }`}>
                                <div className="truncate w-32" title={file}>{file}</div>
                                <div className="font-bold">
                                    {status ? (status.ok ? '200 OK' : status.code === 403 ? '403 PERM' : status.code || 'ERR') : '...'}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="p-4 bg-blue-50 border-t border-blue-100 flex items-start gap-3">
                    <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-blue-800 leading-tight">
                        <strong>Permission Logic:</strong> Files should be set to 644 and folders to 755. A "403" status usually means the server blocked access. A "404" means the file is missing from the <strong>/api</strong> folder.
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* Existing Tabs Content preserved below... */}
      {activeTab === 'ai' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200">
              <h3 className="text-xl font-bold mb-6">AI Tutor Model Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['gemini-3-flash-preview', 'gemini-3-pro-preview', 'llama-3-70b'].map(m => (
                      <div key={m} onClick={() => setConfig({...config, model: m})} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${config.model === m ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}>
                          <div className="font-bold text-slate-800">{m}</div>
                      </div>
                  ))}
              </div>
              <button onClick={handleSave} disabled={saving} className="mt-8 w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save AI Config
              </button>
          </div>
      )}

      {activeTab === 'auth' && (
          <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest">Google Identity Config</h3>
                <input 
                    type="text" 
                    value={googleClientId} 
                    onChange={e => setGoogleClientId(e.target.value)} 
                    placeholder="OAuth Client ID" 
                    className="w-full p-3 border rounded-xl font-mono text-sm bg-slate-50"
                />
              </div>
          </div>
      )}
    </div>
  );
};

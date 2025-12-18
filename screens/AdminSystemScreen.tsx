import React, { useState, useEffect, useRef } from 'react';
import { Save, Bot, Zap, CheckCircle2, AlertCircle, MessageSquare, Loader2, Play, Check, Brain, Key, BarChart3, ToggleLeft, ToggleRight, Share2, Instagram, Facebook, Twitter, Youtube, Linkedin, ShieldCheck, Database, FileCode, RefreshCw, Activity, Terminal, ExternalLink, Sparkles, Send, ShieldAlert } from 'lucide-react';
import { SocialConfig } from '../lib/types';

interface DBTable {
    name: string;
    columns: number;
    rows: number;
}

interface AIModel {
    id: string;
    name: string;
    provider: string;
    description: string;
    strength: string;
    color: string;
}

const AI_MODELS: AIModel[] = [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'Google', description: 'Ultra-fast, optimized for quick doubts and scheduling.', strength: 'Speed', color: 'blue' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', provider: 'Google', description: 'Deep reasoning and complex Physics problem solving.', strength: 'Reasoning', color: 'indigo' },
    { id: 'llama-3.1-70b', name: 'Llama 3.1 (70B)', provider: 'Meta', description: 'Versatile model with great theory explanation capabilities.', strength: 'General', color: 'purple' },
    { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', description: 'Logic-heavy model, excellent for Inorganic Chemistry facts.', strength: 'Logic', color: 'cyan' },
    { id: 'qwen-2.5-72b', name: 'Qwen 2.5 Math', provider: 'Alibaba', description: 'Specialized for high-level Mathematics and Calculus.', strength: 'Math', color: 'emerald' },
    { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', description: 'Balanced performance for general guidance and motivation.', strength: 'Balanced', color: 'orange' }
];

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
  const [activeTab, setActiveTab] = useState<'ai' | 'auth' | 'health'>('ai');
  const [aiConfig, setAiConfig] = useState({ enabled: true, model: 'gemini-3-flash-preview' });
  const [googleClientId, setGoogleClientId] = useState('');
  const [gaId, setGaId] = useState('');
  const [socialConfig, setSocialConfig] = useState<SocialConfig>({ enabled: false });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // AI Sandbox State
  const [testInput, setTestInput] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

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
      // Load AI Config
      const aiRes = await fetch('/api/manage_settings.php?key=ai_config');
      if(aiRes.ok) {
          const data = await aiRes.json();
          if (data?.value) setAiConfig(JSON.parse(data.value));
      }
      
      // Load Analytics
      const gaRes = await fetch('/api/manage_settings.php?key=google_analytics_id');
      if(gaRes.ok) {
          const data = await gaRes.json();
          if(data?.value) setGaId(data.value);
      }

      // Load OAuth
      const oRes = await fetch('/api/manage_settings.php?key=google_client_id');
      if(oRes.ok) {
          const data = await oRes.json();
          if(data?.value) setGoogleClientId(data.value);
      }
    } catch (e) {}
  };

  const handleTestAI = async () => {
      if(!testInput.trim() || verifying) return;
      setVerifying(true);
      setTestResponse('');
      try {
          const prompt = encodeURIComponent(`Admin Verification Test for ${aiConfig.model}: ${testInput}`);
          const res = await fetch(`https://text.pollinations.ai/${prompt}`);
          const text = await res.text();
          setTestResponse(text);
          setVerified(true);
      } catch (e) {
          setTestResponse("Verification failed. Endpoint unreachable.");
      } finally {
          setVerifying(false);
      }
  };

  const runDiagnostics = async () => {
    setScanning(true);
    try {
      const dbRes = await fetch('/api/test_db.php', { cache: 'no-store' });
      if (dbRes.ok) {
        const data = await dbRes.json();
        if (data.tables) setDbTables(data.tables);
      }
      const statusMap: any = {};
      for (const file of API_FILE_LIST) {
        try {
          const res = await fetch(`/api/${file}`, { method: 'HEAD', cache: 'no-store' });
          statusMap[file] = { code: res.status, ok: res.ok };
        } catch (e) { statusMap[file] = { code: 0, ok: false }; }
      }
      setFileStatus(statusMap);
    } catch (e) {}
    setScanning(false);
  };

  const handleSaveAI = async () => {
      setSaving(true);
      try {
          await fetch('/api/manage_settings.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: 'ai_config', value: JSON.stringify(aiConfig) })
          });
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
      } catch (e) {}
      setSaving(false);
  };

  const handleSaveAuth = async () => {
    setSaving(true);
    try {
        await fetch('/api/manage_settings.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'google_analytics_id', value: gaId })
        });
        await fetch('/api/manage_settings.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'google_client_id', value: googleClientId })
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {}
    setSaving(false);
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
             <button onClick={() => setActiveTab('ai')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ai' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>AI Config</button>
             <button onClick={() => setActiveTab('auth')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'auth' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Analytics & Auth</button>
             <button onClick={() => setActiveTab('health')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'health' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Health Check</button>
          </div>
        </div>
      </div>

      {activeTab === 'ai' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AI_MODELS.map(model => (
                      <div 
                        key={model.id} 
                        onClick={() => { setAiConfig({...aiConfig, model: model.id}); setVerified(false); }}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                            aiConfig.model === model.id ? 'border-blue-600 bg-blue-50 shadow-md ring-4 ring-blue-100' : 'border-slate-100 bg-white hover:border-slate-300'
                        }`}
                      >
                          <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                              <Sparkles size={48} />
                          </div>
                          <div className="flex justify-between items-start mb-3">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-${model.color}-100 text-${model.color}-700 border border-${model.color}-200`}>
                                  {model.strength}
                              </span>
                              {aiConfig.model === model.id && <CheckCircle2 size={16} className="text-blue-600" />}
                          </div>
                          <h4 className="font-black text-slate-800 text-lg mb-1">{model.name}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed mb-4">{model.description}</p>
                          <div className="text-[10px] text-slate-400 font-bold">Provider: {model.provider}</div>
                      </div>
                  ))}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                      <Terminal className="text-slate-400" size={20} />
                      <h3 className="font-bold text-slate-700">Sandbox: Verify {aiConfig.model}</h3>
                  </div>
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                          <textarea 
                            value={testInput}
                            onChange={e => setTestInput(e.target.value)}
                            placeholder="Type a test question (e.g. explain Newton's 3rd law)..."
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none h-32 resize-none"
                          />
                          <button 
                            onClick={handleTestAI}
                            disabled={!testInput.trim() || verifying}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50"
                          >
                            {verifying ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>} Verify & Fetch Response
                          </button>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200 min-h-[200px] relative">
                          <span className="absolute top-3 right-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">Model Output</span>
                          {testResponse ? (
                              <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed animate-in fade-in">
                                  {testResponse}
                              </div>
                          ) : (
                              <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                                  No response yet. Send a test message.
                              </div>
                          )}
                      </div>
                  </div>
                  <div className="px-6 py-4 bg-blue-50 border-t border-blue-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className={verified ? 'text-green-600' : 'text-slate-400'} />
                          <span className={`text-xs font-bold ${verified ? 'text-green-700' : 'text-slate-500'}`}>
                              {verified ? 'Model verified for production' : 'Verification pending'}
                          </span>
                      </div>
                      <button 
                        onClick={handleSaveAI}
                        disabled={saving || !verified}
                        className="bg-blue-600 text-white px-8 py-2 rounded-lg text-sm font-black shadow-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} 
                        {saveSuccess ? 'Configuration Saved' : 'Deploy to Production'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'auth' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                      <div>
                          <h3 className="font-black text-slate-800 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                              <BarChart3 size={16} className="text-blue-600" /> Google Analytics 4
                          </h3>
                          <p className="text-xs text-slate-500 mb-4">Monitor real-time user engagement and page views.</p>
                          <div className="relative">
                              <Terminal className="absolute left-3 top-3 text-slate-300" size={16} />
                              <input 
                                  type="text" 
                                  value={gaId} 
                                  onChange={e => setGaId(e.target.value)} 
                                  placeholder="G-XXXXXXXXXX" 
                                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl font-mono text-sm bg-slate-50 focus:ring-2 focus:ring-blue-100"
                              />
                          </div>
                      </div>
                      <div>
                          <h3 className="font-black text-slate-800 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                              <Key size={16} className="text-indigo-600" /> Google OAuth
                          </h3>
                          <p className="text-xs text-slate-500 mb-4">Required for social login functionality.</p>
                          <div className="relative">
                              <Key className="absolute left-3 top-3 text-slate-300" size={16} />
                              <input 
                                  type="text" 
                                  value={googleClientId} 
                                  onChange={e => setGoogleClientId(e.target.value)} 
                                  placeholder="OAuth Client ID" 
                                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl font-mono text-sm bg-slate-50 focus:ring-2 focus:ring-blue-100"
                              />
                          </div>
                      </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 border border-slate-200 text-blue-600">
                          <ExternalLink size={24} />
                      </div>
                      <h4 className="font-bold text-slate-800 mb-2">How to integrate GA4?</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                          Go to your Google Analytics dashboard, create a property, and find your "Measurement ID" in Data Streams. Paste it here to enable live tracking.
                      </p>
                      <a href="https://analytics.google.com" target="_blank" className="text-xs font-black text-blue-600 hover:underline">Open Analytics Console</a>
                  </div>
              </div>
              <button 
                onClick={handleSaveAuth}
                disabled={saving}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 shadow-xl transition-all active:scale-95"
              >
                  {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                  {saveSuccess ? 'Settings Deployed' : 'Save & Refresh All'}
              </button>
          </div>
      )}

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
    </div>
  );
};
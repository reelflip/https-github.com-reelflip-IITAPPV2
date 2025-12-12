// v10.1 - Enhanced Model Selection (Radio Cards) + OAuth Config
import React, { useState, useEffect } from 'react';
import { Save, Bot, Zap, CheckCircle2, AlertCircle, MessageSquare, Loader2, Play, BookOpen, Check, Brain, Key, BarChart3, ToggleLeft, ToggleRight } from 'lucide-react';

const MODEL_METADATA: Record<string, any> = {
  'gemini-2.5-flash': { 
    name: 'Gemini 2.5 Flash', 
    strengths: 'Balanced & Fast', 
    subjects: 'General Purpose', 
    description: 'Best for general tutoring. Good balance of speed and accuracy.',
    badge: 'bg-blue-100 text-blue-800 border-blue-200' 
  },
  'deepseek-r1': { 
    name: 'DeepSeek R1', 
    strengths: 'Logic & Derivations', 
    subjects: 'Maths, Physics', 
    description: 'Excellent for complex derivations and multi-step logical problems.',
    badge: 'bg-purple-100 text-purple-800 border-purple-200' 
  },
  'llama-3-70b': { 
    name: 'Llama-3 70B', 
    strengths: 'Detailed Theory', 
    subjects: 'Physics, Chemistry', 
    description: 'Provides verbose, textbook-style explanations for concepts.',
    badge: 'bg-orange-100 text-orange-800 border-orange-200' 
  },
  'qwen-2.5-math-72b': { 
    name: 'Qwen 2.5 Math', 
    strengths: 'Pure Mathematics', 
    subjects: 'Calculus, Algebra', 
    description: 'Specialized model trained specifically for advanced math problems.',
    badge: 'bg-green-100 text-green-800 border-green-200' 
  },
  'phi-3-medium': { 
    name: 'Phi-3 Medium', 
    strengths: 'Quick Q&A', 
    subjects: 'Revision', 
    description: 'Lightweight model for rapid fire doubt solving.',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
  }
};

export const AdminSystemScreen: React.FC = () => {
  const [config, setConfig] = useState({ enabled: true, model: 'gemini-2.5-flash' });
  const [googleClientId, setGoogleClientId] = useState('');
  const [enableGoogleLogin, setEnableGoogleLogin] = useState(false);
  const [gaId, setGaId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try LocalStorage first (for demo/preview speed)
        const localConfig = localStorage.getItem('iitjee_ai_config');
        if (localConfig) {
            setConfig(JSON.parse(localConfig));
        }

        // Fetch AI Config
        const resAI = await fetch('/api/manage_settings.php?key=ai_config');
        if(resAI.ok) {
            const data = await resAI.json();
            if (data && data.value) {
                const parsed = JSON.parse(data.value);
                setConfig(parsed);
                localStorage.setItem('iitjee_ai_config', JSON.stringify(parsed));
            }
        }

        // Fetch Google Client ID
        const resClient = await fetch('/api/manage_settings.php?key=google_client_id');
        if(resClient.ok) {
            const data = await resClient.json();
            if (data && data.value) setGoogleClientId(data.value);
        }

        // Fetch Google Login Status
        const resLogin = await fetch('/api/manage_settings.php?key=enable_google_login');
        if(resLogin.ok) {
            const data = await resLogin.json();
            if (data && data.value !== null) {
                setEnableGoogleLogin(data.value === 'true');
            }
        }

        // Fetch GA ID
        const resGA = await fetch('/api/manage_settings.php?key=google_analytics_id');
        if(resGA.ok) {
            const data = await resGA.json();
            if (data && data.value) setGaId(data.value);
        }

      } catch (e) { 
          console.debug("Config fetch failed, using defaults"); 
      } 
      finally { setLoading(false); }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save AI Config
      localStorage.setItem('iitjee_ai_config', JSON.stringify(config));
      window.dispatchEvent(new Event('storage'));
      await fetch('/api/manage_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ai_config', value: JSON.stringify(config) })
      });

      // 2. Save Google Client ID
      await fetch('/api/manage_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'google_client_id', value: googleClientId })
      });

      // 3. Save Google Login Enable
      await fetch('/api/manage_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'enable_google_login', value: String(enableGoogleLogin) })
      });

      // 4. Save Analytics ID
      await fetch('/api/manage_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'google_analytics_id', value: gaId })
      });

      setTimeout(() => setSaving(false), 800);
    } catch (error) { 
        setTimeout(() => setSaving(false), 800);
    }
  };

  const handleTest = async () => {
    if (!testPrompt.trim()) return;
    setTesting(true); setTestResponse(''); setTestError('');
    try {
      // Inject Persona for testing based on selected model
      const SIMULATED_PERSONAS: Record<string, string> = {
          'llama-3-70b': "You are Llama-3 70B. Provide detailed theoretical explanations.",
          'deepseek-r1': "You are DeepSeek R1. Focus on multi-step logical derivations.",
          'qwen-2.5-math-72b': "You are Qwen Math. Focus on pure mathematical proofs and calculation.",
          'phi-3-medium': "You are Phi-3. Be short, fast, and punchy."
      };

      let systemInstruction = "You are an expert IIT JEE Tutor. Be concise and helpful.";
      if (SIMULATED_PERSONAS[config.model]) {
          systemInstruction = SIMULATED_PERSONAS[config.model] + " " + systemInstruction;
      }

      const fullPrompt = `${systemInstruction}\n\nUser: ${testPrompt}`;
      const encodedPrompt = encodeURIComponent(fullPrompt);
      
      const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}`);
      if (!response.ok) throw new Error("API Connection Failed");
      const text = await response.text();
      text ? setTestResponse(text) : setTestError("No text returned.");
    } catch (err: any) { setTestError(err.message || "Failed."); } 
    finally { setTesting(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold flex items-center gap-3"><Bot className="w-8 h-8" /> System Configuration</h2>
          <p className="text-violet-100 mt-2 opacity-90 max-w-2xl">Configure AI services, Authentication, and Analytics.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Settings */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* Authentication Config */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center"><Key className="w-5 h-5 mr-2 text-green-500" /> Login Configuration</h3>
                    
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${enableGoogleLogin ? 'text-green-600' : 'text-slate-400'}`}>
                            {enableGoogleLogin ? 'Google Login Active' : 'Google Login Disabled'}
                        </span>
                        <button onClick={() => setEnableGoogleLogin(!enableGoogleLogin)} className={`text-2xl transition-colors ${enableGoogleLogin ? 'text-green-500' : 'text-slate-300'}`}>
                            {enableGoogleLogin ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className={`transition-opacity ${enableGoogleLogin ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Google OAuth Client ID</label>
                        <input 
                            type="text"
                            value={googleClientId}
                            onChange={(e) => setGoogleClientId(e.target.value)}
                            placeholder="784...apps.googleusercontent.com"
                            className="w-full p-3 border border-slate-200 rounded-lg text-sm font-mono text-slate-600 focus:ring-2 focus:ring-green-100 outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-2">
                            Required for "Sign in with Google". Get this from Google Cloud Console.
                        </p>
                    </div>
                </div>
            </div>

            {/* Analytics Config */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4"><BarChart3 className="w-5 h-5 mr-2 text-orange-500" /> Analytics Configuration</h3>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Google Analytics Measurement ID</label>
                    <input 
                        type="text"
                        value={gaId}
                        onChange={(e) => setGaId(e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                        className="w-full p-3 border border-slate-200 rounded-lg text-sm font-mono text-slate-600 focus:ring-2 focus:ring-orange-100 outline-none"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                        Enter your tag ID to enable traffic tracking.
                    </p>
                </div>
            </div>

            {/* AI Config */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center"><Brain className="w-5 h-5 mr-2 text-violet-600" /> AI Tutor Settings</h3>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${config.enabled ? 'text-green-600' : 'text-slate-400'}`}>
                            {config.enabled ? 'AI Tutor Active' : 'AI Tutor Disabled'}
                        </span>
                        <button onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))} className={`relative w-12 h-6 rounded-full transition-colors ${config.enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${config.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(MODEL_METADATA).map(([key, meta]) => (
                        <div 
                            key={key}
                            onClick={() => setConfig(prev => ({ ...prev, model: key }))}
                            className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                                config.model === key 
                                ? 'border-violet-500 bg-violet-50/50 ring-1 ring-violet-500' 
                                : 'border-slate-100 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${meta.badge}`}>
                                    {meta.strengths}
                                </span>
                                {config.model === key && (
                                    <div className="bg-violet-600 text-white rounded-full p-1">
                                        <Check size={12} />
                                    </div>
                                )}
                            </div>
                            <h4 className="font-bold text-slate-800 text-base mb-1">{meta.name}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mb-2">{meta.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-2">
                <button onClick={handleSave} disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                    {saving ? 'Saving System Settings...' : 'Save All Settings'}
                </button>
            </div>
        </div>

        {/* Right Column: Testing */}
        <div className="xl:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-[500px] sticky top-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4"><MessageSquare className="w-5 h-5 mr-2 text-violet-600" /> AI Sandbox</h3>
                
                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4 overflow-y-auto">
                    {testing ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-violet-600" />
                            <span className="text-xs font-bold">Querying {config.model}...</span>
                        </div>
                    ) : testResponse ? (
                        <div className="text-sm text-slate-700 whitespace-pre-wrap animate-in fade-in">
                            <span className="text-xs font-bold text-violet-600 block mb-1">AI Response:</span>
                            {testResponse}
                        </div>
                    ) : testError ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-400">
                            <AlertCircle className="w-8 h-8 mb-2" />
                            <p className="text-center text-xs px-4">{testError}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Bot className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-center text-xs px-6">Select a model on the left and test it here before deploying to students.</p>
                        </div>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={testPrompt} 
                        onChange={(e) => setTestPrompt(e.target.value)} 
                        placeholder="e.g. Explain Torque" 
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-200" 
                        onKeyDown={(e) => e.key === 'Enter' && handleTest()} 
                    />
                    <button 
                        onClick={handleTest} 
                        disabled={testing || !testPrompt} 
                        className="bg-violet-600 hover:bg-violet-700 text-white p-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Play className="w-4 h-4 fill-current" />
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
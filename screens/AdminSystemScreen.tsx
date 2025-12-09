
import React, { useState, useEffect } from 'react';
import { Save, Bot, Zap, CheckCircle2, AlertCircle, MessageSquare, Loader2, Play } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const AdminSystemScreen: React.FC = () => {
  // Configuration State
  const [config, setConfig] = useState({
    enabled: false,
    model: 'gemini-2.5-flash'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Testing State
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState('');

  // Load Settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/manage_settings.php?key=ai_config');
        if(!res.ok) return;
        
        const text = await res.text();
        if(!text || !text.trim()) return;

        const data = JSON.parse(text);
        if (data && data.value) {
          try {
            setConfig(JSON.parse(data.value));
          } catch (e) {
            console.error("Invalid JSON for ai_config");
          }
        }
      } catch (e) {
        console.debug("AI Config fetch failed (likely offline/demo mode)");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Save Settings
  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/manage_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          key: 'ai_config', 
          value: JSON.stringify(config) 
        })
      });
      // Small delay to show success state
      setTimeout(() => setSaving(false), 800);
    } catch (error) {
      setSaving(false);
      alert("Failed to save settings");
    }
  };

  // Test Logic
  const handleTest = async () => {
    if (!testPrompt.trim()) return;
    setTesting(true);
    setTestResponse('');
    setTestError('');

    try {
      // Initialize GenAI with Environment Variable
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: config.model,
        contents: testPrompt,
      });

      if (response.text) {
        setTestResponse(response.text);
      } else {
        setTestError("No text returned from model.");
      }
    } catch (err: any) {
      setTestError(err.message || "Failed to connect to AI Model.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="w-8 h-8" /> AI System Configuration
          </h2>
          <p className="text-violet-100 mt-2 opacity-90 max-w-2xl">
            Control the AI Tutor available to students. Select the model architecture and verify connectivity before enabling.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Configuration Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-violet-600" /> General Settings
            </h3>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          </div>

          <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="font-bold text-slate-700 block">Enable AI Tutor</label>
                <span className="text-xs text-slate-500">Show chat widget on student dashboard</span>
              </div>
              <button 
                onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out ${config.enabled ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-200 ${config.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select AI Model</label>
              <div className="relative">
                <select
                  value={config.model}
                  onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-100 outline-none appearance-none"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Free Tier)</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Fastest)</option>
                  <option value="gemini-2.5-flash-thinking">Gemini 2.5 Flash Thinking (Experimental)</option>
                </select>
                <Bot className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                "Flash" models are optimized for high-frequency, low-latency tasks like tutoring.
              </p>
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* Testing Playground */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-violet-600" /> Test Configuration
            </h3>
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
              Model: {config.model}
            </span>
          </div>

          <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4 overflow-y-auto min-h-[200px]">
            {!testResponse && !testError && !testing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Bot className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">Send a message to test connectivity.</p>
              </div>
            )}
            
            {testing && (
              <div className="flex items-center justify-center h-full text-violet-600 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-bold">Generating response...</span>
              </div>
            )}

            {testError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {testError}
              </div>
            )}

            {testResponse && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-end">
                  <div className="bg-violet-100 text-violet-800 px-3 py-2 rounded-lg rounded-tr-none text-sm max-w-[80%]">
                    {testPrompt}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg rounded-tl-none text-sm shadow-sm max-w-[90%]">
                    <div className="font-bold text-xs text-violet-600 mb-1 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> AI Response
                    </div>
                    {testResponse}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Ask a question (e.g. What is Torque?)"
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
              onKeyDown={(e) => e.key === 'Enter' && handleTest()}
            />
            <button 
              onClick={handleTest}
              disabled={testing || !testPrompt}
              className="bg-slate-800 hover:bg-slate-900 text-white p-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

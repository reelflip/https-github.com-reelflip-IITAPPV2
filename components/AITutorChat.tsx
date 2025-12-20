import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Loader2, Sparkles, ChevronDown, Lightbulb, Zap, HelpCircle, Brain } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface Props {
    isFullScreen?: boolean;
}

export const AITutorChat: React.FC<Props> = ({ isFullScreen = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(true); 
  const [modelName, setModelName] = useState('gemini-3-flash-preview');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isFullScreen) setIsOpen(true); }, [isFullScreen]);

  const loadConfig = () => {
    fetch('/api/manage_settings.php?key=ai_config')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
          if (data && data.value) {
            const config = JSON.parse(data.value);
            setEnabled(config.enabled);
            setModelName(config.model || 'gemini-3-flash-preview');
          }
      })
      .catch(() => {});
      
      if(messages.length === 0) {
         setMessages([{ id: 'welcome', role: 'model', text: `Hi! I'm your Personal AI Tutor. Ask me anything about Physics, Chemistry, or Maths, and I'll help you solve it step-by-step!`, timestamp: new Date() }]);
      }
  };

  useEffect(() => { loadConfig(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Tutor'}: ${m.text}`).join('\n');
      let systemInstruction = "You are an expert IIT JEE and engineering entrance Tutor. Be concise, encouraging, and focus on Physics, Chemistry, and Math. Use markdown for formulas.";
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(systemInstruction + "\n\nContext:\n" + history + "\n\nUser: " + textToSend + "\nTutor:")}`);
      const text = await response.text();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: text || "I'm having trouble thinking.", timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "Connection error.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTIONS = [
    "Explain concept of Pure Rolling.",
    "Derive the quadratic formula.",
    "Factors affecting Electronegativity?",
    "30-day strategy for Organic Chem."
  ];

  if (!enabled) return null;

  if (isFullScreen) {
      return (
          <div className="absolute inset-0 z-10 flex flex-col bg-slate-50 h-full animate-in fade-in pb-20 md:pb-0">
             <div className="bg-gradient-to-r from-violet-800 to-indigo-900 p-6 text-white shadow-xl relative overflow-hidden shrink-0">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <Bot className="w-8 h-8 text-white" />
                            <h1 className="text-2xl font-black tracking-tight">AI TUTOR SESSION</h1>
                        </div>
                        <p className="text-violet-100 text-sm opacity-80 font-medium">Ask doubts, solve problems, master concepts.</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 hidden md:block">
                        <span className="text-[10px] font-black uppercase tracking-widest block text-violet-300">Engine</span>
                        <span className="text-xs font-bold flex items-center gap-1.5">{modelName}</span>
                    </div>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {messages.length <= 1 && (
                    <div className="max-w-4xl mx-auto space-y-8 py-10 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><Zap className="text-blue-600 mb-2"/><h3 className="font-bold">Instant Solve</h3><p className="text-xs text-slate-500">Step-by-step breakdown across PCM subjects.</p></div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><Brain className="text-amber-600 mb-2"/><h3 className="font-bold">Conceptual Depth</h3><p className="text-xs text-slate-500">Go beyond formulas to master the core logic.</p></div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><HelpCircle className="text-purple-600 mb-2"/><h3 className="font-bold">Study Roadmap</h3><p className="text-xs text-slate-500">Custom schedules and revision strategies.</p></div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            {SUGGESTIONS.map((s, idx) => (<button key={idx} onClick={() => handleSend(s)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:border-violet-500 hover:text-violet-600 transition-all active:scale-95 shadow-sm">{s}</button>))}
                        </div>
                    </div>
                )}
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-3xl p-5 text-sm md:text-base shadow-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'}`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-3">
                                <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                                <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">Tutor is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
             </div>

             <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 z-20">
                <div className="max-w-4xl mx-auto relative flex items-center gap-3">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                        placeholder="Type your question here (e.g. Solve x^2 - 5x + 6 = 0)..." 
                        className="flex-1 pl-6 pr-14 py-4 bg-slate-100 border-none rounded-2xl text-base focus:ring-2 focus:ring-violet-200 outline-none shadow-inner" 
                    />
                    <button 
                        onClick={() => handleSend()} 
                        disabled={!input.trim() || isLoading} 
                        className="p-4 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-violet-200"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    </button>
                </div>
             </div>
          </div>
      );
  }

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-[9999] flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 origin-bottom-right">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2"><div className="p-1.5 bg-white/20 rounded-lg"><Bot className="w-5 h-5" /></div><h3 className="font-bold text-sm">AI Tutor</h3></div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><ChevronDown className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (<div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}><p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p></div></div>))}
            {isLoading && <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2"><Bot className="w-4 h-4 text-violet-500 animate-bounce" /><span className="text-xs text-slate-400 font-bold uppercase">Processing...</span></div></div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-white border-t border-slate-100 shrink-0 relative">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-200 outline-none" />
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="absolute right-5 top-5 p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-all active:scale-95">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-[9999] ${isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'}`}>{isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}</button>
    </div>
  );
};
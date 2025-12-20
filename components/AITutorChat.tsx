// v12.25 - Enhanced Full-Screen UI and informative content
import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Loader2, Sparkles, ChevronDown, Maximize2, Minimize2, Lightbulb, Zap, HelpCircle, Brain } from 'lucide-react';

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

  useEffect(() => {
      if (isFullScreen) {
          setIsOpen(true);
      }
  }, [isFullScreen]);

  const loadConfig = () => {
    fetch('/api/manage_settings.php?key=ai_config')
      .then(res => res.ok ? res.text() : Promise.reject())
      .then(text => {
          if (!text || !text.trim()) return;
          const data = JSON.parse(text);
          if (data && data.value) {
            const config = JSON.parse(data.value);
            setEnabled(config.enabled);
            setModelName(config.model || 'gemini-3-flash-preview');
            if (config.enabled && messages.length === 0) {
                setMessages([{ id: 'welcome', role: 'model', text: `Hi! I'm your Personal AI Tutor. Ask me anything about Physics, Chemistry, or Maths, and I'll help you solve it step-by-step!`, timestamp: new Date() }]);
            }
          }
      })
      .catch(() => {
          if(messages.length === 0) {
             setMessages([{ id: 'welcome', role: 'model', text: "Hi! I'm your AI Tutor. Ask me anything about your syllabus!", timestamp: new Date() }]);
          }
      });
  };

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (window.gtag) {
        window.gtag('event', 'ai_chat_query', {
            model: modelName,
            query_length: textToSend.length
        });
    }

    try {
      const history = messages.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Tutor'}: ${m.text}`).join('\n');
      let systemInstruction = "You are an expert IIT JEE and engineering entrance Tutor. Be concise, encouraging, and focus on Physics, Chemistry, and Math. Use markdown for formulas.";
      
      const SIMULATED_PERSONAS: Record<string, string> = {
          'gemini-3-pro-preview': "Focus on advanced derivations and multi-concept application.",
          'llama-3.1-70b': "Provide detailed theoretical context and analogies.",
          'deepseek-v3': "Prioritize logical rigor and factual accuracy in chemistry.",
          'qwen-2.5-72b': "Solve mathematical equations with extreme precision.",
          'mistral-large': "Be extremely encouraging and provide motivational study tips."
      };

      if (SIMULATED_PERSONAS[modelName]) {
          systemInstruction += " " + SIMULATED_PERSONAS[modelName];
      }

      const fullPrompt = `${systemInstruction}\n\nContext:\n${history}\n\nUser: ${textToSend}\nTutor:`;
      const encodedPrompt = encodeURIComponent(fullPrompt);
      
      const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const text = await response.text();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: text || "I'm having trouble thinking right now.", timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "Connection error. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTIONS = [
    "Explain the concept of Pure Rolling with an example.",
    "Help me derive the quadratic formula.",
    "What are the factors affecting Electronegativity?",
    "Give me a 30-day revision strategy for Organic Chemistry."
  ];

  if (!enabled) return null;

  if (isFullScreen) {
      return (
          <div className="absolute inset-0 z-10 flex flex-col bg-slate-50 h-full animate-in fade-in pb-20 md:pb-0">
             {/* Dynamic Hero Header */}
             <div className="bg-gradient-to-r from-violet-700 to-indigo-800 p-8 text-white shadow-xl relative overflow-hidden shrink-0">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <Bot className="w-8 h-8 text-white" />
                            <h1 className="text-3xl font-black tracking-tight">Personal AI Tutor</h1>
                        </div>
                        <p className="text-violet-100 text-lg opacity-90 max-w-2xl leading-relaxed">
                            Solve complex doubts, derive formulas, and get custom study strategies instantly.
                        </p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 hidden md:block">
                        <span className="text-[10px] font-black uppercase tracking-widest block text-violet-300 mb-1">Active Engine</span>
                        <span className="text-sm font-bold flex items-center gap-1.5"><Sparkles size={14} className="text-amber-400" /> {modelName}</span>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
                <div className="absolute bottom-0 left-1/4 -mb-16 w-48 h-48 rounded-full bg-white opacity-5"></div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.length <= 1 && (
                    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600"><Zap /></div>
                                <h3 className="font-bold text-slate-800 mb-2">Instant Doubt Solving</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">Upload any problem text and get a step-by-step breakdown across PCM subjects.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4 text-amber-600"><Brain /></div>
                                <h3 className="font-bold text-slate-800 mb-2">Conceptual Depth</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">Don't just get the answer. Ask "Explain the derivation" or "Why is this true?" to master the core.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4 text-purple-600"><HelpCircle /></div>
                                <h3 className="font-bold text-slate-800 mb-2">Study Roadmap</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">Ask for custom schedules, revision tips, or motivational guidance tailored to your progress.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-center font-black text-slate-400 text-[10px] uppercase tracking-widest">Try asking these:</h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                {SUGGESTIONS.map((s, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleSend(s)}
                                        className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all active:scale-95"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-4 text-sm md:text-base shadow-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'}`}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                                <Bot className="w-5 h-5 text-violet-500 animate-bounce" />
                                <span className="text-sm text-slate-500 font-bold">Tutor is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
             </div>

             <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0">
                <div className="max-w-4xl mx-auto relative">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                        placeholder="Type your question or doubt here..." 
                        className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full text-base focus:ring-2 focus:ring-violet-200 outline-none shadow-sm" 
                    />
                    <button 
                        onClick={() => handleSend()} 
                        disabled={!input.trim() || isLoading} 
                        className="absolute right-3 top-3 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all disabled:opacity-50 active:scale-95"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
                <p className="text-[9px] text-center text-slate-400 mt-2 font-bold uppercase tracking-widest">Powered by Advanced Reasoning Models • v12.25</p>
             </div>
          </div>
      );
  }

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-[9999] flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 origin-bottom-right">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg"><Bot className="w-5 h-5" /></div>
              <div><h3 className="font-bold text-sm">AI Tutor</h3><span className="text-[10px] opacity-80 uppercase tracking-widest font-black">{modelName.split('-')[0]} Mode</span></div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full"><ChevronDown className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2"><Bot className="w-4 h-4 text-violet-500 animate-bounce" /><span className="text-xs text-slate-400">Thinking...</span></div></div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-white border-t border-slate-100 shrink-0 relative">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-200 outline-none" />
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="absolute right-5 top-5 p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50 active:scale-95">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-[9999] ${isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </button>
    </div>
  );
};
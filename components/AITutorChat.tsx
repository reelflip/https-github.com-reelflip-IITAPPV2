
import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Loader2, Sparkles, User, ChevronDown } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const AITutorChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Config on Mount
  useEffect(() => {
    fetch('/api/manage_settings.php?key=ai_config')
      .then(res => res.json())
      .then(data => {
        if (data.value) {
          try {
            const config = JSON.parse(data.value);
            if (config.enabled) {
              setEnabled(true);
              setModelName(config.model || 'gemini-2.5-flash');
              // Add welcome message
              setMessages([{
                id: 'welcome',
                role: 'model',
                text: "Hi! I'm your AI Tutor. Stuck on a Physics problem or need a Chemistry concept explained? Ask away!",
                timestamp: new Date()
              }]);
            }
          } catch (e) {
            console.error("Failed to parse AI Config");
          }
        }
      })
      .catch(err => console.error("Error fetching AI settings", err));
  }, []);

  // 2. Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // 3. Send Message Logic
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = "You are an expert IIT JEE Tutor. Be concise, encouraging, and focus on Physics, Chemistry, and Math. Use formatting like bullet points for clarity.";
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: input, // Using basic single-turn for simplicity in widget, can be upgraded to chat history
        config: { systemInstruction }
      });

      const text = response.text || "I'm having trouble thinking right now. Please try again.";

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered a connection error. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 origin-bottom-right">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Tutor</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] opacity-80">Online • {modelName.replace('gemini-', '')}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-violet-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <span className={`text-[10px] mt-1 block ${msg.role === 'user' ? 'text-violet-200' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet-500 animate-bounce" />
                  <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about Physics, Chem, or Maths..."
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-200 outline-none text-slate-700 placeholder:text-slate-400"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50 disabled:hover:bg-violet-600 active:scale-95"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-slate-300 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> Powered by Gemini
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FAB Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </button>
    </div>
  );
};

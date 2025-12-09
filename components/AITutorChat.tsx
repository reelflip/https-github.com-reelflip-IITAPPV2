// v8.1 - Free AI Update
import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from 'lucide-react';

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
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/manage_settings.php?key=ai_config');
        if (!res.ok) {
            const text = await res.text();
            if(!text || !text.trim()) return;
            throw new Error(text);
        }
        
        const text = await res.text();
        if (!text || !text.trim()) return;

        const data = JSON.parse(text);
        if (data && data.value) {
          try {
            const config = JSON.parse(data.value);
            if (config.enabled) {
              setEnabled(true);
              setModelName(config.model || 'gemini-2.5-flash');
              
              let welcomeText = "Hi! I'm your AI Tutor. Stuck on a Physics problem or need a Chemistry concept explained? Ask away!";
              if (config.model === 'qwen-2.5-math-72b') welcomeText = "Hello! I am Qwen Math. I specialize in Calculus, Algebra, and proofs. Show me your toughest math problem!";
              if (config.model === 'deepseek-r1') welcomeText = "Greetings. I am DeepSeek R1. I am optimized for complex derivations and multi-step reasoning in Physics and Maths.";
              
              setMessages([{
                id: 'welcome',
                role: 'model',
                text: welcomeText,
                timestamp: new Date()
              }]);
            }
          } catch (e) {
            console.error("Failed to parse inner AI Config JSON");
          }
        }
      } catch (err) {
        console.debug("AI Settings fetch failed (likely offline/demo mode)");
      }
    };
    fetchConfig();
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
      let systemInstruction = "You are an expert IIT JEE Tutor. Be concise, encouraging, and focus on Physics, Chemistry, and Math. Use formatting like bullet points for clarity.";

      // Persona Injection
      const SIMULATED_PERSONAS: Record<string, string> = {
          'llama-3-70b': "Adopt the persona of Llama-3 70B. Your strength is general reasoning and theory. Provide very detailed, comprehensive conceptual explanations and theory notes. Do not be brief; be thorough.",
          'deepseek-r1': "Adopt the persona of DeepSeek R1. Your strength is multi-step reasoning. Break down every answer into rigorous logical steps. Focus on derivations and first principles. Ideal for JEE Advanced problems.",
          'qwen-2.5-math-72b': "Adopt the persona of Qwen 2.5 Math. You are a pure mathematics specialist. Be extremely precise with notation, calculus, and algebra. Focus on solving equations and proofs.",
          'phi-3-medium': "Adopt the persona of Phi-3 Medium. Be lightweight and fast. Provide short, punchy, step-wise breakdowns. Good for quick doubt solving."
      };

      if (SIMULATED_PERSONAS[modelName]) {
          systemInstruction = SIMULATED_PERSONAS[modelName] + " " + systemInstruction;
      }
      
      // Combine history for context
      const conversationHistory = messages.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Tutor'}: ${m.text}`).join('\n');
      const fullPrompt = `${systemInstruction}\n\nContext:\n${conversationHistory}\n\nUser: ${input}\nTutor:`;

      // Use Pollinations.ai (Free, No Key)
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}`);
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const text = await response.text();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text || "I'm having trouble thinking right now. Please try again.",
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
                  <span className="text-[10px] opacity-80">
                    {modelName.includes('gemini') ? modelName.replace('gemini-', '') : modelName} (Free)
                  </span>
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
                <Sparkles className="w-3 h-3" /> Powered by Free AI
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
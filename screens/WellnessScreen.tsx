
import React, { useState, useEffect } from 'react';
import { Wind, Sun, Music, Play, Pause, Volume2, CloudRain, Trees, Waves, Moon, Radio, Monitor } from 'lucide-react';

export const WellnessScreen: React.FC = () => {
  // --- Box Breathing State ---
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'IDLE' | 'INHALE' | 'HOLD' | 'EXHALE'>('IDLE');
  const [timer, setTimer] = useState(0);
  
  // --- Ambient Sound State ---
  const [activeSound, setActiveSound] = useState<string | null>(null);

  // Breathing Logic (4-4-4-4 Rule)
  useEffect(() => {
    let interval: number;
    
    if (breathingActive) {
      // Sequence: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> Hold (4s)
      const loop = () => {
        setBreathPhase('INHALE');
        setTimeout(() => {
            if(!breathingActive) return;
            setBreathPhase('HOLD');
            setTimeout(() => {
                if(!breathingActive) return;
                setBreathPhase('EXHALE');
                setTimeout(() => {
                    if(!breathingActive) return;
                    setBreathPhase('HOLD');
                }, 4000);
            }, 4000);
        }, 4000);
      };

      loop(); // Start immediately
      interval = window.setInterval(loop, 16000); // Repeat every 16s
    } else {
      setBreathPhase('IDLE');
    }

    return () => clearInterval(interval);
  }, [breathingActive]);

  const toggleBreathing = () => {
    setBreathingActive(!breathingActive);
    if (breathingActive) setBreathPhase('IDLE');
  };

  // Sound Configuration
  const sounds = [
    { id: 'rain', label: 'Rain', icon: <CloudRain className="w-5 h-5" /> },
    { id: 'forest', label: 'Forest', icon: <Trees className="w-5 h-5" /> },
    { id: 'ocean', label: 'Ocean', icon: <Waves className="w-5 h-5" /> },
    { id: 'lofi', label: 'Lo-Fi', icon: <Radio className="w-5 h-5" /> },
    { id: 'white', label: 'White Noise', icon: <Volume2 className="w-5 h-5" /> },
    { id: 'night', label: 'Night', icon: <Moon className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="text-3xl font-bold flex items-center gap-3">
               <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Wind className="w-6 h-6" />
               </div>
               Wellness Corner
            </h2>
            <p className="text-teal-50 mt-2 opacity-90 max-w-xl">
               Take a deep breath. Your mental health is just as important as your physics formulas.
            </p>
         </div>
         <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Box Breathing Card */}
         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2 mb-8 text-slate-500 font-bold uppercase tracking-wider text-sm">
               <Wind className="w-4 h-4" /> Box Breathing
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
               {/* Animated Circle */}
               <div 
                 className={`absolute inset-0 bg-blue-100 rounded-full transition-all duration-[4000ms] ease-in-out ${
                    breathPhase === 'INHALE' ? 'scale-100 opacity-100' : 
                    breathPhase === 'EXHALE' ? 'scale-50 opacity-80' : 
                    breathPhase === 'HOLD' ? 'scale-90 opacity-90' : 'scale-75 opacity-50'
                 }`}
               ></div>
               
               {/* Core Circle */}
               <div className="relative z-10 w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center shadow-sm border border-blue-100">
                  <span className={`text-lg font-bold transition-all duration-300 ${breathingActive ? 'text-blue-600' : 'text-slate-400'}`}>
                     {breathPhase === 'IDLE' ? 'Ready' : breathPhase}
                  </span>
               </div>
            </div>

            <button 
               onClick={toggleBreathing}
               className={`px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 ${
                  breathingActive 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
               }`}
            >
               {breathingActive ? 'Stop Session' : 'Start Breathing'}
            </button>
         </div>

         {/* Right Column: Yoga & Sounds */}
         <div className="space-y-6">
            
            {/* Desk Yoga */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
               <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-orange-600" /> 5-Minute Desk Yoga
               </h3>
               <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-orange-800">
                     <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                     <span><strong>Neck Rolls:</strong> Slowly roll your head in circles, 5 times each direction.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-orange-800">
                     <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                     <span><strong>Shoulder Shrugs:</strong> Lift shoulders to ears, hold for 3s, drop heavily.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-orange-800">
                     <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                     <span><strong>Seated Twist:</strong> Twist torso to the left, hold chair back, then right.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-orange-800">
                     <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></span>
                     <span><strong>Palming:</strong> Rub palms together until warm, place over closed eyes.</span>
                  </li>
               </ul>
            </div>

            {/* Ambient Sounds */}
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
               <h3 className="text-lg font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-600" /> Ambient Focus Sounds
               </h3>
               <p className="text-xs text-purple-700 mb-4 opacity-80">
                  Listening to binaural beats or white noise can reduce anxiety.
               </p>

               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sounds.map(sound => (
                     <button
                        key={sound.id}
                        onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                           activeSound === sound.id 
                           ? 'bg-white border-purple-300 shadow-md text-purple-700 scale-95 ring-1 ring-purple-200' 
                           : 'bg-white/50 border-purple-100 text-purple-600 hover:bg-white hover:border-purple-200'
                        }`}
                     >
                        <div className={`mb-1 transition-colors ${activeSound === sound.id ? 'text-purple-600' : 'text-purple-400'}`}>
                           {activeSound === sound.id ? <Pause className="w-5 h-5 fill-current" /> : sound.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{sound.label}</span>
                     </button>
                  ))}
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

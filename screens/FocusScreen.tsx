
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCw, Zap, RefreshCw, FileText, Timer } from 'lucide-react';

export const FocusScreen: React.FC = () => {
  const [mode, setMode] = useState<'POMODORO' | 'DEEP' | 'BREAK'>('POMODORO');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // Timer Configuration
  const MODES = {
    POMODORO: { label: 'POMODORO', minutes: 25, color: 'text-blue-600', ring: 'stroke-blue-500' },
    DEEP: { label: 'DEEP WORK', minutes: 50, color: 'text-purple-600', ring: 'stroke-purple-500' },
    BREAK: { label: 'BREAK', minutes: 5, color: 'text-green-600', ring: 'stroke-green-500' }
  };

  const currentConfig = MODES[mode];

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Add sound notification here
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(currentConfig.minutes * 60);
  };

  const changeMode = (newMode: 'POMODORO' | 'DEEP' | 'BREAK') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate progress for ring
  const totalSeconds = currentConfig.minutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden text-center">
          <div className="relative z-10">
              <div className="flex items-center justify-center space-x-3 mb-2">
                  <Timer className="w-8 h-8 text-white" />
                  <h1 className="text-3xl font-bold">Focus Zone</h1>
              </div>
              <p className="text-violet-100 text-lg opacity-90">
                  Eliminate distractions and master your workflow with structured timer blocks.
              </p>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-white opacity-10"></div>
      </div>

      {/* Timer Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col items-center relative overflow-hidden">
        
        {/* Mode Tabs */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mb-10 w-full max-w-sm">
          {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === m 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        {/* Circular Timer */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-10">
          {/* Background Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-100"
            />
            {/* Progress Ring */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${currentConfig.ring} transition-all duration-1000 ease-linear`}
            />
          </svg>
          
          <div className="text-6xl font-mono font-bold text-slate-800 tracking-wider relative z-10">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
              isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </button>

          <button
            onClick={resetTimer}
            className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 hover:rotate-180 transition-all duration-300"
          >
            <RotateCw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Strategies Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
            <span className="text-yellow-500 text-xl">💡</span> Pro Study Strategies
          </h3>
        </div>

        <div className="space-y-4">
          
          {/* Strategy 1 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-2.5 rounded-lg text-yellow-700 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-yellow-900 mb-1">Deep Work Protocol</h4>
                <p className="text-sm text-yellow-800/80 leading-relaxed">
                  Eliminate distractions. Work in 50-min blocks. If stuck, write it down and move on to maintain flow.
                </p>
              </div>
            </div>
          </div>

          {/* Strategy 2 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2.5 rounded-lg text-blue-700 shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">1/7/30 Revision Rule</h4>
                <p className="text-sm text-blue-800/80 leading-relaxed">
                  Revise new topics after 1 day, 7 days, and 30 days to beat the Forgetting Curve.
                </p>
              </div>
            </div>
          </div>

          {/* Strategy 3 */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-2.5 rounded-lg text-green-700 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-green-900 mb-1">High-Yield Short Notes</h4>
                <p className="text-sm text-green-800/80 leading-relaxed">
                  Don't copy text. Use keywords, formulas, and diagrams. Limit 1 chapter to 1 sheet.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

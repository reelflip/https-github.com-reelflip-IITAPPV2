
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Moon, BookOpen, Briefcase, RefreshCw, Brain, PenTool, Layers, Coffee, Zap, Sun as SunIcon, RotateCw } from 'lucide-react';
import { User, UserProgress, TimetableConfig } from '../lib/types';
import { SYLLABUS_DATA } from '../lib/syllabusData';

interface Props {
    user?: User | null;
    savedConfig?: TimetableConfig;
    savedSlots?: any[];
    onSave?: (config: TimetableConfig, slots: any[]) => void;
    progress?: Record<string, UserProgress>;
}

export const TimetableScreen: React.FC<Props> = ({ user, savedConfig, savedSlots, onSave, progress }) => {
  // State
  const [coachingDays, setCoachingDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [coachingStart, setCoachingStart] = useState('06:00');
  const [coachingEnd, setCoachingEnd] = useState('09:00');
  
  const [schoolEnabled, setSchoolEnabled] = useState(true);
  const [schoolStart, setSchoolStart] = useState('10:00');
  const [schoolEnd, setSchoolEnd] = useState('16:00'); 
  
  const [wakeTime, setWakeTime] = useState('05:30');
  const [bedTime, setBedTime] = useState('22:30'); 

  const [generatedSchedule, setGeneratedSchedule] = useState<any[] | null>(null);

  // --- Initialize from Saved Data ---
  useEffect(() => {
      if (savedConfig) {
          setCoachingDays(savedConfig.coachingDays || ['Mon', 'Wed', 'Fri']);
          setCoachingStart(savedConfig.coachingStart || '06:00');
          setCoachingEnd(savedConfig.coachingEnd || '09:00');
          setSchoolEnabled(savedConfig.schoolEnabled ?? true);
          setSchoolStart(savedConfig.schoolStart || '10:00');
          setSchoolEnd(savedConfig.schoolEnd || '16:00');
          setWakeTime(savedConfig.wakeTime || '05:30');
          setBedTime(savedConfig.bedTime || '22:30');
      }
      if (savedSlots && savedSlots.length > 0) {
          setGeneratedSchedule(savedSlots);
      }
  }, [savedConfig, savedSlots]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    if (coachingDays.includes(day)) {
      setCoachingDays(coachingDays.filter(d => d !== day));
    } else {
      setCoachingDays([...coachingDays, day]);
    }
  };

  // --- Utility Functions ---

  const toMins = (t: string) => {
      if(!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
  };

  const fromMins = (m: number) => {
      let h = Math.floor(m / 60);
      const mn = Math.floor(m % 60);
      if (h >= 24) h = h - 24;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      return `${displayH}:${mn.toString().padStart(2, '0')} ${ampm}`;
  };

  // Helper to render icons safely
  const getIcon = (slot: any) => {
      if (slot.iconType === 'sun') return <SunIcon className="w-4 h-4" />;
      if (slot.iconType === 'moon') return <Moon className="w-4 h-4" />;
      if (slot.iconType === 'coffee') return <Coffee className="w-4 h-4" />;
      if (slot.iconType === 'rotate') return <RotateCw className="w-4 h-4" />;
      
      switch (slot.type) {
          case 'theory': return <Brain className="w-4 h-4" />;
          case 'practice': return <PenTool className="w-4 h-4" />;
          case 'revision': return <Layers className="w-4 h-4" />;
          case 'school': return <Briefcase className="w-4 h-4" />;
          case 'coaching': return <BookOpen className="w-4 h-4" />;
          case 'sleep': return <Moon className="w-4 h-4" />;
          default: return <Clock className="w-4 h-4" />;
      }
  };

  // --- Smart Logic Helpers ---
  
  const getSmartTopic = (): string | null => {
      if (!progress) return null;
      
      // 1. Prioritize topics marked 'REVISE'
      const reviseTopics = (Object.values(progress) as UserProgress[]).filter(p => p.status === 'REVISE');
      if (reviseTopics.length > 0) {
          const t = reviseTopics[Math.floor(Math.random() * reviseTopics.length)];
          const topicName = findTopicName(t.topicId);
          return topicName ? `Revise: ${topicName}` : null;
      }

      // 2. Prioritize Stale Topics
      const staleTopics = (Object.values(progress) as UserProgress[])
          .filter(p => p.status === 'IN_PROGRESS' || p.status === 'COMPLETED')
          .sort((a, b) => {
              if (!a.lastRevised) return -1;
              if (!b.lastRevised) return 1;
              return new Date(a.lastRevised).getTime() - new Date(b.lastRevised).getTime();
          })
          .slice(0, 3);

      if (staleTopics.length > 0) {
          const t = staleTopics[0]; 
          const topicName = findTopicName(t.topicId);
          return topicName ? `Practice: ${topicName}` : null;
      }

      return null;
  };

  const findTopicName = (id: string): string | null => {
      const topic = SYLLABUS_DATA.find(t => t.id === id);
      return topic ? topic.name : null;
  };

  const handleGenerate = () => {
    let slots: any[] = [];
    let currentMins = toMins(wakeTime);
    const endOfDayMins = toMins(bedTime);

    // 1. Initial Wake Up
    slots.push({
        time: fromMins(currentMins),
        endTime: fromMins(currentMins + 30),
        label: 'Wake Up & Routine',
        type: 'routine',
        iconType: 'sun'
    });
    currentMins += 30; 

    // 2. Define Fixed Blocks
    const fixedBlocks: { start: number; end: number; label: string; type: string; subtext?: string }[] = [];

    if (schoolEnabled) {
        fixedBlocks.push({
            start: toMins(schoolStart),
            end: toMins(schoolEnd),
            label: 'School / College',
            type: 'school',
            subtext: 'Try to solve easy MCQs during free periods.'
        });
    }

    if (coachingDays.length > 0) {
         fixedBlocks.push({
            start: toMins(coachingStart),
            end: toMins(coachingEnd),
            label: 'Coaching Classes',
            type: 'coaching'
        });
    }

    fixedBlocks.sort((a, b) => a.start - b.start);

    // --- GAP FILLER LOGIC ---
    const fillGap = (start: number, end: number, isAfterCoaching: boolean) => {
        let now = start;
        let coachingRevisionDone = !isAfterCoaching; 

        while (now < end) {
            const duration = end - now;
            const hour = Math.floor(now / 60);

            // A. MEALS
            if (hour >= 7 && hour < 9 && duration >= 20 && !slots.some(s => s.label.includes('Breakfast'))) {
                 const len = Math.min(30, duration);
                 slots.push({ time: fromMins(now), endTime: fromMins(now+len), label: 'Breakfast', type: 'routine', iconType: 'coffee' });
                 now += len;
                 continue;
            }
            if (hour >= 12 && hour < 14 && duration >= 30 && !slots.some(s => s.label.includes('Lunch'))) {
                 const len = Math.min(45, duration);
                 slots.push({ time: fromMins(now), endTime: fromMins(now+len), label: 'Lunch & Power Nap', type: 'routine', iconType: 'coffee' });
                 now += len;
                 continue;
            }
            if (hour >= 19.5 && hour < 21.5 && duration >= 30 && !slots.some(s => s.label.includes('Dinner'))) {
                 const len = Math.min(45, duration);
                 slots.push({ time: fromMins(now), endTime: fromMins(now+len), label: 'Dinner & Relax', type: 'routine', iconType: 'coffee' });
                 now += len;
                 continue;
            }

            // B. COACHING REVISION
            if (!coachingRevisionDone && duration >= 20) {
                const revLen = Math.min(60, duration);
                slots.push({ 
                    time: fromMins(now), 
                    endTime: fromMins(now + revLen), 
                    label: 'Class Notes Revision', 
                    type: 'revision', 
                    subtext: "Immediately revise today's coaching topics.",
                    iconType: 'rotate'
                });
                now += revLen;
                coachingRevisionDone = true; 
                continue;
            }

            // C. STUDY SLOTS & BREAKS
            if (duration < 30) {
                slots.push({ time: fromMins(now), endTime: fromMins(end), label: 'Transit / Relax', type: 'routine' });
                now = end;
            } else if (duration <= 60) {
                const topicRec = getSmartTopic();
                slots.push({ 
                    time: fromMins(now), 
                    endTime: fromMins(now + duration), 
                    label: topicRec || 'Quick Revision / Flashcards', 
                    type: 'revision',
                    subtext: topicRec ? 'Based on your syllabus progress.' : 'Use Flashcards feature.'
                });
                now += duration;
            } else {
                const workLen = 50;
                
                let subject = 'Physics'; 
                let type = 'theory';
                let label = 'Physics: Deep Concepts';
                let subtext = 'Morning is best for heavy concepts.';

                if (hour >= 12 && hour < 18) {
                    subject = 'Maths';
                    type = 'practice';
                    label = 'Maths: Problem Solving';
                    subtext = 'Active solving prevents afternoon slump.';
                } else if (hour >= 18) {
                    subject = 'Chemistry';
                    type = 'theory';
                    label = 'Chemistry: NCERT';
                    subtext = 'Memorization works well in evenings.';
                }

                const smartTopic = getSmartTopic();
                if (smartTopic) {
                    label = smartTopic;
                    subtext = 'Prioritized based on your progress history.';
                }

                slots.push({ 
                    time: fromMins(now), 
                    endTime: fromMins(now + workLen), 
                    label: label, 
                    type: type, 
                    subject: subject,
                    subtext: subtext
                });
                now += workLen;

                if (end - now >= 10) {
                    const breakLen = 10;
                    slots.push({ time: fromMins(now), endTime: fromMins(now + breakLen), label: 'Rest / Stretch', type: 'routine' });
                    now += breakLen;
                }
            }
        }
    };

    // 3. Iterate through Day
    let isAfterCoaching = false;

    for (const block of fixedBlocks) {
        if (currentMins < block.start) {
            fillGap(currentMins, block.start, isAfterCoaching);
        }
        if (currentMins < block.end) {
             const effectiveStart = Math.max(currentMins, block.start);
             slots.push({
                time: fromMins(effectiveStart),
                endTime: fromMins(block.end),
                label: block.label,
                type: block.type,
                subtext: block.subtext
            });
            currentMins = block.end;
            isAfterCoaching = (block.type === 'coaching');
        } else {
            isAfterCoaching = false; 
        }
    }

    // 4. Fill remaining
    if (currentMins < endOfDayMins) {
        fillGap(currentMins, endOfDayMins, isAfterCoaching);
    }

    // 5. Sleep
    slots.push({
        time: fromMins(endOfDayMins),
        label: 'Sleep & Recovery',
        type: 'sleep',
        iconType: 'moon'
    });

    setGeneratedSchedule(slots);

    const configToSave: TimetableConfig = {
        coachingDays, coachingStart, coachingEnd,
        schoolEnabled, schoolStart, schoolEnd,
        wakeTime, bedTime
    };

    if (onSave) {
        onSave(configToSave, slots);
    }

    // --- SAVE TO DB ---
    if (user) {
        fetch('/api/save_timetable.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: user.id,
                config: configToSave,
                slots: slots
            })
        }).catch(err => console.error("Failed to save timetable", err));
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
        {!generatedSchedule ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                    <div className="flex items-center space-x-3 mb-2">
                        <Calendar className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Smart Timetable Generator</h2>
                    </div>
                    <p className="text-orange-100 text-sm opacity-90">Auto-allocates Revision based on your progress history.</p>
                </div>

                <div className="p-6 space-y-8">
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" /> Coaching Schedule
                        </h3>
                        <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                            {days.map(day => (
                                <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        coachingDays.includes(day)
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label htmlFor="coachingStart" className="text-xs text-slate-400 font-medium ml-1">Start Time</label>
                                <div className="relative">
                                    <input id="coachingStart" type="time" value={coachingStart} onChange={(e) => setCoachingStart(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                                    <Clock className="absolute right-3 top-3 text-slate-300 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="coachingEnd" className="text-xs text-slate-400 font-medium ml-1">End Time</label>
                                <div className="relative">
                                    <input id="coachingEnd" type="time" value={coachingEnd} onChange={(e) => setCoachingEnd(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                                    <Clock className="absolute right-3 top-3 text-slate-300 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center">
                                <Briefcase className="w-4 h-4 mr-2" /> School / College
                            </h3>
                            <button onClick={() => setSchoolEnabled(!schoolEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${schoolEnabled ? 'bg-green-500' : 'bg-slate-200'}`} aria-label="Toggle School">
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${schoolEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                        <div className={`grid grid-cols-2 gap-4 transition-opacity duration-200 ${schoolEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <div className="space-y-1">
                                <label htmlFor="schoolStart" className="text-xs text-slate-400 font-medium ml-1">Starts</label>
                                <div className="relative">
                                    <input id="schoolStart" type="time" value={schoolStart} onChange={(e) => setSchoolStart(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                                    <Clock className="absolute right-3 top-3 text-slate-300 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="schoolEnd" className="text-xs text-slate-400 font-medium ml-1">Ends</label>
                                <div className="relative">
                                    <input id="schoolEnd" type="time" value={schoolEnd} onChange={(e) => setSchoolEnd(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                                    <Clock className="absolute right-3 top-3 text-slate-300 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-100" />

                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center">
                            <Moon className="w-4 h-4 mr-2" /> Sleep Cycle
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label htmlFor="wakeTime" className="text-xs text-slate-400 font-medium ml-1">Wake Up</label>
                                <div className="relative">
                                    <input id="wakeTime" type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                                    <Clock className="absolute right-3 top-3 text-slate-300 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="bedTime" className="text-xs text-slate-400 font-medium ml-1">Bed Time</label>
                                <div className="relative">
                                    <input id="bedTime" type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                                    <Clock className="absolute right-3 top-3 text-slate-300 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <button onClick={handleGenerate} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2">
                        <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span>Generate Smart Timetable</span>
                    </button>
                </div>
            </div>
        ) : (
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-slate-800 flex items-center text-lg">
                        <span className="bg-blue-100 text-blue-700 p-2 rounded-lg mr-3">
                            <Calendar className="w-5 h-5" />
                        </span>
                        Optimized Daily Schedule
                    </h3>
                    <button onClick={() => setGeneratedSchedule(null)} className="flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                    </button>
                </div>
                
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
                    {generatedSchedule.map((slot: any, idx: number) => {
                         let bg = 'bg-slate-50';
                         let border = 'border-slate-100';
                         let text = 'text-slate-700';
                         
                         if (slot.type === 'theory') {
                             bg = 'bg-purple-50'; border = 'border-purple-100'; text = 'text-purple-900';
                         } else if (slot.type === 'practice') {
                             bg = 'bg-blue-50'; border = 'border-blue-100'; text = 'text-blue-900';
                         } else if (slot.type === 'revision') {
                             bg = 'bg-amber-50'; border = 'border-amber-100'; text = 'text-amber-900';
                         } else if (slot.type === 'school') {
                             bg = 'bg-green-50'; border = 'border-green-100'; text = 'text-green-900';
                         } else if (slot.type === 'coaching') {
                             bg = 'bg-orange-50'; border = 'border-orange-100'; text = 'text-orange-900';
                         }

                         const icon = getIcon(slot);

                         return (
                            <div key={idx} className="relative pl-8">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${
                                    slot.type === 'sleep' ? 'bg-slate-800' :
                                    slot.type === 'theory' ? 'bg-purple-500' :
                                    slot.type === 'practice' ? 'bg-blue-500' :
                                    slot.type === 'revision' ? 'bg-amber-500' :
                                    slot.type === 'school' ? 'bg-green-500' :
                                    slot.type === 'coaching' ? 'bg-orange-500' :
                                    'bg-slate-400'
                                }`}></div>
                                
                                <div className="text-xs font-mono font-bold text-slate-400 mb-1 flex items-center">
                                    {slot.time} 
                                    {slot.endTime && <span className="text-slate-300 mx-1">-</span>} 
                                    {slot.endTime}
                                </div>
                                
                                <div className={`rounded-lg p-4 relative group transition-all hover:shadow-md border ${bg} ${border}`}>
                                    <div className={`font-bold flex items-start justify-between ${text}`}>
                                        <div className="flex items-center gap-2">
                                            {icon}
                                            <span>{slot.label}</span>
                                        </div>
                                    </div>
                                    {slot.subtext && (
                                        <div className={`text-xs mt-1 font-medium opacity-80 leading-relaxed ${text}`}>
                                            {slot.subtext}
                                        </div>
                                    )}
                                    {slot.subject && (
                                        <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/50 border border-white/20">
                                            {slot.subject}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
  );
};

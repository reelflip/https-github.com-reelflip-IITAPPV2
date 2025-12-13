
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Moon, BookOpen, Briefcase, RefreshCw, Brain, PenTool, Layers, Coffee, Zap, Sun as SunIcon, RotateCw, Map, Flag, CheckSquare, CalendarDays } from 'lucide-react';
import { User, UserProgress, TimetableConfig, MasterPlanWeek, Topic } from '../lib/types';
import { SYLLABUS_DATA } from '../lib/syllabusData';

interface Props {
    user?: User | null;
    savedConfig?: TimetableConfig;
    savedSlots?: any[];
    onSave?: (config: TimetableConfig, slots: any[]) => void;
    progress?: Record<string, UserProgress>;
}

export const TimetableScreen: React.FC<Props> = ({ user, savedConfig, savedSlots, onSave, progress }) => {
  // --- View Mode ---
  const [viewMode, setViewMode] = useState<'DAILY' | 'MASTER'>('DAILY');

  // --- Daily State ---
  const [coachingDays, setCoachingDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [coachingStart, setCoachingStart] = useState('06:00');
  const [coachingEnd, setCoachingEnd] = useState('09:00');
  const [schoolEnabled, setSchoolEnabled] = useState(true);
  const [schoolStart, setSchoolStart] = useState('10:00');
  const [schoolEnd, setSchoolEnd] = useState('16:00'); 
  const [wakeTime, setWakeTime] = useState('05:30');
  const [bedTime, setBedTime] = useState('22:30'); 
  const [generatedSchedule, setGeneratedSchedule] = useState<any[] | null>(null);

  // --- Master Plan State ---
  const [planStartDate, setPlanStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [planTargetDate, setPlanTargetDate] = useState(() => {
    // Default to 6 months from now
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [generatedMasterPlan, setGeneratedMasterPlan] = useState<MasterPlanWeek[] | null>(null);

  // --- Initialize from Saved Data ---
  useEffect(() => {
      if (savedConfig) {
          // Daily
          setCoachingDays(savedConfig.coachingDays || ['Mon', 'Wed', 'Fri']);
          setCoachingStart(savedConfig.coachingStart || '06:00');
          setCoachingEnd(savedConfig.coachingEnd || '09:00');
          setSchoolEnabled(savedConfig.schoolEnabled ?? true);
          setSchoolStart(savedConfig.schoolStart || '10:00');
          setSchoolEnd(savedConfig.schoolEnd || '16:00');
          setWakeTime(savedConfig.wakeTime || '05:30');
          setBedTime(savedConfig.bedTime || '22:30');
          
          // Master Plan
          if(savedConfig.planStartDate) setPlanStartDate(savedConfig.planStartDate);
          if(savedConfig.planTargetDate) setPlanTargetDate(savedConfig.planTargetDate);
          if(savedConfig.masterPlan) setGeneratedMasterPlan(savedConfig.masterPlan);
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

  // --- Master Plan Generator Algorithm ---
  const generateMasterPlan = () => {
      try {
        const start = new Date(planStartDate);
        const end = new Date(planTargetDate);
        
        // Validation
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            alert("Invalid date selection.");
            return;
        }

        if (end <= start) {
            alert("Target date must be at least one week after start date.");
            return;
        }

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const totalWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        
        if (totalWeeks < 2) {
            alert("Study plan too short! Please select a longer duration (at least 2 weeks).");
            return;
        }

        // Reserve last 4 weeks for Revision/Mocks if plan is long enough (> 8 weeks)
        // Otherwise proportional
        let revisionWeeks = totalWeeks > 8 ? 4 : Math.floor(totalWeeks * 0.2); // 20% revision if short
        if (revisionWeeks < 1) revisionWeeks = 1;
        
        const learningWeeks = Math.max(1, totalWeeks - revisionWeeks);

        // Group syllabus by subject
        const physics = SYLLABUS_DATA.filter(t => t.subject === 'Physics');
        const chemistry = SYLLABUS_DATA.filter(t => t.subject === 'Chemistry');
        const maths = SYLLABUS_DATA.filter(t => t.subject === 'Maths');

        const allTopicsCount = physics.length + chemistry.length + maths.length;
        if(allTopicsCount === 0) {
            alert("Syllabus data missing. Please check system configuration.");
            return;
        }

        // Determine topics per week
        const topicsPerWeek = Math.ceil(allTopicsCount / learningWeeks);

        const plan: MasterPlanWeek[] = [];
        let pIdx = 0, cIdx = 0, mIdx = 0;
        let currentWeekStart = new Date(start);

        // Phase 1: Learning Weeks
        for (let i = 1; i <= learningWeeks; i++) {
            const weekTopics: Topic[] = [];
            
            // Distribute topics roughly equally (Round Robin)
            let count = 0;
            // Loop until we fill the week OR run out of ALL topics
            while (count < topicsPerWeek) {
                // Check if all done
                if (pIdx >= physics.length && cIdx >= chemistry.length && mIdx >= maths.length) {
                    break;
                }

                // Add Physics
                if (pIdx < physics.length) { weekTopics.push(physics[pIdx++]); count++; }
                if (count >= topicsPerWeek) break;
                
                // Add Chemistry
                if (cIdx < chemistry.length) { weekTopics.push(chemistry[cIdx++]); count++; }
                if (count >= topicsPerWeek) break;
                
                // Add Maths
                if (mIdx < maths.length) { weekTopics.push(maths[mIdx++]); count++; }
                if (count >= topicsPerWeek) break;
            }

            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            plan.push({
                weekNumber: i,
                startDate: currentWeekStart.toISOString().split('T')[0],
                endDate: weekEnd.toISOString().split('T')[0],
                focus: 'LEARNING',
                topics: weekTopics,
                completed: false
            });

            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }

        // Phase 2: Revision & Mocks Weeks
        for (let i = 1; i <= revisionWeeks; i++) {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            plan.push({
                weekNumber: learningWeeks + i,
                startDate: currentWeekStart.toISOString().split('T')[0],
                endDate: weekEnd.toISOString().split('T')[0],
                focus: i % 2 === 0 ? 'MOCK' : 'REVISION',
                topics: [], // General revision implies all previous
                completed: false
            });
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }

        setGeneratedMasterPlan(plan);
        saveAllData(plan);
      } catch (err) {
          console.error("Master Plan Generation Failed", err);
          alert("Failed to generate plan. Please verify your dates.");
      }
  };

  const toggleWeekComplete = (weekNum: number) => {
      if (!generatedMasterPlan) return;
      const updated = generatedMasterPlan.map(w => w.weekNumber === weekNum ? { ...w, completed: !w.completed } : w);
      setGeneratedMasterPlan(updated);
      saveAllData(updated);
  };

  // --- Common Saver ---
  const saveAllData = (plan?: MasterPlanWeek[], dailySlots?: any[]) => {
      const configToSave: TimetableConfig = {
          coachingDays, coachingStart, coachingEnd,
          schoolEnabled, schoolStart, schoolEnd,
          wakeTime, bedTime,
          masterPlan: plan || generatedMasterPlan || undefined,
          planStartDate,
          planTargetDate
      };

      if (onSave) {
          onSave(configToSave, dailySlots || generatedSchedule || []);
      }

      if (user) {
          fetch('/api/save_timetable.php', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  user_id: user.id,
                  config: configToSave,
                  slots: dailySlots || generatedSchedule || []
              })
          }).catch(err => console.error("Failed to save timetable", err));
      }
  };

  // --- Daily Generator Logic (Simplified for brevity, same as before) ---
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

  const handleGenerateDaily = () => {
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

    const fillGap = (start: number, end: number, isAfterCoaching: boolean) => {
        let now = start;
        let coachingRevisionDone = !isAfterCoaching; 

        while (now < end) {
            const duration = end - now;
            const hour = Math.floor(now / 60);

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

            if (duration < 30) {
                slots.push({ time: fromMins(now), endTime: fromMins(end), label: 'Transit / Relax', type: 'routine' });
                now = end;
            } else if (duration <= 60) {
                slots.push({ 
                    time: fromMins(now), 
                    endTime: fromMins(now + duration), 
                    label: 'Quick Revision / Flashcards', 
                    type: 'revision',
                    subtext: 'Use Flashcards feature.'
                });
                now += duration;
            } else {
                const workLen = 50;
                let subject = hour >= 12 && hour < 18 ? 'Maths' : (hour >= 18 ? 'Chemistry' : 'Physics'); 
                let type = hour >= 12 && hour < 18 ? 'practice' : 'theory';
                let label = `${subject}: ${type === 'practice' ? 'Problem Solving' : 'Deep Concepts'}`;

                slots.push({ 
                    time: fromMins(now), 
                    endTime: fromMins(now + workLen), 
                    label: label, 
                    type: type, 
                    subject: subject
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

    let isAfter = false;
    for (const block of fixedBlocks) {
        if (currentMins < block.start) {
            fillGap(currentMins, block.start, isAfter);
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
            isAfter = (block.type === 'coaching');
        } else {
            isAfter = false; 
        }
    }

    if (currentMins < endOfDayMins) {
        fillGap(currentMins, endOfDayMins, isAfter);
    }

    slots.push({
        time: fromMins(endOfDayMins),
        label: 'Sleep & Recovery',
        type: 'sleep',
        iconType: 'moon'
    });

    setGeneratedSchedule(slots);
    saveAllData(undefined, slots);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-2">
                    <CalendarDays className="w-8 h-8 text-white" />
                    <h1 className="text-3xl font-bold">Schedule & Planner</h1>
                </div>
                <p className="text-emerald-100 text-lg opacity-90 max-w-2xl">
                    Manage your daily routine and generate a long-term master plan for syllabus completion.
                </p>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-white opacity-10"></div>
        </div>

        {/* Top Toggle */}
        <div className="flex justify-center mb-6">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
                <button 
                    onClick={() => setViewMode('DAILY')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'DAILY' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Clock className="w-4 h-4" /> Daily Routine
                </button>
                <button 
                    onClick={() => setViewMode('MASTER')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'MASTER' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Map className="w-4 h-4" /> Full Course Plan
                </button>
            </div>
        </div>

        {/* ... Rest of content ... */}
        {viewMode === 'MASTER' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                {/* Master Plan Inputs */}
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <div className="flex items-center space-x-3 mb-2">
                            <Map className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Long-Term Strategy Generator</h2>
                        </div>
                        <p className="text-blue-100 text-sm opacity-90">Auto-distributes syllabus into weeks until your exam date.</p>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Start Date</label>
                                <input 
                                    type="date" 
                                    value={planStartDate} 
                                    onChange={(e) => setPlanStartDate(e.target.value)} 
                                    className="w-full p-3 border border-slate-200 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Exam Date</label>
                                <input 
                                    type="date" 
                                    value={planTargetDate} 
                                    onChange={(e) => setPlanTargetDate(e.target.value)} 
                                    className="w-full p-3 border border-slate-200 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={generateMasterPlan}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors"
                        >
                            <CalendarDays className="w-5 h-5 mr-2" /> Generate Master Plan
                        </button>
                    </div>
                </div>

                {/* Master Plan Output */}
                {generatedMasterPlan && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 ml-1">Your Roadmap ({generatedMasterPlan.length} Weeks)</h3>
                        {generatedMasterPlan.map((week, idx) => (
                            <div key={idx} className={`bg-white rounded-xl border transition-all ${week.completed ? 'border-green-200 bg-green-50/30 opacity-70' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
                                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold ${
                                            week.focus === 'REVISION' ? 'bg-amber-100 text-amber-700' : 
                                            week.focus === 'MOCK' ? 'bg-red-100 text-red-700' : 
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            <span className="text-xs uppercase">Week</span>
                                            <span className="text-lg leading-none">{week.weekNumber}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-800">
                                                    {new Date(week.startDate).toLocaleDateString('en-US', {month: 'short', day:'numeric'})} - {new Date(week.endDate).toLocaleDateString('en-US', {month: 'short', day:'numeric'})}
                                                </h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                                    week.focus === 'REVISION' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    week.focus === 'MOCK' ? 'bg-red-50 text-red-600 border-red-200' :
                                                    'bg-blue-50 text-blue-600 border-blue-200'
                                                }`}>{week.focus}</span>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {week.focus === 'LEARNING' ? `${week.topics.length} Chapters Assigned` : 'Review weak areas and take full-length tests.'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => toggleWeekComplete(week.weekNumber)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                            week.completed ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                    >
                                        {week.completed ? <CheckSquare className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                                        {week.completed ? 'Completed' : 'Mark Done'}
                                    </button>
                                </div>

                                {week.topics.length > 0 && !week.completed && (
                                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 mt-2">
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {week.topics.map(t => (
                                                <span key={t.id} className={`text-xs px-2 py-1 rounded border ${
                                                    t.subject === 'Physics' ? 'bg-purple-50 border-purple-100 text-purple-700' :
                                                    t.subject === 'Chemistry' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                                    'bg-cyan-50 border-cyan-100 text-cyan-700'
                                                }`}>
                                                    {t.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            // DAILY MODE
            <div className="animate-in fade-in slide-in-from-left-4">
                {!generatedSchedule ? (
                    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
                            <div className="flex items-center space-x-3 mb-2">
                                <Clock className="w-6 h-6" />
                                <h2 className="text-xl font-bold">Daily Routine Generator</h2>
                            </div>
                            <p className="text-slate-300 text-sm opacity-90">Auto-allocates Revision based on your progress history.</p>
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

                            <button onClick={handleGenerateDaily} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2">
                                <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <span>Generate Daily Schedule</span>
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
        )}
    </div>
  );
};

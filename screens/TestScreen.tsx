
import React, { useState, useEffect, useCallback } from 'react';
import { TestAttempt, Test, QuestionResult, User, Question } from '../lib/types';
import { Clock, Check, FileText, PlayCircle, RotateCcw, Target, AlertTriangle, ChevronLeft, ChevronRight, Send, Loader2, Trophy, X, AlertCircle } from 'lucide-react';

interface Props {
  user: User;
  addTestAttempt: (attempt: TestAttempt) => void;
  history: TestAttempt[];
  availableTests: Test[];
}

export const TestScreen: React.FC<Props> = ({ user, addTestAttempt, history, availableTests = [] }) => {
  const isParent = user.role === 'PARENT';
  const [activeTab, setActiveTab] = useState<'practice' | 'history'>(isParent ? 'history' : 'practice');
  const [runningTest, setRunningTest] = useState<Test | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStartTime, setTestStartTime] = useState<number>(0);

  // Logic: Parents are locked to History tab
  useEffect(() => {
    if (isParent) setActiveTab('history');
  }, [isParent]);

  const handleSubmit = useCallback(async (isAuto = false) => {
    if (!runningTest) return;
    
    if (!isAuto && Object.keys(userAnswers).length < runningTest.questions.length) {
        if(!confirm(`You have only answered ${Object.keys(userAnswers).length} out of ${runningTest.questions.length} questions. Submit anyway?`)) return;
    }

    setIsSubmitting(true);

    const questions = runningTest.questions;
    const results: QuestionResult[] = questions.map(q => ({
        questionId: q.id,
        subjectId: q.subjectId,
        topicId: q.topicId,
        status: userAnswers[q.id] === undefined ? 'UNATTEMPTED' : (userAnswers[q.id] === q.correctOptionIndex ? 'CORRECT' : 'INCORRECT'),
        selectedOptionIndex: userAnswers[q.id]
    }));

    const correctCount = results.filter(r => r.status === 'CORRECT').length;
    const incorrectCount = results.filter(r => r.status === 'INCORRECT').length;
    const unattemptedCount = results.filter(r => r.status === 'UNATTEMPTED').length;
    
    // JEE Scoring Logic: +4 for Correct, -1 for Incorrect
    const score = (correctCount * 4) - (incorrectCount * 1);
    const totalMarks = questions.length * 4;
    const accuracy = Math.round((correctCount / (correctCount + incorrectCount || 1)) * 100);

    const timeTaken = Math.floor((Date.now() - testStartTime) / 1000);

    const attempt: TestAttempt = {
        id: `att_${Date.now()}`,
        date: new Date().toISOString(),
        title: runningTest.title,
        score,
        totalMarks,
        accuracy,
        accuracy_percent: accuracy,
        testId: runningTest.id,
        totalQuestions: questions.length,
        correctCount,
        incorrectCount,
        unattemptedCount,
        detailedResults: results,
        timeTakenSeconds: timeTaken
    };

    try {
        await addTestAttempt(attempt);
        setIsSubmitting(false);
        setRunningTest(null);
        setActiveTab('history');
        alert(`Test Submitted Successfully!\nScore: ${score}/${totalMarks}\nAccuracy: ${accuracy}%`);
    } catch (e) {
        alert("Submission failed. Please check your internet connection.");
        setIsSubmitting(false);
    }
  }, [runningTest, userAnswers, testStartTime, addTestAttempt]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (runningTest && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft(prev => {
            if (prev <= 1) {
                clearInterval(interval);
                handleSubmit(true);
                return 0;
            }
            return prev - 1;
        }), 1000);
    }
    return () => clearInterval(interval);
  }, [runningTest, timeLeft, handleSubmit]);

  const startTest = (test: Test) => {
    if (!test.questions || test.questions.length === 0) {
        alert("This test has no questions available. Please select another.");
        return;
    }
    setRunningTest(test);
    setUserAnswers({});
    setCurrentQuestionIdx(0);
    setTimeLeft(test.durationMinutes * 60);
    setTestStartTime(Date.now());
  };

  const handleExit = () => {
      if(confirm("Are you sure you want to exit? Your progress will be lost and no result will be saved.")) {
          setRunningTest(null);
      }
  };

  const handleSelectOption = (qId: string, idx: number) => {
      setUserAnswers(prev => ({
          ...prev,
          [qId]: idx
      }));
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (runningTest) {
      const questions = runningTest.questions;
      if (!questions || questions.length === 0) {
          return (
              <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-8">
                  <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-800">Test Engine Error</h2>
                  <p className="text-slate-500 mt-2">No questions found for this test configuration.</p>
                  <button onClick={handleExit} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Back to Menu</button>
              </div>
          );
      }

      const currentQ = questions[currentQuestionIdx];
      const progress = ((currentQuestionIdx + 1) / questions.length) * 100;

      return (
          <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in fade-in">
              {/* Test Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-xl shrink-0">
                  <div className="flex items-center gap-4">
                      <button onClick={handleExit} className="p-2 hover:bg-white/10 rounded-lg text-white" title="Exit Test">
                          <X className="w-5 h-5" />
                      </button>
                      <div className="h-8 w-px bg-slate-700 mx-1 hidden md:block"></div>
                      <div>
                          <h2 className="text-lg font-bold truncate max-w-xs md:max-w-md">{runningTest.title}</h2>
                          <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase">
                              <span>{questions.length} Questions</span>
                              <span>JEE Pattern</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className={`flex items-center gap-3 px-6 py-2 rounded-xl border transition-colors ${timeLeft < 300 ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-blue-400'}`}>
                      <Clock className="w-5 h-5" />
                      <span className="font-mono text-xl font-black">{formatTime(timeLeft)}</span>
                  </div>
              </div>

              {/* Subject Navigation */}
              <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between">
                  <div className="flex gap-2">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-4 hidden md:block">Navigation:</span>
                     <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Standard Mock</span>
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                      Progress: {currentQuestionIdx + 1} / {questions.length}
                  </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-1.5 shrink-0">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>

              {/* Main Test Engine Area */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                  {/* Left: Question Area */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-12">
                      <div className="max-w-3xl mx-auto space-y-8 pb-32">
                          <div className="flex justify-between items-center">
                              <span className="px-4 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-500 uppercase">Question {currentQuestionIdx + 1}</span>
                              <span className={`px-3 py-1 rounded text-[10px] font-black uppercase ${currentQ.difficulty === 'HARD' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                  {currentQ.difficulty || 'MEDIUM'}
                              </span>
                          </div>

                          <div className="text-xl md:text-2xl text-slate-800 font-bold leading-relaxed">
                              {currentQ.text}
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                              {currentQ.options.map((opt, idx) => (
                                  <button 
                                      key={idx}
                                      onClick={() => handleSelectOption(currentQ.id, idx)}
                                      className={`p-5 rounded-2xl border-2 text-left transition-all group flex items-center gap-4 ${
                                          userAnswers[currentQ.id] === idx 
                                          ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-500/10' 
                                          : 'border-slate-100 hover:border-blue-200 bg-white hover:bg-slate-50'
                                      }`}
                                  >
                                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black transition-colors ${
                                          userAnswers[currentQ.id] === idx 
                                          ? 'bg-blue-600 border-blue-600 text-white' 
                                          : 'border-slate-200 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-600'
                                      }`}>
                                          {String.fromCharCode(65 + idx)}
                                      </div>
                                      <span className={`text-lg ${userAnswers[currentQ.id] === idx ? 'text-blue-900 font-bold' : 'text-slate-600 font-medium'}`}>
                                          {opt}
                                      </span>
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Right: Question Navigator Sidebar (Hidden on mobile) */}
                  <div className="hidden md:flex w-80 bg-white border-l border-slate-200 p-6 flex-col overflow-y-auto">
                      <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-6">Question Palette</h3>
                      <div className="grid grid-cols-4 gap-3">
                          {questions.map((q, idx) => (
                              <button
                                  key={q.id}
                                  onClick={() => setCurrentQuestionIdx(idx)}
                                  className={`h-10 w-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center border-2 ${
                                      currentQuestionIdx === idx ? 'border-blue-600 bg-blue-600 text-white shadow-lg' :
                                      userAnswers[q.id] !== undefined ? 'bg-emerald-50 border-emerald-500 text-emerald-700' :
                                      'bg-slate-50 border-slate-100 text-slate-400'
                                  }`}
                              >
                                  {idx + 1}
                              </button>
                          ))}
                      </div>

                      <div className="mt-auto space-y-4 pt-8">
                          <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                             <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                 <span>Attempted</span>
                                 <span className="text-emerald-600">{Object.keys(userAnswers).length}</span>
                             </div>
                             <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                 <span>Remaining</span>
                                 <span className="text-slate-600">{questions.length - Object.keys(userAnswers).length}</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => handleSubmit()}
                            disabled={isSubmitting}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                          >
                             {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />} Finish Test
                          </button>
                          <button onClick={handleExit} className="w-full text-slate-400 hover:text-red-500 text-xs font-bold uppercase transition-colors">Discard & Exit</button>
                      </div>
                  </div>
              </div>

              {/* Mobile Controls */}
              <div className="md:hidden bg-white border-t border-slate-200 p-4 flex gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] safe-area-pb">
                   <button 
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                    className="flex-1 py-4 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-500 disabled:opacity-30"
                   >
                       <ChevronLeft />
                   </button>
                   <button 
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="flex-[2] bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2"
                   >
                       {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Submit'}
                   </button>
                   <button 
                    disabled={currentQuestionIdx === questions.length - 1}
                    onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    className="flex-1 py-4 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-500 disabled:opacity-30"
                   >
                       <ChevronRight />
                   </button>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold">{isParent ? 'Student Scorecards' : 'Test Center'}</h1>
                <p className="text-blue-100 mt-1 opacity-90">
                    {isParent ? "Viewing verified performance history of your child." : "Challenge yourself with mock exams and track your improvement."}
                </p>
            </div>
            {!isParent && (
                <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-sm border border-white/10 shrink-0">
                    <button onClick={() => setActiveTab('practice')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'practice' ? 'bg-white text-blue-700 shadow-lg' : 'text-white hover:bg-white/10'}`}>Practice</button>
                    <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-blue-700 shadow-lg' : 'text-white hover:bg-white/10'}`}>History</button>
                </div>
            )}
        </div>

        {activeTab === 'practice' && !isParent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {availableTests.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold uppercase tracking-widest text-xs">No Mock Tests Available</p>
                        <p className="mt-2">Check back later or take chapter tests in the Syllabus tab.</p>
                    </div>
                ) : (
                    availableTests.map(test => (
                        <div key={test.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${test.difficulty === 'ADVANCED' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {test.difficulty}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">{test.title}</h3>
                            <div className="flex gap-4 text-xs font-bold text-slate-400 mb-8 uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {test.durationMinutes} mins</span>
                                <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {test.questions?.length || 0} Qs</span>
                            </div>
                            <button 
                                onClick={() => startTest(test)} 
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-blue-600 hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                            >
                                <PlayCircle size={20} /> Start Mock Test
                            </button>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === 'history' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        {isParent ? "Student Performance History" : "Past Attempts"}
                    </h3>
                    <span className="text-[10px] font-black bg-white border px-3 py-1 rounded-full text-slate-400">TOTAL: {history.length}</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {history.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <p className="font-bold text-slate-600">No test records found.</p>
                            <p className="text-xs max-w-xs mx-auto mt-2">{isParent ? "Your child hasn't taken any mock tests or chapter tests yet." : "You haven't completed any assessments. Time to take your first test!"}</p>
                        </div>
                    ) : (
                        history.map(attempt => (
                            <div key={attempt.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex gap-4 items-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${attempt.accuracy_percent >= 75 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        <Trophy size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-base">{attempt.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-2">
                                            <span>{new Date(attempt.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-blue-600">{attempt.timeTakenSeconds ? `${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s` : 'JEE Standard'}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 flex items-center gap-8 text-right">
                                    <div>
                                        <div className="text-2xl font-black text-slate-900">{attempt.score}<span className="text-slate-400 text-sm font-normal">/{attempt.totalMarks}</span></div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Score</div>
                                    </div>
                                    <div className="w-24">
                                        <div className={`text-lg font-black ${attempt.accuracy_percent >= 75 ? 'text-green-600' : attempt.accuracy_percent >= 50 ? 'text-blue-600' : 'text-red-600'}`}>
                                            {attempt.accuracy_percent}%
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accuracy</div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                            <RotateCcw size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
    </div>
  );
};


import React, { useState, useEffect, useMemo } from 'react';
import { TestAttempt, Test, QuestionResult, User } from '../lib/types';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Clock, Check, AlertCircle, PlayCircle, RotateCcw, Filter } from 'lucide-react';

interface Props {
  user?: User;
  addTestAttempt: (attempt: TestAttempt) => void;
  history: TestAttempt[];
  availableTests: Test[];
}

export const TestScreen: React.FC<Props> = ({ user, addTestAttempt, history, availableTests = [] }) => {
  const [activeTab, setActiveTab] = useState<'practice' | 'history'>('practice');
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  
  // Filter Toggle
  const [showAllTests, setShowAllTests] = useState(false);

  // Manual Entry State
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualForm, setManualForm] = useState({ title: '', score: '', totalMarks: '300' });

  // Intelligent Default Tab
  useEffect(() => {
      // If history is empty, guide to practice
      if (history.length === 0) {
          setActiveTab('practice');
      }
  }, [history.length]);

  // Handle Manual Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreVal = parseInt(manualForm.score) || 0;
    const totalVal = parseInt(manualForm.totalMarks) || 300;
    const accuracyVal = totalVal > 0 ? Math.round((scoreVal / totalVal) * 100) : 0;

    const attempt: TestAttempt = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: manualForm.title || 'Untitled Mock Test',
      score: scoreVal,
      totalMarks: totalVal,
      accuracy: accuracyVal,
      mistakes: [],
      testId: 'manual_' + Date.now(),
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      unattemptedCount: 0,
      accuracy_percent: accuracyVal
    };
    addTestAttempt(attempt);
    setIsManualEntry(false);
    setManualForm({ title: '', score: '', totalMarks: '300' });
    setActiveTab('history');
  };

  // Filter Logic
  const filteredTests = useMemo(() => {
      if (showAllTests || !user) return availableTests;

      const target = user.targetExam || 'JEE Main & Advanced';
      
      return availableTests.filter(test => {
          if (target.includes('JEE') && test.examType === 'JEE') return true;
          if (target.includes('BITSAT') && test.examType === 'BITSAT') return true;
          if (target.includes('VITEEE') && test.examType === 'VITEEE') return true;
          if (target.includes('MHT-CET') && test.examType === 'OTHER') return true; // Mapping assumption
          
          // Fallback: If test has no type or target is vague, maybe include? 
          // Stricter for now:
          return false;
      });
  }, [availableTests, user, showAllTests]);

  const displayTests = filteredTests.length > 0 ? filteredTests : (showAllTests ? [] : availableTests); // Fallback to all if filter returns empty (UX choice)

  if (activeTest) {
      return (
          <ActiveTestSession 
            test={activeTest} 
            onFinish={(result) => {
                addTestAttempt(result);
                setActiveTest(null);
                setActiveTab('history');
            }}
            onCancel={() => setActiveTest(null)}
          />
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <PageHeader 
        title="Test Center" 
        subtitle="Attempt new mock tests or analyze your past performance."
        action={
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setActiveTab('practice')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'practice' ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}>Practice Zone</button>
                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}>History</button>
            </div>
        }
      />

      {activeTab === 'practice' && (
          <div className="space-y-6">
              
              {/* Filter Controls */}
              <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                          Showing: {showAllTests ? 'All Available Tests' : `Recommended for ${user?.targetExam || 'You'}`}
                      </span>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${!showAllTests ? 'text-slate-400' : 'text-blue-600'}`}>All</span>
                      <button 
                          onClick={() => setShowAllTests(!showAllTests)}
                          className={`w-10 h-5 rounded-full p-1 transition-colors ${!showAllTests ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                          <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${!showAllTests ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </button>
                      <span className={`text-xs font-bold ${!showAllTests ? 'text-blue-600' : 'text-slate-400'}`}>Recommended</span>
                  </div>
              </div>

              {displayTests.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-slate-500 font-medium">No matching tests found for your target exam.</p>
                      <button onClick={() => setShowAllTests(true)} className="text-xs text-blue-600 font-bold mt-2 hover:underline">
                          Show all available tests
                      </button>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayTests.map(test => (
                          <div key={test.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                  <div>
                                      <div className="flex gap-2 mb-2">
                                          <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{test.examType || 'GENERIC'}</span>
                                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                                              test.difficulty === 'ADVANCED' ? 'bg-red-50 text-red-700 border-red-100' : 
                                              test.difficulty === 'MAINS' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                                          }`}>
                                              {test.difficulty}
                                          </span>
                                      </div>
                                      <h3 className="font-bold text-lg text-slate-800 leading-tight">{test.title}</h3>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 font-medium">
                                  <span className="flex items-center"><Clock size={14} className="mr-1"/> {test.durationMinutes} mins</span>
                                  <span>•</span>
                                  <span>{test.questions.length} Questions</span>
                              </div>
                              <Button onClick={() => setActiveTest(test)} className="w-full group-hover:bg-blue-700">
                                  Start Test <PlayCircle size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/>
                              </Button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {activeTab === 'history' && (
          <div className="space-y-6">
              {!isManualEntry ? (
                  <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => setIsManualEntry(true)}>+ Log Manual Result</Button>
                  </div>
              ) : (
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-4">Log External Test Result</h4>
                      <form onSubmit={handleManualSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                          <div className="flex-1 w-full">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                              <input required value={manualForm.title} onChange={e => setManualForm({...manualForm, title: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g. Allen Major Test 1"/>
                          </div>
                          <div className="w-full md:w-24">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Score</label>
                              <input required type="number" value={manualForm.score} onChange={e => setManualForm({...manualForm, score: e.target.value})} className="w-full p-2 border rounded"/>
                          </div>
                          <div className="w-full md:w-24">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Total</label>
                              <input required type="number" value={manualForm.totalMarks} onChange={e => setManualForm({...manualForm, totalMarks: e.target.value})} className="w-full p-2 border rounded"/>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                              <Button type="submit" className="flex-1 md:flex-none">Save</Button>
                              <Button type="button" variant="ghost" onClick={() => setIsManualEntry(false)} className="flex-1 md:flex-none">Cancel</Button>
                          </div>
                      </form>
                  </div>
              )}

              <div className="space-y-3">
                  {history.length === 0 && <p className="text-center text-slate-400 py-10">No test history found.</p>}
                  {[...history].reverse().map(attempt => (
                      <div key={attempt.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center hover:shadow-sm transition-all">
                          <div>
                              <h4 className="font-bold text-slate-800">{attempt.title}</h4>
                              <p className="text-xs text-slate-500">{new Date(attempt.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                              <span className="block text-xl font-bold text-slate-900">{attempt.score}<span className="text-sm text-slate-400">/{attempt.totalMarks}</span></span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${attempt.accuracy_percent > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {attempt.accuracy_percent}% Accuracy
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

// --- Active Test Component ---

const ActiveTestSession = ({ test, onFinish, onCancel }: { test: Test, onFinish: (r: TestAttempt) => void, onCancel: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentQ, setCurrentQ] = useState(0);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = () => {
        let score = 0;
        let correct = 0;
        let incorrect = 0;
        let unattempted = 0;
        
        const detailedResults: QuestionResult[] = [];

        test.questions.forEach(q => {
            const ans = answers[q.id];
            let status: QuestionResult['status'] = 'UNATTEMPTED';

            if (ans === undefined) {
                unattempted++;
            } else if (ans === q.correctOptionIndex) {
                score += 4;
                correct++;
                status = 'CORRECT';
            } else {
                score -= 1;
                incorrect++;
                status = 'INCORRECT';
            }

            detailedResults.push({
                questionId: q.id,
                subjectId: q.subjectId,
                topicId: q.topicId,
                status,
                selectedOptionIndex: ans
            });
        });

        const totalQs = test.questions.length;
        const attempt: TestAttempt = {
            id: Date.now().toString(),
            testId: test.id,
            date: new Date().toISOString(),
            title: test.title,
            score,
            totalMarks: totalQs * 4,
            accuracy: 0, // Legacy field
            accuracy_percent: correct + incorrect > 0 ? Number(((correct / (correct + incorrect)) * 100).toFixed(2)) : 0,
            totalQuestions: totalQs,
            correctCount: correct,
            incorrectCount: incorrect,
            unattemptedCount: unattempted,
            detailedResults
        };
        onFinish(attempt);
    };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const question = test.questions[currentQ];

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] md:h-[600px] mt-0 md:mt-4">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h3 className="font-bold text-sm md:text-base">{test.title}</h3>
                    <p className="text-xs text-slate-400">Question {currentQ + 1} / {test.questions.length}</p>
                </div>
                <div className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : ''}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">{question.subjectId}</span>
                <p className="text-base md:text-lg font-medium text-slate-800 mb-8">{question.text}</p>
                
                <div className="space-y-3">
                    {question.options.map((opt, idx) => (
                        <div 
                            key={idx}
                            onClick={() => setAnswers(prev => ({ ...prev, [question.id]: idx }))}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center ${
                                answers[question.id] === idx 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                    : 'border-slate-100 hover:border-slate-300'
                            }`}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center text-xs shrink-0 ${
                                answers[question.id] === idx ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300'
                            }`}>
                                {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-sm md:text-base">{opt}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-slate-50 flex justify-between items-center sticky bottom-0">
                <Button 
                    variant="secondary" 
                    onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                    disabled={currentQ === 0}
                    size="sm"
                >
                    Previous
                </Button>
                
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onCancel} className="text-red-500 hover:text-red-600 hover:bg-red-50" size="sm">Quit</Button>
                    {currentQ < test.questions.length - 1 ? (
                        <Button onClick={() => setCurrentQ(prev => prev + 1)} size="sm">Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700" size="sm">Submit Test</Button>
                    )}
                </div>
            </div>
        </div>
    );
};

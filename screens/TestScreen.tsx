
import React, { useState, useEffect, useMemo } from 'react';
import { TestAttempt, Test, QuestionResult, User, Question } from '../lib/types';
import { Button } from '../components/Button';
import { Clock, Check, AlertCircle, PlayCircle, RotateCcw, Filter, FileText, X, CheckCircle2, ArrowLeft, Target } from 'lucide-react';

interface Props {
  user?: User;
  addTestAttempt: (attempt: TestAttempt) => void;
  history: TestAttempt[];
  availableTests: Test[];
}

export const TestScreen: React.FC<Props> = ({ user, addTestAttempt, history, availableTests = [] }) => {
  const isParent = user?.role === 'PARENT';
  const [activeTab, setActiveTab] = useState<'practice' | 'history'>('practice');
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [reviewAttempt, setReviewAttempt] = useState<TestAttempt | null>(null);
  
  // Test Taking State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testSubmitted, setTestSubmitted] = useState(false);

  // Filter Toggle
  const [showAllTests, setShowAllTests] = useState(false);

  // Manual Entry State
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualForm, setManualForm] = useState({ title: '', score: '', totalMarks: '300' });

  // Intelligent Default Tab & Role Logic
  useEffect(() => {
      if (isParent) {
          setActiveTab('history');
      } else if (history.length === 0) {
          setActiveTab('practice');
      }
  }, [history.length, isParent]);

  // Timer logic for active test
  useEffect(() => {
    let timer: any;
    if (activeTest && !testSubmitted && timeLeft > 0) {
        timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTest, testSubmitted, timeLeft]);

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
      testId: `manual_${Date.now()}`,
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      unattemptedCount: 0,
      accuracy_percent: accuracyVal
    };
    
    addTestAttempt(attempt);
    setIsManualEntry(false);
    setManualForm({ title: '', score: '', totalMarks: '300' });
  };

  const startTest = (test: Test) => {
      setActiveTest(test);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setTimeLeft(test.durationMinutes * 60);
      setTestSubmitted(false);
  };

  const submitTest = () => {
      if(!activeTest) return;
      
      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;
      const detailedResults: QuestionResult[] = [];

      activeTest.questions.forEach(q => {
          const ans = answers[q.id];
          if(ans === undefined) {
              unattempted++;
              detailedResults.push({
                  questionId: q.id,
                  subjectId: q.subjectId,
                  topicId: q.topicId,
                  status: 'UNATTEMPTED'
              });
          } else if(ans === q.correctOptionIndex) {
              correct++;
              detailedResults.push({
                  questionId: q.id,
                  subjectId: q.subjectId,
                  topicId: q.topicId,
                  status: 'CORRECT',
                  selectedOptionIndex: ans
              });
          } else {
              incorrect++;
              detailedResults.push({
                  questionId: q.id,
                  subjectId: q.subjectId,
                  topicId: q.topicId,
                  status: 'INCORRECT',
                  selectedOptionIndex: ans
              });
          }
      });

      // Scoring: +4 for correct, -1 for incorrect (JEE Pattern)
      const score = (correct * 4) - (incorrect * 1);
      const totalMarks = activeTest.questions.length * 4;
      const accuracy = correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;

      const attempt: TestAttempt = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          title: activeTest.title,
          testId: activeTest.id,
          score,
          totalMarks,
          accuracy, // Keep legacy accuracy
          accuracy_percent: accuracy,
          totalQuestions: activeTest.questions.length,
          correctCount: correct,
          incorrectCount: incorrect,
          unattemptedCount: unattempted,
          detailedResults
      };

      addTestAttempt(attempt);
      setTestSubmitted(true);
  };

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (activeTest) {
      // Test Taking Interface
      return (
          <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in">
              {/* Header */}
              <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50">
                  <div>
                      <h2 className="text-xl font-bold text-slate-800">{activeTest.title}</h2>
                      <p className="text-xs text-slate-500">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</p>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                          <Clock className="w-5 h-5" />
                          {formatTime(timeLeft)}
                      </div>
                      {!testSubmitted ? (
                          <button 
                              onClick={submitTest} 
                              className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                          >
                              Submit Test
                          </button>
                      ) : (
                          <button 
                              onClick={() => setActiveTest(null)} 
                              className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors"
                          >
                              Close
                          </button>
                      )}
                  </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-12">
                  {testSubmitted ? (
                      <div className="max-w-2xl mx-auto text-center space-y-6">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                              <Target className="w-10 h-10 text-green-600" />
                          </div>
                          <h2 className="text-3xl font-bold text-slate-900">Test Submitted!</h2>
                          <p className="text-slate-500">Your results have been saved to History.</p>
                          <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                  <div className="text-2xl font-bold text-slate-800">{history[history.length - 1]?.score}</div>
                                  <div className="text-xs text-slate-500 uppercase font-bold">Score</div>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                  <div className="text-2xl font-bold text-green-600">{history[history.length - 1]?.accuracy}%</div>
                                  <div className="text-xs text-slate-500 uppercase font-bold">Accuracy</div>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                  <div className="text-2xl font-bold text-blue-600">{history[history.length - 1]?.correctCount}</div>
                                  <div className="text-xs text-slate-500 uppercase font-bold">Correct</div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="max-w-3xl mx-auto">
                          <div className="mb-8">
                              <p className="text-lg font-medium text-slate-800 leading-relaxed">
                                  {activeTest.questions[currentQuestionIndex].text}
                              </p>
                          </div>
                          <div className="space-y-3">
                              {activeTest.questions[currentQuestionIndex].options.map((opt, idx) => (
                                  <button
                                      key={idx}
                                      onClick={() => setAnswers({...answers, [activeTest.questions[currentQuestionIndex].id]: idx})}
                                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                          answers[activeTest.questions[currentQuestionIndex].id] === idx 
                                          ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium' 
                                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                      }`}
                                  >
                                      <span className="inline-block w-6 h-6 rounded-full border-2 border-current text-center text-xs leading-5 mr-3 opacity-60">
                                          {String.fromCharCode(65 + idx)}
                                      </span>
                                      {opt}
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}
              </div>

              {/* Footer Nav */}
              {!testSubmitted && (
                  <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-between">
                      <button 
                          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentQuestionIndex === 0}
                          className="px-4 py-2 text-slate-600 font-bold disabled:opacity-50"
                      >
                          Previous
                      </button>
                      
                      <div className="flex gap-1 overflow-x-auto max-w-[50%] no-scrollbar px-2">
                          {activeTest.questions.map((q, idx) => (
                              <button 
                                  key={idx}
                                  onClick={() => setCurrentQuestionIndex(idx)}
                                  className={`w-8 h-8 rounded text-xs font-bold shrink-0 ${
                                      currentQuestionIndex === idx ? 'bg-blue-600 text-white' :
                                      answers[q.id] !== undefined ? 'bg-green-100 text-green-700' :
                                      'bg-white border border-slate-300 text-slate-500'
                                  }`}
                              >
                                  {idx + 1}
                              </button>
                          ))}
                      </div>

                      <button 
                          onClick={() => setCurrentQuestionIndex(prev => Math.min(activeTest.questions.length - 1, prev + 1))}
                          disabled={currentQuestionIndex === activeTest.questions.length - 1}
                          className="px-4 py-2 text-slate-600 font-bold disabled:opacity-50"
                      >
                          Next
                      </button>
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <FileText className="w-8 h-8 text-white" />
                        <h1 className="text-3xl font-bold">Test Center</h1>
                    </div>
                    <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
                        Practice mock tests, track your history, and analyze performance.
                    </p>
                </div>
                
                <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-sm border border-white/20">
                    <button onClick={() => setActiveTab('practice')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'practice' ? 'bg-white text-blue-700 shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
                        <PlayCircle className="w-4 h-4" /> Practice
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-blue-700 shadow-md' : 'text-blue-100 hover:bg-white/10'}`}>
                        <RotateCcw className="w-4 h-4" /> History
                    </button>
                </div>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-white opacity-10"></div>
        </div>

        {activeTab === 'practice' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableTests.map(test => (
                    <div key={test.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${test.examType === 'JEE' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                                <Target className="w-6 h-6" />
                            </div>
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{test.difficulty}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{test.title}</h3>
                        <div className="flex gap-4 text-sm text-slate-500 mb-6">
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {test.durationMinutes} mins</span>
                            <span className="flex items-center"><FileText className="w-4 h-4 mr-1"/> {test.questions.length} Qs</span>
                        </div>
                        <button 
                            onClick={() => startTest(test)}
                            className="w-full py-3 rounded-lg bg-slate-900 text-white font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            Start Test <ArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                    </div>
                ))}
                
                {availableTests.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No mock tests available at the moment.</p>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'history' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Attempt History</h3>
                    <div className="flex gap-2">
                        {!isParent && (
                            <button 
                                onClick={() => setIsManualEntry(true)}
                                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 text-slate-600"
                            >
                                + Manual Entry
                            </button>
                        )}
                    </div>
                </div>

                {/* Manual Entry Form */}
                {isManualEntry && (
                    <div className="p-6 bg-blue-50/50 border-b border-blue-100 animate-in slide-in-from-top-2">
                        <form onSubmit={handleManualSubmit} className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Test Title</label>
                                <input 
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                                    value={manualForm.title} 
                                    onChange={e => setManualForm({...manualForm, title: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Score</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                                    value={manualForm.score} 
                                    onChange={e => setManualForm({...manualForm, score: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm" 
                                    value={manualForm.totalMarks} 
                                    onChange={e => setManualForm({...manualForm, totalMarks: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Save</Button>
                                <Button type="button" variant="ghost" onClick={() => setIsManualEntry(false)}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="divide-y divide-slate-100">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No history available.</div>
                    ) : (
                        history.map(attempt => (
                            <div key={attempt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{attempt.title}</h4>
                                    <div className="flex gap-3 text-xs text-slate-500 mt-1">
                                        <span>{new Date(attempt.date).toLocaleDateString()}</span>
                                        {attempt.difficulty && <span>• {attempt.difficulty}</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-blue-600">
                                        {attempt.score}<span className="text-slate-400 text-sm">/{attempt.totalMarks}</span>
                                    </div>
                                    <div className={`text-xs font-bold ${attempt.accuracy_percent >= 80 ? 'text-green-600' : attempt.accuracy_percent >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                                        {attempt.accuracy_percent}% Accuracy
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

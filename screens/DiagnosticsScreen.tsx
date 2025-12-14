
import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Server, CheckCircle2, AlertTriangle, XCircle, Activity, Globe, Play, Loader2, Terminal, AlertCircle, ChevronDown, List, Shield, LayoutGrid, Clock, Users, Brain, Bot, Lock, FileText, Download, Trash2 } from 'lucide-react';

export const DiagnosticsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'TERMINAL' | 'DB'>('VISUAL');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-12">
        {/* Navigation Tabs */}
        <div className="bg-slate-900 rounded-xl p-2 inline-flex gap-1 border border-slate-700 shadow-xl overflow-x-auto">
            <button 
                onClick={() => setActiveTab('VISUAL')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'VISUAL' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                <Activity className="w-4 h-4" /> System Health
            </button>
            <button 
                onClick={() => setActiveTab('TERMINAL')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'TERMINAL' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                <Terminal className="w-4 h-4" /> Deep Persistence Audit
            </button>
            <button 
                onClick={() => setActiveTab('DB')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'DB' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                <Database className="w-4 h-4" /> DB Status
            </button>
        </div>

        {activeTab === 'VISUAL' && <VisualSystemHealth />}
        {activeTab === 'TERMINAL' && <SystemIntegrityCheck />}
        {activeTab === 'DB' && <BasicDiagnostics />}
    </div>
  );
};

// --- Shared Test Runner Logic ---
const useTestRunner = () => {
    const [suites, setSuites] = useState<any[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const runTest = async (suiteIndex: number, testName: string, action: () => Promise<any>) => {
      const start = performance.now();
      try {
          await action();
          const duration = Math.round(performance.now() - start);
          setSuites(prev => {
              const newSuites = [...prev];
              if (newSuites[suiteIndex]) {
                  newSuites[suiteIndex].tests.push({ name: testName, passed: true, duration });
              }
              return newSuites;
          });
      } catch (e: any) {
          const duration = Math.round(performance.now() - start);
          setSuites(prev => {
              const newSuites = [...prev];
              if (newSuites[suiteIndex]) {
                  newSuites[suiteIndex].tests.push({ name: testName, passed: false, duration, error: e.message });
              }
              return newSuites;
          });
          throw e; // Halt suite on failure for that specific chain
      }
    };

    const fetchAPI = async (url: string, options?: RequestInit) => {
        const headers = { 'Content-Type': 'application/json', ...options?.headers };
        const res = await fetch(url, { ...options, headers });
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            if (!res.ok) throw new Error(json.message || json.error || `HTTP ${res.status}`);
            return json;
        } catch (e) {
            throw new Error(`Invalid JSON or API Error: ${text.substring(0, 100)}...`);
        }
    };

    const verifyField = (context: string, actual: any, expected: any) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${context} Mismatch. Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
        }
    };

    const executeTests = async () => {
        setIsRunning(true);
        // Initialize Suites - Grouped for Rigorous checking
        setSuites([
            { name: "1. Core & Auth Integrity", icon: Server, tests: [] },
            { name: "2. Progress Persistence", icon: RefreshCw, tests: [] },
            { name: "3. Exam Data Integrity", icon: FileText, tests: [] },
            { name: "4. Timetable & Config", icon: Clock, tests: [] },
            { name: "5. Psychometric Report", icon: Brain, tests: [] },
            { name: "6. Cleanup & Purge", icon: Trash2, tests: [] }
        ]);

        const SESSION_ID = `diag_${Date.now()}`;
        let userId = '';
        const topicId = `t_${SESSION_ID}`;
        const attemptId = `att_${SESSION_ID}`;

        try {
            // --- SUITE 1: Core & Auth ---
            await runTest(0, "API Root Reachable", () => fetchAPI('/api/index.php'));
            await runTest(0, "DB Connected", () => fetchAPI('/api/test_db.php'));
            
            await runTest(0, "Register Test User", async () => {
                const res = await fetchAPI('/api/register.php', {
                    method: 'POST', body: JSON.stringify({ name: `Test ${SESSION_ID}`, email: `${SESSION_ID}@test.com`, password: 'pass', role: 'STUDENT', targetExam: 'JEE', targetYear: 2025 })
                });
                userId = res.user.id;
                if (!userId) throw new Error("No ID returned");
            });

            await runTest(0, "Login & Retrieve Profile", async () => {
                const res = await fetchAPI('/api/login.php', { method: 'POST', body: JSON.stringify({ email: `${SESSION_ID}@test.com`, password: 'pass' }) });
                if (res.user.id !== userId) throw new Error("ID mismatch on login");
            });

            // --- SUITE 2: Progress Persistence ---
            const progressPayload = {
                user_id: userId,
                topic_id: topicId,
                status: 'IN_PROGRESS',
                lastRevised: new Date().toISOString(),
                revisionLevel: 2,
                nextRevisionDate: new Date().toISOString(),
                solvedQuestions: ['q1', 'q2', 'q3']
            };

            await runTest(1, "Save Progress (incl. Arrays)", () => fetchAPI('/api/sync_progress.php', { method: 'POST', body: JSON.stringify(progressPayload) }));
            
            await runTest(1, "Verify Progress Fields", async () => {
                const dash = await fetchAPI(`/api/get_dashboard.php?user_id=${userId}`);
                const p = dash.progress.find((x: any) => x.topic_id === topicId);
                if (!p) throw new Error("Progress record not found");
                
                verifyField('Status', p.status, progressPayload.status);
                verifyField('Revision Level', parseInt(p.revision_level), progressPayload.revisionLevel);
                
                // Parse JSON array from DB
                const solved = p.solved_questions_json ? JSON.parse(p.solved_questions_json) : [];
                verifyField('Solved Questions Array', solved, progressPayload.solvedQuestions);
            });

            // --- SUITE 3: Exam Data Integrity ---
            const attemptPayload = {
                user_id: userId,
                id: attemptId,
                testId: 'mock_test_1',
                title: 'Diagnostic Mock',
                score: 100,
                totalMarks: 300,
                accuracy_percent: 33,
                detailedResults: [
                    { questionId: 'q1', status: 'CORRECT', selectedOption: 1 },
                    { questionId: 'q2', status: 'INCORRECT', selectedOption: 2 },
                    { questionId: 'q3', status: 'UNATTEMPTED' }
                ]
            };

            await runTest(2, "Save Complex Test Attempt", () => fetchAPI('/api/save_attempt.php', { method: 'POST', body: JSON.stringify(attemptPayload) }));

            await runTest(2, "Verify Deep JSON Data", async () => {
                const dash = await fetchAPI(`/api/get_dashboard.php?user_id=${userId}`);
                const att = dash.attempts.find((x: any) => x.id === attemptId);
                if (!att) throw new Error("Attempt record not found");

                verifyField('Score', parseInt(att.score), attemptPayload.score);
                // detailedResults is already decoded in get_dashboard.php
                verifyField('Detailed Results JSON', att.detailedResults, attemptPayload.detailedResults);
            });

            // --- SUITE 4: Timetable & Config ---
            const timetablePayload = {
                user_id: userId,
                config: { wakeTime: '06:00', bedTime: '22:00' },
                slots: [{ time: '08:00', label: 'Maths' }, { time: '10:00', label: 'Physics' }]
            };

            await runTest(3, "Save Timetable Config", () => fetchAPI('/api/save_timetable.php', { method: 'POST', body: JSON.stringify(timetablePayload) }));

            await runTest(3, "Verify Config & Slots", async () => {
                const dash = await fetchAPI(`/api/get_dashboard.php?user_id=${userId}`);
                if (!dash.timetable) throw new Error("Timetable table empty");
                
                verifyField('Config JSON', dash.timetable.config, timetablePayload.config);
                verifyField('Slots JSON', dash.timetable.slots, timetablePayload.slots);
            });

            // --- SUITE 5: Psychometric Report ---
            const psychPayload = {
                user_id: userId,
                report: {
                    date: new Date().toISOString(),
                    scores: { "Stress": 80, "Focus": 40 },
                    overallScore: 60,
                    profileType: "Balanced",
                    insights: [{ text: "Good job" }],
                    actionPlan: ["Sleep more"]
                }
            };

            await runTest(4, "Save Psychometric Report", () => fetchAPI('/api/save_psychometric.php', { method: 'POST', body: JSON.stringify(psychPayload) }));

            await runTest(4, "Verify Full Report Structure", async () => {
                const res = await fetchAPI(`/api/get_psychometric.php?user_id=${userId}`);
                if (!res.report) throw new Error("Report not retrieved");
                verifyField('Report Integrity', res.report, psychPayload.report);
            });

            // --- SUITE 6: Cleanup ---
            await runTest(5, "Purge Test User & Data", async () => {
                // Cascading delete usually handles this, but manual clean for safety
                await fetchAPI(`/api/manage_users.php?id=${userId}`, { method: 'DELETE' });
                
                // Verify user is gone
                const res = await fetchAPI('/api/login.php', { method: 'POST', body: JSON.stringify({ email: `${SESSION_ID}@test.com`, password: 'pass' }) });
                if (res.status === 'success') throw new Error("Delete failed - User still exists");
            });

        } catch (e: any) { 
            console.error(e); 
            // Don't stop showing results, just mark failed
        }
        setIsRunning(false);
    };

    return { suites, isRunning, executeTests };
};

// --- VISUAL TAB ---
const VisualSystemHealth = () => {
    const { suites, isRunning, executeTests } = useTestRunner();
    
    const totalTests = suites.reduce((acc, s) => acc + s.tests.length, 0);
    const passedTests = suites.reduce((acc, s) => acc + s.tests.filter((t: any) => t.passed).length, 0);
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center shadow-lg gap-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Activity className="w-6 h-6 text-green-400" /> System Health Check
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm max-w-xl">
                        Validate DB Schema (LONGTEXT support), API endpoints, and field-level data integrity.
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className={`block text-3xl font-black ${passRate >= 100 ? 'text-green-400' : 'text-orange-400'}`}>{passRate}%</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pass Rate</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={executeTests}
                            disabled={isRunning}
                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center transition-all disabled:opacity-50"
                        >
                            {isRunning ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Play className="w-5 h-5 mr-2"/>}
                            {isRunning ? 'Auditing...' : 'Start Audit'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suites.map((suite, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: `${idx * 50}ms`}}>
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <suite.icon className="w-4 h-4 text-slate-500" />
                                <h3 className="font-bold text-slate-700 text-xs truncate max-w-[150px]">{suite.name}</h3>
                            </div>
                            {suite.tests.length > 0 && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${suite.tests.every((t:any) => t.passed) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    {suite.tests.every((t:any) => t.passed) ? 'PASS' : 'FAIL'}
                                </span>
                            )}
                        </div>
                        <div className="divide-y divide-slate-50 max-h-40 overflow-y-auto custom-scrollbar">
                            {suite.tests.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-400 italic">Waiting...</div>
                            ) : (
                                suite.tests.map((test: any, tIdx: number) => (
                                    <div key={tIdx} className="p-2 px-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {test.passed ? <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" /> : <XCircle className="w-3 h-3 text-red-500 shrink-0" />}
                                            <span className={`text-[11px] truncate ${test.passed ? 'text-slate-600' : 'text-red-600 font-medium'}`}>{test.name}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400">{test.duration}ms</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- TERMINAL TAB (Detailed) ---
const SystemIntegrityCheck = () => {
  const { suites, isRunning, executeTests } = useTestRunner();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
      <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden font-sans">
         <div className="p-6 border-b border-slate-800 flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                   <Terminal className="w-8 h-8 text-green-400" /> Integrity Audit Log
                </h2>
             </div>
             <button 
                onClick={executeTests}
                disabled={isRunning}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-2 rounded-lg font-bold flex items-center transition-all disabled:opacity-50"
             >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Play className="w-4 h-4 mr-2"/>} 
                Execute
             </button>
         </div>

         <div className="p-6 space-y-4 font-mono text-sm h-[600px] overflow-y-auto custom-scrollbar">
             {suites.map((suite, idx) => (
                 <div key={idx} className="border border-slate-800 rounded-lg overflow-hidden">
                     <div className="bg-slate-800/50 px-4 py-2 flex justify-between items-center">
                         <span className="text-slate-300 font-bold">{suite.name}</span>
                     </div>
                     <div className="bg-black/20 p-2 space-y-1">
                         {suite.tests.map((test: any, tIdx: number) => (
                             <div key={tIdx} className="flex justify-between px-2 py-1 hover:bg-white/5 rounded cursor-pointer" onClick={() => setExpanded(test.error ? `${idx}-${tIdx}` : null)}>
                                 <span className={test.passed ? 'text-green-400' : 'text-red-400'}>
                                     {test.passed ? '✔' : '✖'} {test.name}
                                 </span>
                                 <span className="text-slate-500">{test.duration}ms</span>
                                 {expanded === `${idx}-${tIdx}` && test.error && (
                                     <div className="w-full mt-2 text-red-300 bg-red-900/20 p-2 rounded block whitespace-pre-wrap break-all">
                                         {test.error}
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 </div>
             ))}
         </div>
      </div>
  );
};

// --- DB TAB ---
const BasicDiagnostics = () => {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  const runLiveDbCheck = async () => {
      setLoadingDb(true);
      setDbStatus(null);
      try {
          const res = await fetch('/api/test_db.php');
          if(res.ok) {
              const data = await res.json();
              setDbStatus(data);
          } else {
              setDbStatus({ status: 'ERROR', message: `HTTP Error: ${res.status} ${res.statusText}` });
          }
      } catch(e: any) {
          setDbStatus({ status: 'ERROR', message: e.message || 'Connection failed' });
      } finally {
          setLoadingDb(false);
      }
  };

  return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                      <Database className="w-6 h-6" /> Database Inspector
                  </h3>
                  <p className="text-purple-100 text-sm mt-1">Direct query to `test_db.php` to verify table schemas.</p>
              </div>
              <button 
                  onClick={runLiveDbCheck}
                  disabled={loadingDb}
                  className="bg-white text-purple-600 px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-purple-50 transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {loadingDb ? <RefreshCw className="w-5 h-5 animate-spin mr-2"/> : <Activity className="w-5 h-5 mr-2" />}
                  Check DB
              </button>
          </div>

          <div className="p-6 bg-slate-50 min-h-[160px]">
              {dbStatus && (
                  <div className="animate-in fade-in">
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200">
                          <div className={`p-3 rounded-full ${dbStatus.status === 'CONNECTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {dbStatus.status === 'CONNECTED' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                          </div>
                          <div className="flex-1">
                              <h4 className={`text-lg font-bold ${dbStatus.status === 'CONNECTED' ? 'text-slate-800' : 'text-red-700'}`}>
                                  {dbStatus.status === 'CONNECTED' ? 'Database Connected' : 'Connection Failed'}
                              </h4>
                              {dbStatus.message && <p className="text-sm text-red-600 mt-2 font-bold">{dbStatus.message}</p>}
                          </div>
                      </div>

                      {dbStatus.tables && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                              {dbStatus.tables.map((t: any) => (
                                  <div key={t.name} className="p-3 rounded-lg border bg-white border-slate-200 flex justify-between items-center text-sm">
                                      <span className="font-bold text-slate-700">{t.name}</span>
                                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">{t.rows} Rows</span>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Server, Table, CheckCircle2, AlertTriangle, XCircle, Activity, Globe, Play, Loader2, Terminal, AlertCircle, FileText, ChevronRight, ChevronDown } from 'lucide-react';

// Tables required for v12.11
const REQUIRED_SCHEMA = [
    'users', 'topic_progress', 'tests', 'questions', 'test_attempts',
    'attempt_details', 'flashcards', 'memory_hacks', 'blog_posts',
    'topics', 'videos', 'notifications', 'contact_messages', 'goals',
    'mistakes', 'backlogs', 'timetable_configs', 'system_settings', 'chapter_notes',
    'psychometric_results'
];

interface TestResult {
    name: string;
    passed: boolean;
    duration: number;
    error?: string;
    details?: any;
}

interface TestSuite {
    name: string;
    description: string;
    tests: TestResult[];
    status: 'PENDING' | 'RUNNING' | 'COMPLETED';
}

export const DiagnosticsScreen: React.FC = () => {
  // Live DB State
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  
  // Test Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [expandedError, setExpandedError] = useState<string | null>(null);

  // Generate Unique Test IDs to avoid collision with real data
  const SESSION_ID = `diag_${Date.now()}`;
  const TEST_USER = {
      name: `Test User ${SESSION_ID}`,
      email: `test_${SESSION_ID}@diag.local`,
      password: 'TestPassword123'
  };

  useEffect(() => {
      // Initialize Suites Structure
      setSuites([
          { name: "0. Infrastructure", description: "API & DB Connectivity", tests: [], status: 'PENDING' },
          { name: "1. Authentication", description: "Register, Login, Profile", tests: [], status: 'PENDING' },
          { name: "2. Content Engine", description: "Flashcards, Hacks, Blogs", tests: [], status: 'PENDING' },
          { name: "3. Academic Core", description: "Syllabus, Tests, Progress", tests: [], status: 'PENDING' },
          { name: "4. Productivity Tools", description: "Goals, Backlogs, Mistakes", tests: [], status: 'PENDING' },
          { name: "5. System & AI", description: "Settings, Analytics, AI", tests: [], status: 'PENDING' },
          { name: "6. Cleanup", description: "Garbage Collection", tests: [], status: 'PENDING' }
      ]);
  }, []);

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

  // --- Test Runner Utility ---
  const runTest = async (suiteIndex: number, testName: string, action: () => Promise<any>) => {
      const start = performance.now();
      try {
          const result = await action();
          const duration = Math.round(performance.now() - start);
          setSuites(prev => {
              const newSuites = [...prev];
              newSuites[suiteIndex].tests.push({ name: testName, passed: true, duration, details: result });
              return newSuites;
          });
          return result;
      } catch (e: any) {
          const duration = Math.round(performance.now() - start);
          setSuites(prev => {
              const newSuites = [...prev];
              newSuites[suiteIndex].tests.push({ name: testName, passed: false, duration, error: e.message });
              return newSuites;
          });
          throw e; // Re-throw to stop dependent tests if needed
      }
  };

  const fetchAPI = async (url: string, options?: RequestInit) => {
      const res = await fetch(url, options);
      const text = await res.text();
      try {
          const json = JSON.parse(text);
          if (!res.ok) throw new Error(json.message || json.error || `HTTP ${res.status}`);
          return json;
      } catch (e) {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
          return text; // Return text if valid HTML/String
      }
  };

  const executeDiagnostics = async () => {
      setIsRunning(true);
      
      // Reset Tests
      setSuites(prev => prev.map(s => ({ ...s, tests: [], status: 'PENDING' })));
      
      let userId = '';
      let topicId = `${SESSION_ID}_topic`;
      let flashcardId = 0;
      let goalId = `${SESSION_ID}_goal`;
      let backlogId = `${SESSION_ID}_bl`;
      let mistakeId = `${SESSION_ID}_mst`;

      try {
          // --- SUITE 0: INFRASTRUCTURE ---
          setSuites(p => { p[0].status = 'RUNNING'; return [...p]; });
          
          await runTest(0, "Ping API Root", async () => {
              const res = await fetchAPI('/api/index.php');
              if (res.status !== 'active') throw new Error("API status not active");
              return res;
          });

          await runTest(0, "Check DB Config", async () => {
              const res = await fetchAPI('/api/test_db.php');
              if (res.status !== 'CONNECTED') throw new Error(res.message);
              return res;
          });
          
          setSuites(p => { p[0].status = 'COMPLETED'; return [...p]; });


          // --- SUITE 1: AUTHENTICATION ---
          setSuites(p => { p[1].status = 'RUNNING'; return [...p]; });

          await runTest(1, "Register Test User", async () => {
              const res = await fetchAPI('/api/register.php', {
                  method: 'POST',
                  body: JSON.stringify({ ...TEST_USER, role: 'STUDENT', targetExam: 'JEE', targetYear: 2025 })
              });
              if (!res.user?.id) throw new Error("No User ID returned");
              userId = res.user.id;
              return res;
          });

          await runTest(1, "Login Test User", async () => {
              const res = await fetchAPI('/api/login.php', {
                  method: 'POST',
                  body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
              });
              if (res.user.email !== TEST_USER.email) throw new Error("Email mismatch");
              return res;
          });

          setSuites(p => { p[1].status = 'COMPLETED'; return [...p]; });


          // --- SUITE 2: CONTENT ENGINE ---
          setSuites(p => { p[2].status = 'RUNNING'; return [...p]; });

          await runTest(2, "Create Flashcard", async () => {
              const res = await fetchAPI('/api/manage_content.php?type=flashcard', {
                  method: 'POST',
                  body: JSON.stringify({ type: 'flashcard', front: `Q_${SESSION_ID}`, back: `A_${SESSION_ID}` })
              });
              // API doesn't return ID on create, so we verify by listing
              return res;
          });

          await runTest(2, "Verify Flashcard Exists", async () => {
              const res = await fetchAPI('/api/manage_content.php?type=flashcards');
              const found = res.find((f: any) => f.front === `Q_${SESSION_ID}`);
              if (!found) throw new Error("Created flashcard not found in DB");
              flashcardId = found.id;
              return found;
          });

          await runTest(2, "Delete Flashcard", async () => {
              if(!flashcardId) throw new Error("No ID to delete");
              return await fetchAPI(`/api/manage_content.php?type=flashcard&id=${flashcardId}`, { method: 'DELETE' });
          });

          setSuites(p => { p[2].status = 'COMPLETED'; return [...p]; });


          // --- SUITE 3: ACADEMIC CORE ---
          setSuites(p => { p[3].status = 'RUNNING'; return [...p]; });

          await runTest(3, "Create Custom Topic", async () => {
              return await fetchAPI('/api/manage_syllabus.php', {
                  method: 'POST',
                  body: JSON.stringify({ id: topicId, name: 'Diag Topic', chapter: 'Diag Chapter', subject: 'Physics' })
              });
          });

          await runTest(3, "Sync Progress", async () => {
              return await fetchAPI('/api/sync_progress.php', {
                  method: 'POST',
                  body: JSON.stringify({ user_id: userId, topic_id: topicId, status: 'IN_PROGRESS', revisionLevel: 1 })
              });
          });

          await runTest(3, "Verify Dashboard Data", async () => {
              const res = await fetchAPI(`/api/get_dashboard.php?user_id=${userId}`);
              const prog = res.progress.find((p: any) => p.topic_id === topicId);
              if (!prog || prog.status !== 'IN_PROGRESS') throw new Error("Progress sync failed");
              return prog;
          });

          setSuites(p => { p[3].status = 'COMPLETED'; return [...p]; });


          // --- SUITE 4: PRODUCTIVITY TOOLS ---
          setSuites(p => { p[4].status = 'RUNNING'; return [...p]; });

          // Goals
          await runTest(4, "Create Goal", async () => {
              return await fetchAPI('/api/manage_goals.php', {
                  method: 'POST',
                  body: JSON.stringify({ id: goalId, user_id: userId, text: "Test Goal" })
              });
          });

          await runTest(4, "Toggle Goal", async () => {
              return await fetchAPI('/api/manage_goals.php', {
                  method: 'PUT',
                  body: JSON.stringify({ id: goalId, completed: true })
              });
          });

          // Backlogs
          await runTest(4, "Create Backlog", async () => {
              return await fetchAPI('/api/manage_backlogs.php', {
                  method: 'POST',
                  body: JSON.stringify({ id: backlogId, user_id: userId, title: "Test Backlog", subject: 'Maths', priority: 'High', status: 'PENDING', deadline: '2025-01-01' })
              });
          });

          // Mistakes
          await runTest(4, "Log Mistake", async () => {
              return await fetchAPI('/api/manage_mistakes.php', {
                  method: 'POST',
                  body: JSON.stringify({ id: mistakeId, user_id: userId, question: "Why?", subject: "Physics", note: "Because" })
              });
          });

          // Verify All
          await runTest(4, "Verify All Productivity Data", async () => {
              const res = await fetchAPI(`/api/get_dashboard.php?user_id=${userId}`);
              const g = res.goals.find((x: any) => x.id === goalId);
              const b = res.backlogs.find((x: any) => x.id === backlogId);
              const m = res.mistakes.find((x: any) => x.id === mistakeId);
              
              if(!g) throw new Error("Goal missing");
              if(g.completed != 1) throw new Error("Goal toggle failed");
              if(!b) throw new Error("Backlog missing");
              if(!m) throw new Error("Mistake missing");
              return { g, b, m };
          });

          setSuites(p => { p[4].status = 'COMPLETED'; return [...p]; });


          // --- SUITE 5: SYSTEM & AI ---
          setSuites(p => { p[5].status = 'RUNNING'; return [...p]; });

          await runTest(5, "Fetch System Settings", async () => {
              const res = await fetchAPI('/api/manage_settings.php?key=total_visits');
              return res;
          });

          await runTest(5, "Track Analytics Visit", async () => {
              return await fetchAPI('/api/track_visit.php');
          });

          setSuites(p => { p[5].status = 'COMPLETED'; return [...p]; });


          // --- SUITE 6: CLEANUP ---
          setSuites(p => { p[6].status = 'RUNNING'; return [...p]; });

          await runTest(6, "Delete Test Topic", async () => {
              return await fetchAPI(`/api/manage_syllabus.php?id=${topicId}`, { method: 'DELETE' });
          });

          await runTest(6, "Delete Test Goal", async () => {
              return await fetchAPI(`/api/manage_goals.php?id=${goalId}`, { method: 'DELETE' });
          });

          await runTest(6, "Delete Test Backlog", async () => {
              return await fetchAPI(`/api/manage_backlogs.php?id=${backlogId}`, { method: 'DELETE' });
          });

          await runTest(6, "Delete Test Mistake", async () => {
              return await fetchAPI(`/api/manage_mistakes.php?id=${mistakeId}`, { method: 'DELETE' });
          });

          await runTest(6, "Delete Test User (CASCADE)", async () => {
              return await fetchAPI(`/api/manage_users.php?id=${userId}`, { method: 'DELETE' });
          });

          setSuites(p => { p[6].status = 'COMPLETED'; return [...p]; });

      } catch (e) {
          console.error("Diagnostic Sequence Halted", e);
      } finally {
          setIsRunning(false);
      }
  };

  return (
    <div className="space-y-8 pb-12 font-mono">
      
      {/* Live Database Inspector Section */}
      <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden font-sans">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
              <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                      <Database className="w-6 h-6" /> Live Database Inspector
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">Scan database tables and verify content availability in real-time.</p>
              </div>
              <button 
                  onClick={runLiveDbCheck}
                  disabled={loadingDb}
                  className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {loadingDb ? <RefreshCw className="w-5 h-5 animate-spin mr-2"/> : <Activity className="w-5 h-5 mr-2" />}
                  {loadingDb ? 'Running Diagnostics...' : 'Start DB Check'}
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
                                  {dbStatus.status === 'CONNECTED' ? 'Database Connected Successfully' : 'Connection Failed'}
                              </h4>
                              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-slate-600 font-mono">
                                  {dbStatus.db_host && <p className="flex items-center"><Globe className="w-3 h-3 mr-1 text-slate-400" /> Host: <strong className="ml-1 text-slate-800">{dbStatus.db_host}</strong></p>}
                                  {dbStatus.db_name && <p className="flex items-center"><Database className="w-3 h-3 mr-1 text-slate-400" /> Database: <strong className="ml-1 text-slate-800">{dbStatus.db_name}</strong></p>}
                                  {dbStatus.server_info && <p className="flex items-center"><Server className="w-3 h-3 mr-1 text-slate-400" /> Ver: {dbStatus.server_info}</p>}
                              </div>
                              {dbStatus.message && <p className="text-sm text-red-600 mt-2 font-bold">{dbStatus.message}</p>}
                          </div>
                      </div>

                      {dbStatus.tables && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                              {REQUIRED_SCHEMA.map((tableName) => {
                                  const existing = dbStatus.tables.find((t: any) => t.name === tableName);
                                  return (
                                      <div key={tableName} className={`p-3 rounded-lg border flex justify-between items-center text-sm ${existing ? 'bg-white border-slate-200' : 'bg-red-50 border-red-200'}`}>
                                          <span className={`font-bold ${existing ? 'text-slate-700' : 'text-red-700'}`}>{tableName}</span>
                                          {existing ? (
                                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">{existing.rows} Rows</span>
                                          ) : (
                                              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> MISSING</span>
                                          )}
                                      </div>
                                  );
                              })}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>

      {/* Main Execution Terminal */}
      <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden font-sans">
         <div className="p-6 border-b border-slate-800 flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                   <Terminal className="w-8 h-8 text-green-400" /> System Integrity Check
                </h2>
                <p className="text-slate-400 mt-1 max-w-xl text-sm">
                   Executes strict CRUD operations against the live API. No mocks. 
                   <span className="text-orange-400 ml-1">Warning: Creates and deletes test data.</span>
                </p>
             </div>
             
             <button 
                onClick={executeDiagnostics}
                disabled={isRunning}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isRunning ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <Play className="w-5 h-5 mr-2"/>} 
                {isRunning ? 'Running Tests...' : 'Run Full Diagnostic'}
             </button>
         </div>

         <div className="p-6 space-y-6">
             {suites.map((suite, idx) => (
                 <div key={idx} className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                     suite.status === 'PENDING' ? 'border-slate-800 bg-slate-800/30' : 
                     suite.status === 'RUNNING' ? 'border-blue-500 bg-blue-900/10 ring-1 ring-blue-500' :
                     suite.tests.some(t => !t.passed) ? 'border-red-500/50 bg-red-900/10' : 'border-green-500/30 bg-green-900/10'
                 }`}>
                     <div className="px-4 py-3 bg-slate-800/50 flex justify-between items-center">
                         <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${
                                 suite.status === 'PENDING' ? 'bg-slate-600' :
                                 suite.status === 'RUNNING' ? 'bg-blue-400 animate-pulse' :
                                 suite.tests.some(t => !t.passed) ? 'bg-red-500' : 'bg-green-500'
                             }`}></div>
                             <h3 className="font-bold text-slate-200">{suite.name}</h3>
                             <span className="text-xs text-slate-500 border-l border-slate-700 pl-3">{suite.description}</span>
                         </div>
                         <div className="text-xs font-mono text-slate-400">
                             {suite.status === 'COMPLETED' ? (
                                 <span className={suite.tests.some(t => !t.passed) ? 'text-red-400' : 'text-green-400'}>
                                     {suite.tests.filter(t => t.passed).length}/{suite.tests.length} PASS
                                 </span>
                             ) : suite.status}
                         </div>
                     </div>
                     
                     {suite.tests.length > 0 && (
                         <div className="divide-y divide-slate-800/50">
                             {suite.tests.map((test, tIdx) => (
                                 <div key={tIdx} className="px-4 py-2 flex flex-col hover:bg-white/5 transition-colors">
                                     <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedError(expandedError === `${idx}-${tIdx}` ? null : `${idx}-${tIdx}`)}>
                                         <div className="flex items-center gap-3">
                                             {test.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                             <span className={`text-sm ${test.passed ? 'text-slate-300' : 'text-red-300 font-bold'}`}>{test.name}</span>
                                         </div>
                                         <div className="flex items-center gap-4">
                                             <span className="text-xs font-mono text-slate-500">{test.duration}ms</span>
                                             {(test.error || test.details) && (
                                                 <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expandedError === `${idx}-${tIdx}` ? 'rotate-180' : ''}`} />
                                             )}
                                         </div>
                                     </div>
                                     
                                     {expandedError === `${idx}-${tIdx}` && (
                                         <div className="mt-2 p-3 bg-black/50 rounded-lg text-xs font-mono overflow-x-auto border border-slate-700">
                                             {test.error && (
                                                 <div className="text-red-400 mb-2">
                                                     <strong>ERROR:</strong> {test.error}
                                                 </div>
                                             )}
                                             {test.details && (
                                                 <div className="text-green-300">
                                                     <strong>RESPONSE PAYLOAD:</strong>
                                                     <pre className="mt-1 opacity-80">{JSON.stringify(test.details, null, 2)}</pre>
                                                 </div>
                                             )}
                                         </div>
                                     )}
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
};

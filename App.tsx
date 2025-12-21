
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Navigation, MobileNavigation } from './components/Navigation';
import { AITutorChat } from './components/AITutorChat';
import { SyncStatusBadge, SyncStatus } from './components/SyncStatusBadge';
import { apiService } from './services/apiService';
import { Database, AlertTriangle, RefreshCw, UploadCloud, ArrowRight, ShieldAlert } from 'lucide-react';
import { 
  User, UserProgress, TestAttempt, Goal, BacklogItem, 
  Flashcard, MemoryHack, BlogPost, Screen, Test, Question, 
  TimetableConfig, PsychometricReport 
} from './lib/types';
import { SYLLABUS_DATA } from './lib/syllabusData';
import { MOCK_TESTS_DATA, generateInitialQuestionBank } from './lib/mockTestsData';

// --- Lazy Screens ---
const AuthScreen = lazy(() => import('./screens/AuthScreen').then(m => ({ default: m.AuthScreen })));
const DashboardScreen = lazy(() => import('./screens/DashboardScreen').then(m => ({ default: m.DashboardScreen })));
const AdminDashboardScreen = lazy(() => import('./screens/AdminDashboardScreen').then(m => ({ default: m.AdminDashboardScreen })));
const SyllabusScreen = lazy(() => import('./screens/SyllabusScreen').then(m => ({ default: m.SyllabusScreen })));
const RevisionScreen = lazy(() => import('./screens/RevisionScreen').then(m => ({ default: m.RevisionScreen })));
const TimetableScreen = lazy(() => import('./screens/TimetableScreen').then(m => ({ default: m.TimetableScreen })));
const TestScreen = lazy(() => import('./screens/TestScreen').then(m => ({ default: m.TestScreen })));
const FocusScreen = lazy(() => import('./screens/FocusScreen').then(m => ({ default: m.FocusScreen })));
const FlashcardScreen = lazy(() => import('./screens/FlashcardScreen').then(m => ({ default: m.FlashcardScreen })));
const MistakesScreen = lazy(() => import('./screens/MistakesScreen').then(m => ({ default: m.MistakesScreen })));
const AnalyticsScreen = lazy(() => import('./screens/AnalyticsScreen').then(m => ({ default: m.AnalyticsScreen })));
const WellnessScreen = lazy(() => import('./screens/WellnessScreen').then(m => ({ default: m.WellnessScreen })));
const BacklogScreen = lazy(() => import('./screens/BacklogScreen').then(m => ({ default: m.BacklogScreen })));
const HacksScreen = lazy(() => import('./screens/HacksScreen').then(m => ({ default: m.HacksScreen })));
const PsychometricScreen = lazy(() => import('./screens/PsychometricScreen').then(m => ({ default: m.PsychometricScreen })));
const AdminUserManagementScreen = lazy(() => import('./screens/AdminUserManagementScreen').then(m => ({ default: m.AdminUserManagementScreen })));
const AdminInboxScreen = lazy(() => import('./screens/AdminInboxScreen').then(m => ({ default: m.AdminInboxScreen })));
const AdminSyllabusScreen = lazy(() => import('./screens/AdminSyllabusScreen').then(m => ({ default: m.AdminSyllabusScreen })));
const AdminTestManagerScreen = lazy(() => import('./screens/AdminTestManagerScreen').then(m => ({ default: m.AdminTestManagerScreen })));
const AdminSystemScreen = lazy(() => import('./screens/AdminSystemScreen').then(m => ({ default: m.AdminSystemScreen })));
const DeploymentScreen = lazy(() => import('./screens/DeploymentScreen').then(m => ({ default: m.DeploymentScreen })));
const DiagnosticsScreen = lazy(() => import('./screens/DiagnosticsScreen').then(m => ({ default: m.DiagnosticsScreen })));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen').then(m => ({ default: m.ProfileScreen })));
const ContentManagerScreen = lazy(() => import('./screens/ContentManagerScreen').then(m => ({ default: m.ContentManagerScreen })));
const AdminBlogScreen = lazy(() => import('./screens/AdminBlogScreen').then(m => ({ default: m.AdminBlogScreen })));
const ParentFamilyScreen = lazy(() => import('./screens/ParentFamilyScreen').then(m => ({ default: m.ParentFamilyScreen })));

const LoadingView = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
    <p className="text-xs font-bold uppercase tracking-widest italic">Querying Server Node v19.0...</p>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const isDemo = user?.id.startsWith('demo_') || false;

  const [currentScreen, setScreen] = useState<Screen>(() => {
    const saved = localStorage.getItem('last_screen');
    if (saved) return saved as Screen;
    return user?.role.includes('ADMIN') ? 'overview' : 'dashboard';
  });

  const [globalSyncStatus, setGlobalSyncStatus] = useState<SyncStatus>('IDLE');
  const [syncError, setSyncError] = useState<string | null>(null);

  // App Data State (No local mirroring for real users)
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>([]);
  const [timetable, setTimetable] = useState<{config?: TimetableConfig, slots?: any[]}>({});
  const [psychReport, setPsychReport] = useState<PsychometricReport | null>(null);
  const [questionBank] = useState<Question[]>(() => generateInitialQuestionBank());
  const [tests] = useState<Test[]>(MOCK_TESTS_DATA);

  const loadData = useCallback(async (userId: string) => {
    setSyncError(null);
    
    // --- VIRTUAL SANDBOX BYPASS ---
    if (userId.startsWith('demo_')) {
        setGlobalSyncStatus('SYNCED');
        // Load some demo attempts so charts aren't empty
        setTestAttempts([]);
        setGoals([]);
        return;
    }

    setGlobalSyncStatus('SYNCING');
    try {
        const data = await apiService.request(`/api/get_dashboard.php?user_id=${userId}`);
        
        if (data.progress) {
            const pm: Record<string, UserProgress> = {};
            data.progress.forEach((p: any) => pm[p.topicId || p.topic_id] = {
                topicId: p.topicId || p.topic_id,
                status: p.status,
                lastRevised: p.lastRevised || p.last_revised,
                revisionLevel: parseInt(p.revisionLevel || p.revision_level || 0),
                nextRevisionDate: p.nextRevisionDate || p.next_revision_date,
                solvedQuestions: p.solvedQuestions || (p.solved_questions_json ? JSON.parse(p.solved_questions_json) : [])
            });
            setProgress(pm);
        }

        setTestAttempts(data.attempts || []);
        setGoals(data.goals || []);
        setBacklogs(data.backlogs || []);
        setTimetable(data.timetable || {});
        setPsychReport(data.psychometric || null);
        
        setGlobalSyncStatus('SYNCED');
    } catch (e: any) { 
        console.error("Critical Sync Failure:", e.message);
        setSyncError(e.message);
        setGlobalSyncStatus('ERROR'); 
    }
  }, []);

  useEffect(() => { if (user) loadData(user.id); }, [user?.id, loadData]);
  useEffect(() => { localStorage.setItem('last_screen', currentScreen); }, [currentScreen]);

  // --- PERSISTENCE GUARDS FOR DEMO MODE ---

  const checkDemoRestriction = () => {
    if (isDemo) {
        alert("Action Blocked: This is a Demo environment. Data changes are not permitted in this mode. Please register a real account to save progress.");
        return true;
    }
    return false;
  };

  const updateProgress = async (topicId: string, updates: Partial<UserProgress>) => {
    if (checkDemoRestriction()) return;
    setGlobalSyncStatus('SYNCING');
    const existing = progress[topicId] || { topicId, status: 'NOT_STARTED', lastRevised: null, revisionLevel: 0, nextRevisionDate: null, solvedQuestions: [] };
    const updated = { ...existing, ...updates };
    try {
        await apiService.request('/api/sync_progress.php', { method: 'POST', body: JSON.stringify({ userId: user?.id, ...updated }) });
        setProgress(prev => ({ ...prev, [topicId]: updated }));
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const addTestAttempt = async (attempt: TestAttempt) => {
    if (checkDemoRestriction()) return;
    setGlobalSyncStatus('SYNCING');
    try {
        await apiService.request('/api/save_attempt.php', { method: 'POST', body: JSON.stringify({ ...attempt, userId: user?.id }) });
        setTestAttempts(prev => [attempt, ...prev]);
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const saveTimetable = async (config: TimetableConfig, slots: any[]) => {
    if (checkDemoRestriction()) return;
    setGlobalSyncStatus('SYNCING');
    try {
        await apiService.request('/api/save_timetable.php', { method: 'POST', body: JSON.stringify({ userId: user?.id, config, slots }) });
        setTimetable({ config, slots });
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const addGoal = async (text: string) => {
    if (checkDemoRestriction()) return;
    if (!user) return;
    setGlobalSyncStatus('SYNCING');
    const newGoal: Goal = { id: `goal_${Date.now()}`, text, completed: false };
    try {
        await apiService.request('/api/manage_goals.php', { method: 'POST', body: JSON.stringify({ userId: user.id, ...newGoal }) });
        setGoals(prev => [...prev, newGoal]);
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const toggleGoal = async (id: string) => {
    if (checkDemoRestriction()) return;
    if (!user) return;
    setGlobalSyncStatus('SYNCING');
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const updated = { ...goal, completed: !goal.completed };
    try {
        await apiService.request('/api/manage_goals.php', { method: 'PUT', body: JSON.stringify({ userId: user.id, ...updated }) });
        setGoals(prev => prev.map(g => g.id === id ? updated : g));
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const renderContent = () => {
    const role = user?.role || 'STUDENT';
    const isAdmin = role.includes('ADMIN');
    
    if (isAdmin) {
        switch(currentScreen) {
            case 'overview': return <AdminDashboardScreen user={user!} onNavigate={setScreen} />;
            case 'users': return <AdminUserManagementScreen />;
            case 'inbox': return <AdminInboxScreen />;
            case 'deployment': return <DeploymentScreen />;
            case 'system': return <AdminSystemScreen />;
            case 'diagnostics': return <DiagnosticsScreen />;
            case 'syllabus_admin': return <AdminSyllabusScreen syllabus={SYLLABUS_DATA} onAddTopic={()=>{}} onDeleteTopic={()=>{}} />;
            case 'tests_admin': return <AdminTestManagerScreen questionBank={questionBank} tests={tests} onAddQuestion={()=>{}} onCreateTest={()=>{}} onDeleteQuestion={()=>{}} onDeleteTest={()=>{}} syllabus={SYLLABUS_DATA} />;
            case 'content': return <ContentManagerScreen flashcards={[]} hacks={[]} blogs={[]} onAddFlashcard={()=>{}} onAddHack={()=>{}} onAddBlog={()=>{}} onDelete={()=>{}} />;
            case 'profile': return <ProfileScreen user={user!} onAcceptRequest={()=>{}} />;
            default: return <AdminDashboardScreen user={user!} onNavigate={setScreen} />;
        }
    }

    if (role === 'PARENT') {
        switch(currentScreen) {
            case 'dashboard': return <DashboardScreen user={user!} progress={progress} testAttempts={testAttempts} goals={[]} toggleGoal={()=>{}} addGoal={()=>{}} setScreen={setScreen} />;
            case 'family': return <ParentFamilyScreen user={user!} onSendRequest={async ()=>({success:true, message:'Request Sent'})} />;
            case 'analytics': return <AnalyticsScreen progress={progress} testAttempts={testAttempts} />;
            case 'profile': return <ProfileScreen user={user!} onAcceptRequest={()=>{}} />;
            default: return <DashboardScreen user={user!} progress={progress} testAttempts={testAttempts} goals={[]} toggleGoal={()=>{}} addGoal={()=>{}} setScreen={setScreen} />;
        }
    }

    switch (currentScreen) {
      case 'dashboard': return <DashboardScreen user={user!} progress={progress} testAttempts={testAttempts} goals={goals} toggleGoal={toggleGoal} addGoal={addGoal} setScreen={setScreen} linkedPsychReport={psychReport || undefined} />;
      case 'syllabus': return <SyllabusScreen user={user!} subjects={SYLLABUS_DATA} progress={progress} onUpdateProgress={updateProgress} questionBank={questionBank} addTestAttempt={addTestAttempt} syncStatus={globalSyncStatus} showIndicators={true} />;
      case 'tests': return <TestScreen user={user!} addTestAttempt={addTestAttempt} history={testAttempts} availableTests={tests} />;
      case 'psychometric': return <PsychometricScreen user={user!} reportData={psychReport || undefined} onSaveReport={r => isDemo ? checkDemoRestriction() : apiService.request('/api/save_psychometric.php', {method:'POST', body:JSON.stringify({user_id:user?.id, report:r})}).then(()=>setPsychReport(r))} />;
      case 'timetable': return <TimetableScreen user={user!} savedConfig={timetable.config} savedSlots={timetable.slots} progress={progress} onSave={saveTimetable} />;
      case 'revision': return <RevisionScreen progress={progress} handleRevisionComplete={(id) => updateProgress(id, { lastRevised: new Date().toISOString() })} />;
      case 'analytics': return <AnalyticsScreen user={user!} progress={progress} testAttempts={testAttempts} />;
      case 'profile': return <ProfileScreen user={user!} onAcceptRequest={() => {}} />;
      default: return <DashboardScreen user={user!} progress={progress} testAttempts={testAttempts} goals={goals} toggleGoal={toggleGoal} addGoal={addGoal} setScreen={setScreen} />;
    }
  };

  if (!user) {
      return <Suspense fallback={<LoadingView />}><AuthScreen onLogin={u => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); setScreen(u.role.includes('ADMIN') ? 'overview' : 'dashboard'); }} onNavigate={p => setScreen(p as Screen)} /></Suspense>;
  }

  // --- ERROR STATE HANDLING (STRICT FOR REAL USERS, BYPASSED FOR DEMO) ---
  if (syncError && !isDemo) {
      const isAdmin = user?.role.includes('ADMIN');
      const isMissingApi = syncError.includes('API_NOT_FOUND');

      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
              <div className="p-4 bg-red-100 rounded-full text-red-600 mb-6 shadow-xl">
                  <Database size={48} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                  {isMissingApi ? 'Backend Not Deployed' : 'Database Node Offline'}
              </h2>
              <p className="text-slate-500 max-w-md mt-2 mb-8 leading-relaxed">
                  {isMissingApi 
                    ? "The requested API file was not found on your server. This usually means the /api/ folder hasn't been uploaded to Hostinger or the file is missing."
                    : "The application is unable to reach your server's backend. Check your MySQL configuration or network connectivity."}
              </p>
              <div className="bg-white p-4 rounded-xl border border-red-100 mb-8 w-full max-w-lg text-left shadow-sm">
                  <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase mb-2 tracking-widest">
                      <AlertTriangle size={12} /> Server Response
                  </div>
                  <code className="text-xs font-mono text-slate-700 block bg-slate-50 p-3 rounded border break-all">
                      {syncError}
                  </code>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                  {isAdmin && (
                      <button 
                        onClick={() => { setSyncError(null); setScreen('deployment'); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                          <UploadCloud size={20} /> Open Deployment Console <ArrowRight size={16} />
                      </button>
                  )}
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-4 px-10 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                      <RefreshCw size={20} /> Retry Handshake
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-inter">
      {isDemo && (
          <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 px-4 z-[9999] flex items-center justify-center gap-2 shadow-md">
              <ShieldAlert size={12} /> Sandbox Mode Enabled (Read-Only) • Verify Navigation & UI Integrity
          </div>
      )}
      <Navigation currentScreen={currentScreen} setScreen={setScreen} logout={() => { setUser(null); localStorage.clear(); window.location.reload(); }} user={user} />
      <main className={`flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full relative ${isDemo ? 'pt-10 md:pt-14' : ''}`}>
        <div className="absolute top-4 right-4 z-50">
            <SyncStatusBadge status={isDemo ? 'SYNCED' : globalSyncStatus} show={true} />
        </div>
        <Suspense fallback={<LoadingView />}>{renderContent()}</Suspense>
      </main>
      <MobileNavigation currentScreen={currentScreen} setScreen={setScreen} logout={() => { setUser(null); localStorage.clear(); window.location.reload(); }} user={user} />
      {user.role === 'STUDENT' && !['ai-tutor', 'tests', 'focus', 'psychometric'].includes(currentScreen) && <AITutorChat />}
    </div>
  );
};

export default App;

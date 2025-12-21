
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Navigation, MobileNavigation } from './components/Navigation';
import { AITutorChat } from './components/AITutorChat';
import { SyncStatusBadge, SyncStatus } from './components/SyncStatusBadge';
import { apiService } from './services/apiService';
import { 
  User, UserProgress, TestAttempt, Goal, BacklogItem, 
  Flashcard, MemoryHack, BlogPost, Screen, Test, Question, 
  TimetableConfig, ChapterNote, VideoLesson, PsychometricReport 
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
    <p className="text-xs font-bold uppercase tracking-widest">Resuming Prep Node...</p>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentScreen, setScreen] = useState<Screen>(() => {
    const saved = localStorage.getItem('last_screen');
    return (saved as Screen) || 'dashboard';
  });

  const [globalSyncStatus, setGlobalSyncStatus] = useState<SyncStatus>('IDLE');
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>([]);
  const [timetable, setTimetable] = useState<{config?: TimetableConfig, slots?: any[]}>({});
  const [psychReport, setPsychReport] = useState<PsychometricReport | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [hacks, setHacks] = useState<MemoryHack[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  const loadData = useCallback(async (userId: string) => {
    setGlobalSyncStatus('SYNCING');
    try {
        const data = await apiService.request(`/api/get_dashboard.php?user_id=${userId}`);
        
        if (data.progress) {
            const pm: Record<string, UserProgress> = {};
            data.progress.forEach((p: any) => pm[p.topicId] = p);
            setProgress(pm);
        }

        setTestAttempts(data.attempts || []);
        setGoals(data.goals || []);
        setBacklogs(data.backlogs || []);
        setTimetable(data.timetable || {});
        setPsychReport(data.psychometric || null);
        
        setGlobalSyncStatus('SYNCED');
    } catch (e) { 
        console.error("Master Sync Failure:", e);
        setGlobalSyncStatus('ERROR'); 
    }
  }, []);

  useEffect(() => { if (user) loadData(user.id); }, [user?.id, loadData]);
  useEffect(() => { localStorage.setItem('last_screen', currentScreen); }, [currentScreen]);

  const updateProgress = async (topicId: string, updates: Partial<UserProgress>) => {
    setGlobalSyncStatus('SYNCING');
    const existing = progress[topicId] || { topicId, status: 'NOT_STARTED', lastRevised: null, revisionLevel: 0, nextRevisionDate: null, solvedQuestions: [] };
    const updated = { ...existing, ...updates };
    setProgress(prev => ({ ...prev, [topicId]: updated }));
    try {
        await apiService.request('/api/sync_progress.php', { method: 'POST', body: JSON.stringify({ userId: user?.id, ...updated }) });
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const addTestAttempt = async (attempt: TestAttempt) => {
    setGlobalSyncStatus('SYNCING');
    setTestAttempts(prev => [attempt, ...prev]);
    try {
        await apiService.request('/api/save_attempt.php', { method: 'POST', body: JSON.stringify({ ...attempt, userId: user?.id }) });
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const saveTimetable = async (config: TimetableConfig, slots: any[]) => {
    setGlobalSyncStatus('SYNCING');
    setTimetable({ config, slots });
    try {
        await apiService.request('/api/save_timetable.php', { method: 'POST', body: JSON.stringify({ userId: user?.id, config, slots }) });
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const toggleGoal = async (id: string) => {
    setGlobalSyncStatus('SYNCING');
    const updatedGoals = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    const target = updatedGoals.find(g => g.id === id);
    setGoals(updatedGoals);
    try {
        await apiService.request('/api/manage_goals.php', { method: 'POST', body: JSON.stringify({ ...target, userId: user?.id }) });
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const addGoal = async (text: string) => {
    setGlobalSyncStatus('SYNCING');
    const newGoal = { id: `g_${Date.now()}`, text, completed: false };
    setGoals(prev => [...prev, newGoal]);
    try {
        await apiService.request('/api/manage_goals.php', { method: 'POST', body: JSON.stringify({ ...newGoal, userId: user?.id }) });
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const handleSavePsychometric = async (report: PsychometricReport) => {
      setGlobalSyncStatus('SYNCING');
      setPsychReport(report);
      try {
          await apiService.request('/api/save_psychometric.php', { method: 'POST', body: JSON.stringify({ user_id: user?.id, report }) });
          setGlobalSyncStatus('SYNCED');
      } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const renderContent = () => {
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ADMIN_EXECUTIVE';
    
    switch (currentScreen) {
      case 'dashboard':
      case 'overview':
        return isAdmin 
          ? <AdminDashboardScreen user={user!} onNavigate={setScreen} />
          : <DashboardScreen user={user!} progress={progress} testAttempts={testAttempts} goals={goals} toggleGoal={toggleGoal} addGoal={addGoal} setScreen={setScreen} linkedPsychReport={psychReport || undefined} />;
      
      case 'syllabus': return <SyllabusScreen user={user!} subjects={SYLLABUS_DATA} progress={progress} onUpdateProgress={updateProgress} questionBank={generateInitialQuestionBank()} addTestAttempt={addTestAttempt} syncStatus={globalSyncStatus} />;
      case 'tests': return <TestScreen user={user!} addTestAttempt={addTestAttempt} history={testAttempts} availableTests={MOCK_TESTS_DATA} />;
      case 'psychometric': return <PsychometricScreen user={user!} reportData={psychReport || undefined} />;
      case 'timetable': return <TimetableScreen user={user!} savedConfig={timetable.config} savedSlots={timetable.slots} progress={progress} onSave={saveTimetable} />;
      case 'revision': return <RevisionScreen progress={progress} handleRevisionComplete={(id) => updateProgress(id, { lastRevised: new Date().toISOString() })} />;
      case 'backlogs': return <BacklogScreen backlogs={backlogs} onAddBacklog={()=>{}} onToggleBacklog={()=>{}} onDeleteBacklog={()=>{}} />;
      case 'profile': return <ProfileScreen user={user!} onAcceptRequest={() => {}} onUpdateUser={upd => setUser({...user!, ...upd})} />;
      case 'analytics': return <AnalyticsScreen user={user!} progress={progress} testAttempts={testAttempts} />;
      case 'ai-tutor': return <AITutorChat isFullScreen={true} />;
      default: return <DashboardScreen user={user!} progress={progress} testAttempts={testAttempts} goals={goals} toggleGoal={toggleGoal} addGoal={addGoal} setScreen={setScreen} />;
    }
  };

  if (!user) {
      return <Suspense fallback={<LoadingView />}><AuthScreen onLogin={u => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); setScreen(u.role.includes('ADMIN') ? 'overview' : 'dashboard'); }} onNavigate={p => setScreen(p as Screen)} /></Suspense>;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-inter">
      <Navigation currentScreen={currentScreen} setScreen={setScreen} logout={() => { setUser(null); localStorage.clear(); window.location.reload(); }} user={user} />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full relative">
        <div className="absolute top-4 right-4 z-50">
            <SyncStatusBadge status={globalSyncStatus} show={true} />
        </div>
        <Suspense fallback={<LoadingView />}>{renderContent()}</Suspense>
      </main>
      <MobileNavigation currentScreen={currentScreen} setScreen={setScreen} logout={() => { setUser(null); localStorage.clear(); window.location.reload(); }} user={user} />
      {user.role === 'STUDENT' && !['ai-tutor', 'tests', 'focus'].includes(currentScreen) && <AITutorChat />}
    </div>
  );
};

export default App;

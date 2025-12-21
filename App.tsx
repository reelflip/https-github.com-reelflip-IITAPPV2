
import React, { Component, useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Navigation, MobileNavigation } from './components/Navigation';
import { AITutorChat } from './components/AITutorChat';
import { PublicLayout } from './components/PublicLayout';
import { SyncStatusBadge, SyncStatus } from './components/SyncStatusBadge';
import { apiService } from './services/apiService';
import { 
  User, UserProgress, TestAttempt, Goal, MistakeLog, BacklogItem, 
  Flashcard, MemoryHack, BlogPost, Screen, Test, Question, 
  Topic, TimetableConfig, ChapterNote, VideoLesson 
} from './lib/types';
import { SYLLABUS_DATA } from './lib/syllabusData';
import { MOCK_TESTS_DATA, generateInitialQuestionBank } from './lib/mockTestsData';
import { calculateNextRevision } from './lib/utils';
import { Info, WifiOff, Globe } from 'lucide-react';

// --- Lazy Loading Screens ---
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
    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Connecting to Sync Engine...</p>
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
  const [questionBank, setQuestionBank] = useState<Question[]>(generateInitialQuestionBank());
  const [tests, setTests] = useState<Test[]>(MOCK_TESTS_DATA);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [hacks, setHacks] = useState<MemoryHack[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [chapterNotes, setChapterNotes] = useState<Record<string, ChapterNote>>({});

  const mapProgress = (p: any): UserProgress => ({
    topicId: p.topic_id || p.topicId,
    status: p.status,
    lastRevised: p.last_revised || p.lastRevised,
    revisionLevel: Number(p.revision_level || p.revisionLevel || 0),
    nextRevisionDate: p.next_revision_date || p.nextRevisionDate,
    solvedQuestions: p.solved_questions_json ? (typeof p.solved_questions_json === 'string' ? JSON.parse(p.solved_questions_json) : p.solved_questions_json) : (p.solvedQuestions || [])
  });

  const loadDashboard = useCallback(async (userId: string) => {
    setGlobalSyncStatus('SYNCING');
    try {
        const data = await apiService.request(`/api/get_dashboard.php?user_id=${userId}`);
        if (data.progress) {
            const progMap: Record<string, UserProgress> = {};
            data.progress.forEach((p: any) => { const mapped = mapProgress(p); progMap[mapped.topicId] = mapped; });
            setProgress(progMap);
        }
        if (data.attempts) {
            setTestAttempts(data.attempts.map((a: any) => ({
                ...a, score: Number(a.score), totalMarks: Number(a.total_marks || a.totalMarks),
                accuracy_percent: Number(a.accuracy), detailedResults: a.detailed_results ? (typeof a.detailed_results === 'string' ? JSON.parse(a.detailed_results) : a.detailed_results) : []
            })));
        }
        if (data.goals) setGoals(data.goals.map((g: any) => ({ ...g, completed: g.completed == 1 || g.completed === true })));
        if (data.backlogs) setBacklogs(data.backlogs.map((b: any) => ({ ...b, status: b.status || 'PENDING' })));
        if (data.timetable) setTimetable({ 
            config: data.timetable.config_json ? (typeof data.timetable.config_json === 'string' ? JSON.parse(data.timetable.config_json) : data.timetable.config_json) : data.timetable.config, 
            slots: data.timetable.slots_json ? (typeof data.timetable.slots_json === 'string' ? JSON.parse(data.timetable.slots_json) : data.timetable.slots_json) : (data.timetable.slots || [])
        });
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  }, []);

  useEffect(() => { if (user) loadDashboard(user.id); }, [user?.id, loadDashboard]);
  useEffect(() => { localStorage.setItem('last_screen', currentScreen); }, [currentScreen]);

  const updateProgress = async (topicId: string, updates: Partial<UserProgress>) => {
    setGlobalSyncStatus('SYNCING');
    const updated = { ...(progress[topicId] || { topicId, status: 'NOT_STARTED', lastRevised: null, revisionLevel: 0, nextRevisionDate: null, solvedQuestions: [] }), ...updates };
    setProgress(prev => ({ ...prev, [topicId]: updated }));
    try {
        await apiService.request('/api/sync_progress.php', { method: 'POST', body: JSON.stringify({ userId: user?.id, ...updated }) });
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const addTestAttempt = async (attempt: TestAttempt) => {
    setGlobalSyncStatus('SYNCING');
    setTestAttempts(prev => [...prev, attempt]);
    try {
        await apiService.request('/api/save_attempt.php', { method: 'POST', body: JSON.stringify({ ...attempt, userId: user?.id }) });
        setGlobalSyncStatus('SYNCED');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const renderContent = () => {
    const isAdminRole = user?.role === 'ADMIN' || user?.role === 'ADMIN_EXECUTIVE';
    
    switch (currentScreen) {
      // --- COMMON ---
      case 'dashboard':
      case 'overview':
        return isAdminRole 
          ? <AdminDashboardScreen user={user!} onNavigate={setScreen} />
          : <DashboardScreen user={user!} progress={progress} testAttempts={testAttempts} goals={goals} toggleGoal={()=>{}} addGoal={()=>{}} setScreen={setScreen} />;
      
      case 'analytics': return <AnalyticsScreen user={user!} progress={progress} testAttempts={testAttempts} />;
      case 'profile': return <ProfileScreen user={user!} onAcceptRequest={() => {}} onUpdateUser={upd => setUser({...user!, ...upd})} />;
      
      // --- STUDENT ---
      case 'syllabus': return <SyllabusScreen user={user!} subjects={SYLLABUS_DATA} progress={progress} onUpdateProgress={updateProgress} questionBank={questionBank} addTestAttempt={addTestAttempt} testAttempts={testAttempts} syncStatus={globalSyncStatus} />;
      case 'tests': return <TestScreen user={user!} addTestAttempt={addTestAttempt} history={testAttempts} availableTests={tests} />;
      case 'psychometric': return <PsychometricScreen user={user!} />;
      case 'focus': return <FocusScreen />;
      case 'timetable': return <TimetableScreen user={user!} savedConfig={timetable.config} savedSlots={timetable.slots} onSave={(c, s) => setTimetable({config: c, slots: s})} progress={progress} />;
      case 'revision': return <RevisionScreen progress={progress} handleRevisionComplete={(id) => updateProgress(id, { lastRevised: new Date().toISOString() })} />;
      case 'mistakes': return <MistakesScreen mistakes={[]} addMistake={()=>{}} />;
      case 'flashcards': return <FlashcardScreen flashcards={flashcards} />;
      case 'backlogs': return <BacklogScreen backlogs={backlogs} onAddBacklog={()=>{}} onToggleBacklog={()=>{}} onDeleteBacklog={()=>{}} />;
      case 'hacks': return <HacksScreen hacks={hacks} />;
      case 'wellness': return <WellnessScreen />;
      case 'ai-tutor': return <AITutorChat isFullScreen={true} />;

      // --- PARENT ---
      case 'family': return <ParentFamilyScreen user={user!} onSendRequest={async () => ({success: true, message: 'Invite sent'})} />;

      // --- ADMIN ---
      case 'users': return <AdminUserManagementScreen />;
      case 'inbox': return <AdminInboxScreen />;
      case 'syllabus_admin': return <AdminSyllabusScreen syllabus={SYLLABUS_DATA} onAddTopic={()=>{}} onDeleteTopic={()=>{}} chapterNotes={chapterNotes} />;
      case 'content': return <ContentManagerScreen flashcards={flashcards} hacks={hacks} blogs={blogs} onAddFlashcard={c => setFlashcards([...flashcards, {...c, id: Date.now()}])} onAddHack={h => setHacks([...hacks, {...h, id: Date.now()}])} onAddBlog={()=>{}} onDelete={()=>{}} />;
      case 'blog_admin': return <AdminBlogScreen blogs={blogs} onAddBlog={b => setBlogs([...blogs, b])} />;
      case 'system': return <AdminSystemScreen />;
      case 'deployment': return <DeploymentScreen />;
      case 'diagnostics': return <DiagnosticsScreen />;
      
      default: return <DashboardScreen user={user!} progress={progress} testAttempts={testAttempts} goals={goals} toggleGoal={()=>{}} addGoal={()=>{}} setScreen={setScreen} />;
    }
  };

  if (!user) {
      return <Suspense fallback={<LoadingView />}><AuthScreen onLogin={u => { setUser(u); setScreen(u.role.includes('ADMIN') ? 'overview' : 'dashboard'); }} onNavigate={p => setScreen(p as Screen)} /></Suspense>;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-inter">
      <Navigation currentScreen={currentScreen} setScreen={setScreen} logout={() => { setUser(null); setScreen('dashboard'); localStorage.clear(); }} user={user} />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full relative">
        <div className="absolute top-4 right-4 z-50">
            <SyncStatusBadge status={globalSyncStatus} show={true} />
        </div>
        <Suspense fallback={<LoadingView />}>{renderContent()}</Suspense>
      </main>
      <MobileNavigation currentScreen={currentScreen} setScreen={setScreen} logout={() => { setUser(null); setScreen('dashboard'); localStorage.clear(); }} user={user} />
      {user.role === 'STUDENT' && !['ai-tutor', 'tests', 'focus'].includes(currentScreen) && <AITutorChat />}
    </div>
  );
};

export default App;

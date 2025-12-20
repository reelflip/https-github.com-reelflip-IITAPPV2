import React, { Component, useState, useEffect, useCallback, ErrorInfo, ReactNode, Suspense, lazy } from 'react';
import { Navigation, MobileNavigation } from './components/Navigation';
import { AITutorChat } from './components/AITutorChat';
import { PublicLayout } from './components/PublicLayout';
import { SyncStatusBadge, SyncStatus } from './components/SyncStatusBadge';
import { 
  User, UserProgress, TestAttempt, Goal, MistakeLog, BacklogItem, 
  Flashcard, MemoryHack, BlogPost, Screen, Test, Question, 
  Topic, TimetableConfig, ChapterNote, VideoLesson, PsychometricReport 
} from './lib/types';
import { SYLLABUS_DATA } from './lib/syllabusData';
import { MOCK_TESTS_DATA, generateInitialQuestionBank } from './lib/mockTestsData';

// --- Lazy Loading Screens (v12.43) ---
const AuthScreen = lazy(() => import('./screens/AuthScreen').then(m => ({ default: m.AuthScreen })));
const DashboardScreen = lazy(() => import('./screens/DashboardScreen').then(m => ({ default: m.DashboardScreen })));
const AdminDashboardScreen = lazy(() => import('./screens/AdminDashboardScreen').then(m => ({ default: m.AdminDashboardScreen })));
const SyllabusScreen = lazy(() => import('./screens/SyllabusScreen').then(m => ({ default: m.SyllabusScreen })));
const RevisionScreen = lazy(() => import('./screens/RevisionScreen').then(m => ({ default: m.RevisionScreen })));
const TimetableScreen = lazy(() => import('./screens/TimetableScreen').then(m => ({ default: m.TimetableScreen })));
const TestScreen = lazy(() => import('./screens/TestScreen').then(m => ({ default: m.TestScreen })));
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
const AdminAnalyticsScreen = lazy(() => import('./screens/AdminAnalyticsScreen').then(m => ({ default: m.AdminAnalyticsScreen })));
const AdminSystemScreen = lazy(() => import('./screens/AdminSystemScreen').then(m => ({ default: m.AdminSystemScreen })));
const DeploymentScreen = lazy(() => import('./screens/DeploymentScreen').then(m => ({ default: m.DeploymentScreen })));
const DiagnosticsScreen = lazy(() => import('./screens/DiagnosticsScreen').then(m => ({ default: m.DiagnosticsScreen })));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen').then(m => ({ default: m.ProfileScreen })));
const AboutUsScreen = lazy(() => import('./screens/AboutUsScreen').then(m => ({ default: m.AboutUsScreen })));
const ExamGuideScreen = lazy(() => import('./screens/ExamGuideScreen').then(m => ({ default: m.ExamGuideScreen })));
const PrivacyPolicyScreen = lazy(() => import('./screens/PrivacyPolicyScreen').then(m => ({ default: m.PrivacyPolicyScreen })));
const ContactUsScreen = lazy(() => import('./screens/ContactUsScreen').then(m => ({ default: m.ContactUsScreen })));
const FeaturesScreen = lazy(() => import('./screens/FeaturesScreen').then(m => ({ default: m.FeaturesScreen })));
const ContentManagerScreen = lazy(() => import('./screens/ContentManagerScreen').then(m => ({ default: m.ContentManagerScreen })));
const AdminBlogScreen = lazy(() => import('./screens/AdminBlogScreen').then(m => ({ default: m.AdminBlogScreen })));

const LoadingView = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p className="text-xs font-bold uppercase tracking-widest">Synchronizing Command Interface...</p>
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

  const [showIndicators, setShowIndicators] = useState(false);
  const [globalSyncStatus, setGlobalSyncStatus] = useState<SyncStatus>('IDLE');

  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mistakes, setMistakes] = useState<MistakeLog[]>([]);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>([]);
  const [timetable, setTimetable] = useState<{config?: TimetableConfig, slots?: any[]}>({});
  const [questionBank, setQuestionBank] = useState<Question[]>(generateInitialQuestionBank());
  const [tests, setTests] = useState<Test[]>(MOCK_TESTS_DATA);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [hacks, setHacks] = useState<MemoryHack[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [linkedData, setLinkedData] = useState<{ progress: Record<string, UserProgress>, tests: TestAttempt[], studentName: string, psychReport?: PsychometricReport } | undefined>();

  const clearState = useCallback(() => {
    setProgress({}); setTestAttempts([]); setGoals([]); setMistakes([]); setBacklogs([]); setTimetable({}); setLinkedData(undefined);
  }, []);

  const mapProgress = (p: any): UserProgress => ({
    topicId: p.topic_id, status: p.status, lastRevised: p.last_revised, revisionLevel: Number(p.revision_level || 0), nextRevisionDate: p.next_revision_date, solvedQuestions: p.solved_questions_json ? JSON.parse(p.solved_questions_json) : []
  });

  const loadDashboard = useCallback(async (userId: string) => {
    setGlobalSyncStatus('SYNCING');
    try {
        const res = await fetch(`/api/get_dashboard.php?user_id=${userId}`, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data.progress) {
                const progMap: Record<string, UserProgress> = {};
                data.progress.forEach((p: any) => { const mapped = mapProgress(p); progMap[mapped.topicId] = mapped; });
                setProgress(progMap);
            }
            if (data.attempts) setTestAttempts(data.attempts.map((a: any) => ({ ...a, detailedResults: a.detailed_results ? JSON.parse(a.detailed_results) : [] })));
            if (data.goals) setGoals(data.goals.map((g: any) => ({ ...g, completed: g.completed == 1 })));
            if (data.backlogs) setBacklogs(data.backlogs.map((b: any) => ({ ...b, status: b.status || 'PENDING' })));
            if (data.mistakes) setMistakes(data.mistakes.map((m: any) => ({ ...m })));
            if (data.timetable) setTimetable({ config: data.timetable.config_json ? JSON.parse(data.timetable.config_json) : undefined, slots: data.timetable.slots_json ? JSON.parse(data.timetable.slots_json) : [] });
            if (data.blogs) setBlogs(data.blogs);
            if (data.flashcards) setFlashcards(data.flashcards);
            if (data.hacks) setHacks(data.hacks);
            if (data.userProfileSync) setUser(prev => ({ ...prev!, ...data.userProfileSync, notifications: data.notifications || [] }));
            setGlobalSyncStatus('SYNCED');
        } else { setGlobalSyncStatus('ERROR'); }
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  }, []);

  useEffect(() => {
    if (user) loadDashboard(user.id);
  }, [user?.id, loadDashboard]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => { localStorage.setItem('last_screen', currentScreen); }, [currentScreen]);

  const updateProgress = async (topicId: string, updates: Partial<UserProgress>) => {
    setGlobalSyncStatus('SYNCING');
    const updated = { ...(progress[topicId] || { topicId, status: 'NOT_STARTED', lastRevised: null, revisionLevel: 0, nextRevisionDate: null, solvedQuestions: [] }), ...updates };
    setProgress(prev => ({ ...prev, [topicId]: updated }));
    try {
        const res = await fetch('/api/sync_progress.php', { method: 'POST', body: JSON.stringify({ userId: user?.id, ...updated }) });
        if (res.ok) setGlobalSyncStatus('SYNCED'); else setGlobalSyncStatus('ERROR');
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const handleAddBlog = async (blog: BlogPost) => {
    setGlobalSyncStatus('SYNCING');
    try {
      const res = await fetch('/api/manage_content.php?type=blog', { method: 'POST', body: JSON.stringify(blog) });
      if (res.ok) {
          const data = await res.json();
          setBlogs(prev => [{ ...blog, id: data.id || blog.id }, ...prev.filter(b => b.id !== blog.id)]);
          setGlobalSyncStatus('SYNCED');
      }
    } catch (e) { setGlobalSyncStatus('ERROR'); }
  };

  const renderContent = () => {
    const isAdminRole = user?.role === 'ADMIN' || user?.role === 'ADMIN_EXECUTIVE';
    switch (currentScreen) {
      case 'dashboard':
      case 'overview':
        return isAdminRole 
          ? <AdminDashboardScreen user={user!} onNavigate={setScreen} />
          : <DashboardScreen user={user!} progress={linkedData?.progress || progress} testAttempts={linkedData?.tests || testAttempts} goals={goals} toggleGoal={id => {}} addGoal={t => {}} setScreen={setScreen} viewingStudentName={linkedData?.studentName} linkedPsychReport={linkedData?.psychReport} />;
      case 'syllabus':
        return <SyllabusScreen user={user!} subjects={SYLLABUS_DATA} progress={linkedData?.progress || progress} onUpdateProgress={updateProgress} questionBank={questionBank} viewingStudentName={linkedData?.studentName} readOnly={user!.role === 'PARENT'} addTestAttempt={() => {}} testAttempts={linkedData?.tests || testAttempts} syncStatus={globalSyncStatus} showIndicators={showIndicators} />;
      case 'tests':
        return isAdminRole
          ? <AdminTestManagerScreen questionBank={questionBank} tests={tests} syllabus={SYLLABUS_DATA} onAddQuestion={q => setQuestionBank([...questionBank, q])} onCreateTest={t => setTests([...tests, t])} onDeleteQuestion={id => setQuestionBank(questionBank.filter(q => q.id !== id))} onDeleteTest={id => setTests(tests.filter(t => t.id !== id))} />
          : <TestScreen user={user!} addTestAttempt={() => {}} history={linkedData?.tests || testAttempts} availableTests={tests} />;
      case 'timetable':
        return <TimetableScreen user={user!} savedConfig={timetable.config} savedSlots={timetable.slots} onSave={(c, s) => {}} progress={progress} />;
      case 'diagnostics': return <DiagnosticsScreen />;
      case 'deployment': return <DeploymentScreen />;
      case 'profile': return <ProfileScreen user={user!} onAcceptRequest={id => {}} onUpdateUser={upd => setUser({...user!, ...upd})} />;
      case 'backlogs': return <BacklogScreen backlogs={backlogs} onAddBacklog={i => {}} onDeleteBacklog={i => {}} onToggleBacklog={i => {}} />;
      case 'mistakes': return <MistakesScreen mistakes={mistakes} addMistake={m => {}} />;
      case 'psychometric': return <PsychometricScreen user={user!} />;
      case 'analytics': return <AnalyticsScreen user={user!} progress={linkedData?.progress || progress} testAttempts={linkedData?.tests || testAttempts} viewingStudentName={linkedData?.studentName} />;
      case 'inbox': return <AdminInboxScreen />;
      case 'users': return <AdminUserManagementScreen />;
      case 'content': return <ContentManagerScreen flashcards={flashcards} hacks={hacks} blogs={blogs} onAddFlashcard={c => {}} onAddHack={h => {}} onAddBlog={handleAddBlog} onDelete={(t, id) => {}} />;
      case 'blog_admin': return <AdminBlogScreen blogs={blogs} onAddBlog={handleAddBlog} onUpdateBlog={handleAddBlog} onDeleteBlog={id => {}} />;
      case 'syllabus_admin': return <AdminSyllabusScreen syllabus={SYLLABUS_DATA} onAddTopic={() => {}} onDeleteTopic={() => {}} />;
      case 'system': return <AdminSystemScreen />;
      case 'flashcards': return <FlashcardScreen flashcards={flashcards} />;
      case 'hacks': return <HacksScreen hacks={hacks} />;
      default: return <DashboardScreen user={user!} progress={progress} testAttempts={testAttempts} goals={[]} toggleGoal={id => {}} addGoal={t => {}} setScreen={setScreen} />;
    }
  };

  if (!user) {
      const publicScreens: Screen[] = ['about', 'exams', 'privacy', 'contact', 'features'];
      if (publicScreens.includes(currentScreen)) {
          return (
              <Suspense fallback={<LoadingView />}>
                <PublicLayout onNavigate={p => setScreen(p as Screen)} currentScreen={currentScreen}>
                    {currentScreen === 'about' && <AboutUsScreen />}
                    {currentScreen === 'exams' && <ExamGuideScreen />}
                    {currentScreen === 'privacy' && <PrivacyPolicyScreen />}
                    {currentScreen === 'contact' && <ContactUsScreen />}
                    {currentScreen === 'features' && <FeaturesScreen />}
                </PublicLayout>
              </Suspense>
          );
      }
      return <Suspense fallback={<LoadingView />}><AuthScreen onLogin={u => { setUser(u); setScreen(u.role.includes('ADMIN') ? 'overview' : 'dashboard'); }} onNavigate={p => setScreen(p as Screen)} /></Suspense>;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-inter">
      <Navigation currentScreen={currentScreen} setScreen={setScreen} logout={() => { setUser(null); clearState(); setScreen('dashboard'); localStorage.clear(); }} user={user} />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full relative">
        <div className="absolute top-4 right-4 z-50 pointer-events-none">
            <SyncStatusBadge status={globalSyncStatus} show={showIndicators} />
        </div>
        <Suspense fallback={<LoadingView />}>{renderContent()}</Suspense>
      </main>
      <MobileNavigation currentScreen={currentScreen} setScreen={setScreen} logout={() => { setUser(null); clearState(); setScreen('dashboard'); localStorage.clear(); }} user={user} />
      {user.role === 'STUDENT' && currentScreen !== 'ai-tutor' && <AITutorChat />}
    </div>
  );
};

export default App;
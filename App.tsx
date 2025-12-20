import React, { Component, useState, useEffect, useCallback, ErrorInfo, ReactNode, Suspense, lazy } from 'react';
import { Navigation, MobileNavigation } from './components/Navigation';
import { AITutorChat } from './components/AITutorChat';
import { PublicLayout } from './components/PublicLayout';
import { 
  User, UserProgress, TestAttempt, Goal, MistakeLog, BacklogItem, 
  Flashcard, MemoryHack, BlogPost, Screen, Test, Question, 
  Topic, TimetableConfig, ChapterNote, VideoLesson, PsychometricReport 
} from './lib/types';
import { SYLLABUS_DATA } from './lib/syllabusData';
import { calculateNextRevision } from './lib/utils';
import { MOCK_TESTS_DATA, generateInitialQuestionBank } from './lib/mockTestsData';

// --- Lazy Loading Screens (v12.35) ---
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
const ContentManagerScreen = lazy(() => import('./screens/ContentManagerScreen').then(m => ({ default: m.ContentManagerScreen })));
const AdminBlogScreen = lazy(() => import('./screens/AdminBlogScreen').then(m => ({ default: m.AdminBlogScreen })));
const PublicBlogScreen = lazy(() => import('./screens/PublicBlogScreen').then(m => ({ default: m.PublicBlogScreen })));
const AboutUsScreen = lazy(() => import('./screens/AboutUsScreen').then(m => ({ default: m.AboutUsScreen })));
const ExamGuideScreen = lazy(() => import('./screens/ExamGuideScreen').then(m => ({ default: m.ExamGuideScreen })));
const ContactUsScreen = lazy(() => import('./screens/ContactUsScreen').then(m => ({ default: m.ContactUsScreen })));
const PrivacyPolicyScreen = lazy(() => import('./screens/PrivacyPolicyScreen').then(m => ({ default: m.PrivacyPolicyScreen })));
const FeaturesScreen = lazy(() => import('./screens/FeaturesScreen').then(m => ({ default: m.FeaturesScreen })));
const ParentFamilyScreen = lazy(() => import('./screens/ParentFamilyScreen').then(m => ({ default: m.ParentFamilyScreen })));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen').then(m => ({ default: m.ProfileScreen })));

interface ErrorBoundaryProps { children?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Persistence Sync Error</h1>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Restart App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingView = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p className="text-xs font-bold uppercase tracking-widest">Synchronizing Persistence...</p>
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

  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mistakes, setMistakes] = useState<MistakeLog[]>([]);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [hacks, setHacks] = useState<MemoryHack[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [timetable, setTimetable] = useState<{config?: TimetableConfig, slots?: any[]}>({});
  const [questionBank, setQuestionBank] = useState<Question[]>(generateInitialQuestionBank());
  const [tests, setTests] = useState<Test[]>(MOCK_TESTS_DATA);
  const [chapterNotes, setChapterNotes] = useState<Record<string, ChapterNote>>({});
  const [videoMap, setVideoMap] = useState<Record<string, VideoLesson>>({});
  const [linkedData, setLinkedData] = useState<{ progress: Record<string, UserProgress>, tests: TestAttempt[], studentName: string, psychReport?: PsychometricReport } | undefined>();

  const clearState = useCallback(() => {
    setProgress({}); setTestAttempts([]); setGoals([]); setMistakes([]); setBacklogs([]); setTimetable({}); setLinkedData(undefined);
  }, []);

  const mapProgress = (p: any): UserProgress => ({
    topicId: p.topic_id || p.topicId,
    status: p.status,
    lastRevised: p.last_revised || p.lastRevised,
    revisionLevel: Number(p.revision_level || p.revisionLevel || 0),
    nextRevisionDate: p.next_revision_date || p.nextRevisionDate,
    solvedQuestions: p.solved_questions_json ? JSON.parse(p.solved_questions_json) : (p.solvedQuestions || [])
  });

  const mapAttempt = (a: any): TestAttempt => ({
    id: a.id,
    date: a.date,
    title: a.title || 'Mock Test',
    score: Number(a.score),
    totalMarks: Number(a.total_marks || a.totalMarks),
    accuracy: Number(a.accuracy || a.accuracy_percent),
    accuracy_percent: Number(a.accuracy_percent || a.accuracy),
    testId: a.test_id || a.testId,
    totalQuestions: Number(a.total_questions || a.totalQuestions),
    correctCount: Number(a.correct_count || a.correctCount),
    incorrectCount: Number(a.incorrect_count || a.incorrectCount),
    unattemptedCount: Number(a.unattempted_count || a.unattemptedCount),
    topicId: a.topic_id || a.topicId,
    difficulty: a.difficulty,
    detailedResults: a.detailed_results ? JSON.parse(a.detailed_results) : (a.detailedResults || [])
  });

  const loadDashboard = useCallback(async (userId: string) => {
    try {
        const res = await fetch(`/api/get_dashboard.php?user_id=${userId}`, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data.progress) {
                const progMap: Record<string, UserProgress> = {};
                data.progress.forEach((p: any) => { const mapped = mapProgress(p); progMap[mapped.topicId] = mapped; });
                setProgress(progMap);
            }
            if (data.attempts) setTestAttempts(data.attempts.map(mapAttempt));
            if (data.goals) setGoals(data.goals.map((g: any) => ({ ...g, completed: g.completed == 1 })));
            if (data.timetable) setTimetable({
                config: data.timetable.config_json ? JSON.parse(data.timetable.config_json) : undefined,
                slots: data.timetable.slots_json ? JSON.parse(data.timetable.slots_json) : []
            });
            
            if (data.userProfileSync) {
                const updatedUser = { ...data.userProfileSync, notifications: data.notifications || [] };
                setUser(updatedUser);
                if (updatedUser.role === 'PARENT' && updatedUser.linkedStudentId) {
                    const sRes = await fetch(`/api/get_dashboard.php?user_id=${updatedUser.linkedStudentId}`);
                    if (sRes.ok) {
                        const sData = await sRes.json();
                        const sProgMap: Record<string, UserProgress> = {};
                        sData.progress?.forEach((p: any) => { const mapped = mapProgress(p); sProgMap[mapped.topicId] = mapped; });
                        setLinkedData({ progress: sProgMap, tests: (sData.attempts || []).map(mapAttempt), studentName: sData.userProfileSync?.name || 'Student' });
                    }
                }
            }
        }
    } catch (e) { console.error("Persistence Sync Failed:", e); }
  }, []);

  useEffect(() => {
    if (user) { loadDashboard(user.id); window.setCurrentScreen = (s: Screen) => setScreen(s); }
  }, [user?.id, loadDashboard]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => { localStorage.setItem('last_screen', currentScreen); }, [currentScreen]);

  const handleLogin = (u: User) => {
    clearState();
    setUser(u);
    setScreen(u.role.includes('ADMIN') ? 'overview' : 'dashboard');
  };

  const handleLogout = () => { setUser(null); clearState(); setScreen('dashboard'); localStorage.clear(); };

  const handleAddTestAttempt = async (attempt: TestAttempt) => {
    setTestAttempts(prev => [attempt, ...prev]);
    if (user && !user.id.startsWith('demo_')) {
        await fetch('/api/save_attempt.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...attempt, user_id: user.id })
        });
    }
  };

  const updateProgress = async (topicId: string, updates: Partial<UserProgress>) => {
    const current = progress[topicId] || { topicId, status: 'NOT_STARTED', lastRevised: null, revisionLevel: 0, nextRevisionDate: null, solvedQuestions: [] };
    const updated = { ...current, ...updates };
    setProgress(prev => ({ ...prev, [topicId]: updated }));
    if (user && !user.id.startsWith('demo_')) {
        await fetch('/api/sync_progress.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, ...updated })
        });
    }
  };

  const handleSaveTimetable = async (config: TimetableConfig, slots: any[]) => {
      setTimetable({ config, slots });
      if (user && !user.id.startsWith('demo_')) {
          await fetch('/api/save_timetable.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: user.id, config, slots })
          });
      }
  };

  const renderContent = () => {
    const isAdminRole = user?.role === 'ADMIN' || user?.role === 'ADMIN_EXECUTIVE';
    switch (currentScreen) {
      case 'dashboard':
      case 'overview':
        return isAdminRole 
          ? <AdminDashboardScreen user={user!} onNavigate={setScreen} />
          : <DashboardScreen user={user!} progress={linkedData?.progress || progress} testAttempts={linkedData?.tests || testAttempts} goals={goals} toggleGoal={id => {}} addGoal={t => {}} setScreen={setScreen} viewingStudentName={linkedData?.studentName} />;
      case 'syllabus':
        return <SyllabusScreen user={user!} subjects={SYLLABUS_DATA} progress={linkedData?.progress || progress} onUpdateProgress={updateProgress} chapterNotes={chapterNotes} videoMap={videoMap} questionBank={questionBank} viewingStudentName={linkedData?.studentName} readOnly={user!.role === 'PARENT'} addTestAttempt={handleAddTestAttempt} testAttempts={linkedData?.tests || testAttempts} />;
      case 'tests':
        return isAdminRole
          ? <AdminTestManagerScreen questionBank={questionBank} tests={tests} syllabus={SYLLABUS_DATA} onAddQuestion={q => {}} onCreateTest={t => {}} onDeleteQuestion={id => {}} onDeleteTest={id => {}} />
          : <TestScreen user={user!} addTestAttempt={handleAddTestAttempt} history={linkedData?.tests || testAttempts} availableTests={tests} />;
      case 'timetable':
        return <TimetableScreen user={user!} savedConfig={timetable.config} savedSlots={timetable.slots} onSave={handleSaveTimetable} progress={progress} />;
      case 'diagnostics': return <DiagnosticsScreen />;
      case 'deployment': return <DeploymentScreen />;
      case 'profile': return <ProfileScreen user={user!} onAcceptRequest={id => {}} onUpdateUser={upd => setUser({...user!, ...upd})} />;
      default: return <DashboardScreen user={user!} progress={progress} testAttempts={testAttempts} goals={[]} toggleGoal={id => {}} addGoal={t => {}} setScreen={setScreen} />;
    }
  };

  if (!user) {
      const publicScreens: Screen[] = ['about', 'blog', 'exams', 'privacy', 'contact', 'features'];
      if (publicScreens.includes(currentScreen)) {
          return (
              <Suspense fallback={<LoadingView />}>
                <PublicLayout onNavigate={p => setScreen(p as Screen)} currentScreen={currentScreen}>
                    {currentScreen === 'about' && <AboutUsScreen />}
                    {currentScreen === 'blog' && <PublicBlogScreen blogs={blogs} onBack={() => setScreen('dashboard')} />}
                    {currentScreen === 'exams' && <ExamGuideScreen />}
                    {currentScreen === 'privacy' && <PrivacyPolicyScreen />}
                    {currentScreen === 'contact' && <ContactUsScreen />}
                    {currentScreen === 'features' && <FeaturesScreen />}
                </PublicLayout>
              </Suspense>
          );
      }
      return <Suspense fallback={<LoadingView />}><AuthScreen onLogin={handleLogin} onNavigate={p => setScreen(p as Screen)} /></Suspense>;
  }

  return (
    <ErrorBoundary>
      <div className="flex bg-slate-50 min-h-screen font-inter">
        <Navigation currentScreen={currentScreen} setScreen={setScreen} logout={handleLogout} user={user} />
        <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
          <Suspense fallback={<LoadingView />}>{renderContent()}</Suspense>
        </main>
        <MobileNavigation currentScreen={currentScreen} setScreen={setScreen} logout={handleLogout} user={user} />
        {user.role === 'STUDENT' && currentScreen !== 'ai-tutor' && <AITutorChat />}
      </div>
    </ErrorBoundary>
  );
};

export default App;
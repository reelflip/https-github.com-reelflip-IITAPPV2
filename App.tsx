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

// --- Lazy Loading Screens for Bundle Separation (v12.25) ---
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

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public props: ErrorBoundaryProps;
  public state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(_error: Error) { return { hasError: true }; }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("App Crash:", error, errorInfo); }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong.</h1>
          <p className="text-slate-500 mb-6">The application crashed. Please refresh to try again.</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200">Refresh App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingView = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p className="text-xs font-bold uppercase tracking-widest">Loading Module...</p>
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
    setProgress({});
    setTestAttempts([]);
    setGoals([]);
    setMistakes([]);
    setBacklogs([]);
    setTimetable({});
    setLinkedData(undefined);
  }, []);

  useEffect(() => {
    if (user) {
        const isAdmin = user.role === 'ADMIN' || user.role === 'ADMIN_EXECUTIVE';
        if (isAdmin && currentScreen === 'dashboard') {
            setScreen('overview');
        } else if (user.role === 'STUDENT' && currentScreen === 'overview') {
            setScreen('dashboard');
        } else if (user.role === 'PARENT' && currentScreen === 'overview') {
            setScreen('dashboard');
        }
    }
  }, [user?.role, currentScreen]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('last_screen', currentScreen);
  }, [currentScreen]);

  const mapProgress = (p: any): UserProgress => ({
    topicId: p.topicId || p.topic_id,
    status: p.status,
    lastRevised: p.lastRevised || p.last_revised,
    revisionLevel: (p.revisionLevel !== undefined ? p.revisionLevel : p.revision_level) || 0,
    nextRevisionDate: p.nextRevisionDate || p.next_revision_date,
    solvedQuestions: p.solvedQuestions || (p.solved_questions_json ? JSON.parse(p.solved_questions_json) : [])
  });

  const mapAttempt = (a: any): TestAttempt => ({
    id: a.id,
    date: a.date,
    title: a.title || 'Mock Test',
    score: Number(a.score),
    totalMarks: Number(a.totalMarks || a.total_marks),
    accuracy: Number(a.accuracy),
    accuracy_percent: Number(a.accuracy_percent || a.accuracy),
    testId: a.testId || a.test_id,
    totalQuestions: Number(a.totalQuestions || a.total_questions),
    correctCount: Number(a.correctCount || a.correct_count),
    incorrectCount: Number(a.incorrectCount || a.incorrect_count),
    unattemptedCount: Number(a.unattemptedCount || a.unattempted_count),
    topicId: a.topicId || a.topic_id,
    difficulty: a.difficulty,
    detailedResults: a.detailedResults || (a.detailed_results ? JSON.parse(a.detailed_results) : [])
  });

  const loadDashboard = useCallback(async (userId: string) => {
    try {
        const res = await fetch(`/api/get_dashboard.php?user_id=${userId}`);
        if (res.ok) {
            const data = await res.json();
            clearState();

            if (data.progress) {
                const progMap: Record<string, UserProgress> = {};
                data.progress.forEach((p: any) => {
                    const mapped = mapProgress(p);
                    progMap[mapped.topicId] = mapped;
                });
                setProgress(progMap);
            }
            if (data.attempts) setTestAttempts(data.attempts.map(mapAttempt));
            if (data.goals) setGoals(data.goals.map((g: any) => ({ ...g, completed: g.completed == 1 })));
            if (data.mistakes) setMistakes(data.mistakes);
            if (data.backlogs) setBacklogs(data.backlogs);
            if (data.timetable) setTimetable(data.timetable);
            if (data.notifications && data.userProfileSync) {
                const updatedUser = { ...data.userProfileSync, notifications: data.notifications };
                setUser(updatedUser);

                if (updatedUser.role === 'PARENT' && updatedUser.linkedStudentId) {
                    const sRes = await fetch(`/api/get_dashboard.php?user_id=${updatedUser.linkedStudentId}`);
                    const psychRes = await fetch(`/api/get_psychometric.php?user_id=${updatedUser.linkedStudentId}`);
                    
                    if (sRes.ok) {
                        const sData = await sRes.json();
                        const sProgMap: Record<string, UserProgress> = {};
                        sData.progress?.forEach((p: any) => {
                           const mapped = mapProgress(p);
                           sProgMap[mapped.topicId] = mapped;
                        });
                        
                        let psychReport;
                        if (psychRes.ok) {
                            const pData = await psychRes.json();
                            psychReport = pData.report;
                        }

                        setLinkedData({
                            progress: sProgMap,
                            tests: (sData.attempts || []).map(mapAttempt),
                            studentName: sData.userProfileSync?.name || 'Student',
                            psychReport
                        });
                    }
                }
            }
        }
    } catch (e) { console.error(e); }
  }, [clearState]);

  useEffect(() => {
    if (user) {
        loadDashboard(user.id);
        window.setCurrentScreen = (s: Screen) => setScreen(s);
    }
  }, [user?.id, loadDashboard]);

  useEffect(() => {
      const loadGlobalContent = async () => {
          try {
              const [bRes, fRes, hRes, nRes] = await Promise.all([
                  fetch('/api/manage_content.php?type=blog'),
                  fetch('/api/manage_content.php?type=flashcard'),
                  fetch('/api/manage_content.php?type=hack'),
                  fetch('/api/manage_notes.php')
              ]);
              if(bRes.ok) setBlogs((await bRes.json()).map((b: any) => ({ ...JSON.parse(b.content_json), id: b.id, date: b.created_at })));
              if(fRes.ok) setFlashcards((await fRes.json()).map((f: any) => ({ ...JSON.parse(f.content_json), id: f.id })));
              if(hRes.ok) setHacks((await hRes.json()).map((h: any) => ({ ...JSON.parse(h.content_json), id: h.id })));
              if(nRes.ok) setChapterNotes(await nRes.json());
          } catch(e) {}
      };
      loadGlobalContent();
  }, []);

  const handleLogin = (u: User) => {
    clearState();
    setUser(u);
    const isAdmin = u.role === 'ADMIN' || u.role === 'ADMIN_EXECUTIVE';
    setScreen(isAdmin ? 'overview' : 'dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    clearState();
    setScreen('dashboard');
    localStorage.clear();
  };

  const handleAcceptRequest = async (notificationId: string) => {
    if (!user) return;
    try {
        const res = await fetch('/api/respond_request.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notification_id: notificationId, action: 'ACCEPT' })
        });
        if (res.ok) {
            loadDashboard(user.id);
            alert("Request Accepted! Account is now linked.");
        }
    } catch (e) {
        alert("Failed to respond to request.");
    }
  };

  const handleAddTestAttempt = async (attempt: TestAttempt) => {
    setTestAttempts(prev => [attempt, ...prev]);
    if (user && !user.id.startsWith('demo_')) {
        try {
            await fetch('/api/save_attempt.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...attempt, user_id: user.id })
            });
        } catch (e) {}
    }
  };

  const updateProgress = async (topicId: string, updates: Partial<UserProgress>) => {
    const current = progress[topicId] || { topicId, status: 'NOT_STARTED', lastRevised: null, revisionLevel: 0, nextRevisionDate: null, solvedQuestions: [] };
    const updated = { ...current, ...updates };
    if (updates.status === 'COMPLETED' && !updated.nextRevisionDate) {
        updated.lastRevised = new Date().toISOString();
        updated.nextRevisionDate = calculateNextRevision(0, updated.lastRevised);
    }
    setProgress(prev => ({ ...prev, [topicId]: updated }));
    if (user && !user.id.startsWith('demo_')) {
        try {
            await fetch('/api/sync_progress.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, ...updated })
            });
        } catch (e) {}
    }
  };

  const handleRevisionComplete = (topicId: string) => {
    const current = progress[topicId];
    if (!current) return;
    const nextLevel = Math.min(current.revisionLevel + 1, 4);
    const lastRevised = new Date().toISOString();
    const nextRevisionDate = calculateNextRevision(nextLevel, lastRevised);
    updateProgress(topicId, { revisionLevel: nextLevel, lastRevised, nextRevisionDate });
  };

  const toggleGoal = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newState = !goal.completed;
    setGoals(goals.map(g => g.id === id ? { ...g, completed: newState } : g));
    try { await fetch('/api/manage_goals.php', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, completed: newState }) }); } catch(e) {}
  };

  const addGoal = async (text: string) => {
    const newGoal: Goal = { id: `g_${Date.now()}`, text, completed: false };
    setGoals([...goals, newGoal]);
    if (user) {
        try { await fetch('/api/manage_goals.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newGoal, user_id: user.id }) }); } catch(e) {}
    }
  };

  const handleSendRequest = async (studentId: string) => {
    if (!user) return { success: false, message: 'Not logged in' };
    try {
        const res = await fetch('/api/send_request.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from_id: user.id, from_name: user.name, to_id: studentId })
        });
        return await res.json();
    } catch (e) {
        return { success: false, message: 'Connection Error' };
    }
  };

  if (!user) {
      const publicScreens: Screen[] = ['about', 'blog', 'exams', 'privacy', 'contact', 'features'];
      if (publicScreens.includes(currentScreen)) {
          return (
              <Suspense fallback={<LoadingView />}>
                {/* Fix: Wrapped setScreen call with explicit cast to Screen to resolve Type incompatibility error with onNavigate */}
                <PublicLayout onNavigate={(p) => setScreen(p as Screen)} currentScreen={currentScreen}>
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
      {/* Fix: Wrapped setScreen call with explicit cast to Screen to resolve Type incompatibility error with onNavigate */}
      return <Suspense fallback={<LoadingView />}><AuthScreen onLogin={handleLogin} onNavigate={(p) => setScreen(p as Screen)} /></Suspense>;
  }

  const isAdminRole = user.role === 'ADMIN' || user.role === 'ADMIN_EXECUTIVE';

  const renderContent = () => {
    switch (currentScreen) {
      case 'dashboard':
      case 'overview':
        return isAdminRole 
          ? <AdminDashboardScreen user={user} onNavigate={setScreen} messageCount={0} />
          : <DashboardScreen user={user} progress={linkedData?.progress || progress} testAttempts={linkedData?.tests || testAttempts} goals={goals} toggleGoal={goal => toggleGoal(goal)} addGoal={addGoal} setScreen={setScreen} viewingStudentName={linkedData?.studentName} linkedPsychReport={linkedData?.psychReport} />;
      case 'syllabus':
        return <SyllabusScreen user={user} subjects={SYLLABUS_DATA} progress={linkedData?.progress || progress} onUpdateProgress={updateProgress} chapterNotes={chapterNotes} videoMap={videoMap} questionBank={questionBank} viewingStudentName={linkedData?.studentName} readOnly={user.role === 'PARENT'} addTestAttempt={handleAddTestAttempt} testAttempts={linkedData?.tests || testAttempts} />;
      case 'tests':
        return isAdminRole
          ? <AdminTestManagerScreen questionBank={questionBank} tests={tests} syllabus={SYLLABUS_DATA} onAddQuestion={(q) => setQuestionBank([...questionBank, q])} onCreateTest={(t) => setTests([...tests, t])} onDeleteQuestion={(id) => setQuestionBank(questionBank.filter(q => q.id !== id))} onDeleteTest={(id) => setTests(tests.filter(t => t.id !== id))} />
          : <TestScreen user={user} addTestAttempt={handleAddTestAttempt} history={linkedData?.tests || testAttempts} availableTests={tests} />;
      case 'analytics':
        return isAdminRole ? <AdminAnalyticsScreen /> : <AnalyticsScreen user={user} progress={linkedData?.progress || progress} testAttempts={linkedData?.tests || testAttempts} viewingStudentName={linkedData?.studentName} />;
      case 'timetable':
        return <TimetableScreen user={user} savedConfig={timetable.config} savedSlots={timetable.slots} onSave={(c, s) => setTimetable({ config: c, slots: s })} />;
      case 'revision':
        return <RevisionScreen progress={progress} handleRevisionComplete={handleRevisionComplete} />;
      case 'mistakes':
        return <MistakesScreen mistakes={mistakes} addMistake={(m) => setMistakes([...mistakes, { ...m, id: `m_${Date.now()}`, date: new Date().toISOString() }])} />;
      case 'flashcards':
        return <FlashcardScreen flashcards={flashcards} />;
      case 'backlogs':
        return <BacklogScreen backlogs={backlogs} onAddBacklog={(b) => setBacklogs([...backlogs, { ...b, id: `b_${Date.now()}`, status: 'PENDING' }])} onToggleBacklog={(id) => setBacklogs(backlogs.map(b => b.id === id ? { ...b, status: b.status === 'PENDING' ? 'COMPLETED' : 'PENDING' } : b))} onDeleteBacklog={(id) => setBacklogs(backlogs.filter(b => b.id !== id))} />;
      case 'hacks':
        return <HacksScreen hacks={hacks} />;
      case 'wellness':
        return <WellnessScreen />;
      case 'profile':
        return <ProfileScreen user={user} onAcceptRequest={handleAcceptRequest} onUpdateUser={(upd) => setUser({ ...user, ...upd })} linkedStudentName={linkedData?.studentName} />;
      case 'psychometric':
        return <PsychometricScreen user={user} />;
      case 'family':
        return <ParentFamilyScreen user={user} onSendRequest={handleSendRequest} linkedData={linkedData} />;
      case 'users':
        return <AdminUserManagementScreen />;
      case 'inbox':
        return <AdminInboxScreen />;
      case 'syllabus_admin':
        return <AdminSyllabusScreen syllabus={SYLLABUS_DATA} onAddTopic={() => {}} onDeleteTopic={() => {}} chapterNotes={chapterNotes} onUpdateNotes={(id, p) => setChapterNotes({...chapterNotes, [id]: { id: 0, topicId: id, pages: p, lastUpdated: new Date().toISOString() }})} />;
      case 'content':
        return <ContentManagerScreen flashcards={flashcards} hacks={hacks} blogs={blogs} onAddFlashcard={(c) => setFlashcards([...flashcards, { ...c, id: Date.now() }])} onAddHack={(h) => setHacks([...hacks, { ...h, id: Date.now() }])} onAddBlog={(b) => setBlogs([...blogs, { ...b, id: Date.now(), date: new Date().toISOString() }])} onDelete={() => {}} />;
      case 'blog_admin':
        return <AdminBlogScreen blogs={blogs} onAddBlog={(b) => setBlogs([...blogs, b])} onDeleteBlog={(id) => setBlogs(blogs.filter(b => b.id !== id))} />;
      case 'diagnostics':
        return <DiagnosticsScreen />;
      case 'deployment':
        return <DeploymentScreen />;
      case 'system':
        return <AdminSystemScreen />;
      case 'ai-tutor':
        return <AITutorChat isFullScreen={true} />;
      default:
        return isAdminRole ? <AdminDashboardScreen user={user} onNavigate={setScreen} /> : <DashboardScreen user={user} progress={progress} testAttempts={testAttempts} goals={goals} toggleGoal={goal => toggleGoal(goal)} addGoal={addGoal} setScreen={setScreen} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex bg-slate-50 min-h-screen font-inter">
        <Navigation currentScreen={currentScreen} setScreen={setScreen} logout={handleLogout} user={user} />
        <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full">
          <Suspense fallback={<LoadingView />}>
            {user && renderContent()}
          </Suspense>
        </main>
        <MobileNavigation currentScreen={currentScreen} setScreen={setScreen} logout={handleLogout} user={user!} />
        {user && user.role === 'STUDENT' && currentScreen !== 'ai-tutor' && <AITutorChat />}
      </div>
    </ErrorBoundary>
  );
};

export default App;

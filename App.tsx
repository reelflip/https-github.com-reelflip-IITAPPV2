
import React, { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { Navigation, MobileNavigation } from './components/Navigation';
import { AuthScreen } from './screens/AuthScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { SyllabusScreen } from './screens/SyllabusScreen';
import { RevisionScreen } from './screens/RevisionScreen';
import { TimetableScreen } from './screens/TimetableScreen';
import { TestScreen } from './screens/TestScreen';
import { FlashcardScreen } from './screens/FlashcardScreen';
import { MistakesScreen } from './screens/MistakesScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { FocusScreen } from './screens/FocusScreen';
import { WellnessScreen } from './screens/WellnessScreen';
import { BacklogScreen } from './screens/BacklogScreen';
import { HacksScreen } from './screens/HacksScreen';
import { PsychometricScreen } from './screens/PsychometricScreen';
import { AdminUserManagementScreen } from './screens/AdminUserManagementScreen';
import { AdminInboxScreen } from './screens/AdminInboxScreen';
import { AdminSyllabusScreen } from './screens/AdminSyllabusScreen';
import { AdminTestManagerScreen } from './screens/AdminTestManagerScreen';
import { AdminAnalyticsScreen } from './screens/AdminAnalyticsScreen';
import { AdminSystemScreen } from './screens/AdminSystemScreen';
import { DeploymentScreen } from './screens/DeploymentScreen';
import { ContentManagerScreen } from './screens/ContentManagerScreen';
import { AdminBlogScreen } from './screens/AdminBlogScreen';
import { PublicBlogScreen } from './screens/PublicBlogScreen';
import { AboutUsScreen } from './screens/AboutUsScreen';
import { ExamGuideScreen } from './screens/ExamGuideScreen';
import { ContactUsScreen } from './screens/ContactUsScreen';
import { PrivacyPolicyScreen } from './screens/PrivacyPolicyScreen';
import { FeaturesScreen } from './screens/FeaturesScreen';
import { ParentFamilyScreen } from './screens/ParentFamilyScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { VideoManagerScreen } from './screens/VideoManagerScreen';
import { AITutorChat } from './components/AITutorChat';
import { PublicLayout } from './components/PublicLayout';
import { 
  User, UserProgress, TestAttempt, Goal, MistakeLog, BacklogItem, 
  Flashcard, MemoryHack, BlogPost, Screen, Test, Question, 
  Topic, TimetableConfig, ChapterNote, VideoLesson 
} from './lib/types';
import { SYLLABUS_DATA } from './lib/syllabusData';
import { calculateNextRevision } from './lib/utils';
import { MOCK_TESTS_DATA, generateInitialQuestionBank } from './lib/mockTestsData';

// Error Boundary for UI Resilience
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("App Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong.</h1>
          <p className="text-slate-500 mb-4">The application crashed. Please refresh to try again.</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Refresh App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Fix: Completed App.tsx and provided default export to satisfy index.tsx import
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentScreen, setScreen] = useState<Screen>('dashboard');
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
  
  // Parent View Support
  const [linkedData, setLinkedData] = useState<{ progress: Record<string, UserProgress>, tests: TestAttempt[], studentName: string } | undefined>();

  // Helper to sync state to localStorage for offline persistence
  useEffect(() => {
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        localStorage.removeItem('user');
    }
  }, [user]);

  // Load Initial Dashboard Data
  const loadDashboard = useCallback(async (userId: string) => {
    try {
        const res = await fetch(`/api/get_dashboard.php?user_id=${userId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.progress) {
                const progMap: Record<string, UserProgress> = {};
                data.progress.forEach((p: any) => {
                    progMap[p.topic_id] = {
                        topicId: p.topic_id,
                        status: p.status,
                        lastRevised: p.last_revised,
                        revisionLevel: p.revision_level,
                        nextRevisionDate: p.next_revision_date,
                        solvedQuestions: p.solved_questions_json ? JSON.parse(p.solved_questions_json) : []
                    };
                });
                setProgress(progMap);
            }
            if (data.attempts) setTestAttempts(data.attempts);
            if (data.goals) setGoals(data.goals.map((g: any) => ({ ...g, completed: g.completed == 1 })));
            if (data.mistakes) setMistakes(data.mistakes);
            if (data.backlogs) setBacklogs(data.backlogs);
            if (data.timetable) setTimetable(data.timetable);
            if (data.notifications && data.userProfileSync) {
                setUser({ ...data.userProfileSync, notifications: data.notifications });
            }
        }
    } catch (e) {
        console.error("Failed to load dashboard", e);
    }
  }, []);

  useEffect(() => {
    if (user) {
        loadDashboard(user.id);
        // Expose screen switcher for diagnostics
        window.setCurrentScreen = setScreen;
    }
  }, [user?.id, loadDashboard]);

  // Public content load
  useEffect(() => {
      const loadContent = async () => {
          try {
              const [bRes, fRes, hRes, nRes, vRes] = await Promise.all([
                  fetch('/api/manage_content.php?type=blog'),
                  fetch('/api/manage_content.php?type=flashcard'),
                  fetch('/api/manage_content.php?type=hack'),
                  fetch('/api/manage_notes.php'),
                  fetch('/api/manage_videos.php')
              ]);
              if(bRes.ok) {
                  const bData = await bRes.json();
                  setBlogs(bData.map((b: any) => ({ ...JSON.parse(b.content_json), id: b.id, date: b.created_at })));
              }
              if(fRes.ok) {
                  const fData = await fRes.json();
                  setFlashcards(fData.map((f: any) => ({ ...JSON.parse(f.content_json), id: f.id })));
              }
              if(hRes.ok) {
                  const hData = await hRes.json();
                  setHacks(hData.map((h: any) => ({ ...JSON.parse(h.content_json), id: h.id })));
              }
              if(nRes.ok) setChapterNotes(await nRes.json());
              // Video loading logic usually returns a map from manage_videos.php or similar
          } catch(e) {}
      };
      loadContent();
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setScreen('dashboard');
    localStorage.clear();
  };

  const updateProgress = async (topicId: string, updates: Partial<UserProgress>) => {
    const current = progress[topicId] || { topicId, status: 'NOT_STARTED', lastRevised: null, revisionLevel: 0, nextRevisionDate: null, solvedQuestions: [] };
    const updated = { ...current, ...updates };
    
    // Auto-calculate revision if status changed to COMPLETED
    if (updates.status === 'COMPLETED' && !updated.nextRevisionDate) {
        updated.lastRevised = new Date().toISOString();
        updated.nextRevisionDate = calculateNextRevision(0, updated.lastRevised);
    }

    setProgress(prev => ({ ...prev, [topicId]: updated }));

    if (user) {
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

    updateProgress(topicId, {
        revisionLevel: nextLevel,
        lastRevised,
        nextRevisionDate
    });
  };

  const toggleGoal = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newState = !goal.completed;
    setGoals(goals.map(g => g.id === id ? { ...g, completed: newState } : g));
    try {
        await fetch('/api/manage_goals.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, completed: newState })
        });
    } catch(e) {}
  };

  const addGoal = async (text: string) => {
    const newGoal: Goal = { id: `g_${Date.now()}`, text, completed: false };
    setGoals([...goals, newGoal]);
    if (user) {
        try {
            await fetch('/api/manage_goals.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newGoal, user_id: user.id })
            });
        } catch(e) {}
    }
  };

  const addMistake = async (m: Omit<MistakeLog, 'id' | 'date'>) => {
    const newMistake: MistakeLog = { ...m, id: `m_${Date.now()}`, date: new Date().toISOString() };
    setMistakes([newMistake, ...mistakes]);
    if (user) {
        try {
            await fetch('/api/manage_mistakes.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newMistake, user_id: user.id })
            });
        } catch(e) {}
    }
  };

  const addBacklog = async (item: Omit<BacklogItem, 'id' | 'status'>) => {
    const newItem: BacklogItem = { ...item, id: `b_${Date.now()}`, status: 'PENDING' };
    setBacklogs([...backlogs, newItem]);
    if (user) {
        try {
            await fetch('/api/manage_backlogs.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newItem, user_id: user.id })
            });
        } catch(e) {}
    }
  };

  const deleteBacklog = async (id: string) => {
      setBacklogs(backlogs.filter(b => b.id !== id));
      try { await fetch(`/api/manage_backlogs.php?id=${id}`, { method: 'DELETE' }); } catch(e) {}
  };

  const handleAcceptRequest = async (notifId: string) => {
      const notif = user?.notifications?.find(n => n.id === notifId);
      if(!notif || !user) return;
      try {
          const res = await fetch('/api/respond_request.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accept: true, student_id: user.id, parent_id: notif.fromId, notification_id: notifId })
          });
          if(res.ok) {
              setUser({ ...user, parentId: notif.fromId, notifications: user.notifications?.filter(n => n.id !== notifId) });
              alert("Connected to parent!");
          }
      } catch(e) {}
  };

  const sendParentRequest = async (studentId: string) => {
      if(!user) return { success: false, message: 'Not logged in' };
      try {
          const res = await fetch('/api/send_request.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'send', student_identifier: studentId, parent_id: user.id, parent_name: user.name })
          });
          const data = await res.json();
          return { success: res.ok, message: data.message };
      } catch(e) { return { success: false, message: 'Network error' }; }
  };

  // --- Rendering Logic ---

  if (!user) {
      // Handle Public/Auth Routing
      const publicScreens: Screen[] = ['about', 'blog', 'exams', 'privacy', 'contact', 'features'];
      if (publicScreens.includes(currentScreen)) {
          return (
              <PublicLayout onNavigate={setScreen} currentScreen={currentScreen}>
                  {currentScreen === 'about' && <AboutUsScreen />}
                  {currentScreen === 'blog' && <PublicBlogScreen blogs={blogs} onBack={() => setScreen('dashboard')} />}
                  {currentScreen === 'exams' && <ExamGuideScreen />}
                  {currentScreen === 'privacy' && <PrivacyPolicyScreen />}
                  {currentScreen === 'contact' && <ContactUsScreen />}
                  {currentScreen === 'features' && <FeaturesScreen />}
              </PublicLayout>
          );
      }
      return <AuthScreen onLogin={handleLogin} onNavigate={setScreen} />;
  }

  // Multi-role Dashboard Matrix
  const renderContent = () => {
    switch (currentScreen) {
      case 'dashboard':
      case 'overview':
        return user.role === 'ADMIN' || user.role === 'ADMIN_EXECUTIVE' 
          ? <AdminDashboardScreen user={user} onNavigate={setScreen} messageCount={0} />
          : <DashboardScreen user={user} progress={progress} testAttempts={testAttempts} goals={goals} toggleGoal={toggleGoal} addGoal={addGoal} setScreen={setScreen} />;
      
      case 'syllabus':
        return <SyllabusScreen user={user} subjects={SYLLABUS_DATA} progress={progress} onUpdateProgress={updateProgress} chapterNotes={chapterNotes} videoMap={videoMap} questionBank={questionBank} />;
      
      case 'tests':
        return <TestScreen user={user} addTestAttempt={(a) => setTestAttempts([...testAttempts, a])} history={testAttempts} availableTests={tests} />;
      
      case 'analytics':
      case 'admin_analytics':
        return user.role === 'ADMIN' ? <AdminAnalyticsScreen /> : <AnalyticsScreen user={user} progress={progress} testAttempts={testAttempts} />;
      
      case 'timetable':
        return <TimetableScreen user={user} savedConfig={timetable.config} savedSlots={timetable.slots} onSave={(c, s) => setTimetable({ config: c, slots: s })} />;
      
      case 'revision':
        return <RevisionScreen progress={progress} handleRevisionComplete={handleRevisionComplete} />;
      
      case 'mistakes':
        return <MistakesScreen mistakes={mistakes} addMistake={addMistake} />;
      
      case 'flashcards':
        return <FlashcardScreen flashcards={flashcards} />;
      
      case 'backlogs':
        return <BacklogScreen backlogs={backlogs} onAddBacklog={addBacklog} onToggleBacklog={(id) => setBacklogs(backlogs.map(b => b.id === id ? { ...b, status: b.status === 'PENDING' ? 'COMPLETED' : 'PENDING' } : b))} onDeleteBacklog={deleteBacklog} />;
      
      case 'hacks':
        return <HacksScreen hacks={hacks} />;
      
      case 'wellness':
        return <WellnessScreen />;
      
      case 'profile':
        return <ProfileScreen user={user} onAcceptRequest={handleAcceptRequest} onUpdateUser={(upd) => setUser({ ...user, ...upd })} />;
      
      case 'psychometric':
        return <PsychometricScreen user={user} />;
      
      case 'family':
        return <ParentFamilyScreen user={user} onSendRequest={sendParentRequest} linkedData={linkedData} />;

      // Admin Only Screens
      case 'users':
        return <AdminUserManagementScreen />;
      case 'inbox':
        return <AdminInboxScreen />;
      case 'syllabus_admin':
        return <AdminSyllabusScreen syllabus={SYLLABUS_DATA} onAddTopic={() => {}} onDeleteTopic={() => {}} chapterNotes={chapterNotes} onUpdateNotes={(id, p) => setChapterNotes({...chapterNotes, [id]: { id: 0, topicId: id, pages: p, lastUpdated: new Date().toISOString() }})} />;
      case 'content':
      case 'content_admin':
        return <ContentManagerScreen flashcards={flashcards} hacks={hacks} blogs={blogs} onAddFlashcard={(c) => setFlashcards([...flashcards, { ...c, id: Date.now() }])} onAddHack={(h) => setHacks([...hacks, { ...h, id: Date.now() }])} onAddBlog={(b) => setBlogs([...blogs, { ...b, id: Date.now(), date: new Date().toISOString() }])} onDelete={() => {}} />;
      case 'blog_admin':
        return <AdminBlogScreen blogs={blogs} onAddBlog={(b) => setBlogs([...blogs, b])} onDeleteBlog={(id) => setBlogs(blogs.filter(b => b.id !== id))} />;
      case 'diagnostics':
        return <DeploymentScreen />; // Diagnostics tool combined in Deployment
      case 'system':
        return <AdminSystemScreen />;
      case 'deployment':
        return <DeploymentScreen />;
      case 'ai-tutor':
        return <AITutorChat isFullScreen={true} />;

      default:
        return <DashboardScreen user={user} progress={progress} testAttempts={testAttempts} goals={goals} toggleGoal={toggleGoal} addGoal={addGoal} setScreen={setScreen} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex bg-slate-50 min-h-screen">
        <Navigation currentScreen={currentScreen} setScreen={setScreen} logout={handleLogout} user={user} />
        <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
          {renderContent()}
        </main>
        <MobileNavigation currentScreen={currentScreen} setScreen={setScreen} logout={handleLogout} user={user} />
        {currentScreen !== 'ai-tutor' && <AITutorChat />}
      </div>
    </ErrorBoundary>
  );
};

export default App;

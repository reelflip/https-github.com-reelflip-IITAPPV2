
import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, MobileNavigation } from './components/Navigation';
import { AuthScreen } from './screens/AuthScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { SyllabusScreen } from './screens/SyllabusScreen';
import { RevisionScreen } from './screens/RevisionScreen';
import { TestScreen } from './screens/TestScreen';
import { TimetableScreen } from './screens/TimetableScreen';
import { FlashcardScreen } from './screens/FlashcardScreen';
import { MistakesScreen } from './screens/MistakesScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';
import { DeploymentScreen } from './screens/DeploymentScreen';
import { ContentManagerScreen } from './screens/ContentManagerScreen';
import { HacksScreen } from './screens/HacksScreen';
import { PublicBlogScreen } from './screens/PublicBlogScreen';
import { ParentFamilyScreen } from './screens/ParentFamilyScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { VideoManagerScreen } from './screens/VideoManagerScreen';
import { AdminTestManagerScreen } from './screens/AdminTestManagerScreen';
import { AdminUserManagementScreen } from './screens/AdminUserManagementScreen';
import { AdminSyllabusScreen } from './screens/AdminSyllabusScreen';
import { AdminBlogScreen } from './screens/AdminBlogScreen';
import { AdminInboxScreen } from './screens/AdminInboxScreen';
import { AdminAnalyticsScreen } from './screens/AdminAnalyticsScreen';
import { AdminSystemScreen } from './screens/AdminSystemScreen';
import { AboutUsScreen } from './screens/AboutUsScreen';
import { ContactUsScreen } from './screens/ContactUsScreen';
import { ExamGuideScreen } from './screens/ExamGuideScreen';
import { PrivacyPolicyScreen } from './screens/PrivacyPolicyScreen';
import { FeaturesScreen } from './screens/FeaturesScreen';
import { FocusScreen } from './screens/FocusScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { WellnessScreen } from './screens/WellnessScreen';
import { BacklogScreen } from './screens/BacklogScreen'; 
import { PsychometricScreen } from './screens/PsychometricScreen';
import { PublicLayout } from './components/PublicLayout';
import { AITutorChat } from './components/AITutorChat';
import { User, UserProgress, TopicStatus, TestAttempt, Screen, Goal, MistakeLog, Flashcard, MemoryHack, BlogPost, VideoLesson, Question, Test, TimetableConfig, Topic, ContactMessage, BacklogItem, TopicNote, ChapterNote, SocialConfig } from './lib/types';
import { calculateNextRevision } from './lib/utils';
import { SYLLABUS_DATA } from './lib/syllabusData';
import { DEFAULT_CHAPTER_NOTES } from './lib/chapterContent';
import { MOCK_TESTS_DATA, generateInitialQuestionBank } from './lib/mockTestsData';
import { TrendingUp, Bell, LogOut, Cloud, CloudOff, RefreshCw, Check, WifiOff, AlertTriangle } from 'lucide-react';

const APP_VERSION = '12.22';

const ComingSoonScreen = ({ title, icon }: { title: string, icon: string }) => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
    <p className="text-slate-500 max-w-md">This feature is available in the Pro version or is currently under development.</p>
  </div>
);

// --- Sync Status Component ---
const SyncIndicator = ({ status, onRetry }: { status: 'SYNCED' | 'SAVING' | 'ERROR' | 'OFFLINE', onRetry: () => void }) => {
    if (status === 'SYNCED') return (
        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-[10px] font-bold border border-green-200" title="Data Saved to Cloud">
            <Cloud className="w-3 h-3" /> <span>Synced</span>
        </div>
    );
    if (status === 'SAVING') return (
        <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-[10px] font-bold border border-blue-200" title="Saving...">
            <RefreshCw className="w-3 h-3 animate-spin" /> <span>Saving...</span>
        </div>
    );
    if (status === 'OFFLINE') return (
        <div className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded text-[10px] font-bold border border-slate-200 cursor-help" title="Offline Mode: Backend not found. Data saved locally.">
            <WifiOff className="w-3 h-3" /> <span>Offline Mode</span>
        </div>
    );
    return (
        <button onClick={onRetry} className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-[10px] font-bold border border-red-200 hover:bg-red-100 cursor-pointer" title="Sync Failed. Click to Retry.">
            <CloudOff className="w-3 h-3" /> <span>Retry Sync</span>
        </button>
    );
};

// --- Screen Validation Helper ---
const validateScreen = (role: string, screen: Screen): Screen => {
    const studentScreens: Screen[] = [
        'dashboard', 'syllabus', 'ai-tutor', 'tests', 'psychometric', 'focus', 
        'analytics', 'timetable', 'revision', 'mistakes', 'flashcards', 'backlogs', 
        'hacks', 'wellness', 'profile', 'exams'
    ];
    const parentScreens: Screen[] = [
        'dashboard', 'family', 'analytics', 'tests', 'syllabus', 'profile'
    ];
    const adminScreens: Screen[] = [
        'overview', 'users', 'syllabus_admin', 'inbox', 'content_admin', 'content', 
        'blog_admin', 'tests', 'tests_admin', 'analytics', 'diagnostics', 'system', 'deployment'
    ];
    const publicScreens: Screen[] = [
        'about', 'contact', 'exams', 'blog', 'public-blog', 'privacy', 'features'
    ];

    if (publicScreens.includes(screen)) return screen;

    switch (role) {
        case 'STUDENT': return studentScreens.includes(screen) ? screen : 'dashboard';
        case 'PARENT': return parentScreens.includes(screen) ? screen : 'dashboard';
        case 'ADMIN': return adminScreens.includes(screen) ? screen : 'overview';
        default: return 'dashboard';
    }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
      const saved = localStorage.getItem('iitjee_last_screen');
      return (saved as Screen) || 'dashboard';
  });

  const [enableGoogleLogin, setEnableGoogleLogin] = useState(false);
  const [gaMeasurementId, setGaMeasurementId] = useState<string | null>(null);
  const [socialConfig, setSocialConfig] = useState<SocialConfig>({ enabled: false });
  
  // Data State
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mistakes, setMistakes] = useState<MistakeLog[]>([]);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>([]);
  const [timetableData, setTimetableData] = useState<{config: TimetableConfig, slots: any[]} | null>(null);
  const [syllabus, setSyllabus] = useState<Topic[]>(SYLLABUS_DATA);
  const [linkedStudentData, setLinkedStudentData] = useState<{ progress: Record<string, UserProgress>; tests: TestAttempt[]; studentName: string; } | undefined>(undefined);
  
  // Sync State
  const [syncStatus, setSyncStatus] = useState<'SYNCED' | 'SAVING' | 'ERROR' | 'OFFLINE'>('SYNCED');
  const [syncErrorMsg, setSyncErrorMsg] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([
     { id: 1, front: "Newton's Second Law", back: "F = ma\n(Force equals mass times acceleration.)", subjectId: 'phys' },
     { id: 2, front: "Integration of sin(x)", back: "-cos(x) + C", subjectId: 'math' },
     { id: 3, front: "Escape Velocity Formula", back: "v = √(2GM/R)", subjectId: 'phys' },
     { id: 4, front: "Ideal Gas Equation", back: "PV = nRT", subjectId: 'chem' }
  ]);

  const [hacks, setHacks] = useState<MemoryHack[]>([
     { id: 1, title: 'Trig Values', description: 'Remember Sine, Cosine, Tangent ratios', tag: 'Maths', subjectId: 'math', trick: 'SOH CAH TOA' },
     { id: 2, title: 'Resistor Color Codes', description: 'Resistance values', tag: 'Physics', subjectId: 'phys', trick: 'BB ROY of Great Britain had a Very Good Wife' }
  ]);

  const [blogs, setBlogs] = useState<BlogPost[]>([
     { 
       id: 1, 
       title: 'JEE Main & Advanced 2025: Complete Roadmap', 
       excerpt: 'A strategic month-by-month guide.', 
       content: '<h2>The Foundation</h2><p>Consistency is key.</p>', 
       author: 'System Admin', 
       date: new Date().toISOString(),
       imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
       category: 'Strategy'
     }
  ]);
  
  const [videoMap, setVideoMap] = useState<Record<string, VideoLesson>>({});
  const [chapterNotes, setChapterNotes] = useState<Record<string, ChapterNote>>(() => {
      const defaults: Record<string, ChapterNote> = {};
      Object.entries(DEFAULT_CHAPTER_NOTES).forEach(([topicId, data], index) => {
          defaults[topicId] = {
              id: 1000 + index,
              topicId: topicId,
              pages: data.pages,
              lastUpdated: new Date().toISOString()
          };
      });
      return defaults;
  });
  
  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [adminTests, setAdminTests] = useState<Test[]>(MOCK_TESTS_DATA);

  // --- Central API Handler ---
  const apiCall = useCallback(async (endpoint: string, method: string, body?: any) => {
      if (isOfflineMode) return { status: 'success', offline: true };
      if (!user) return;
      setSyncStatus('SAVING');
      try {
          const res = await fetch(endpoint, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: body ? JSON.stringify(body) : undefined
          });
          if (!res.ok) {
              if (res.status === 404) {
                  setIsOfflineMode(true);
                  setSyncStatus('OFFLINE');
                  return { status: 'success', offline: true };
              }
              throw new Error(`HTTP ${res.status}`);
          }
          const data = await res.json();
          setSyncStatus('SYNCED');
          setSyncErrorMsg(null);
          return data;
      } catch (error) {
          setIsOfflineMode(true);
          setSyncStatus('OFFLINE');
          return { status: 'success', offline: true };
      }
  }, [user, isOfflineMode]);

  useEffect(() => {
      const storedVersion = localStorage.getItem('iitjee_app_version');
      if (storedVersion !== APP_VERSION) {
          localStorage.removeItem('iitjee_admin_tests');
          localStorage.setItem('iitjee_app_version', APP_VERSION);
          setAdminTests(MOCK_TESTS_DATA);
      }
      fetch('/api/track_visit.php').catch(() => {});
  }, []);

  useEffect(() => {
      if (user) {
          const safeScreen = validateScreen(user.role, currentScreen);
          if (safeScreen !== currentScreen) {
              setCurrentScreen(safeScreen);
          }
      }
  }, [user, currentScreen]);

  useEffect(() => {
      if (user) {
          localStorage.setItem('iitjee_last_screen', currentScreen);
      }
  }, [currentScreen, user]);

  useEffect(() => {
      const loadLinkedData = async () => {
          if (user?.role === 'PARENT' && user.linkedStudentId) {
              await loadLinkedStudent(user.linkedStudentId);
          }
      };
      loadLinkedData();
  }, [user?.linkedStudentId, user?.role]);

  const loadLinkedStudent = async (studentId: string) => {
      try {
          const res = await fetch(`/api/get_dashboard.php?user_id=${studentId}`);
          if(res.ok) {
              const data = await res.json();
              const progMap: Record<string, UserProgress> = {};
              if(Array.isArray(data.progress)) {
                  data.progress.forEach((p: any) => {
                      const id = p.topic_id || p.topicId;
                      if(id) {
                          progMap[id] = {
                              topicId: id,
                              status: p.status,
                              lastRevised: p.last_revised || p.lastRevised,
                              revisionLevel: p.revision_level !== undefined ? parseInt(p.revision_level) : (p.revisionLevel || 0),
                              nextRevisionDate: p.next_revision_date || p.nextRevisionDate,
                              solvedQuestions: p.solved_questions_json ? JSON.parse(p.solved_questions_json) : (p.solvedQuestions || [])
                          };
                      }
                  });
              }
              setLinkedStudentData({
                  progress: progMap,
                  tests: data.attempts || [],
                  studentName: data.userProfileSync ? data.userProfileSync.name : 'Student'
              });
          }
      } catch(e) { console.error("Failed to load linked student data", e); }
  };

  const handleLogin = (userData: User) => {
    const safeScreen = validateScreen(userData.role, currentScreen);
    setCurrentScreen(safeScreen);
    setUser(userData);
    fetchRemoteData(userData.id);
  };

  const handleLogout = () => { 
      setUser(null); 
      setCurrentScreen('dashboard'); 
      localStorage.removeItem('iitjee_user'); 
      setLinkedStudentData(undefined); 
  };
  
  const handleNavigation = (page: string) => { setCurrentScreen(page as Screen); };

  const fetchRemoteData = async (userId: string, retryCount = 0) => {
      setSyncStatus('SAVING'); 
      setSyncErrorMsg(null);
      try {
          const res = await fetch(`/api/get_dashboard.php?user_id=${userId}`);
          if (!res.ok) {
              if (res.status === 404) {
                  setIsOfflineMode(true);
                  setSyncStatus('OFFLINE');
                  return;
              } else if (res.status === 500 && retryCount === 0) {
                  await fetch('/api/migrate_db.php');
                  return fetchRemoteData(userId, 1);
              }
              throw new Error(`HTTP Error ${res.status}`);
          }
          
          const text = await res.text();
          let data = JSON.parse(text);
          if (data.error) throw new Error(data.error);

          if (Array.isArray(data.progress)) {
              const progMap: Record<string, UserProgress> = {};
              data.progress.forEach((p: any) => {
                  const id = p.topic_id || p.topicId;
                  if (id) {
                      progMap[id] = {
                          topicId: id,
                          status: p.status,
                          lastRevised: p.last_revised || p.lastRevised,
                          revisionLevel: p.revision_level !== undefined ? parseInt(p.revision_level) : (p.revisionLevel || 0),
                          nextRevisionDate: p.next_revision_date || p.nextRevisionDate,
                          solvedQuestions: p.solved_questions_json ? JSON.parse(p.solved_questions_json) : (p.solvedQuestions || [])
                      };
                  }
              });
              setProgress(progMap);
          }
          if (data.attempts) setTestAttempts(data.attempts);
          if (data.goals) setGoals(data.goals);
          if (data.mistakes) setMistakes(data.mistakes);
          if (data.backlogs) setBacklogs(data.backlogs);
          if (data.notifications && user) {
              setUser(prev => prev ? ({...prev, notifications: data.notifications}) : prev);
          }
          if (data.userProfileSync && user) {
              setUser(prev => prev ? ({ ...prev, ...data.userProfileSync }) : prev);
          }
          if (data.timetable) {
              setTimetableData({ config: data.timetable.config, slots: data.timetable.slots });
          }
          
          setSyncStatus('SYNCED');
          setIsOfflineMode(false);
      } catch (e: any) { 
          setIsOfflineMode(true);
          setSyncStatus('OFFLINE');
          setSyncErrorMsg(`Connection Failed: ${e.message}`);
      }
  };

  const sendConnectionRequest = async (studentId: string) => {
      if(!user) return { success: false, message: 'Not logged in' };
      try {
          const data = await apiCall('/api/send_request.php', 'POST', {
              student_identifier: studentId,
              parent_id: user.id,
              parent_name: user.name,
              action: 'send'
          });
          return { success: true, message: data.message || 'Invitation sent!' };
      } catch(e) {
          return { success: false, message: 'Failed to send request.' };
      }
  };

  const acceptConnectionRequest = async (notificationId: string) => {
      if(!user || !user.notifications) return;
      const notification = user.notifications.find(n => n.id === notificationId);
      if(!notification) return;
      try {
          await apiCall('/api/respond_request.php', 'POST', {
              accept: true,
              student_id: user.id,
              parent_id: notification.fromId,
              notification_id: notificationId
          });
          // CRITICAL: Refresh user data to show linked state immediately
          fetchRemoteData(user.id);
      } catch(e) { console.error("Accept failed", e); }
  };

  const updateTopicProgress = (topicId: string, updates: Partial<UserProgress>) => {
    if(!user) return;
    setProgress(prev => {
      const current = prev[topicId] || { topicId, status: 'NOT_STARTED', lastRevised: null, revisionLevel: 0, nextRevisionDate: null, solvedQuestions: [] };
      if (updates.status === 'COMPLETED' && current.status !== 'COMPLETED') {
        const now = new Date().toISOString();
        updates.lastRevised = now; updates.nextRevisionDate = calculateNextRevision(0, now); updates.revisionLevel = 0;
      }
      const updated = { ...current, ...updates };
      apiCall('/api/sync_progress.php', 'POST', { user_id: user.id, topic_id: topicId, ...updated });
      return { ...prev, [topicId]: updated };
    });
  };
  
  const toggleQuestionSolved = (topicId: string, questionId: string) => {
      if(!user) return;
      setProgress(prev => {
          const current = prev[topicId] || { topicId, status: 'NOT_STARTED', lastRevised: null, revisionLevel: 0, nextRevisionDate: null, solvedQuestions: [] };
          const solved = current.solvedQuestions || [];
          const newSolved = solved.includes(questionId) ? solved.filter(id => id !== questionId) : [...solved, questionId];
          let status = current.status;
          if (newSolved.length > 0 && status === 'NOT_STARTED') status = 'IN_PROGRESS';
          const updated = { ...current, solvedQuestions: newSolved, status };
          apiCall('/api/sync_progress.php', 'POST', { user_id: user.id, topic_id: topicId, ...updated });
          return { ...prev, [topicId]: updated };
      });
  };

  const handleRevisionComplete = (topicId: string) => {
    if(!user) return;
    setProgress(prev => {
      const current = prev[topicId];
      if (!current) return prev;
      const now = new Date().toISOString();
      const newLevel = Math.min(current.revisionLevel + 1, 4);
      const updated = { ...current, lastRevised: now, revisionLevel: newLevel, nextRevisionDate: calculateNextRevision(newLevel, now) };
      apiCall('/api/sync_progress.php', 'POST', { user_id: user.id, topic_id: topicId, ...updated });
      return { ...prev, [topicId]: updated };
    });
  };

  const saveTimetable = async (config: TimetableConfig, slots: any[]) => {
      if(!user) return;
      setTimetableData({ config, slots });
      await apiCall('/api/save_timetable.php', 'POST', { user_id: user.id, config, slots });
  };

  const updateChapterNotes = (topicId: string, pages: string[]) => {
      setChapterNotes(prev => {
          const updated = {
              ...prev,
              [topicId]: {
                  id: prev[topicId]?.id || Date.now(),
                  topicId,
                  pages,
                  lastUpdated: new Date().toISOString()
              }
          };
          apiCall('/api/manage_notes.php', 'POST', { topicId, pages });
          return updated;
      });
  };

  const updateVideo = (topicId: string, url: string, description: string) => {
      setVideoMap(prev => {
          const updated = {
              ...prev,
              [topicId]: { topicId, videoUrl: url, description }
          };
          apiCall('/api/manage_videos.php', 'POST', { topicId, url, desc: description });
          return updated;
      });
  };

  // --- View Flow ---
  if (!user) {
    return <AuthScreen onLogin={handleLogin} onNavigate={handleNavigation} enableGoogleLogin={enableGoogleLogin} socialConfig={socialConfig} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      <Navigation currentScreen={currentScreen} setScreen={setCurrentScreen} logout={handleLogout} user={user} />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen pb-24 md:pb-8 relative">
        <div className="md:hidden flex justify-between items-center mb-4 sticky top-0 bg-slate-50/90 backdrop-blur-xl z-30 py-3 border-b border-slate-200/50 -mx-4 px-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
            <div className="flex items-center gap-2"><div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-blue-400 shadow-md"><TrendingUp className="w-5 h-5" /></div><span className="font-bold text-lg text-slate-800 tracking-tight">IIT<span className="text-blue-600">GEE</span>Prep</span></div>
            <div className="flex items-center gap-3">
                <SyncIndicator status={syncStatus} onRetry={() => fetchRemoteData(user.id)} />
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100 active:scale-95"><LogOut className="w-5 h-5" /></button>
            </div>
        </div>
        
        <div className="hidden md:block absolute top-6 right-8 z-50">
            <SyncIndicator status={syncStatus} onRetry={() => fetchRemoteData(user.id)} />
        </div>

        <div className="max-w-6xl mx-auto">
          {user.role === 'PARENT' && (
             <>
                {currentScreen === 'dashboard' && <DashboardScreen user={user} viewingStudentName={linkedStudentData?.studentName} progress={linkedStudentData?.progress || {}} testAttempts={linkedStudentData?.tests || []} goals={[]} addGoal={()=>{}} toggleGoal={()=>{}} setScreen={setCurrentScreen} />}
                {currentScreen === 'family' && <ParentFamilyScreen user={user} onSendRequest={sendConnectionRequest} linkedData={linkedStudentData} />}
                {currentScreen === 'analytics' && <AnalyticsScreen user={user} viewingStudentName={linkedStudentData?.studentName} progress={linkedStudentData?.progress || {}} testAttempts={linkedStudentData?.tests || []} />}
                {currentScreen === 'tests' && <TestScreen user={user} history={linkedStudentData?.tests || []} addTestAttempt={()=>{}} availableTests={adminTests} />}
                {currentScreen === 'syllabus' && <SyllabusScreen user={user} viewingStudentName={linkedStudentData?.studentName} subjects={syllabus} progress={linkedStudentData?.progress || {}} onUpdateProgress={()=>{}} readOnly={true} summaryOnly={true} videoMap={videoMap} chapterNotes={chapterNotes} questionBank={questionBank} addTestAttempt={()=>{}} testAttempts={linkedStudentData?.tests || []} />}
                {currentScreen === 'profile' && <ProfileScreen user={user} onAcceptRequest={()=>{}} onUpdateUser={(u) => { const updated = { ...user, ...u }; setUser(updated); }} linkedStudentName={linkedStudentData?.studentName} />} 
             </>
          )}
          {user.role === 'STUDENT' && (
              <>
                <AITutorChat isFullScreen={currentScreen === 'ai-tutor'} />
                {currentScreen === 'dashboard' && <DashboardScreen user={user} progress={progress} testAttempts={testAttempts} goals={goals} addGoal={(t) => setGoals([...goals, {id: Date.now().toString(), text: t, completed: false}])} toggleGoal={(id) => setGoals(goals.map(g => g.id === id ? {...g, completed: !g.completed} : g))} setScreen={setCurrentScreen} />}
                {currentScreen === 'syllabus' && <SyllabusScreen user={user} subjects={syllabus} progress={progress} onUpdateProgress={updateTopicProgress} videoMap={videoMap} chapterNotes={chapterNotes} questionBank={questionBank} onToggleQuestion={toggleQuestionSolved} addTestAttempt={(a) => setTestAttempts([...testAttempts, a])} testAttempts={testAttempts} />}
                {currentScreen === 'revision' && <RevisionScreen progress={progress} handleRevisionComplete={handleRevisionComplete} />}
                {currentScreen === 'tests' && <TestScreen user={user} history={testAttempts} addTestAttempt={(a) => setTestAttempts([...testAttempts, a])} availableTests={adminTests} />}
                {currentScreen === 'psychometric' && <PsychometricScreen user={user} />}
                {currentScreen === 'timetable' && <TimetableScreen user={user} savedConfig={timetableData?.config} savedSlots={timetableData?.slots} onSave={saveTimetable} progress={progress} />}
                {currentScreen === 'focus' && <FocusScreen />}
                {currentScreen === 'exams' && <ExamGuideScreen />}
                {currentScreen === 'flashcards' && <FlashcardScreen flashcards={flashcards} />}
                {currentScreen === 'mistakes' && <MistakesScreen mistakes={mistakes} addMistake={(m) => setMistakes([{...m, id: Date.now().toString(), date: new Date().toISOString()}, ...mistakes])} />}
                {currentScreen === 'backlogs' && <BacklogScreen backlogs={backlogs} onAddBacklog={(b) => setBacklogs([{...b, id: Date.now().toString(), status: 'PENDING'}, ...backlogs])} onToggleBacklog={(id) => setBacklogs(backlogs.map(b => b.id === id ? {...b, status: b.status === 'PENDING' ? 'COMPLETED' : 'PENDING'} : b))} onDeleteBacklog={(id) => setBacklogs(backlogs.filter(b => b.id !== id))} />}
                {currentScreen === 'hacks' && <HacksScreen hacks={hacks} />}
                {currentScreen === 'analytics' && <AnalyticsScreen user={user} progress={progress} testAttempts={testAttempts} />}
                {currentScreen === 'wellness' && <WellnessScreen />}
                {currentScreen === 'profile' && <ProfileScreen user={user} onAcceptRequest={acceptConnectionRequest} onUpdateUser={(u) => { const updated = { ...user, ...u }; setUser(updated); }} />}
              </>
          )}
          {user.role === 'ADMIN' && (
              <>
                {currentScreen === 'overview' && <AdminDashboardScreen user={user} onNavigate={setCurrentScreen} />}
                {currentScreen === 'users' && <AdminUserManagementScreen />}
                {currentScreen === 'syllabus_admin' && <AdminSyllabusScreen syllabus={syllabus} onAddTopic={(t) => setSyllabus([...syllabus, {...t, id: Date.now().toString()}])} onDeleteTopic={(id) => setSyllabus(syllabus.filter(t => t.id !== id))} chapterNotes={chapterNotes} onUpdateNotes={updateChapterNotes} videoMap={videoMap} onUpdateVideo={updateVideo} />}
                {currentScreen === 'inbox' && <AdminInboxScreen />}
                {currentScreen === 'content' && <ContentManagerScreen flashcards={flashcards} hacks={hacks} blogs={blogs} onAddFlashcard={(c) => setFlashcards([...flashcards, {...c, id: Date.now()}])} onAddHack={(h) => setHacks([...hacks, {...h, id: Date.now()}])} onAddBlog={(b) => setBlogs([{...b, id: Date.now(), date: new Date().toISOString()}, ...blogs])} onDelete={(t, id) => { if(t === 'flashcard') setFlashcards(flashcards.filter(f => f.id !== id)); }} />}
                {currentScreen === 'blog_admin' && <AdminBlogScreen blogs={blogs} onAddBlog={(b) => setBlogs([b, ...blogs])} onUpdateBlog={(b) => setBlogs(blogs.map(x => x.id === b.id ? b : x))} onDeleteBlog={(id) => setBlogs(blogs.filter(b => b.id !== id))} />}
                {currentScreen === 'tests' && <AdminTestManagerScreen questionBank={questionBank} tests={adminTests} onAddQuestion={(q) => setQuestionBank([...questionBank, q])} onCreateTest={(t) => setAdminTests([...adminTests, t])} onDeleteQuestion={(id) => setQuestionBank(questionBank.filter(q => q.id !== id))} onDeleteTest={(id) => setAdminTests(adminTests.filter(t => t.id !== id))} syllabus={syllabus} />}
                {currentScreen === 'analytics' && <AdminAnalyticsScreen />}
                {currentScreen === 'diagnostics' && <DiagnosticsScreen />}
                {currentScreen === 'deployment' && <DeploymentScreen />}
                {currentScreen === 'system' && <AdminSystemScreen />}
              </>
          )}
        </div>
      </main>
      
      <MobileNavigation currentScreen={currentScreen} setScreen={setCurrentScreen} logout={handleLogout} user={user} />
    </div>
  );
}

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
import { User, UserProgress, TestAttempt, Screen, Goal, MistakeLog, Flashcard, MemoryHack, BlogPost, VideoLesson, Question, Test, TimetableConfig, Topic, ContactMessage, BacklogItem, ChapterNote, SocialConfig } from './lib/types';
import { SYLLABUS_DATA } from './lib/syllabusData';
import { MOCK_TESTS_DATA } from './lib/mockTestsData';
import { LogOut, Cloud, CloudOff, RefreshCw, WifiOff } from 'lucide-react';

const SyncIndicator = ({ status, onRetry }: { status: 'SYNCED' | 'SAVING' | 'ERROR' | 'OFFLINE', onRetry: () => void }) => {
    if (status === 'SYNCED') return (
        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-[10px] font-bold border border-green-200">
            <Cloud className="w-3 h-3" /> <span>Synced</span>
        </div>
    );
    if (status === 'SAVING') return (
        <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-[10px] font-bold border border-blue-200">
            <RefreshCw className="w-3 h-3 animate-spin" /> <span>Saving...</span>
        </div>
    );
    if (status === 'OFFLINE') return (
        <div className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded text-[10px] font-bold border border-slate-200">
            <WifiOff className="w-3 h-3" /> <span>Offline</span>
        </div>
    );
    return (
        <button onClick={onRetry} className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-[10px] font-bold border border-red-200 hover:bg-red-100">
            <CloudOff className="w-3 h-3" /> <span>Retry Sync</span>
        </button>
    );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  
  // CRITICAL FIX: Validate screen before setting initial state to prevent persistent crash loops
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const saved = localStorage.getItem('iitjee_last_screen');
    // Ensure the saved screen is valid, or fallback to dashboard
    const validScreens: Screen[] = ['dashboard', 'syllabus', 'tests', 'ai-tutor', 'focus', 'analytics', 'timetable', 'revision', 'mistakes', 'flashcards', 'backlogs', 'hacks', 'wellness', 'profile', 'psychometric', 'overview', 'users', 'videos', 'content', 'diagnostics', 'system', 'deployment', 'tests_admin', 'content_admin', 'video_admin', 'admin_analytics', 'syllabus_admin', 'inbox', 'blog_admin', 'family', 'public-blog', 'about', 'blog', 'exams', 'privacy', 'contact', 'features'];
    return (saved && validScreens.includes(saved as Screen)) ? (saved as Screen) : 'dashboard';
  });

  const [enableGoogleLogin] = useState(false);
  const [socialConfig] = useState<SocialConfig>({ enabled: false });
  
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
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Content state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [hacks, setHacks] = useState<MemoryHack[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [videoMap, setVideoMap] = useState<Record<string, VideoLesson>>({});
  const [chapterNotes, setChapterNotes] = useState<Record<string, ChapterNote>>({});
  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [adminTests, setAdminTests] = useState<Test[]>(MOCK_TESTS_DATA);

  // Central API Handler
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
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setSyncStatus('SYNCED');
          return data;
      } catch (error) {
          setSyncStatus('OFFLINE');
          return { status: 'error', offline: true };
      }
  }, [user, isOfflineMode]);

  const fetchRemoteData = async (userId: string) => {
      setSyncStatus('SAVING'); 
      try {
          const res = await fetch(`/api/get_dashboard.php?user_id=${userId}`);
          if (!res.ok) throw new Error("Fetch failed");
          const data = await res.json();

          if (data.userProfileSync) {
              setUser(prev => prev ? ({ ...prev, ...data.userProfileSync, notifications: data.notifications || [] }) : prev);
          }

          if (Array.isArray(data.progress)) {
              const progMap: Record<string, UserProgress> = {};
              data.progress.forEach((p: any) => {
                  progMap[p.topic_id] = {
                      topicId: p.topic_id,
                      status: p.status,
                      lastRevised: p.last_revised,
                      revisionLevel: Number(p.revision_level),
                      nextRevisionDate: p.next_revision_date,
                      solvedQuestions: p.solved_questions_json ? JSON.parse(p.solved_questions_json) : []
                  };
              });
              setProgress(progMap);
          }
          if (data.attempts) setTestAttempts(data.attempts);
          if (data.goals) setGoals(data.goals);
          if (data.mistakes) setMistakes(data.mistakes);
          if (data.backlogs) setBacklogs(data.backlogs);
          if (data.timetable) setTimetableData({ config: data.timetable.config, slots: data.timetable.slots });
          
          setSyncStatus('SYNCED');
          setIsOfflineMode(false);
      } catch (e) { 
          setSyncStatus('OFFLINE');
      }
  };

  useEffect(() => {
    if (user) {
        localStorage.setItem('iitjee_last_screen', currentScreen);
        if (user.role === 'PARENT' && user.linkedStudentId) {
            loadLinkedStudent(user.linkedStudentId);
        }
    }
  }, [currentScreen, user?.linkedStudentId, user?.role]);

  const loadLinkedStudent = async (studentId: string) => {
      try {
          const res = await fetch(`/api/get_dashboard.php?user_id=${studentId}`);
          if(res.ok) {
              const data = await res.json();
              const progMap: Record<string, UserProgress> = {};
              if(Array.isArray(data.progress)) {
                  data.progress.forEach((p: any) => {
                      progMap[p.topic_id] = {
                          topicId: p.topic_id,
                          status: p.status,
                          lastRevised: p.last_revised,
                          revisionLevel: Number(p.revision_level),
                          nextRevisionDate: p.next_revision_date || null,
                          solvedQuestions: p.solved_questions_json ? JSON.parse(p.solved_questions_json) : []
                      };
                  });
              }
              setLinkedStudentData({
                  progress: progMap,
                  tests: data.attempts || [],
                  studentName: data.userProfileSync ? data.userProfileSync.name : 'Student'
              });
          }
      } catch(e) { console.error(e); }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    fetchRemoteData(userData.id);
  };

  const handleLogout = () => { setUser(null); setLinkedStudentData(undefined); setCurrentScreen('dashboard'); };
  
  const acceptRequest = async (notifId: string) => {
      if(!user) return;
      const notif = user.notifications?.find(n => n.id === notifId);
      if(!notif) return;
      try {
          const res = await fetch('/api/respond_request.php', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ accept: true, student_id: user.id, parent_id: notif.fromId, notification_id: notifId })
          });
          if(res.ok) {
              await fetchRemoteData(user.id);
          }
      } catch(e) { console.error(e); }
  };

  if (!user) return (
      <PublicLayout onNavigate={(p: any) => setCurrentScreen(p)} currentScreen={currentScreen}>
          {['about', 'features', 'exams', 'blog', 'privacy', 'contact'].includes(currentScreen) ? (
              <>
                  {currentScreen === 'about' && <AboutUsScreen />}
                  {currentScreen === 'features' && <FeaturesScreen />}
                  {currentScreen === 'exams' && <ExamGuideScreen />}
                  {currentScreen === 'blog' && <PublicBlogScreen blogs={blogs} onBack={() => setCurrentScreen('dashboard')} />}
                  {currentScreen === 'privacy' && <PrivacyPolicyScreen />}
                  {currentScreen === 'contact' && <ContactUsScreen />}
              </>
          ) : (
              <AuthScreen onLogin={handleLogin} onNavigate={(p: any) => setCurrentScreen(p)} enableGoogleLogin={enableGoogleLogin} socialConfig={socialConfig} />
          )}
      </PublicLayout>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      <Navigation currentScreen={currentScreen} setScreen={setCurrentScreen} logout={handleLogout} user={user} />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen pb-24 md:pb-8 relative">
        <div className="md:hidden flex justify-between items-center mb-4 sticky top-0 bg-slate-50/90 backdrop-blur-xl z-30 py-3 border-b border-slate-200/50 -mx-4 px-4 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-lg">IIT<span className="text-blue-600">GEE</span>Prep</div>
            <div className="flex items-center gap-3">
                <SyncIndicator status={syncStatus} onRetry={() => fetchRemoteData(user.id)} />
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
            </div>
        </div>
        
        <div className="hidden md:block absolute top-6 right-8 z-50">
            <SyncIndicator status={syncStatus} onRetry={() => fetchRemoteData(user.id)} />
        </div>

        <div className="max-w-6xl mx-auto">
          {user.role === 'PARENT' ? (
             <>
                {currentScreen === 'dashboard' && <DashboardScreen user={user} viewingStudentName={linkedStudentData?.studentName} progress={linkedStudentData?.progress || {}} testAttempts={linkedStudentData?.tests || []} goals={[]} addGoal={()=>{}} toggleGoal={()=>{}} setScreen={setCurrentScreen} />}
                {currentScreen === 'family' && <ParentFamilyScreen user={user} onSendRequest={async (id) => {
                    const res = await fetch('/api/send_request.php', { method: 'POST', body: JSON.stringify({ action: 'send', student_identifier: id, parent_id: user.id, parent_name: user.name }) });
                    return await res.json();
                }} linkedData={linkedStudentData} />}
                {currentScreen === 'analytics' && <AnalyticsScreen user={user} viewingStudentName={linkedStudentData?.studentName} progress={linkedStudentData?.progress || {}} testAttempts={linkedStudentData?.tests || []} />}
                {currentScreen === 'tests' && <TestScreen user={user} history={linkedStudentData?.tests || []} addTestAttempt={()=>{}} availableTests={adminTests} />}
                {currentScreen === 'syllabus' && <SyllabusScreen user={user} viewingStudentName={linkedStudentData?.studentName} subjects={syllabus} progress={linkedStudentData?.progress || {}} onUpdateProgress={()=>{}} readOnly={true} summaryOnly={true} />}
                {currentScreen === 'profile' && <ProfileScreen user={user} onAcceptRequest={()=>{}} onUpdateUser={(u) => setUser({...user, ...u})} linkedStudentName={linkedStudentData?.studentName} />} 
             </>
          ) : user.role === 'ADMIN' ? (
              <>
                {currentScreen === 'overview' && <AdminDashboardScreen user={user} onNavigate={setCurrentScreen} />}
                {currentScreen === 'users' && <AdminUserManagementScreen />}
                {currentScreen === 'inbox' && <AdminInboxScreen />}
                {currentScreen === 'syllabus_admin' && <AdminSyllabusScreen syllabus={syllabus} onAddTopic={(t) => setSyllabus([...syllabus, {...t, id: Date.now().toString()}])} onDeleteTopic={(id) => setSyllabus(syllabus.filter(s => s.id !== id))} chapterNotes={chapterNotes} videoMap={videoMap} />}
                {currentScreen === 'tests' && <AdminTestManagerScreen questionBank={questionBank} tests={adminTests} syllabus={syllabus} onAddQuestion={(q) => setQuestionBank([...questionBank, q])} onCreateTest={(t) => setAdminTests([...adminTests, t])} onDeleteQuestion={(id) => setQuestionBank(questionBank.filter(q => q.id !== id))} onDeleteTest={(id) => setAdminTests(adminTests.filter(t => t.id !== id))} />}
                {currentScreen === 'content' && <ContentManagerScreen flashcards={flashcards} hacks={hacks} blogs={blogs} onAddFlashcard={(f) => setFlashcards([...flashcards, {...f, id: Date.now()}])} onAddHack={(h) => setHacks([...hacks, {...h, id: Date.now()}])} onAddBlog={(b) => setBlogs([...blogs, {...b, id: Date.now(), date: new Date().toISOString()}])} onDelete={()=>{}} />}
                {currentScreen === 'blog_admin' && <AdminBlogScreen blogs={blogs} onAddBlog={(b) => setBlogs([...blogs, b])} onUpdateBlog={(b) => setBlogs(blogs.map(x => x.id === b.id ? b : x))} onDeleteBlog={(id) => setBlogs(blogs.filter(b => b.id !== id))} />}
                {currentScreen === 'analytics' && <AdminAnalyticsScreen />}
                {currentScreen === 'diagnostics' && <DiagnosticsScreen />}
                {currentScreen === 'system' && <AdminSystemScreen />}
                {currentScreen === 'deployment' && <DeploymentScreen />}
              </>
          ) : (
              <>
                {currentScreen === 'dashboard' && <DashboardScreen user={user} progress={progress} testAttempts={testAttempts} goals={goals} addGoal={(t) => setGoals([...goals, {id: Date.now().toString(), text: t, completed: false}])} toggleGoal={(id) => setGoals(goals.map(g => g.id === id ? {...g, completed: !g.completed} : g))} setScreen={setCurrentScreen} />}
                {currentScreen === 'syllabus' && <SyllabusScreen user={user} subjects={syllabus} progress={progress} onUpdateProgress={(tid, upd) => setProgress({...progress, [tid]: {...(progress[tid] || {}), ...upd}})} videoMap={videoMap} chapterNotes={chapterNotes} questionBank={questionBank} testAttempts={testAttempts} />}
                {currentScreen === 'ai-tutor' && <AITutorChat isFullScreen={true} />}
                {currentScreen === 'tests' && <TestScreen user={user} history={testAttempts} addTestAttempt={(a) => setTestAttempts([...testAttempts, a])} availableTests={adminTests} />}
                {currentScreen === 'psychometric' && <PsychometricScreen user={user} />}
                {currentScreen === 'focus' && <FocusScreen />}
                {currentScreen === 'analytics' && <AnalyticsScreen user={user} progress={progress} testAttempts={testAttempts} />}
                {currentScreen === 'timetable' && <TimetableScreen user={user} savedConfig={timetableData?.config} savedSlots={timetableData?.slots} progress={progress} onSave={(cfg, slots) => setTimetableData({config: cfg, slots})} />}
                {currentScreen === 'revision' && <RevisionScreen progress={progress} handleRevisionComplete={(id) => {}} />}
                {currentScreen === 'exams' && <ExamGuideScreen />}
                {currentScreen === 'mistakes' && <MistakesScreen mistakes={mistakes} addMistake={(m) => setMistakes([...mistakes, {...m, id: Date.now().toString(), date: new Date().toISOString()}])} />}
                {currentScreen === 'flashcards' && <FlashcardScreen flashcards={flashcards} />}
                {currentScreen === 'backlogs' && <BacklogScreen backlogs={backlogs} onAddBacklog={(b) => setBacklogs([...backlogs, {...b, id: Date.now().toString(), status: 'PENDING'}])} onToggleBacklog={(id) => setBacklogs(backlogs.map(x => x.id === id ? {...x, status: x.status === 'PENDING' ? 'COMPLETED' : 'PENDING'} : x))} onDeleteBacklog={(id) => setBacklogs(backlogs.filter(x => x.id !== id))} />}
                {currentScreen === 'hacks' && <HacksScreen hacks={hacks} />}
                {currentScreen === 'wellness' && <WellnessScreen />}
                {currentScreen === 'profile' && <ProfileScreen user={user} onAcceptRequest={acceptRequest} onUpdateUser={(u) => setUser({...user, ...u})} />}
              </>
          )}
        </div>
      </main>
      <MobileNavigation currentScreen={currentScreen} setScreen={setCurrentScreen} logout={handleLogout} user={user} />
      {user.role === 'STUDENT' && currentScreen !== 'ai-tutor' && <AITutorChat />}
    </div>
  );
}

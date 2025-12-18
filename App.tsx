
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
        <div className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded text-[10px] font-bold border border-slate-200 cursor-help" title="Offline Mode">
            <WifiOff className="w-3 h-3" /> <span>Offline</span>
        </div>
    );
    return (
        <button onClick={onRetry} className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-[10px] font-bold border border-red-200 hover:bg-red-100 cursor-pointer">
            <CloudOff className="w-3 h-3" /> <span>Retry Sync</span>
        </button>
    );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => (localStorage.getItem('iitjee_last_screen') as Screen) || 'dashboard');
  const [enableGoogleLogin, setEnableGoogleLogin] = useState(false);
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
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Content state (initialized with empty arrays or defaults)
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
                      // FIXED: Used Number() instead of invalid (int) syntax to cast revisionLevel
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
                          // FIXED: Used Number() for casting and provided missing mandatory nextRevisionDate
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
  const handleNavigation = (page: string) => setCurrentScreen(page as Screen);

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

  if (!user) return <AuthScreen onLogin={handleLogin} onNavigate={handleNavigation} enableGoogleLogin={enableGoogleLogin} socialConfig={socialConfig} />;

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
          ) : (
              <>
                {currentScreen === 'dashboard' && <DashboardScreen user={user} progress={progress} testAttempts={testAttempts} goals={goals} addGoal={(t) => setGoals([...goals, {id: Date.now().toString(), text: t, completed: false}])} toggleGoal={(id) => setGoals(goals.map(g => g.id === id ? {...g, completed: !g.completed} : g))} setScreen={setCurrentScreen} />}
                {currentScreen === 'syllabus' && <SyllabusScreen user={user} subjects={syllabus} progress={progress} onUpdateProgress={(tid, upd) => setProgress({...progress, [tid]: {...(progress[tid] || {}), ...upd}})} videoMap={videoMap} chapterNotes={chapterNotes} questionBank={questionBank} testAttempts={testAttempts} />}
                {currentScreen === 'tests' && <TestScreen user={user} history={testAttempts} addTestAttempt={(a) => setTestAttempts([...testAttempts, a])} availableTests={adminTests} />}
                {currentScreen === 'psychometric' && <PsychometricScreen user={user} />}
                {currentScreen === 'profile' && <ProfileScreen user={user} onAcceptRequest={acceptRequest} onUpdateUser={(u) => setUser({...user, ...u})} />}
                {/* Other student screens... */}
              </>
          )}
          {user.role === 'ADMIN' && <AdminDashboardScreen user={user} onNavigate={setCurrentScreen} />}
        </div>
      </main>
      <MobileNavigation currentScreen={currentScreen} setScreen={setCurrentScreen} logout={handleLogout} user={user} />
    </div>
  );
}

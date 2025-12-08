
import React, { useState, useEffect } from 'react';
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
import { AboutUsScreen } from './screens/AboutUsScreen';
import { ContactUsScreen } from './screens/ContactUsScreen';
import { ExamGuideScreen } from './screens/ExamGuideScreen';
import { PrivacyPolicyScreen } from './screens/PrivacyPolicyScreen';
import { FocusScreen } from './screens/FocusScreen'; // Import FocusScreen
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { PublicLayout } from './components/PublicLayout';
import { User, UserProgress, TopicStatus, TestAttempt, Screen, Goal, MistakeLog, Flashcard, MemoryHack, BlogPost, VideoLesson, Question, Test, TimetableConfig, Topic, ContactMessage } from './lib/types';
import { calculateNextRevision } from './lib/utils';
import { SYLLABUS_DATA } from './lib/syllabusData';
import { TrendingUp, Bell } from 'lucide-react';

// Placeholder for screens not yet fully implemented
const ComingSoonScreen = ({ title, icon }: { title: string, icon: string }) => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
    <p className="text-slate-500 max-w-md">
      This feature is available in the Pro version or is currently under development.
    </p>
  </div>
);

// Backlog Screen reused logic
const BacklogScreen = ({ progress }: { progress: Record<string, UserProgress> }) => {
  const backlogs = Object.values(progress).filter(p => p.status === 'BACKLOG');
  return (
     <div className="space-y-6">
       <h2 className="text-2xl font-bold text-slate-900">Backlog Manager</h2>
       {backlogs.length === 0 ? (
         <div className="p-12 bg-green-50 text-green-700 rounded-xl text-center">
           No backlogs! You are on track.
         </div>
       ) : (
         <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {backlogs.map(b => (
              <div key={b.topicId} className="p-4 border-b last:border-0 flex justify-between items-center">
                 <span className="font-medium text-slate-700">{b.topicId}</span>
                 <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Backlog</span>
              </div>
            ))}
         </div>
       )}
     </div>
  );
};

// --- DEMO DATA SEEDING ---
const DEMO_TESTS: Test[] = [
    {
        id: 'demo_jee_main_1',
        title: 'JEE Main 2024 - Physics Full Mock',
        durationMinutes: 180,
        category: 'ADMIN',
        difficulty: 'MAINS',
        examType: 'JEE',
        questions: [
            { id: 'q1', subjectId: 'phys', topicId: 'p-kin-1d', text: 'A particle moves with velocity v = t^2 - 2t. Find distance traveled in first 3 seconds.', options: ['4m', '6m', '8m', '2m'], correctOptionIndex: 1, source: 'JEE Main', year: 2024 },
            { id: 'q2', subjectId: 'phys', topicId: 'p-electro', text: 'Two point charges q and 4q are separated by distance r. Where should a third charge be placed for equilibrium?', options: ['r/3 from q', 'r/3 from 4q', 'r/2', '2r/3 from q'], correctOptionIndex: 0, source: 'JEE Main', year: 2023 }
        ]
    },
    {
        id: 'demo_jee_adv_1',
        title: 'JEE Advanced 2022 - Paper 1 (Mixed)',
        durationMinutes: 180,
        category: 'ADMIN',
        difficulty: 'ADVANCED',
        examType: 'JEE',
        questions: [
            { id: 'q3', subjectId: 'chem', topicId: 'c-thermo', text: 'For an adiabatic expansion of an ideal gas, the plot of ln P vs ln V is linear with slope:', options: ['-γ', 'γ', '1-γ', 'γ-1'], correctOptionIndex: 0, source: 'JEE Advanced', year: 2022 }
        ]
    },
    {
        id: 'demo_bitsat_1',
        title: 'BITSAT English & Logic Speed Test',
        durationMinutes: 45,
        category: 'ADMIN',
        difficulty: 'CUSTOM',
        examType: 'BITSAT',
        questions: [
            { id: 'q4', subjectId: 'math', topicId: 'm-stats', text: 'The mean of 5 observations is 4. If one observation is excluded, new mean is 3. Find excluded value.', options: ['8', '6', '4', '2'], correctOptionIndex: 0, source: 'BITSAT', year: 2023 }
        ]
    },
    {
        id: 'demo_viteee_1',
        title: 'VITEEE Science Quickfire',
        durationMinutes: 90,
        category: 'ADMIN',
        difficulty: 'CUSTOM',
        examType: 'VITEEE',
        questions: [
            { id: 'q5', subjectId: 'phys', topicId: 'p-units', text: 'Dimensions of Planck Constant are same as:', options: ['Energy', 'Power', 'Angular Momentum', 'Force'], correctOptionIndex: 2, source: 'VITEEE', year: 2021 }
        ]
    }
];

// --- SIMULATED USER DATABASE HELPERS ---
const getUserDB = (): User[] => {
    const db = localStorage.getItem('iitjee_users_db');
    return db ? JSON.parse(db) : [];
};

const saveUserToDB = (user: User) => {
    const db = getUserDB();
    const index = db.findIndex(u => u.id === user.id);
    if (index >= 0) {
        db[index] = user;
    } else {
        db.push(user);
    }
    localStorage.setItem('iitjee_users_db', JSON.stringify(db));
};

const findUserById = (id: string) => getUserDB().find(u => u.id === id);

export default function App() {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [enableGoogleLogin, setEnableGoogleLogin] = useState(true); // Admin Controlled
  
  // Persisted Data for CURRENT USER
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mistakes, setMistakes] = useState<MistakeLog[]>([]);
  const [timetableData, setTimetableData] = useState<{config: TimetableConfig, slots: any[]} | null>(null);
  
  // Dynamic Syllabus State
  const [syllabus, setSyllabus] = useState<Topic[]>(SYLLABUS_DATA);

  // Data for LINKED Student (Only for Parent View)
  const [linkedStudentData, setLinkedStudentData] = useState<{
      progress: Record<string, UserProgress>;
      tests: TestAttempt[];
      studentName: string;
  } | undefined>(undefined);
  
  // Content Data (Shared/Admin Managed)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
     { id: 1, front: "Newton's Second Law", back: "F = ma", subjectId: 'phys' },
     { id: 2, front: "Integration of sin(x)", back: "-cos(x) + C", subjectId: 'math' }
  ]);
  const [hacks, setHacks] = useState<MemoryHack[]>([
     { id: 1, title: 'Trig Values', description: 'Remember SOH CAH TOA', tag: 'Maths', subjectId: 'math', trick: 'SOH CAH TOA' }
  ]);
  const [blogs, setBlogs] = useState<BlogPost[]>([
     { id: 1, title: 'JEE 2025 Strategy', excerpt: 'How to plan your year...', content: 'Full guide here.', author: 'Admin', date: new Date().toISOString() }
  ]);
  const [videoMap, setVideoMap] = useState<Record<string, VideoLesson>>({
      'p-units': { topicId: 'p-units', videoUrl: 'https://www.youtube.com/embed/j16d8Z0dM30', description: 'Introduction to Units & Dimensions' }, 
      'p-kinematics': { topicId: 'p-kinematics', videoUrl: 'https://www.youtube.com/embed/5kM3q9z9y9g', description: 'Kinematics 1D Basics' }
  });
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  
  // Admin Tests & Question Bank
  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [adminTests, setAdminTests] = useState<Test[]>([]);

  // --- Data Loading Logic ---
  const loadLocalData = (userId: string) => {
    const savedProgress = localStorage.getItem(`iitjee_progress_${userId}`);
    const savedTests = localStorage.getItem(`iitjee_tests_${userId}`);
    const savedGoals = localStorage.getItem(`iitjee_goals_${userId}`);
    const savedMistakes = localStorage.getItem(`iitjee_mistakes_${userId}`);
    const savedTimetable = localStorage.getItem(`iitjee_timetable_${userId}`);

    if (savedProgress) setProgress(JSON.parse(savedProgress)); else setProgress({});
    if (savedTests) setTestAttempts(JSON.parse(savedTests)); else setTestAttempts([]);
    if (savedGoals) setGoals(JSON.parse(savedGoals)); else setGoals([]);
    if (savedMistakes) setMistakes(JSON.parse(savedMistakes)); else setMistakes([]);
    if (savedTimetable) setTimetableData(JSON.parse(savedTimetable)); else setTimetableData(null);
  };

  const fetchRemoteData = async (userId: string) => {
      try {
          const res = await fetch(`/api/get_dashboard.php?user_id=${userId}`);
          if (!res.ok) throw new Error('API Error or Offline');
          
          const text = await res.text();
          if (!text) throw new Error('Empty response');
          
          const data = JSON.parse(text);
          if (Array.isArray(data.progress)) {
              const progMap: Record<string, UserProgress> = {};
              data.progress.forEach((p: any) => {
                  progMap[p.topic_id] = {
                      topicId: p.topic_id,
                      status: p.status,
                      lastRevised: p.last_revised,
                      revisionLevel: p.revision_level,
                      nextRevisionDate: p.next_revision_date,
                      ex1Solved: p.ex1_solved, ex1Total: p.ex1_total,
                      ex2Solved: p.ex2_solved, ex2Total: p.ex2_total,
                      ex3Solved: p.ex3_solved, ex3Total: p.ex3_total,
                      ex4Solved: p.ex4_solved, ex4Total: p.ex4_total
                  };
              });
              setProgress(progMap);
          } else {
              setProgress({});
          }

          if (data.attempts) setTestAttempts(data.attempts);
          if (data.goals) setGoals(data.goals);
          
          if (data.timetable) {
              setTimetableData({
                  config: data.timetable.config,
                  slots: data.timetable.slots
              });
          } else {
              setTimetableData(null);
          }
      } catch (e) {
          loadLocalData(userId);
      }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('iitjee_user');
    const savedCards = localStorage.getItem('iitjee_flashcards');
    const savedHacks = localStorage.getItem('iitjee_hacks');
    const savedBlogs = localStorage.getItem('iitjee_blogs');
    const savedVideos = localStorage.getItem('iitjee_videos');
    const savedQuestions = localStorage.getItem('iitjee_questions');
    const savedAdminTests = localStorage.getItem('iitjee_admin_tests');
    const savedSyllabus = localStorage.getItem('iitjee_syllabus');
    const savedGoogleConfig = localStorage.getItem('iitjee_enable_google');

    if (savedGoogleConfig !== null) setEnableGoogleLogin(savedGoogleConfig === 'true');

    if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        fetchRemoteData(u.id);
        if(u.role === 'PARENT' && u.linkedStudentId) loadLinkedStudent(u.linkedStudentId);
    }
    
    if (savedCards) setFlashcards(JSON.parse(savedCards));
    if (savedHacks) setHacks(JSON.parse(savedHacks));
    if (savedBlogs) setBlogs(JSON.parse(savedBlogs));
    if (savedVideos) setVideoMap(JSON.parse(savedVideos));
    if (savedQuestions) setQuestionBank(JSON.parse(savedQuestions));
    
    if (savedAdminTests) {
        const parsedTests = JSON.parse(savedAdminTests);
        setAdminTests(parsedTests.length > 0 ? parsedTests : DEMO_TESTS);
    } else {
        setAdminTests(DEMO_TESTS);
    }

    if (savedSyllabus) setSyllabus(JSON.parse(savedSyllabus));
  }, []);

  useEffect(() => {
    if (user) {
        localStorage.setItem('iitjee_user', JSON.stringify(user));
        saveUserToDB(user);
        localStorage.setItem(`iitjee_progress_${user.id}`, JSON.stringify(progress));
        localStorage.setItem(`iitjee_tests_${user.id}`, JSON.stringify(testAttempts));
        localStorage.setItem(`iitjee_goals_${user.id}`, JSON.stringify(goals));
        localStorage.setItem(`iitjee_mistakes_${user.id}`, JSON.stringify(mistakes));
        if (timetableData) {
            localStorage.setItem(`iitjee_timetable_${user.id}`, JSON.stringify(timetableData));
        }
    }
    localStorage.setItem('iitjee_flashcards', JSON.stringify(flashcards));
    localStorage.setItem('iitjee_hacks', JSON.stringify(hacks));
    localStorage.setItem('iitjee_blogs', JSON.stringify(blogs));
    localStorage.setItem('iitjee_videos', JSON.stringify(videoMap));
    localStorage.setItem('iitjee_questions', JSON.stringify(questionBank));
    localStorage.setItem('iitjee_admin_tests', JSON.stringify(adminTests));
    localStorage.setItem('iitjee_syllabus', JSON.stringify(syllabus));
    localStorage.setItem('iitjee_enable_google', String(enableGoogleLogin));
  }, [user, progress, testAttempts, goals, mistakes, timetableData, flashcards, hacks, blogs, videoMap, questionBank, adminTests, syllabus, enableGoogleLogin]);

  const loadLinkedStudent = (studentId: string) => {
      const sProgress = localStorage.getItem(`iitjee_progress_${studentId}`);
      const sTests = localStorage.getItem(`iitjee_tests_${studentId}`);
      const studentUser = findUserById(studentId);
      
      if (studentUser) {
          setLinkedStudentData({
              progress: sProgress ? JSON.parse(sProgress) : {},
              tests: sTests ? JSON.parse(sTests) : [],
              studentName: studentUser.name
          });
      }
  };

  const handleLogin = (userData: User) => {
    const existingDb = getUserDB();
    const existingUser = existingDb.find(u => u.email === userData.email);
    let newUser: User;
    if (existingUser) {
        newUser = { ...existingUser, ...userData, id: existingUser.id }; 
    } else {
        newUser = { 
            ...userData,
            id: userData.id || Math.floor(100000 + Math.random() * 900000).toString(),
            notifications: []
        };
    }
    setUser(newUser);
    fetchRemoteData(newUser.id);
    if (newUser.role === 'ADMIN') setCurrentScreen('overview');
    else if (newUser.role === 'PARENT') {
        setCurrentScreen('dashboard');
        if(newUser.linkedStudentId) loadLinkedStudent(newUser.linkedStudentId);
    }
    else setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('dashboard');
    localStorage.removeItem('iitjee_user');
    setLinkedStudentData(undefined);
  };

  const handleNavigation = (page: string) => {
      setCurrentScreen(page as Screen);
  };

  const sendConnectionRequest = async (studentId: string): Promise<{success: boolean, message: string}> => {
      if(!user) return { success: false, message: 'Not logged in' };
      const student = findUserById(studentId);
      if(!student) return { success: false, message: 'Student ID not found' };
      if(student.role !== 'STUDENT') return { success: false, message: 'ID belongs to non-student' };
      
      const updatedStudent = {
          ...student,
          notifications: [
              ...(student.notifications || []),
              {
                  id: Date.now().toString(),
                  fromId: user.id,
                  fromName: user.name,
                  type: 'connection_request' as const,
                  date: new Date().toISOString()
              }
          ]
      };
      saveUserToDB(updatedStudent);
      return { success: true, message: 'Invitation sent successfully!' };
  };

  const acceptConnectionRequest = (notificationId: string) => {
      if(!user) return;
      const notification = user.notifications?.find(n => n.id === notificationId);
      if(!notification) return;
      const parentId = notification.fromId;
      const parent = findUserById(parentId);
      const updatedStudent: User = {
          ...user,
          notifications: user.notifications?.filter(n => n.id !== notificationId),
          parentId: parentId 
      };
      setUser(updatedStudent); 
      if(parent) {
          const updatedParent = { ...parent, linkedStudentId: user.id };
          saveUserToDB(updatedParent);
      }
  };

  const updateTopicProgress = (topicId: string, updates: Partial<UserProgress>) => {
    setProgress(prev => {
      const current = prev[topicId] || { 
        topicId, status: 'NOT_STARTED', lastRevised: null, revisionLevel: 0, nextRevisionDate: null 
      };
      if (updates.status === 'COMPLETED' && current.status !== 'COMPLETED') {
        const now = new Date().toISOString();
        updates.lastRevised = now;
        updates.nextRevisionDate = calculateNextRevision(0, now);
        updates.revisionLevel = 0;
      }
      return { ...prev, [topicId]: { ...current, ...updates } };
    });
  };

  const handleRevisionComplete = (topicId: string) => {
    setProgress(prev => {
      const current = prev[topicId];
      if (!current) return prev;
      const now = new Date().toISOString();
      const newLevel = Math.min(current.revisionLevel + 1, 4);
      return {
        ...prev,
        [topicId]: { ...current, lastRevised: now, revisionLevel: newLevel, nextRevisionDate: calculateNextRevision(newLevel, now) }
      };
    });
  };

  const updateVideo = (topicId: string, url: string, description: string) => {
      setVideoMap(prev => ({ 
          ...prev, 
          [topicId]: { topicId, videoUrl: url, description } 
      }));
  };

  const saveTimetable = (config: TimetableConfig, slots: any[]) => {
      setTimetableData({ config, slots });
  };

  const addQuestion = (q: Question) => setQuestionBank(prev => [...prev, q]);
  const deleteQuestion = (id: string) => setQuestionBank(prev => prev.filter(q => q.id !== id));
  const createTest = (t: Test) => setAdminTests(prev => [...prev, t]);
  const deleteTest = (id: string) => setAdminTests(prev => prev.filter(t => t.id !== id));
  const addTestAttempt = (attempt: TestAttempt) => setTestAttempts(prev => [...prev, attempt]);
  const addGoal = (text: string) => setGoals(prev => [...prev, { id: Date.now().toString(), text, completed: false }]);
  const toggleGoal = (id: string) => setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  const addMistake = (m: Omit<MistakeLog, 'id' | 'date'>) => setMistakes(prev => [{ ...m, id: Date.now().toString(), date: new Date().toISOString() }, ...prev]);
  const addFlashcard = (card: Omit<Flashcard, 'id'>) => setFlashcards(prev => [...prev, { ...card, id: Date.now() }]);
  const addHack = (hack: Omit<MemoryHack, 'id'>) => setHacks(prev => [...prev, { ...hack, id: Date.now() }]);
  const addBlog = (blog: Omit<BlogPost, 'id' | 'date'>) => setBlogs(prev => [...prev, { ...blog, id: Date.now(), date: new Date().toISOString() }]);
  const deleteContent = (type: 'flashcard' | 'hack' | 'blog', id: number) => {
    if(type === 'flashcard') setFlashcards(prev => prev.filter(i => i.id !== id));
    if(type === 'hack') setHacks(prev => prev.filter(i => i.id !== id));
    if(type === 'blog') setBlogs(prev => prev.filter(i => i.id !== id));
  };
  const handleAddTopic = (topic: Omit<Topic, 'id'>) => {
      const newTopic: Topic = { ...topic, id: `${topic.subject[0].toLowerCase()}_${Date.now()}` };
      setSyllabus(prev => [...prev, newTopic]);
  };
  const handleDeleteTopic = (id: string) => {
      setSyllabus(prev => prev.filter(t => t.id !== id));
  };

  // Public Routes
  if (currentScreen === 'public-blog') return <PublicBlogScreen blogs={blogs} onBack={() => user ? setCurrentScreen('dashboard') : setCurrentScreen('dashboard')} />;
  if (currentScreen === 'about') return <PublicLayout onNavigate={handleNavigation} currentScreen="about"><AboutUsScreen /></PublicLayout>;
  if (currentScreen === 'contact') return <PublicLayout onNavigate={handleNavigation} currentScreen="contact"><ContactUsScreen /></PublicLayout>;
  if (currentScreen === 'exams') return <PublicLayout onNavigate={handleNavigation} currentScreen="exams"><ExamGuideScreen /></PublicLayout>;
  if (currentScreen === 'privacy') return <PublicLayout onNavigate={handleNavigation} currentScreen="privacy"><PrivacyPolicyScreen /></PublicLayout>;

  // Auth Guard
  if (!user) {
    return <AuthScreen onLogin={handleLogin} onNavigate={handleNavigation} enableGoogleLogin={enableGoogleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Desktop Sidebar */}
      <Navigation 
        currentScreen={currentScreen} 
        setScreen={setCurrentScreen} 
        logout={handleLogout} 
        user={user}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen pb-24 md:pb-8">
        
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 sticky top-0 bg-slate-50 z-30 py-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-blue-400">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-slate-800">IITGEEPrep</span>
            </div>
            <div className="flex items-center gap-3">
                {user.notifications && user.notifications.length > 0 && (
                    <div className="relative p-2">
                        <Bell className="w-6 h-6 text-slate-600" />
                        <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-white"></span>
                    </div>
                )}
                {user.avatarUrl && <img src={user.avatarUrl} className="w-8 h-8 rounded-full border border-slate-300" alt="Avatar" />}
            </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {user.role === 'PARENT' && (
             <>
                {currentScreen === 'dashboard' && <DashboardScreen user={user} progress={linkedStudentData?.progress || {}} testAttempts={linkedStudentData?.tests || []} goals={[]} addGoal={()=>{}} toggleGoal={()=>{}} setScreen={setCurrentScreen} />}
                {currentScreen === 'family' && <ParentFamilyScreen user={user} onSendRequest={sendConnectionRequest} linkedData={linkedStudentData} />}
                {currentScreen === 'analytics' && <AnalyticsScreen user={user} progress={linkedStudentData?.progress || {}} testAttempts={linkedStudentData?.tests || []} />}
                {currentScreen === 'timetable' && <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">Timetable viewing is available in Student account.</div>}
                {currentScreen === 'tests' && <TestScreen history={linkedStudentData?.tests || []} addTestAttempt={()=>{}} availableTests={adminTests} />}
                {currentScreen === 'syllabus' && <SyllabusScreen user={user} subjects={syllabus} progress={linkedStudentData?.progress || {}} onUpdateProgress={()=>{}} readOnly={true} videoMap={videoMap} />}
                {currentScreen === 'profile' && <ProfileScreen user={user} onAcceptRequest={()=>{}} onUpdateUser={(u) => { const updated = { ...user, ...u }; setUser(updated); saveUserToDB(updated); }} linkedStudentName={linkedStudentData?.studentName} />} 
             </>
          )}

          {user.role === 'STUDENT' && (
              <>
                {currentScreen === 'dashboard' && <DashboardScreen user={user} progress={progress} testAttempts={testAttempts} goals={goals} addGoal={addGoal} toggleGoal={toggleGoal} setScreen={setCurrentScreen} />}
                {currentScreen === 'syllabus' && <SyllabusScreen user={user} subjects={syllabus} progress={progress} onUpdateProgress={updateTopicProgress} videoMap={videoMap} />}
                {currentScreen === 'revision' && <RevisionScreen progress={progress} handleRevisionComplete={handleRevisionComplete} />}
                {currentScreen === 'tests' && <TestScreen history={testAttempts} addTestAttempt={addTestAttempt} availableTests={adminTests} />}
                {currentScreen === 'timetable' && <TimetableScreen user={user} savedConfig={timetableData?.config} savedSlots={timetableData?.slots} onSave={saveTimetable} progress={progress} />}
                {currentScreen === 'focus' && <FocusScreen />}
                {currentScreen === 'flashcards' && <FlashcardScreen flashcards={flashcards} />}
                {currentScreen === 'mistakes' && <MistakesScreen mistakes={mistakes} addMistake={addMistake} />}
                {currentScreen === 'backlogs' && <BacklogScreen progress={progress} />}
                {currentScreen === 'hacks' && <HacksScreen hacks={hacks} />}
                {currentScreen === 'analytics' && <AnalyticsScreen user={user} progress={progress} testAttempts={testAttempts} />}
                {currentScreen === 'profile' && <ProfileScreen user={user} onAcceptRequest={acceptConnectionRequest} onUpdateUser={(u) => { const updated = { ...user, ...u }; setUser(updated); saveUserToDB(updated); }} />}
              </>
          )}

          {user.role === 'ADMIN' && (
              <>
                {currentScreen === 'overview' && <AdminDashboardScreen user={user} onNavigate={setCurrentScreen} enableGoogleLogin={enableGoogleLogin} onToggleGoogle={() => setEnableGoogleLogin(!enableGoogleLogin)} />}
                {currentScreen === 'users' && <AdminUserManagementScreen />}
                {currentScreen === 'syllabus_admin' && <AdminSyllabusScreen syllabus={syllabus} onAddTopic={handleAddTopic} onDeleteTopic={handleDeleteTopic} />}
                {(currentScreen === 'inbox' || currentScreen === 'content_admin') && <AdminInboxScreen />}
                {currentScreen === 'content' && <ContentManagerScreen flashcards={flashcards} hacks={hacks} blogs={blogs} onAddFlashcard={addFlashcard} onAddHack={addHack} onAddBlog={addBlog} onDelete={deleteContent} initialTab='flashcards' />}
                {currentScreen === 'blog_admin' && <AdminBlogScreen blogs={blogs} onAddBlog={addBlog} onDeleteBlog={(id) => deleteContent('blog', id)} />}
                {(currentScreen === 'videos' || currentScreen === 'video_admin') && <VideoManagerScreen videoMap={videoMap} onUpdateVideo={updateVideo} />}
                {(currentScreen === 'tests' || currentScreen === 'tests_admin') && <AdminTestManagerScreen questionBank={questionBank} tests={adminTests} onAddQuestion={addQuestion} onCreateTest={createTest} onDeleteQuestion={deleteQuestion} onDeleteTest={deleteTest} syllabus={syllabus} />}
                {currentScreen === 'diagnostics' && <DiagnosticsScreen />}
                {currentScreen === 'deployment' && <DeploymentScreen />}
              </>
          )}

          {/* Shared/Placeholders */}
          {['ai-tutor','wellness','system','admin_analytics'].includes(currentScreen) && (
              <ComingSoonScreen title={currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1)} icon="🚧" />
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation currentScreen={currentScreen} setScreen={setCurrentScreen} logout={handleLogout} user={user} />
    </div>
  );
}

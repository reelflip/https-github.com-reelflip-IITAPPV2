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
import { AdminAnalyticsScreen } from './screens/AdminAnalyticsScreen';
import { AdminSystemScreen } from './screens/AdminSystemScreen';
import { AboutUsScreen } from './screens/AboutUsScreen';
import { ContactUsScreen } from './screens/ContactUsScreen';
import { ExamGuideScreen } from './screens/ExamGuideScreen';
import { PrivacyPolicyScreen } from './screens/PrivacyPolicyScreen';
import { FocusScreen } from './screens/FocusScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { WellnessScreen } from './screens/WellnessScreen';
import { BacklogScreen } from './screens/BacklogScreen'; 
import { PublicLayout } from './components/PublicLayout';
import { AITutorChat } from './components/AITutorChat';
import { User, UserProgress, TopicStatus, TestAttempt, Screen, Goal, MistakeLog, Flashcard, MemoryHack, BlogPost, VideoLesson, Question, Test, TimetableConfig, Topic, ContactMessage, BacklogItem, TopicNote, ChapterNote } from './lib/types';
import { calculateNextRevision } from './lib/utils';
import { SYLLABUS_DATA } from './lib/syllabusData';
import { TrendingUp, Bell } from 'lucide-react';

const APP_VERSION = '10.3';

const ComingSoonScreen = ({ title, icon }: { title: string, icon: string }) => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
    <p className="text-slate-500 max-w-md">This feature is available in the Pro version or is currently under development.</p>
  </div>
);

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
    }
];

// --- DB Helpers ---
const getUserDB = (): User[] => {
    const db = localStorage.getItem('iitjee_users_db');
    return db ? JSON.parse(db) : [];
};

const saveUserToDB = (user: User) => {
    const db = getUserDB();
    const index = db.findIndex(u => u.id === user.id);
    if (index >= 0) db[index] = user;
    else db.push(user);
    localStorage.setItem('iitjee_users_db', JSON.stringify(db));
};

const findUserById = (id: string) => getUserDB().find(u => u.id === id);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [enableGoogleLogin, setEnableGoogleLogin] = useState(false);
  const [gaMeasurementId, setGaMeasurementId] = useState<string | null>(null);
  
  // Persisted Data
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mistakes, setMistakes] = useState<MistakeLog[]>([]);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>([]);
  const [timetableData, setTimetableData] = useState<{config: TimetableConfig, slots: any[]} | null>(null);
  const [syllabus, setSyllabus] = useState<Topic[]>(SYLLABUS_DATA);
  const [linkedStudentData, setLinkedStudentData] = useState<{ progress: Record<string, UserProgress>; tests: TestAttempt[]; studentName: string; } | undefined>(undefined);
  
  // Shared Content
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
     { id: 1, front: "Newton's Second Law", back: "F = ma", subjectId: 'phys' },
     { id: 2, front: "Integration of sin(x)", back: "-cos(x) + C", subjectId: 'math' }
  ]);
  const [hacks, setHacks] = useState<MemoryHack[]>([
     { id: 1, title: 'Trig Values', description: 'Remember SOH CAH TOA', tag: 'Maths', subjectId: 'math', trick: 'SOH CAH TOA' }
  ]);
  const [blogs, setBlogs] = useState<BlogPost[]>([
     { 
       id: 1, 
       title: 'JEE Main & Advanced 2025: Complete Roadmap', 
       excerpt: 'A strategic month-by-month guide to conquering Physics, Chemistry, and Maths while managing Board Exams.', 
       content: '<h2>The Foundation</h2><p>Success in JEE Main and Advanced is not just about hard work; it is about <strong>smart work</strong> and consistent effort.</p><h3>1. Chemistry: The Scoring Machine</h3><p>Chemistry is the easiest subject to score in if you stick to the basics. <strong>NCERT is your Bible</strong> for Inorganic Chemistry. Do not ignore it.</p><h3>2. Physics: Concepts over Formulas</h3><p>Avoid rote memorization. Focus on Mechanics and Electrodynamics as they form the bulk of the paper. Solve Irodov for Advanced preparation.</p><h3>3. Mathematics: Practice is Key</h3><p>Calculus and Algebra require daily practice. Solve at least 30-40 problems every day to build muscle memory.</p><h3>4. Mock Tests</h3><p>Start taking full-length mock tests at least 6 months before the exam. Analyze your mistakes using the <strong>Mistake Notebook</strong> feature in this app.</p>', 
       author: 'System Admin', 
       date: new Date().toISOString(),
       imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000',
       category: 'Strategy'
     }
  ]);
  
  const [videoMap, setVideoMap] = useState<Record<string, VideoLesson>>({});
  const [noteMap, setNoteMap] = useState<Record<string, TopicNote>>({}); // Keeping for backward compatibility
  const [chapterNotes, setChapterNotes] = useState<Record<string, ChapterNote>>({}); // NEW
  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [adminTests, setAdminTests] = useState<Test[]>([]);

  // --- Version Check & Cache Busting ---
  useEffect(() => {
      const storedVersion = localStorage.getItem('iitjee_app_version');
      if (storedVersion !== APP_VERSION) {
          localStorage.removeItem('iitjee_blogs');
          localStorage.removeItem('iitjee_hacks');
          localStorage.removeItem('iitjee_flashcards');
          localStorage.removeItem('iitjee_notes');
          localStorage.removeItem('iitjee_chapter_notes');
          localStorage.setItem('iitjee_app_version', APP_VERSION);
      }
  }, []);

  // --- 1. Init System Settings (Google & GA) ---
  useEffect(() => {
      const initSettings = async () => {
          try {
              // Fetch Google Analytics ID
              const resGA = await fetch('/api/manage_settings.php?key=google_analytics_id');
              if(resGA.ok) {
                  const data = await resGA.json();
                  if (data && data.value) setGaMeasurementId(data.value);
              }

              // Fetch Google Login Status
              const resLogin = await fetch('/api/manage_settings.php?key=enable_google_login');
              if(resLogin.ok) {
                  const data = await resLogin.json();
                  if (data && data.value !== null) {
                      setEnableGoogleLogin(data.value === 'true');
                  }
              }
          } catch (e) { console.debug("Settings Init Failed (Offline/Demo)"); }
      };
      initSettings();
  }, []);

  const toggleGoogleLogin = async () => {
      const newState = !enableGoogleLogin;
      setEnableGoogleLogin(newState);
      try {
          await fetch('/api/manage_settings.php', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ key: 'enable_google_login', value: String(newState) })
          });
      } catch(e) { console.error("Failed to save setting"); }
  };

  // --- 2. Fetch Public Content (Blogs/Hacks/Notes) from API ---
  useEffect(() => {
      const fetchPublicContent = async () => {
          try {
            const blogRes = await fetch('/api/manage_content.php?type=blogs');
            if (blogRes.ok) {
                const blogData = await blogRes.json();
                if (Array.isArray(blogData) && blogData.length > 0) setBlogs(blogData);
            }

            const fcRes = await fetch('/api/manage_content.php?type=flashcards');
            if (fcRes.ok) {
                const fcData = await fcRes.json();
                if (Array.isArray(fcData) && fcData.length > 0) setFlashcards(fcData);
            }
            
            const hacksRes = await fetch('/api/manage_content.php?type=hacks');
            if (hacksRes.ok) {
                const hacksData = await hacksRes.json();
                if (Array.isArray(hacksData) && hacksData.length > 0) setHacks(hacksData);
            }

            // Fetch Notes (New Multi-page)
            const notesRes = await fetch('/api/manage_notes.php');
            if (notesRes.ok) {
                const notesData = await notesRes.json();
                if (notesData) setChapterNotes(notesData);
            }

          } catch (e) {
             console.error("Failed to fetch public content", e);
             const savedBlogs = localStorage.getItem('iitjee_blogs');
             if (savedBlogs) setBlogs(JSON.parse(savedBlogs));
             
             // Fallback local storage for notes
             const savedChapterNotes = localStorage.getItem('iitjee_chapter_notes');
             if (savedChapterNotes) setChapterNotes(JSON.parse(savedChapterNotes));
          }
      };
      fetchPublicContent();
  }, []);

  // --- 3. Initial Data Load (User & LocalStorage) ---
  useEffect(() => {
    const savedUser = localStorage.getItem('iitjee_user');
    const savedVideos = localStorage.getItem('iitjee_videos');
    const savedQuestions = localStorage.getItem('iitjee_questions');
    const savedAdminTests = localStorage.getItem('iitjee_admin_tests');
    const savedSyllabus = localStorage.getItem('iitjee_syllabus');

    if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        fetchRemoteData(u.id);
        if(u.role === 'PARENT' && u.linkedStudentId) loadLinkedStudent(u.linkedStudentId);
    }
    
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

  // --- 4. Persist User Data ---
  useEffect(() => {
    if (user) {
        localStorage.setItem('iitjee_user', JSON.stringify(user));
        saveUserToDB(user);
        localStorage.setItem(`iitjee_progress_${user.id}`, JSON.stringify(progress));
        localStorage.setItem(`iitjee_tests_${user.id}`, JSON.stringify(testAttempts));
        localStorage.setItem(`iitjee_goals_${user.id}`, JSON.stringify(goals));
        localStorage.setItem(`iitjee_mistakes_${user.id}`, JSON.stringify(mistakes));
        localStorage.setItem(`iitjee_backlogs_${user.id}`, JSON.stringify(backlogs));
        if (timetableData) localStorage.setItem(`iitjee_timetable_${user.id}`, JSON.stringify(timetableData));
    }
    localStorage.setItem('iitjee_videos', JSON.stringify(videoMap));
    localStorage.setItem('iitjee_questions', JSON.stringify(questionBank));
    localStorage.setItem('iitjee_admin_tests', JSON.stringify(adminTests));
    localStorage.setItem('iitjee_syllabus', JSON.stringify(syllabus));
    
    if(blogs.length > 0) localStorage.setItem('iitjee_blogs', JSON.stringify(blogs));
    if(flashcards.length > 0) localStorage.setItem('iitjee_flashcards', JSON.stringify(flashcards));
    if(hacks.length > 0) localStorage.setItem('iitjee_hacks', JSON.stringify(hacks));
    localStorage.setItem('iitjee_chapter_notes', JSON.stringify(chapterNotes));

  }, [user, progress, testAttempts, goals, mistakes, backlogs, timetableData, videoMap, questionBank, adminTests, syllabus, blogs, flashcards, hacks, chapterNotes]);

  // ... (loadLocalData, fetchRemoteData, loadLinkedStudent, handleLogin, handleLogout ... same as before)
  const loadLocalData = (userId: string) => {
    const savedProgress = localStorage.getItem(`iitjee_progress_${userId}`);
    const savedTests = localStorage.getItem(`iitjee_tests_${userId}`);
    const savedGoals = localStorage.getItem(`iitjee_goals_${userId}`);
    const savedMistakes = localStorage.getItem(`iitjee_mistakes_${userId}`);
    const savedBacklogs = localStorage.getItem(`iitjee_backlogs_${userId}`);
    const savedTimetable = localStorage.getItem(`iitjee_timetable_${userId}`);

    if (savedProgress) setProgress(JSON.parse(savedProgress)); else setProgress({});
    if (savedTests) setTestAttempts(JSON.parse(savedTests)); else setTestAttempts([]);
    if (savedGoals) setGoals(JSON.parse(savedGoals)); else setGoals([]);
    if (savedMistakes) setMistakes(JSON.parse(savedMistakes)); else setMistakes([]);
    if (savedBacklogs) setBacklogs(JSON.parse(savedBacklogs)); else setBacklogs([]);
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
          } else { setProgress({}); }
          if (data.attempts) setTestAttempts(data.attempts);
          if (data.goals) setGoals(data.goals);
          if (data.timetable) {
              setTimetableData({ config: data.timetable.config, slots: data.timetable.slots });
          } else { setTimetableData(null); }
      } catch (e) { loadLocalData(userId); }
  };

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
    if (existingUser) { newUser = { ...existingUser, ...userData, id: existingUser.id }; } 
    else { newUser = { ...userData, id: userData.id || Math.floor(100000 + Math.random() * 900000).toString(), notifications: [] }; }
    setUser(newUser);
    fetchRemoteData(newUser.id);
    if (newUser.role === 'ADMIN') setCurrentScreen('overview');
    else if (newUser.role === 'PARENT') { setCurrentScreen('dashboard'); if(newUser.linkedStudentId) loadLinkedStudent(newUser.linkedStudentId); }
    else setCurrentScreen('dashboard');
  };

  const handleLogout = () => { setUser(null); setCurrentScreen('dashboard'); localStorage.removeItem('iitjee_user'); setLinkedStudentData(undefined); };
  const handleNavigation = (page: string) => { setCurrentScreen(page as Screen); };
  const sendConnectionRequest = async (studentId: string): Promise<{success: boolean, message: string}> => {
      if(!user) return { success: false, message: 'Not logged in' };
      const student = findUserById(studentId);
      if(!student) return { success: false, message: 'Student ID not found' };
      if(student.role !== 'STUDENT') return { success: false, message: 'ID belongs to non-student' };
      const updatedStudent = { ...student, notifications: [ ...(student.notifications || []), { id: Date.now().toString(), fromId: user.id, fromName: user.name, type: 'connection_request' as const, date: new Date().toISOString() } ] };
      saveUserToDB(updatedStudent);
      return { success: true, message: 'Invitation sent successfully!' };
  };

  const searchStudents = async (query: string): Promise<User[]> => {
      // 1. Try API
      try {
          const res = await fetch('/api/send_request.php', {
              method: 'POST',
              body: JSON.stringify({ action: 'search', query })
          });
          if(res.ok) {
              const data = await res.json();
              if(Array.isArray(data)) return data;
          }
      } catch(e) {}

      // 2. Fallback local search (Demo mode)
      const db = getUserDB();
      return db.filter(u => 
          u.role === 'STUDENT' && 
          (u.name.toLowerCase().includes(query.toLowerCase()) || 
           u.id.includes(query) || 
           u.email.toLowerCase().includes(query.toLowerCase()))
      );
  };

  const acceptConnectionRequest = (notificationId: string) => {
      if(!user) return;
      const notification = user.notifications?.find(n => n.id === notificationId);
      if(!notification) return;
      const parentId = notification.fromId;
      const parent = findUserById(parentId);
      const updatedStudent: User = { ...user, notifications: user.notifications?.filter(n => n.id !== notificationId), parentId: parentId };
      setUser(updatedStudent); 
      if(parent) { const updatedParent = { ...parent, linkedStudentId: user.id }; saveUserToDB(updatedParent); }
  };
  const updateTopicProgress = (topicId: string, updates: Partial<UserProgress>) => {
    setProgress(prev => {
      const current = prev[topicId] || { topicId, status: 'NOT_STARTED', lastRevised: null, revisionLevel: 0, nextRevisionDate: null };
      if (updates.status === 'COMPLETED' && current.status !== 'COMPLETED') {
        const now = new Date().toISOString();
        updates.lastRevised = now; updates.nextRevisionDate = calculateNextRevision(0, now); updates.revisionLevel = 0;
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
      return { ...prev, [topicId]: { ...current, lastRevised: now, revisionLevel: newLevel, nextRevisionDate: calculateNextRevision(newLevel, now) } };
    });
  };
  const updateVideo = (topicId: string, url: string, description: string) => { setVideoMap(prev => ({ ...prev, [topicId]: { topicId, videoUrl: url, description } })); };
  
  // Note Saver (Updated for Multi-page support)
  const updateChapterNotes = (topicId: string, pages: string[]) => {
      setChapterNotes(prev => ({ ...prev, [topicId]: { id: Date.now(), topicId, pages, lastUpdated: new Date().toISOString() } }));
      // API Call
      fetch('/api/manage_notes.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicId, pages })
      }).catch(console.error);
  };

  const saveTimetable = (config: TimetableConfig, slots: any[]) => { setTimetableData({ config, slots }); };
  const addQuestion = (q: Question) => setQuestionBank(prev => [...prev, q]);
  const deleteQuestion = (id: string) => setQuestionBank(prev => prev.filter(q => q.id !== id));
  const createTest = (t: Test) => setAdminTests(prev => [...prev, t]);
  const deleteTest = (id: string) => setAdminTests(prev => prev.filter(t => t.id !== id));
  const addTestAttempt = (attempt: TestAttempt) => setTestAttempts(prev => [...prev, attempt]);
  const addGoal = (text: string) => setGoals(prev => [...prev, { id: Date.now().toString(), text, completed: false }]);
  const toggleGoal = (id: string) => setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  const addMistake = (m: Omit<MistakeLog, 'id' | 'date'>) => setMistakes(prev => [{ ...m, id: Date.now().toString(), date: new Date().toISOString() }, ...prev]);
  
  // --- Updated Content Management Functions with API Persistence ---
  
  const addFlashcard = (card: Omit<Flashcard, 'id'>) => {
      const newCard = { ...card, id: Date.now() };
      setFlashcards(prev => [...prev, newCard]);
      fetch('/api/manage_content.php?type=flashcard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(card)
      }).catch(e => console.error(e));
  };

  const addHack = (hack: Omit<MemoryHack, 'id'>) => {
      const newHack = { ...hack, id: Date.now() };
      setHacks(prev => [...prev, newHack]);
      fetch('/api/manage_content.php?type=hack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hack)
      }).catch(e => console.error(e));
  };

  const addBlog = (blog: Omit<BlogPost, 'id' | 'date'>) => {
      const newBlog = { ...blog, id: Date.now(), date: new Date().toISOString() };
      setBlogs(prev => [newBlog, ...prev]);
      fetch('/api/manage_content.php?type=blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blog)
      }).catch(e => console.error(e));
  };

  const deleteContent = (type: 'flashcard' | 'hack' | 'blog', id: number) => {
    if(type === 'flashcard') setFlashcards(prev => prev.filter(i => i.id !== id));
    if(type === 'hack') setHacks(prev => prev.filter(i => i.id !== id));
    if(type === 'blog') setBlogs(prev => prev.filter(i => i.id !== id));
    
    fetch(`/api/manage_content.php?type=${type}&id=${id}`, {
        method: 'DELETE'
    }).catch(e => console.error(e));
  };

  const handleAddTopic = (topic: Omit<Topic, 'id'>) => { const newTopic: Topic = { ...topic, id: `${topic.subject[0].toLowerCase()}_${Date.now()}` }; setSyllabus(prev => [...prev, newTopic]); };
  const handleDeleteTopic = (id: string) => { setSyllabus(prev => prev.filter(t => t.id !== id)); };
  const addBacklog = (item: Omit<BacklogItem, 'id' | 'status'>) => { setBacklogs(prev => [...prev, { ...item, id: `bl_${Date.now()}`, status: 'PENDING' }]); };
  const toggleBacklog = (id: string) => { setBacklogs(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'PENDING' ? 'COMPLETED' : 'PENDING' } : b)); };
  const deleteBacklog = (id: string) => { setBacklogs(prev => prev.filter(b => b.id !== id)); };

  if (currentScreen === 'public-blog') return <PublicBlogScreen blogs={blogs} onBack={() => user ? setCurrentScreen('dashboard') : setCurrentScreen('dashboard')} />;
  if (currentScreen === 'about') return <PublicLayout onNavigate={handleNavigation} currentScreen="about"><AboutUsScreen /></PublicLayout>;
  if (currentScreen === 'contact') return <PublicLayout onNavigate={handleNavigation} currentScreen="contact"><ContactUsScreen /></PublicLayout>;
  if (currentScreen === 'exams') return <PublicLayout onNavigate={handleNavigation} currentScreen="exams"><ExamGuideScreen /></PublicLayout>;
  if (currentScreen === 'privacy') return <PublicLayout onNavigate={handleNavigation} currentScreen="privacy"><PrivacyPolicyScreen /></PublicLayout>;

  if (!user) { return <AuthScreen onLogin={handleLogin} onNavigate={handleNavigation} enableGoogleLogin={enableGoogleLogin} />; }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      <Navigation currentScreen={currentScreen} setScreen={setCurrentScreen} logout={handleLogout} user={user} />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen pb-24 md:pb-8 relative">
        <div className="md:hidden flex justify-between items-center mb-6 sticky top-0 bg-slate-50 z-30 py-2 border-b border-slate-200">
            <div className="flex items-center gap-2"><div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-blue-400"><TrendingUp className="w-5 h-5" /></div><span className="font-bold text-lg text-slate-800">IITGEEPrep</span></div>
            <div className="flex items-center gap-3">
                {user.notifications && user.notifications.length > 0 && <div className="relative p-2"><Bell className="w-6 h-6 text-slate-600" /><span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-white"></span></div>}
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
                {currentScreen === 'tests' && <TestScreen user={user} history={linkedStudentData?.tests || []} addTestAttempt={()=>{}} availableTests={adminTests} />}
                {currentScreen === 'syllabus' && <SyllabusScreen user={user} subjects={syllabus} progress={linkedStudentData?.progress || {}} onUpdateProgress={()=>{}} readOnly={true} videoMap={videoMap} chapterNotes={chapterNotes} />}
                {currentScreen === 'profile' && <ProfileScreen user={user} onAcceptRequest={()=>{}} onUpdateUser={(u) => { const updated = { ...user, ...u }; setUser(updated); saveUserToDB(updated); }} linkedStudentName={linkedStudentData?.studentName} />} 
             </>
          )}
          {user.role === 'STUDENT' && (
              <>
                <AITutorChat isFullScreen={currentScreen === 'ai-tutor'} />
                
                {currentScreen === 'dashboard' && <DashboardScreen user={user} progress={progress} testAttempts={testAttempts} goals={goals} addGoal={addGoal} toggleGoal={toggleGoal} setScreen={setCurrentScreen} />}
                {currentScreen === 'syllabus' && <SyllabusScreen user={user} subjects={syllabus} progress={progress} onUpdateProgress={updateTopicProgress} videoMap={videoMap} chapterNotes={chapterNotes} />}
                {currentScreen === 'revision' && <RevisionScreen progress={progress} handleRevisionComplete={handleRevisionComplete} />}
                {currentScreen === 'tests' && <TestScreen user={user} history={testAttempts} addTestAttempt={addTestAttempt} availableTests={adminTests} />}
                {currentScreen === 'timetable' && <TimetableScreen user={user} savedConfig={timetableData?.config} savedSlots={timetableData?.slots} onSave={saveTimetable} progress={progress} />}
                {currentScreen === 'focus' && <FocusScreen />}
                {currentScreen === 'ai-tutor' && (
                   <div className="h-full hidden md:block"></div> 
                )}
                {currentScreen === 'flashcards' && <FlashcardScreen flashcards={flashcards} />}
                {currentScreen === 'mistakes' && <MistakesScreen mistakes={mistakes} addMistake={addMistake} />}
                {currentScreen === 'backlogs' && <BacklogScreen backlogs={backlogs} onAddBacklog={addBacklog} onToggleBacklog={toggleBacklog} onDeleteBacklog={deleteBacklog} />}
                {currentScreen === 'hacks' && <HacksScreen hacks={hacks} />}
                {currentScreen === 'analytics' && <AnalyticsScreen user={user} progress={progress} testAttempts={testAttempts} />}
                {currentScreen === 'wellness' && <WellnessScreen />}
                {currentScreen === 'profile' && <ProfileScreen user={user} onAcceptRequest={acceptConnectionRequest} onUpdateUser={(u) => { const updated = { ...user, ...u }; setUser(updated); saveUserToDB(updated); }} />}
              </>
          )}
          {user.role === 'ADMIN' && (
              <>
                {currentScreen === 'overview' && <AdminDashboardScreen user={user} onNavigate={setCurrentScreen} enableGoogleLogin={enableGoogleLogin} onToggleGoogle={toggleGoogleLogin} />}
                {currentScreen === 'users' && <AdminUserManagementScreen />}
                {currentScreen === 'syllabus_admin' && <AdminSyllabusScreen syllabus={syllabus} onAddTopic={handleAddTopic} onDeleteTopic={handleDeleteTopic} chapterNotes={chapterNotes} onUpdateNotes={updateChapterNotes} />}
                {(currentScreen === 'inbox' || currentScreen === 'content_admin') && <AdminInboxScreen />}
                {currentScreen === 'content' && <ContentManagerScreen flashcards={flashcards} hacks={hacks} blogs={blogs} onAddFlashcard={addFlashcard} onAddHack={addHack} onAddBlog={addBlog} onDelete={deleteContent} initialTab='flashcards' />}
                {currentScreen === 'blog_admin' && <AdminBlogScreen blogs={blogs} onAddBlog={addBlog} onDeleteBlog={(id) => deleteContent('blog', id)} />}
                {(currentScreen === 'videos' || currentScreen === 'video_admin') && <VideoManagerScreen videoMap={videoMap} onUpdateVideo={updateVideo} />}
                {(currentScreen === 'tests' || currentScreen === 'tests_admin') && <AdminTestManagerScreen questionBank={questionBank} tests={adminTests} onAddQuestion={addQuestion} onCreateTest={createTest} onDeleteQuestion={deleteQuestion} onDeleteTest={deleteTest} syllabus={syllabus} />}
                {currentScreen === 'analytics' && <AdminAnalyticsScreen />}
                {currentScreen === 'diagnostics' && <DiagnosticsScreen />}
                {currentScreen === 'deployment' && <DeploymentScreen />}
                {currentScreen === 'system' && <AdminSystemScreen />}
              </>
          )}
          {['admin_analytics'].includes(currentScreen) && <ComingSoonScreen title={currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1)} icon="🚧" />}
        </div>
      </main>
      <MobileNavigation currentScreen={currentScreen} setScreen={setCurrentScreen} logout={handleLogout} user={user} />
    </div>
  );
}
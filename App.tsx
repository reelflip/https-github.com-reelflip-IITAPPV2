
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
      // If we are in offline mode, don't even try to fetch
      if (isOfflineMode) {
          console.log(`[Offline] Skipped API call to ${endpoint}`);
          return { status: 'success', offline: true };
      }

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
                  // Backend not found, switch to offline mode immediately
                  setIsOfflineMode(true);
                  setSyncStatus('OFFLINE');
                  setSyncErrorMsg(null);
                  return { status: 'success', offline: true };
              }
              throw new Error(`HTTP ${res.status}`);
          }
          const data = await res.json();
          setSyncStatus('SYNCED');
          setSyncErrorMsg(null);
          return data;
      } catch (error) {
          console.error("Sync Failed:", error);
          // If fetch failed completely (network error), switch to offline
          setIsOfflineMode(true);
          setSyncStatus('OFFLINE');
          return { status: 'success', offline: true };
      }
  }, [user, isOfflineMode]);

  // --- Version Check & Validation ---
  useEffect(() => {
      const storedVersion = localStorage.getItem('iitjee_app_version');
      if (storedVersion !== APP_VERSION) {
          localStorage.removeItem('iitjee_admin_tests');
          localStorage.setItem('iitjee_app_version', APP_VERSION);
          setAdminTests(MOCK_TESTS_DATA);
      }
      fetch('/api/track_visit.php').catch(() => {});
  }, []);

  // --- Safety Check for Screen on User Load ---
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
      const initSettings = async () => {
          try {
              const resGA = await fetch('/api/manage_settings.php?key=google_analytics_id');
              if(resGA.ok) {
                  const data = await resGA.json();
                  if (data && data.value) setGaMeasurementId(data.value);
              }
              const resLogin = await fetch('/api/manage_settings.php?key=enable_google_login');
              if(resLogin.ok) {
                  const data = await resLogin.json();
                  if (data && data.value !== null) setEnableGoogleLogin(data.value === 'true');
              }
              const resSocial = await fetch('/api/manage_settings.php?key=social_links');
              if(resSocial.ok) {
                  const data = await resSocial.json();
                  if (data && data.value) {
                      setSocialConfig(JSON.parse(data.value));
                  }
              }
          } catch (e) {}
      };
      initSettings();
  }, []);

  useEffect(() => {
      const fetchPublicContent = async () => {
          try {
            const blogRes = await fetch('/api/manage_content.php?type=blogs');
            if (blogRes.ok) { const d = await blogRes.json(); if (Array.isArray(d)) setBlogs(d); }

            const fcRes = await fetch('/api/manage_content.php?type=flashcards');
            if (fcRes.ok) { const d = await fcRes.json(); if (Array.isArray(d)) setFlashcards(d); }
            
            const hacksRes = await fetch('/api/manage_content.php?type=hacks');
            if (hacksRes.ok) { const d = await hacksRes.json(); if (Array.isArray(d)) setHacks(d); }

            const notesRes = await fetch('/api/manage_notes.php');
            if (notesRes.ok) {
                const notesData = await notesRes.json();
                if (notesData) setChapterNotes(prev => ({ ...prev, ...notesData }));
            }
          } catch (e) {
             const savedChapterNotes = localStorage.getItem('iitjee_chapter_notes');
             if (savedChapterNotes) setChapterNotes(prev => ({ ...prev, ...JSON.parse(savedChapterNotes) }));
          }
      };
      fetchPublicContent();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('iitjee_user');
    const savedVideos = localStorage.getItem('iitjee_videos');
    const savedQuestions = localStorage.getItem('iitjee_questions');
    const savedAdminTests = localStorage.getItem('iitjee_admin_tests');
    const savedSyllabus = localStorage.getItem('iitjee_syllabus');

    if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        // CRITICAL: Ensure we fetch fresh data on load
        fetchRemoteData(u.id);
        if(u.role === 'PARENT' && u.linkedStudentId) loadLinkedStudent(u.linkedStudentId);
    }
    
    if (savedVideos) setVideoMap(JSON.parse(savedVideos));
    
    if (savedQuestions) {
        const parsed = JSON.parse(savedQuestions);
        setQuestionBank(parsed.length > 0 ? parsed : generateInitialQuestionBank());
    } else {
        setQuestionBank(generateInitialQuestionBank());
    }
    
    if (savedAdminTests) {
        const parsedTests = JSON.parse(savedAdminTests);
        setAdminTests(parsedTests.length > 0 ? parsedTests : MOCK_TESTS_DATA);
    } else {
        setAdminTests(MOCK_TESTS_DATA);
    }

    if (savedSyllabus) setSyllabus(JSON.parse(savedSyllabus));
  }, []);

  // Persist Local Backup (Global Settings)
  useEffect(() => {
    if (user) {
        localStorage.setItem('iitjee_user', JSON.stringify(user));
    }
    localStorage.setItem('iitjee_videos', JSON.stringify(videoMap));
    localStorage.setItem('iitjee_questions', JSON.stringify(questionBank));
    localStorage.setItem('iitjee_admin_tests', JSON.stringify(adminTests));
    localStorage.setItem('iitjee_syllabus', JSON.stringify(syllabus));
    localStorage.setItem('iitjee_chapter_notes', JSON.stringify(chapterNotes));
  }, [user, videoMap, questionBank, adminTests, syllabus, chapterNotes]);

  // Persist User-Specific Data (Offline Support)
  useEffect(() => {
      if (user) {
          localStorage.setItem(`iitjee_progress_${user.id}`, JSON.stringify(progress));
          localStorage.setItem(`iitjee_tests_${user.id}`, JSON.stringify(testAttempts));
          localStorage.setItem(`iitjee_goals_${user.id}`, JSON.stringify(goals));
          localStorage.setItem(`iitjee_mistakes_${user.id}`, JSON.stringify(mistakes));
          localStorage.setItem(`iitjee_backlogs_${user.id}`, JSON.stringify(backlogs));
          if(timetableData) localStorage.setItem(`iitjee_timetable_${user.id}`, JSON.stringify(timetableData));
      }
  }, [user, progress, testAttempts, goals, mistakes, backlogs, timetableData]);

  const loadLocalData = (userId: string) => {
    const savedProgress = localStorage.getItem(`iitjee_progress_${userId}`);
    const savedTests = localStorage.getItem(`iitjee_tests_${userId}`);
    const savedGoals = localStorage.getItem(`iitjee_goals_${userId}`);
    const savedMistakes = localStorage.getItem(`iitjee_mistakes_${userId}`);
    const savedBacklogs = localStorage.getItem(`iitjee_backlogs_${userId}`);
    const savedTimetable = localStorage.getItem(`iitjee_timetable_${userId}`);

    if (savedProgress) setProgress(JSON.parse(savedProgress));
    if (savedTests) setTestAttempts(JSON.parse(savedTests));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedMistakes) setMistakes(JSON.parse(savedMistakes));
    if (savedBacklogs) setBacklogs(JSON.parse(savedBacklogs));
    if (savedTimetable) setTimetableData(JSON.parse(savedTimetable));
  };

  const fetchRemoteData = async (userId: string, retryCount = 0) => {
      setSyncStatus('SAVING'); 
      setSyncErrorMsg(null);
      try {
          const res = await fetch(`/api/get_dashboard.php?user_id=${userId}`);
          
          if (!res.ok) {
              if (res.status === 404) {
                  // Gracefully switch to Offline Mode without crashing the UI
                  console.warn("Backend API not found. Switching to Offline Mode.");
                  setIsOfflineMode(true);
                  setSyncStatus('OFFLINE');
                  // Do NOT throw error, just load local and continue
                  loadLocalData(userId);
                  
                  // Only warn admin users to reduce noise for regular students using static site
                  if (user?.role === 'ADMIN') {
                      setSyncErrorMsg("Backend API missing. Deploy PHP files to enable sync.");
                  }
                  return;
              } else if (res.status === 500) {
                  if (retryCount === 0) {
                      // Attempt Auto-Heal for DB Schema mismatch
                      console.log("Detecting DB Schema mismatch. Attempting auto-repair...");
                      await fetch('/api/migrate_db.php');
                      // Retry once
                      return fetchRemoteData(userId, 1);
                  }
                  throw new Error("Server Error (500). Check Database Credentials in config.php.");
              }
              throw new Error(`HTTP Error ${res.status}`);
          }
          
          const text = await res.text();
          let data;
          try {
              data = JSON.parse(text);
          } catch(e) {
              console.error("Invalid JSON response:", text.substring(0, 100));
              if (text.includes("<!DOCTYPE html>") || text.includes("<html>")) {
                  throw new Error("Server returned HTML instead of JSON. Check .htaccess configuration.");
              }
              throw new Error("Invalid Server Response (JSON Parse Error)");
          }
          
          if (data.error) throw new Error(data.error);

          // Populate State
          if (Array.isArray(data.progress)) {
              const progMap: Record<string, UserProgress> = {};
              data.progress.forEach((p: any) => {
                  // Handle both snake_case (from new API) and camelCase (legacy)
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
          console.error("Remote Fetch Failed:", e);
          setIsOfflineMode(true);
          setSyncStatus('OFFLINE');
          // Only show banner for non-404 errors (like network/500/syntax)
          setSyncErrorMsg(`Connection Failed: ${e.message}`);
          loadLocalData(userId); 
      }
  };

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
    if (userData.role === 'PARENT' && userData.linkedStudentId) loadLinkedStudent(userData.linkedStudentId);
  };

  const handleLogout = () => { 
      setUser(null); 
      setCurrentScreen('dashboard'); 
      localStorage.removeItem('iitjee_user'); 
      setLinkedStudentData(undefined); 
  };
  
  const handleNavigation = (page: string) => { setCurrentScreen(page as Screen); };
  
  // --- Data Mutators using apiClient ---

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
          const updatedNotifs = user.notifications.filter(n => n.id !== notificationId);
          const updatedUser = { ...user, notifications: updatedNotifs, parentId: notification.fromId };
          setUser(updatedUser);
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
      
      // Update Server - IMPORTANT: We send 'topic_id' to match PHP expectation in sync_progress.php
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

  const updateVideo = (topicId: string, url: string, description: string) => { 
      setVideoMap(prev => ({ ...prev, [topicId]: { topicId, videoUrl: url, description } })); 
      // Admin APIs usually don't need the same user-sync logic but good to keep consistent
      fetch('/api/manage_videos.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ topicId, url, desc: description }) });
  };
  
  const updateChapterNotes = (topicId: string, pages: string[]) => {
      setChapterNotes(prev => ({ ...prev, [topicId]: { id: Date.now(), topicId, pages, lastUpdated: new Date().toISOString() } }));
      fetch('/api/manage_notes.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topicId, pages }) });
  };

  const saveTimetable = (config: TimetableConfig, slots: any[]) => { 
      setTimetableData({ config, slots }); 
      if (user) {
          apiCall('/api/save_timetable.php', 'POST', { user_id: user.id, config, slots });
      }
  };

  const addQuestion = (q: Question) => setQuestionBank(prev => [...prev, q]);
  const deleteQuestion = (id: string) => setQuestionBank(prev => prev.filter(q => q.id !== id));
  const createTest = (t: Test) => setAdminTests(prev => [...prev, t]);
  const deleteTest = (id: string) => setAdminTests(prev => prev.filter(t => t.id !== id));
  
  const addTestAttempt = (attempt: TestAttempt) => {
      setTestAttempts(prev => [...prev, attempt]);
      if (user) {
          apiCall('/api/save_attempt.php', 'POST', { ...attempt, user_id: user.id });
      }
  };

  const addGoal = (text: string) => {
      if(!user) return;
      const id = Date.now().toString();
      const newGoal = { id, text, completed: false };
      setGoals(prev => [...prev, newGoal]);
      apiCall('/api/manage_goals.php', 'POST', { id, user_id: user.id, text });
  };

  const toggleGoal = (id: string) => {
      if(!user) return;
      setGoals(prev => {
          const updated = prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
          const goal = updated.find(g => g.id === id);
          if(goal) {
              apiCall('/api/manage_goals.php', 'PUT', { id, completed: goal.completed });
          }
          return updated;
      });
  };

  const addMistake = (m: Omit<MistakeLog, 'id' | 'date'>) => {
      if(!user) return;
      const id = Date.now().toString();
      const date = new Date().toISOString();
      const newMistake = { ...m, id, date };
      setMistakes(prev => [newMistake, ...prev]);
      apiCall('/api/manage_mistakes.php', 'POST', { id, user_id: user.id, ...newMistake });
  };
  
  // Public Content Managers (Admin) - Using simple fetch as they are less critical for sync state
  const addFlashcard = (card: Omit<Flashcard, 'id'>) => { 
      const newCard = { ...card, id: Date.now() };
      setFlashcards(prev => [...prev, newCard]); 
      fetch('/api/manage_content.php?type=flashcard', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...card, type: 'flashcard'}) });
  };

  const addHack = (hack: Omit<MemoryHack, 'id'>) => { 
      const newHack = { ...hack, id: Date.now() };
      setHacks(prev => [...prev, newHack]); 
      fetch('/api/manage_content.php?type=hack', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...hack, type: 'hack'}) });
  };

  const addBlog = (blog: Omit<BlogPost, 'id' | 'date'>) => { 
      const tempId = Date.now();
      const newBlog = { ...blog, id: tempId, date: new Date().toISOString() };
      setBlogs(prev => [newBlog, ...prev]); 
      fetch('/api/manage_content.php?type=blog', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...blog, type: 'blog'}) })
      .then(res => res.json()).then(data => { if(data && data.id) setBlogs(prev => prev.map(b => b.id === tempId ? { ...b, id: data.id } : b)); });
  };

  const updateBlog = (blog: BlogPost) => { 
      setBlogs(prev => prev.map(b => b.id === blog.id ? blog : b)); 
      fetch('/api/manage_content.php?type=blog', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...blog, type: 'blog'}) });
  };

  const deleteContent = (type: 'flashcard' | 'hack' | 'blog', id: number) => {
    if(type === 'flashcard') setFlashcards(prev => prev.filter(i => i.id !== id));
    if(type === 'hack') setHacks(prev => prev.filter(i => i.id !== id));
    if(type === 'blog') setBlogs(prev => prev.filter(i => i.id !== id));
    fetch(`/api/manage_content.php?type=${type}&id=${id}`, { method: 'DELETE' });
  };

  const handleAddTopic = (topic: Omit<Topic, 'id'>) => { 
      const newTopic: Topic = { ...topic, id: `${topic.subject[0].toLowerCase()}_${Date.now()}` }; 
      setSyllabus(prev => [...prev, newTopic]); 
      fetch('/api/manage_syllabus.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newTopic) });
  };

  const handleDeleteTopic = (id: string) => { 
      setSyllabus(prev => prev.filter(t => t.id !== id)); 
      fetch(`/api/manage_syllabus.php?id=${id}`, { method: 'DELETE' });
  };

  const addBacklog = (item: Omit<BacklogItem, 'id' | 'status'>) => {
      if(!user) return;
      const id = `bl_${Date.now()}`;
      const newItem = { ...item, id, status: 'PENDING' as const };
      setBacklogs(prev => [...prev, newItem]);
      apiCall('/api/manage_backlogs.php', 'POST', { id, user_id: user.id, ...item, status: 'PENDING' });
  };

  const toggleBacklog = (id: string) => { setBacklogs(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'PENDING' ? 'COMPLETED' : 'PENDING' } : b)); };
  const deleteBacklog = (id: string) =>
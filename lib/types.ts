
// Add global window type definition
declare global {
  interface Window {
    IITJEE_CONFIG: {
      enableDevTools: boolean;
    };
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        }
      }
    };
  }
}

export type Subject = 'Physics' | 'Chemistry' | 'Maths';

export type TopicStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BACKLOG' | 'REVISE' | 'NOT_STARTED';

export type Role = 'STUDENT' | 'ADMIN' | 'PARENT';

export interface Topic {
  id: string;
  name: string;
  chapter: string;
  subject: Subject;
}

export interface UserProgress {
  topicId: string;
  status: TopicStatus;
  lastRevised: string | null; // ISO Date string
  revisionLevel: number; // 0 to 4
  nextRevisionDate: string | null; // ISO Date string
  revisionCount?: number;
  // Exercise Tracking
  ex1Solved?: number;
  ex1Total?: number;
  ex2Solved?: number;
  ex2Total?: number;
  ex3Solved?: number;
  ex3Total?: number;
  ex4Solved?: number;
  ex4Total?: number;
}

export interface VideoLesson {
  topicId: string;
  videoUrl: string;
  description?: string;
}

// Updated Note Interface
export interface ChapterNote {
  id: number;
  topicId: string;
  pages: string[]; // Array of HTML strings, one per page
  lastUpdated: string;
}

// Deprecated (Keep for compatibility if needed, but we use ChapterNote now)
export interface TopicNote {
  id: number;
  topicId: string;
  content: string;
  lastUpdated: string;
}

export interface TestAttempt {
  id: string;
  date: string;
  title: string;
  score: number;
  totalMarks: number;
  accuracy: number; // Percentage (0-100)
  mistakes?: string[]; // Legacy
  studentId?: string;
  testId: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy_percent: number;
  detailedResults?: QuestionResult[];
}

export interface QuestionResult {
    questionId: string;
    subjectId: string;
    topicId: string;
    status: 'CORRECT' | 'INCORRECT' | 'UNATTEMPTED';
    selectedOptionIndex?: number;
}

export interface Notification {
  id: string;
  fromId: string;
  fromName: string;
  type: 'connection_request' | 'info';
  date: string;
  title?: string;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  targetExam: string;
  role: Role;
  linkedStudentId?: string | null; 
  notifications?: Notification[];
  // Extra profile fields
  institute?: string;
  school?: string;
  course?: string;
  targetYear?: number;
  phone?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | '';
  avatarUrl?: string;
  isVerified?: boolean;
  studentId?: string; // For parents to connect
  parentId?: string; // For students
  pendingRequest?: { fromId: string; fromName: string };
  googleId?: string; // For Social Login
}

export interface MasterPlanWeek {
    weekNumber: number;
    startDate: string;
    endDate: string;
    focus: 'LEARNING' | 'REVISION' | 'MOCK';
    topics: Topic[]; // Topics assigned to this week
    completed: boolean;
}

export interface TimetableConfig {
  wakeTime: string;
  bedTime: string; 
  schoolStart: string;
  schoolEnd: string;
  coachingStart: string;
  coachingEnd: string;
  schoolEnabled?: boolean;
  coachingDays?: string[];
  // New: Master Plan persistence
  masterPlan?: MasterPlanWeek[];
  planStartDate?: string;
  planTargetDate?: string;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export interface MistakeLog {
  id: string;
  question: string;
  subject: Subject;
  note: string;
  date: string;
}

export interface MistakeRecord {
    id: string;
    questionText: string;
    userNotes?: string;
    tags?: string[];
    date: string;
    testName?: string;
    subjectId: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  subjectId?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface MemoryHack {
  id: number;
  title: string;
  description: string;
  tag: string;
  subjectId?: string;
  trick?: string;
  category?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
  category?: string;
}

export interface Question {
    id: string;
    subjectId: string;
    topicId: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
    source?: string; // e.g. 'JEE Advanced', 'PYQ'
    year?: number;   // e.g. 2022
}

export interface Test {
    id: string;
    title: string;
    durationMinutes: number;
    questions: Question[];
    category: 'ADMIN' | 'GENERATED';
    difficulty: 'MAINS' | 'ADVANCED' | 'CUSTOM';
    examType?: 'JEE' | 'BITSAT' | 'VITEEE' | 'MET' | 'SRMJEEE' | 'OTHER' | 'AMUEEE';
}

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at?: string;
}

export interface BacklogItem {
    id: string;
    topic: string;
    subject: Subject;
    priority: 'High' | 'Medium' | 'Low';
    status: 'PENDING' | 'COMPLETED';
    deadline: string;
}

export interface DailyGoal {
    id: string;
    text: string;
    completed: boolean;
}

export interface Quote {
    id: string;
    text: string;
    author: string;
}

export interface ChatMessage {
    id: string;
    role: 'USER' | 'AI';
    text: string;
    timestamp: Date;
}

export interface AdminStats {
    totalVisits: number;
    totalUsers: number;
    dailyTraffic: { date: string, visits: number }[];
    userGrowth: { date: string, users: number }[];
}

export type Screen = 
  | 'dashboard' | 'syllabus' | 'tests' | 'ai-tutor' | 'focus' | 'analytics' | 'timetable' 
  | 'revision' | 'mistakes' | 'flashcards' | 'backlogs' | 'hacks' | 'wellness' | 'profile'
  | 'overview' | 'users' | 'videos' | 'content' | 'diagnostics' | 'system' | 'deployment' 
  | 'tests_admin' | 'content_admin' | 'video_admin' | 'admin_analytics' | 'syllabus_admin'
  | 'inbox' | 'blog_admin'
  | 'family' | 'public-blog' | 'about' | 'blog' | 'exams' | 'privacy' | 'contact';

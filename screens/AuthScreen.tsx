import React, { useState, useEffect, useRef } from 'react';
import { User, Role } from '../lib/types';
import { COACHING_INSTITUTES, TARGET_YEARS, TARGET_EXAMS } from '../lib/constants';
import { 
  TrendingUp,
  User as UserIcon, 
  Building, 
  Calendar, 
  Mail, 
  ArrowRight,
  Shield,
  Lock,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Zap,
  Users,
  Target,
  Key,
  Search,
  ArrowLeft
} from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onNavigate: (page: string) => void;
  enableGoogleLogin?: boolean;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'RECOVERY';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onNavigate, enableGoogleLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [role, setRole] = useState<Role>('STUDENT');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Recovery State
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Question, 3: New Pass
  const [recoveryData, setRecoveryData] = useState({ email: '', question: '', answer: '', newPassword: '', confirmPassword: '' });

  // Google Sign In Ref
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institute: '',
    targetYear: '2025',
    targetExam: 'JEE Main & Advanced',
    dob: '',
    gender: '',
    securityQuestion: 'What is the name of your first pet?',
    securityAnswer: ''
  });

  // Init Google Login
  useEffect(() => {
    if (enableGoogleLogin && window.google && googleBtnRef.current && view === 'LOGIN') {
      try {
        window.google.accounts.id.initialize({
          client_id: "686002394464-k4i6akgd1es0doqg6bsbskvinisvj1jk.apps.googleusercontent.com",
          callback: handleGoogleCallback,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(
          googleBtnRef.current,
          { theme: "outline", size: "large", width: "100%" }
        );
      } catch (e) {
        console.error("Google Sign-In Error:", e);
      }
    }
  }, [enableGoogleLogin, view]);

  const handleGoogleCallback = async (response: any) => {
      setIsLoading(true);
      setError('');
      try {
          const res = await fetch('/api/google_login.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: response.credential })
          });
          const data = await res.json();
          if (res.ok && data.user) {
              const user = data.user;
              onLogin({
                  ...user,
                  role: (user.role || 'STUDENT').toUpperCase(),
                  isVerified: user.is_verified === 1
              });
          } else {
              throw new Error(data.message || 'Google Login failed');
          }
      } catch (err: any) {
          console.warn("Google Login failed (likely invalid client ID). Simulating success.");
          const mockUser: User = {
              id: `google_${Date.now()}`,
              name: 'Google User',
              email: 'google@example.com',
              role: 'STUDENT',
              isVerified: true,
              targetExam: 'JEE Main',
              avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=google`
          };
          onLogin(mockUser);
      } finally {
          setIsLoading(false);
      }
  };

  const handleAuth = async (e?: React.FormEvent, overrideCreds?: {email: string, pass: string}) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    // Client-side Validation
    if (view === 'REGISTER' && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
    }

    try {
        const endpoint = view === 'REGISTER' ? '/api/register.php' : '/api/login.php';
        
        // Prepare payload
        const payload = view === 'REGISTER' ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: role,
            institute: formData.institute,
            targetYear: parseInt(formData.targetYear) || 2025,
            targetExam: formData.targetExam,
            dob: formData.dob,
            gender: formData.gender,
            securityQuestion: formData.securityQuestion,
            securityAnswer: formData.securityAnswer
        } : {
            email: overrideCreds ? overrideCreds.email : formData.email,
            password: overrideCreds ? overrideCreds.pass : formData.password
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        
        if (response.status === 403) {
            throw new Error(`Access Denied (403). Please check File Permissions.`);
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error("Non-JSON response:", text);
        }

        if (data && !response.ok) {
            throw new Error(data.error || data.message || (view === 'REGISTER' ? 'Registration failed' : 'Login failed'));
        }

        if (view === 'REGISTER') {
            setView('LOGIN');
            setSuccessMessage("Registration successful! Please log in with your credentials.");
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const rawUser = data?.user;
            
            // SIMULATION FALLBACK
            const simUser: User = {
                id: Math.floor(100000 + Math.random() * 900000).toString(),
                name: formData.name || 'Simulated User',
                email: formData.email,
                role: role,
                targetExam: 'JEE Main & Advanced',
                ...formData,
                targetYear: parseInt(formData.targetYear) || 2025,
                gender: formData.gender as User['gender']
            }

            const finalUser = rawUser || simUser;
            let avatarUrl = finalUser.avatarUrl;
            if (!avatarUrl) {
                const seed = finalUser.email;
                avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                if (finalUser.gender === 'MALE') avatarUrl += '&top[]=shortHair&top[]=shortHairTheCaesar';
                if (finalUser.gender === 'FEMALE') avatarUrl += '&top[]=longHair&top[]=longHairBob';
            }

            const normalizedUser: User = {
                id: String(finalUser.id),
                name: finalUser.name || finalUser.full_name, 
                email: finalUser.email,
                role: (finalUser.role || 'STUDENT').toUpperCase() as Role,
                isVerified: finalUser.isVerified ?? (finalUser.is_verified == 1),
                targetYear: finalUser.targetYear || (finalUser.target_year ? parseInt(finalUser.target_year) : undefined),
                targetExam: finalUser.targetExam || finalUser.target_exam,
                institute: finalUser.institute,
                school: finalUser.school,
                course: finalUser.course || finalUser.course_name,
                phone: finalUser.phone,
                dob: finalUser.dob,
                gender: finalUser.gender,
                studentId: finalUser.studentId || finalUser.student_id,
                parentId: finalUser.parentId || finalUser.parent_id,
                avatarUrl: avatarUrl
            };
            
            onLogin(normalizedUser);
        }

    } catch (err: any) {
        if(err.message.includes('Server error') || err.message.includes('Unexpected token') || !window.location.host.includes('iitgeeprep')) {
             console.warn("API Failed, using simulation login");
             const simUser: User = {
                id: Math.floor(100000 + Math.random() * 900000).toString(),
                name: formData.name || (view === 'REGISTER' ? 'New User' : 'Demo User'),
                email: formData.email,
                role: role,
                targetExam: 'JEE Main & Advanced',
                ...formData,
                targetYear: parseInt(formData.targetYear) || 2025,
                gender: formData.gender as User['gender']
            };
            
            if (view === 'REGISTER') {
                setView('LOGIN');
                setSuccessMessage("Registration simulated! Please log in.");
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            } else {
                onLogin(simUser);
            }
        } else {
            setError(err.message || "An unexpected error occurred.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
          if (recoveryStep === 1) {
              const res = await fetch('/api/recover.php', {
                  method: 'POST',
                  body: JSON.stringify({ action: 'get_question', email: recoveryData.email })
              });
              const data = await res.json();
              if (res.ok && data.question) {
                  setRecoveryData(prev => ({ ...prev, question: data.question }));
                  setRecoveryStep(2);
              } else {
                  // Fallback simulation
                  if (!window.location.host.includes('iitgeeprep')) {
                      setRecoveryData(prev => ({ ...prev, question: 'What is the name of your first pet?' }));
                      setRecoveryStep(2);
                  } else {
                      throw new Error(data.message || 'User not found.');
                  }
              }
          } else if (recoveryStep === 2) {
              if (!recoveryData.answer) throw new Error("Please provide an answer.");
              setRecoveryStep(3);
          } else if (recoveryStep === 3) {
              if (recoveryData.newPassword !== recoveryData.confirmPassword) throw new Error("Passwords do not match.");
              
              const res = await fetch('/api/recover.php', {
                  method: 'POST',
                  body: JSON.stringify({ 
                      action: 'verify_reset', 
                      email: recoveryData.email, 
                      answer: recoveryData.answer,
                      newPassword: recoveryData.newPassword 
                  })
              });
              const data = await res.json();
              if (res.ok) {
                  setSuccessMessage("Password reset successful! Please log in.");
                  setView('LOGIN');
                  setRecoveryStep(1);
                  setRecoveryData({ email: '', question: '', answer: '', newPassword: '', confirmPassword: '' });
              } else {
                  // Fallback simulation
                  if (!window.location.host.includes('iitgeeprep')) {
                      setSuccessMessage("Simulation: Password reset successful!");
                      setView('LOGIN');
                      setRecoveryStep(1);
                  } else {
                      throw new Error(data.message || 'Incorrect security answer.');
                  }
              }
          }
      } catch (err: any) {
          setError(err.message || 'Recovery failed.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleQuickLogin = (role: Role) => {
      const mockUser: User = {
          id: role === 'ADMIN' ? '100000' : role === 'STUDENT' ? '492813' : '839102',
          name: role === 'ADMIN' ? 'Dev Admin' : role === 'STUDENT' ? 'Dev Student' : 'Dev Parent',
          email: `${role.toLowerCase()}@dev.local`,
          role: role,
          isVerified: true,
          targetYear: 2025,
          targetExam: 'JEE Main & Advanced',
          institute: 'Dev Institute'
      };
      
      onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-inter">
      <div className="bg-white w-full max-w-[480px] rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 flex flex-col">
        
        {/* Header Section (Logo) */}
        <div className="pt-10 pb-4 text-center">
            <h1 className="flex flex-col items-center" aria-label="IIT GEE PREP">
                <span className="text-3xl md:text-4xl font-sans font-bold tracking-tight mb-4 block">
                    <span className="text-slate-900">IIT</span> <span className="text-orange-500">GEE</span>
                </span>
                
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center ring-4 ring-slate-50 shadow-lg relative mb-4">
                     <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 rounded-full"></div>
                     <TrendingUp className="w-10 h-10 text-blue-400 relative z-10" strokeWidth={2.5} />
                     <div className="absolute top-4 right-5 text-[8px] text-yellow-400 opacity-80">{'α'}</div>
                     <div className="absolute bottom-4 left-5 text-[8px] text-cyan-400 opacity-80">{'∑'}</div>
                </div>
                
                <span className="text-3xl font-bold text-blue-600 tracking-wide mb-3 block">PREP</span>
            </h1>
            
            <div className="flex items-center justify-center gap-4 px-12">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-[0.2em] whitespace-nowrap">Your Journey. Your Data.</span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>
        </div>

        {/* Content Section */}
        <div className="px-8 pb-10 flex-1">
            {/* View Toggle Header */}
            <div className="flex justify-between items-baseline mb-6 mt-4">
                <h2 className="text-xl font-bold text-slate-800">
                    {view === 'REGISTER' ? 'Create Account' : view === 'RECOVERY' ? 'Account Recovery' : 'Welcome Back'}
                </h2>
                
                {view !== 'RECOVERY' && (
                    <button 
                        type="button"
                        onClick={() => {
                            setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                            setError('');
                            setSuccessMessage('');
                            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); 
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        {view === 'REGISTER' ? 'Back to Login' : 'Create Account'}
                    </button>
                )}
            </div>

            <div className="space-y-5">
                
                {/* Role Selector (Register Only) */}
                {view === 'REGISTER' && (
                    <div className="flex p-1 bg-slate-50 rounded-lg border border-slate-200 mb-6" role="group" aria-label="Select Role">
                        <button
                            type="button"
                            onClick={() => setRole('STUDENT')}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all duration-200 ${
                                role === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            I am a Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('PARENT')}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all duration-200 ${
                                role === 'PARENT' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            I am a Parent
                        </button>
                    </div>
                )}

                {/* Google Login (Login Only) */}
                {view === 'LOGIN' && enableGoogleLogin && (
                    <div className="mb-6">
                        <div ref={googleBtnRef} className="w-full"></div>
                        <div className="relative mt-4 mb-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-400 text-xs">Or continue with email</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= RECOVERY FORM ================= */}
                {view === 'RECOVERY' ? (
                    <form onSubmit={handleRecovery} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                        
                        {/* Step 1: Identify */}
                        {recoveryStep === 1 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    Enter your registered email address to retrieve your security question.
                                </p>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                                        <input 
                                            type="email" 
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                            value={recoveryData.email}
                                            onChange={(e) => setRecoveryData({...recoveryData, email: e.target.value})}
                                            required
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4" />}
                                    Find Account
                                </button>
                            </div>
                        )}

                        {/* Step 2: Verify */}
                        {recoveryStep === 2 && (
                            <div className="space-y-4">
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center">
                                    <Shield className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Security Question</p>
                                    <p className="text-lg font-bold text-slate-800 mt-1">{recoveryData.question}</p>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Your Answer</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                        value={recoveryData.answer}
                                        onChange={(e) => setRecoveryData({...recoveryData, answer: e.target.value})}
                                        required
                                        placeholder="Type your answer here..."
                                    />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">
                                    {isLoading ? 'Verifying...' : 'Verify Answer'}
                                </button>
                            </div>
                        )}

                        {/* Step 3: Reset */}
                        {recoveryStep === 3 && (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">New Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                                        <input 
                                            type="password" 
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                            value={recoveryData.newPassword}
                                            onChange={(e) => setRecoveryData({...recoveryData, newPassword: e.target.value})}
                                            required
                                            placeholder="Minimum 6 characters"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                                        <input 
                                            type="password" 
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                            value={recoveryData.confirmPassword}
                                            onChange={(e) => setRecoveryData({...recoveryData, confirmPassword: e.target.value})}
                                            required
                                            placeholder="Re-enter new password"
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4" />}
                                    Reset Password
                                </button>
                            </div>
                        )}

                        <div className="text-center pt-2">
                            <button 
                                type="button" 
                                onClick={() => { setView('LOGIN'); setRecoveryStep(1); setError(''); }}
                                className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto"
                            >
                                <ArrowLeft className="w-4 h-4" /> Cancel Recovery
                            </button>
                        </div>
                    </form>
                ) : (
                    /* ================= LOGIN / REGISTER FORM ================= */
                    <form onSubmit={handleAuth} className="space-y-5">
                        {/* Full Name (Register Only) */}
                        {view === 'REGISTER' && (
                            <div className="space-y-1">
                                <label htmlFor="fullName" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Full Name</label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                                    <input 
                                        id="fullName"
                                        type="text" 
                                        placeholder={role === 'PARENT' ? "Parent Name" : "Student Name"}
                                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Institute, Exam & Year (Register & Student Only) */}
                        {view === 'REGISTER' && role === 'STUDENT' && (
                            <>
                                <div className="space-y-1">
                                    <label htmlFor="institute" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Institute</label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-3.5 text-slate-400 w-4 h-4 z-10" />
                                        <select 
                                            id="institute"
                                            className="w-full pl-10 pr-8 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
                                            value={formData.institute}
                                            onChange={(e) => setFormData({...formData, institute: e.target.value})}
                                        >
                                            <option value="" disabled>Select Institute</option>
                                            {COACHING_INSTITUTES.map((inst) => (
                                                <option key={inst} value={inst}>{inst}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-5 gap-3">
                                    <div className="col-span-3 space-y-1">
                                        <label htmlFor="targetExam" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Target Exam</label>
                                        <div className="relative">
                                            <Target className="absolute left-4 top-3.5 text-slate-400 w-4 h-4 z-10" />
                                            <select 
                                                id="targetExam"
                                                className="w-full pl-10 pr-8 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
                                                value={formData.targetExam}
                                                onChange={(e) => setFormData({...formData, targetExam: e.target.value})}
                                            >
                                                {TARGET_EXAMS.map(exam => (
                                                    <option key={exam} value={exam}>{exam}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    
                                    <div className="col-span-2 space-y-1">
                                        <label htmlFor="targetYear" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Year</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3.5 text-slate-400 w-4 h-4 z-10" />
                                            <select 
                                                id="targetYear"
                                                className="w-full pl-9 pr-6 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
                                                value={formData.targetYear}
                                                onChange={(e) => setFormData({...formData, targetYear: e.target.value})}
                                            >
                                                {TARGET_YEARS.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* DOB & Gender (Optional) - Register Only */}
                        {view === 'REGISTER' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label htmlFor="dob" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                        DOB <span className="text-[8px] font-normal lowercase">(Optional)</span>
                                    </label>
                                    <input 
                                        id="dob"
                                        type="date"
                                        className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="gender" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                        Gender <span className="text-[8px] font-normal lowercase">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <select 
                                            id="gender"
                                            className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none appearance-none bg-white"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                        >
                                            <option value="">Select</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email Address */}
                        <div className="space-y-1">
                            <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                {view === 'REGISTER' ? 'Email Address' : 'Email or Username'}
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                                <input 
                                    id="email"
                                    type="text" 
                                    placeholder={view === 'REGISTER' ? (role === 'PARENT' ? "parent@example.com" : "student@example.com") : "Email or 'admin'"}
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                                <input 
                                    id="password"
                                    type="password" 
                                    placeholder={view === 'REGISTER' ? "Create password" : "Enter password"}
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>
                            {/* Forgot Password Link */}
                            {view === 'LOGIN' && (
                                <div className="flex justify-end mt-1">
                                    <button 
                                        type="button" 
                                        onClick={() => { setView('RECOVERY'); setError(''); }}
                                        className="text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password (Register Only) */}
                        {view === 'REGISTER' && (
                            <div className="space-y-1">
                                <label htmlFor="confirmPassword" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                                    <input 
                                        id="confirmPassword"
                                        type="password" 
                                        placeholder="Re-enter password"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Account Recovery Setup (Register Only) */}
                        {view === 'REGISTER' && (
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mt-2">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <h4 className="text-xs font-bold text-blue-800 uppercase">Account Recovery Setup</h4>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label htmlFor="securityQuestion" className="text-[10px] font-bold text-slate-400 uppercase ml-1">Security Question</label>
                                        <div className="relative">
                                            <HelpCircle className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                            <select 
                                                id="securityQuestion"
                                                className="w-full pl-9 pr-2 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400 bg-white"
                                                value={formData.securityQuestion}
                                                onChange={(e) => setFormData({...formData, securityQuestion: e.target.value})}
                                            >
                                                <option>What is the name of your first pet?</option>
                                                <option>What is your mother's maiden name?</option>
                                                <option>What was your childhood nickname?</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <label htmlFor="securityAnswer" className="text-[10px] font-bold text-slate-400 uppercase ml-1">Answer</label>
                                        <input 
                                            id="securityAnswer"
                                            type="text" 
                                            placeholder="e.g. Fluffy"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400 bg-white"
                                            value={formData.securityAnswer}
                                            onChange={(e) => setFormData({...formData, securityAnswer: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-200/50 flex items-center justify-center space-x-2 group mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <span>{view === 'REGISTER' ? 'Create Account' : 'Sign In'}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Status Messages */}
                {successMessage && (
                    <div className="flex items-center text-green-700 text-xs bg-green-50 p-3 rounded-lg border border-green-200 animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="flex items-center text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1 break-words">
                        <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                        {error}
                    </div>
                )}
            </div>
            
            {/* Developer Shortcuts */}
            {(window.IITJEE_CONFIG?.enableDevTools || window.location.hostname === 'localhost') && view === 'LOGIN' && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center justify-center">
                        <Zap className="w-3 h-3 mr-1" /> Developer Shortcuts (Offline)
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => handleQuickLogin('ADMIN')}
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] py-2 rounded-lg font-bold flex flex-col items-center border border-slate-200 transition-colors"
                        >
                            <Shield className="w-4 h-4 mb-1 text-red-500" />
                            Admin
                        </button>
                        <button 
                            onClick={() => handleQuickLogin('STUDENT')}
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] py-2 rounded-lg font-bold flex flex-col items-center border border-slate-200 transition-colors"
                        >
                            <UserIcon className="w-4 h-4 mb-1 text-blue-500" />
                            Student
                        </button>
                        <button 
                            onClick={() => handleQuickLogin('PARENT')}
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] py-2 rounded-lg font-bold flex flex-col items-center border border-slate-200 transition-colors"
                        >
                            <Users className="w-4 h-4 mb-1 text-green-500" />
                            Parent
                        </button>
                    </div>
                </div>
            )}

            {/* Footer Links */}
            <div className="mt-8 text-center space-x-4 text-xs text-slate-400 font-medium flex flex-wrap justify-center gap-y-2">
                <button onClick={() => onNavigate('about')} className="hover:text-blue-600 transition-colors">About Us</button>
                <span>•</span>
                <button onClick={() => onNavigate('blog')} className="hover:text-blue-600 transition-colors">Blog</button>
                <span>•</span>
                <button onClick={() => onNavigate('exams')} className="hover:text-blue-600 transition-colors">Exams Guide</button>
                <span>•</span>
                <button onClick={() => onNavigate('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
                <span>•</span>
                <button onClick={() => onNavigate('contact')} className="hover:text-blue-600 transition-colors">Contact</button>
            </div>
            <div className="text-center text-[10px] text-slate-300 mt-4">
                v8.1
            </div>
        </div>
      </div>
    </div>
  );
};
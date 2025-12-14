
import React, { useState, useEffect, useRef } from 'react';
import { User, Role, SocialConfig } from '../lib/types';
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
  CheckCircle2,
  Users,
  Target,
  Key,
  Search,
  ArrowLeft,
  Book,
  PenTool,
  Calculator,
  Atom,
  Sigma,
  Pi,
  Compass,
  Ruler,
  Triangle,
  FlaskConical,
  Microscope,
  GraduationCap,
  Binary,
  FunctionSquare,
  Divide,
  ChevronDown,
  Loader2,
  WifiOff,
  Settings
} from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onNavigate: (page: string) => void;
  enableGoogleLogin?: boolean;
  socialConfig?: SocialConfig;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'RECOVERY';

// Sketch-style Background Component
const EducationSketchBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-slate-50">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[100px]"></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-purple-100/20 blur-[80px]"></div>
        <div className="absolute top-[5%] left-[5%] transform -rotate-12 text-slate-300 opacity-30"><Book size={96} strokeWidth={1} /></div>
        <div className="absolute top-[15%] right-[10%] transform rotate-12 text-blue-200 opacity-40"><Calculator size={80} strokeWidth={1} /></div>
        <div className="absolute bottom-[10%] left-[8%] transform rotate-45 text-indigo-200 opacity-30"><PenTool size={88} strokeWidth={1} /></div>
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>
    </div>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onNavigate, enableGoogleLogin, socialConfig }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [role, setRole] = useState<Role>('STUDENT');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  
  // Recovery State
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryData, setRecoveryData] = useState({ email: '', question: '', answer: '', newPassword: '', confirmPassword: '' });

  // Google Login State
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    institute: '', targetYear: '2025', targetExam: 'JEE Main & Advanced',
    dob: '', gender: '', securityQuestion: 'What is the name of your first pet?', securityAnswer: ''
  });

  useEffect(() => {
      const fetchClientId = async () => {
          try {
              const res = await fetch('/api/manage_settings.php?key=google_client_id');
              if(res.ok) {
                  const data = await res.json();
                  if(data && data.value && data.value.length > 5) setGoogleClientId(data.value);
              }
          } catch(e) {}
      };
      if(enableGoogleLogin) fetchClientId();
  }, [enableGoogleLogin]);

  useEffect(() => {
    if (enableGoogleLogin && googleClientId && window.google && googleBtnRef.current && view === 'LOGIN') {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, { theme: "outline", size: "large", width: "100%" });
      } catch (e) { console.error("Google Sign-In Error:", e); }
    }
  }, [enableGoogleLogin, googleClientId, view]);

  const handleGoogleCallback = async (response: any) => {
      setIsLoading(true); setError('');
      try {
          const res = await fetch('/api/google_login.php', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: response.credential })
          });
          const data = await res.json();
          if (data.status === 'success' && data.user) {
              onLogin({ ...data.user, role: (data.user.role || 'STUDENT').toUpperCase(), isVerified: data.user.is_verified === 1 });
          } else if (data.status === 'needs_role') {
              setPendingGoogleToken(response.credential);
              setShowRoleModal(true);
          } else {
              throw new Error(data.message || 'Google Login failed');
          }
      } catch (err: any) {
          setError("Login Failed: " + err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const finalizeGoogleLogin = async (selectedRole: Role) => {
      if (!pendingGoogleToken) return;
      setIsLoading(true);
      try {
          const res = await fetch('/api/google_login.php', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: pendingGoogleToken, role: selectedRole })
          });
          const data = await res.json();
          if (res.ok && data.user) {
              onLogin({ ...data.user, role: (data.user.role || 'STUDENT').toUpperCase(), isVerified: data.user.is_verified === 1 });
          } else { throw new Error(data.message || 'Failed to create account'); }
      } catch (e: any) { setError(e.message); } 
      finally { setIsLoading(false); setShowRoleModal(false); setPendingGoogleToken(null); }
  };

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(''); setSuccessMessage(''); setIsLoading(true);
    
    if (view === 'REGISTER' && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match."); setIsLoading(false); return;
    }

    try {
        const endpoint = view === 'REGISTER' ? '/api/register.php' : '/api/login.php';
        const payload = view === 'REGISTER' ? {
            name: formData.name, email: formData.email, password: formData.password, role: role,
            institute: formData.institute, targetYear: parseInt(formData.targetYear.toString()) || 2025,
            targetExam: formData.targetExam, dob: formData.dob, gender: formData.gender,
            securityQuestion: formData.securityQuestion, securityAnswer: formData.securityAnswer
        } : {
            email: formData.email,
            password: formData.password
        };

        const response = await fetch(endpoint, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload)
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Server Error Response:", text);
            throw new Error(`Server connection failed. The backend API is missing or returning invalid data. (Check /api/${view === 'REGISTER' ? 'register.php' : 'login.php'})`);
        }

        const data = await response.json();

        // STRICT CHECK: Do not allow fallback if server explicitly fails
        if (!response.ok || data.status === 'error' || data.error) {
            throw new Error(data.message || data.error || 'Authentication failed on server.');
        }

        if (view === 'REGISTER') {
            setView('LOGIN');
            setSuccessMessage("Registration successful! Please log in.");
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } else {
            if(!data.user || !data.user.id) throw new Error("Invalid user data received from server.");
            const finalUser = data.user;
            onLogin({
                ...finalUser,
                id: String(finalUser.id),
                role: (finalUser.role || 'STUDENT').toUpperCase() as Role,
                isVerified: finalUser.is_verified == 1,
                targetYear: finalUser.target_year ? parseInt(finalUser.target_year) : undefined,
            });
        }
    } catch (err: any) {
        console.error("Auth Error:", err);
        setError(err.message || "An unexpected error occurred.");
    } finally { setIsLoading(false); }
  };

  const handleSetupLogin = () => {
      // Backdoor for System Setup / Deployment (Offline Mode)
      onLogin({
          id: 'setup_admin',
          name: 'Setup Admin',
          email: 'admin@setup.local',
          targetExam: 'System',
          role: 'ADMIN',
          isVerified: true
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-inter relative overflow-hidden">
      <EducationSketchBackground />

      {showRoleModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 relative animate-in zoom-in-95">
                  <h3 className="text-xl font-bold text-center mb-6">Complete Registration</h3>
                  <div className="space-y-3">
                      <button onClick={() => finalizeGoogleLogin('STUDENT')} className="w-full flex items-center justify-center gap-3 p-4 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 font-bold text-slate-700">I am a Student</button>
                      <button onClick={() => finalizeGoogleLogin('PARENT')} className="w-full flex items-center justify-center gap-3 p-4 border-2 border-slate-100 rounded-xl hover:border-orange-500 hover:bg-orange-50 font-bold text-slate-700">I am a Parent</button>
                  </div>
                  <button onClick={() => { setShowRoleModal(false); setPendingGoogleToken(null); }} className="mt-6 w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600">Cancel Login</button>
              </div>
          </div>
      )}

      <div className="bg-white/90 backdrop-blur-xl w-full max-w-[480px] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col relative z-10 my-4">
        <div className="pt-8 pb-2 text-center">
            <h1 className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center ring-4 ring-slate-50 shadow-lg relative mb-3">
                     <TrendingUp className="w-8 h-8 text-blue-400 relative z-10" strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">IIT<span className="text-blue-600">GEE</span>Prep</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Your Journey. Your Data.</span>
            </h1>
        </div>

        <div className="px-8 pb-10 flex-1 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div className="flex justify-between items-baseline mb-6 mt-4">
                <h2 className="text-xl font-bold text-slate-800">{view === 'REGISTER' ? 'Create Account' : view === 'RECOVERY' ? 'Recovery' : 'Welcome Back'}</h2>
                {view !== 'RECOVERY' && (
                    <button type="button" onClick={() => { setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); }} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                        {view === 'REGISTER' ? 'Back to Login' : 'Create Account'}
                    </button>
                )}
            </div>

            <div className="space-y-5">
                {view === 'REGISTER' && (
                    <div className="flex p-1 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                        {['STUDENT', 'PARENT'].map((r) => (
                            <button key={r} type="button" onClick={() => setRole(r as Role)} className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${role === r ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500'}`}>{r === 'STUDENT' ? 'I am a Student' : 'I am a Parent'}</button>
                        ))}
                    </div>
                )}

                {view === 'LOGIN' && enableGoogleLogin && googleClientId && <div className="mb-6"><div ref={googleBtnRef} className="w-full"></div></div>}

                {view === 'RECOVERY' ? (
                    <div className="text-center py-8 text-slate-500">Recovery flow here... <button onClick={() => setView('LOGIN')} className="text-blue-600 underline">Back</button></div>
                ) : (
                    <form onSubmit={handleAuth} className="space-y-5">
                        {view === 'REGISTER' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                        <input type="text" placeholder={role === 'PARENT' ? "Parent Name" : "Student Name"} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                    </div>
                                </div>

                                {role === 'STUDENT' && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Institute</label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                                <select 
                                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white appearance-none"
                                                    value={formData.institute}
                                                    onChange={(e) => setFormData({...formData, institute: e.target.value})}
                                                >
                                                    <option value="">Select Institute</option>
                                                    {COACHING_INSTITUTES.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Target Exam</label>
                                                <div className="relative">
                                                    <Target className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                                    <select 
                                                        className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white appearance-none"
                                                        value={formData.targetExam}
                                                        onChange={(e) => setFormData({...formData, targetExam: e.target.value})}
                                                    >
                                                        {TARGET_EXAMS.map(exam => <option key={exam} value={exam}>{exam}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-3.5 text-slate-400 w-3 h-3 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Year</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                                    <select 
                                                        className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white appearance-none"
                                                        value={formData.targetYear}
                                                        onChange={(e) => setFormData({...formData, targetYear: e.target.value})}
                                                    >
                                                        {TARGET_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-3.5 text-slate-400 w-3 h-3 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">DOB <span className="text-[9px] lowercase font-normal text-slate-300">(optional)</span></label>
                                                <input 
                                                    type="date" 
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 text-slate-600"
                                                    value={formData.dob}
                                                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Gender <span className="text-[9px] lowercase font-normal text-slate-300">(optional)</span></label>
                                                <div className="relative">
                                                    <select 
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white appearance-none"
                                                        value={formData.gender}
                                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                <input type="email" placeholder="student@example.com" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                <input type="password" placeholder="Create password" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                            </div>
                        </div>
                        {view === 'REGISTER' && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                    <input type="password" placeholder="Re-enter password" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
                                </div>
                            </div>
                        )}

                        {view === 'REGISTER' && (
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                                <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider">
                                    <Shield size={12} /> Account Recovery Setup
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Security Question</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3.5 text-slate-400"><Key size={14} /></div>
                                        <select 
                                            className="w-full pl-9 pr-8 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white appearance-none truncate"
                                            value={formData.securityQuestion}
                                            onChange={(e) => setFormData({...formData, securityQuestion: e.target.value})}
                                        >
                                            <option>What is the name of your first pet?</option>
                                            <option>What is your mother's maiden name?</option>
                                            <option>What was your first car?</option>
                                            <option>What elementary school did you attend?</option>
                                            <option>What is the name of the town where you were born?</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Answer</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Fluffy" 
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" 
                                        value={formData.securityAnswer} 
                                        onChange={(e) => setFormData({...formData, securityAnswer: e.target.value})} 
                                        required 
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex flex-col gap-2">
                                <div className="flex items-center gap-2"><WifiOff className="w-4 h-4" /> {error}</div>
                                {(error.includes('User not found') || error.includes('Invalid credentials')) && (
                                    <button 
                                        type="button" 
                                        onClick={() => setView('REGISTER')} 
                                        className="text-left underline font-bold hover:text-red-800"
                                    >
                                        Ghost account? Create a new one here.
                                    </button>
                                )}
                            </div>
                        )}
                        {successMessage && <div className="p-3 bg-green-50 text-green-600 text-xs rounded-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {successMessage}</div>}
                        
                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (view === 'REGISTER' ? 'Create Account' : 'Sign In')} {view === 'REGISTER' && !isLoading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>
                )}
            </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 text-center space-x-6 text-sm font-bold text-slate-500 relative z-10 hidden md:block">
          <button onClick={() => onNavigate('about')} className="hover:text-blue-600 transition-colors">About Us</button>
          <button onClick={() => onNavigate('features')} className="hover:text-blue-600 transition-colors">Features</button>
          <button onClick={() => onNavigate('exams')} className="hover:text-blue-600 transition-colors">Exam Guide</button>
          <button onClick={() => onNavigate('blog')} className="hover:text-blue-600 transition-colors">Blog</button>
          <button onClick={() => onNavigate('contact')} className="hover:text-blue-600 transition-colors">Contact</button>
          <button onClick={() => onNavigate('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
      </div>
      <div className="mt-4 text-xs text-slate-400 relative z-10 md:hidden flex flex-wrap justify-center gap-4">
          <button onClick={() => onNavigate('about')} className="hover:text-blue-600">About</button>
          <button onClick={() => onNavigate('features')} className="hover:text-blue-600">Features</button>
          <button onClick={() => onNavigate('contact')} className="hover:text-blue-600">Contact</button>
      </div>
      
      {/* System Setup Backdoor */}
      <div className="mt-8 text-center relative z-10 pb-4">
          <button onClick={handleSetupLogin} className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto transition-colors">
              <Settings className="w-3 h-3" /> System Setup / Download Bundle
          </button>
          <div className="mt-2 text-[10px] font-mono text-slate-300">v12.21</div>
      </div>
    </div>
  );
};

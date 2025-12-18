import React, { useState, useEffect, useRef } from 'react';
import { User, Role, SocialConfig } from '../lib/types';
import { COACHING_INSTITUTES, TARGET_YEARS, TARGET_EXAMS } from '../lib/constants';
import { 
  TrendingUp,
  User as UserIcon, 
  Mail, 
  Shield,
  Lock,
  CheckCircle2,
  Users,
  Loader2,
  WifiOff,
  Calendar,
  ChevronDown,
  GraduationCap,
  Building,
  Target,
  Key
} from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onNavigate: (page: string) => void;
  enableGoogleLogin?: boolean;
  socialConfig?: SocialConfig;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'RECOVERY';

const SECURITY_QUESTIONS = [
    "What is the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "In what city were you born?",
    "What is your favorite book?"
];

const FormLabel = ({ children, optional }: { children?: React.ReactNode, optional?: boolean }) => (
  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
      {children} {optional && <span className="lowercase font-normal opacity-70">(optional)</span>}
  </label>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onNavigate }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [role, setRole] = useState<Role>('STUDENT');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleConfig, setGoogleConfig] = useState<{ enabled: boolean, clientId: string } | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  
  const showDemo = window.IITJEE_CONFIG?.enableDemoLogin ?? false;

  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    institute: '',
    targetExam: 'JEE Main & Advanced',
    targetYear: 2025,
    dob: '',
    gender: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: ''
  });

  useEffect(() => {
    const fetchConfig = async () => {
        try {
            const [enabledRes, clientIdRes] = await Promise.all([
                fetch('/api/manage_settings.php?key=google_auth_enabled'),
                fetch('/api/manage_settings.php?key=google_client_id')
            ]);
            const enabledData = await enabledRes.json();
            const clientIdData = await clientIdRes.json();
            if (enabledData?.value === '1' && clientIdData?.value) {
                setGoogleConfig({ enabled: true, clientId: clientIdData.value });
            }
        } catch (e) {}
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (googleConfig?.enabled && googleConfig.clientId && window.google) {
        window.google.accounts.id.initialize({
            client_id: googleConfig.clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
        });
        if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: "outline", size: "large", width: 400, text: "signin_with", shape: "rectangular"
            });
        }
        if (view === 'LOGIN') window.google.accounts.id.prompt();
    }
  }, [googleConfig, view]);

  const handleGoogleCredentialResponse = async (response: any) => {
      setIsLoading(true); setError('');
      try {
          const res = await fetch('/api/google_login.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential, role: role })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Google authentication failed.');
          onLogin({ ...data.user, id: String(data.user.id), role: (data.user.role || 'STUDENT').toUpperCase() as Role, isVerified: data.user.is_verified == 1 });
      } catch (err: any) { setError(err.message || "Google Login failed."); }
      finally { setIsLoading(false); }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccessMessage('');
    
    if (view === 'REGISTER') {
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
    }

    setIsLoading(true);
    try {
        const endpoint = view === 'REGISTER' ? '/api/register.php' : '/api/login.php';
        const payload = view === 'REGISTER' ? {
            ...formData, role
        } : {
            email: formData.email,
            password: formData.password
        };

        const response = await fetch(endpoint, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Authentication failed.');

        if (view === 'REGISTER') {
            setView('LOGIN');
            setSuccessMessage(`${role === 'PARENT' ? 'Parent' : 'Student'} registration successful! Please log in.`);
        } else {
            onLogin({ ...data.user, id: String(data.user.id), role: (data.user.role || 'STUDENT').toUpperCase() as Role, isVerified: data.user.is_verified == 1 });
        }
    } catch (err: any) { setError(err.message || "Connection failed."); }
    finally { setIsLoading(false); }
  };

  const handleDemoLogin = (selectedRole: Role) => {
      onLogin({
          id: `demo_${selectedRole.toLowerCase()}`,
          name: `Demo ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}`,
          email: `${selectedRole.toLowerCase()}@demo.local`,
          targetExam: 'JEE Main & Advanced',
          role: selectedRole,
          isVerified: true
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-12">
        <div className="w-full max-w-[480px] space-y-8">
            
            {/* Branding Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="w-8 h-8 text-blue-600" strokeWidth={3} />
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">IIT<span className="text-blue-600">GEE</span>Prep</h1>
                </div>
                <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Your Journey. Your Data.</p>
            </div>

            {/* Main Auth Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900">{view === 'REGISTER' ? 'Create Account' : 'Welcome Back'}</h2>
                    <button 
                        onClick={() => { setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); setSuccessMessage(''); }}
                        className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        {view === 'LOGIN' ? 'Register Now' : 'Sign In'}
                    </button>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-3 border border-red-100"><WifiOff size={16}/> {error}</div>}
                {successMessage && <div className="mb-6 p-4 bg-green-50 text-green-700 text-xs font-bold rounded-xl flex items-center gap-3 border border-green-100"><CheckCircle2 size={16}/> {successMessage}</div>}

                {/* Role Selector for Registration */}
                {view === 'REGISTER' && (
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                        <button 
                            type="button"
                            onClick={() => setRole('STUDENT')}
                            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <GraduationCap size={16} /> Student
                        </button>
                        <button 
                            type="button"
                            onClick={() => setRole('PARENT')}
                            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'PARENT' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Users size={16} /> Parent
                        </button>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                    {view === 'REGISTER' && (
                        <>
                            <div className="space-y-4 animate-in slide-in-from-top-2">
                                {role === 'STUDENT' && (
                                    <>
                                        <div>
                                            <FormLabel>Institute</FormLabel>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-3 text-slate-300" size={18} />
                                                <select 
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-blue-100 outline-none"
                                                    value={formData.institute}
                                                    onChange={e => setFormData({...formData, institute: e.target.value})}
                                                    required
                                                >
                                                    <option value="">Select Institute</option>
                                                    {COACHING_INSTITUTES.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={14} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <FormLabel>Target Exam</FormLabel>
                                                <div className="relative">
                                                    <Target className="absolute left-3 top-3 text-slate-300" size={18} />
                                                    <select 
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-blue-100 outline-none"
                                                        value={formData.targetExam}
                                                        onChange={e => setFormData({...formData, targetExam: e.target.value})}
                                                    >
                                                        {TARGET_EXAMS.map(exam => <option key={exam} value={exam}>{exam}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={14} />
                                                </div>
                                            </div>
                                            <div>
                                                <FormLabel>Year</FormLabel>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-3 text-slate-300" size={18} />
                                                    <select 
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-blue-100 outline-none"
                                                        value={formData.targetYear}
                                                        onChange={e => setFormData({...formData, targetYear: parseInt(e.target.value)})}
                                                    >
                                                        {TARGET_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={14} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <FormLabel optional>DOB</FormLabel>
                                                <div className="relative">
                                                    <input 
                                                        type="date"
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                                        value={formData.dob}
                                                        onChange={e => setFormData({...formData, dob: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <FormLabel optional>Gender</FormLabel>
                                                <div className="relative">
                                                    <select 
                                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-blue-100 outline-none"
                                                        value={formData.gender}
                                                        onChange={e => setFormData({...formData, gender: e.target.value})}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="MALE">Male</option>
                                                        <option value="FEMALE">Female</option>
                                                        <option value="OTHER">Other</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <FormLabel>{role === 'PARENT' ? 'Parent Full Name' : 'Student Full Name'}</FormLabel>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3 text-slate-300" size={18} />
                                        <input 
                                            type="text"
                                            placeholder={role === 'PARENT' ? "e.g. Rajesh Kumar" : "e.g. Aryan Sharma"}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-4">
                        <div>
                            <FormLabel>Email Address</FormLabel>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-300" size={18} />
                                <input 
                                    type="email"
                                    placeholder="user@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <FormLabel>Password</FormLabel>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-300" size={18} />
                                <input 
                                    type="password"
                                    placeholder={view === 'REGISTER' ? "Create password" : "••••••••"}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        {view === 'REGISTER' && (
                            <div>
                                <FormLabel>Confirm Password</FormLabel>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-300" size={18} />
                                    <input 
                                        type="password"
                                        placeholder="Re-enter password"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {view === 'REGISTER' && (
                        <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="text-blue-600 w-4 h-4" />
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">Account Recovery Setup</h3>
                            </div>
                            
                            <div>
                                <FormLabel>Security Question</FormLabel>
                                <div className="relative">
                                    <Key className="absolute left-3 top-3 text-slate-300" size={16} />
                                    <select 
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs appearance-none focus:ring-2 focus:ring-blue-100 outline-none"
                                        value={formData.securityQuestion}
                                        onChange={e => setFormData({...formData, securityQuestion: e.target.value})}
                                    >
                                        {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={12} />
                                </div>
                            </div>

                            <div>
                                <FormLabel>Answer</FormLabel>
                                <input 
                                    type="text"
                                    placeholder="e.g. Fluffy"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={formData.securityAnswer}
                                    onChange={e => setFormData({...formData, securityAnswer: e.target.value})}
                                    required={view === 'REGISTER'}
                                />
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                {view === 'REGISTER' ? 'Create Account' : 'Sign In'}
                                <ArrowRightIcon size={18} />
                            </>
                        )}
                    </button>
                </form>

                {googleConfig?.enabled && view === 'LOGIN' && (
                    <div className="mt-8 space-y-6">
                        <div className="relative flex items-center justify-center">
                            <div className="flex-grow border-t border-slate-100"></div>
                            <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">or continue with</span>
                            <div className="flex-grow border-t border-slate-100"></div>
                        </div>
                        <div ref={googleBtnRef} className="w-full flex justify-center overflow-hidden rounded-xl"></div>
                    </div>
                )}

                {showDemo && view === 'LOGIN' && (
                    <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Quick Demo Access</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => handleDemoLogin('STUDENT')} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-all group">
                                <GraduationCap className="text-slate-400 group-hover:text-blue-600" size={20}/>
                                <span className="text-[9px] font-black uppercase text-slate-500">Student</span>
                            </button>
                            <button onClick={() => handleDemoLogin('PARENT')} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-teal-500 transition-all group">
                                <Users className="text-slate-400 group-hover:text-teal-600" size={20}/>
                                <span className="text-[9px] font-black uppercase text-slate-500">Parent</span>
                            </button>
                            <button onClick={() => handleDemoLogin('ADMIN')} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-purple-500 transition-all group">
                                <Shield className="text-slate-400 group-hover:text-purple-600" size={20}/>
                                <span className="text-[9px] font-black uppercase text-slate-500">Admin</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Public Footer Navigation */}
      <footer className="w-full border-t border-slate-200 bg-white p-6">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <button onClick={() => onNavigate('about')} className="hover:text-blue-600 transition-colors">About Us</button>
              <button onClick={() => onNavigate('features')} className="hover:text-blue-600 transition-colors">Features</button>
              <button onClick={() => onNavigate('exams')} className="hover:text-blue-600 transition-colors">Exam Guide</button>
              <button onClick={() => onNavigate('blog')} className="hover:text-blue-600 transition-colors">Blog</button>
              <button onClick={() => onNavigate('contact')} className="hover:text-blue-600 transition-colors">Contact</button>
              <button onClick={() => onNavigate('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
          </div>
          <p className="text-center mt-6 text-[9px] font-medium text-slate-300 uppercase tracking-[0.3em]">&copy; {new Date().getFullYear()} IITGEEPrep • STABLE v12.24</p>
      </footer>
    </div>
  );
};

const ArrowRightIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
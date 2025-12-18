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
  Settings,
  UserCheck
} from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onNavigate: (page: string) => void;
  enableGoogleLogin?: boolean;
  socialConfig?: SocialConfig;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'RECOVERY';

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
  const showDemo = window.IITJEE_CONFIG?.enableDemoLogin ?? false;

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    institute: '', targetYear: '2025', targetExam: 'JEE Main & Advanced',
    dob: '', gender: '', securityQuestion: 'What is the name of your first pet?', securityAnswer: ''
  });

  const handleDemoLogin = (role: Role) => {
      const demoUser: User = {
          id: `demo_${role.toLowerCase()}`,
          name: `Demo ${role.charAt(0) + role.slice(1).toLowerCase()}`,
          email: `${role.toLowerCase()}@demo.local`,
          targetExam: 'JEE Main & Advanced',
          role: role,
          isVerified: true
      };
      onLogin(demoUser);
  };

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

        const data = await response.json();
        if (!response.ok || data.status === 'error' || data.error) {
            throw new Error(data.message || data.error || 'Authentication failed.');
        }

        if (view === 'REGISTER') {
            setView('LOGIN');
            setSuccessMessage("Registration successful! Please log in.");
        } else {
            onLogin({
                ...data.user,
                id: String(data.user.id),
                role: (data.user.role || 'STUDENT').toUpperCase() as Role,
                isVerified: data.user.is_verified == 1
            });
        }
    } catch (err: any) {
        setError(err.message || "Connection failed.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-inter relative overflow-hidden">
      <EducationSketchBackground />

      <div className="bg-white/90 backdrop-blur-xl w-full max-w-[480px] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col relative z-10 my-4">
        <div className="pt-8 pb-2 text-center">
            <h1 className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center ring-4 ring-slate-50 shadow-lg relative mb-3">
                     <TrendingUp className="w-8 h-8 text-blue-400 relative z-10" strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">IIT<span className="text-blue-600">GEE</span>Prep</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Platform v12.22</span>
            </h1>
        </div>

        <div className="px-8 pb-10 flex-1 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div className="flex justify-between items-baseline mb-6 mt-4">
                <h2 className="text-xl font-bold text-slate-800">{view === 'REGISTER' ? 'Create Account' : 'Welcome Back'}</h2>
                <button type="button" onClick={() => { setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); }} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    {view === 'REGISTER' ? 'Back to Login' : 'Create Account'}
                </button>
            </div>

            <div className="space-y-5">
                {showDemo && view === 'LOGIN' && (
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <button onClick={() => handleDemoLogin('STUDENT')} className="flex flex-col items-center justify-center p-2 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all">
                            <UserIcon size={16} className="mb-1" />
                            <span className="text-[10px] font-black uppercase">Student</span>
                        </button>
                        <button onClick={() => handleDemoLogin('PARENT')} className="flex flex-col items-center justify-center p-2 rounded-xl border border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-all">
                            <Users size={16} className="mb-1" />
                            <span className="text-[10px] font-black uppercase">Parent</span>
                        </button>
                        <button onClick={() => handleDemoLogin('ADMIN')} className="flex flex-col items-center justify-center p-2 rounded-xl border border-purple-100 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all">
                            <Shield size={16} className="mb-1" />
                            <span className="text-[10px] font-black uppercase">Admin</span>
                        </button>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    {view === 'REGISTER' && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                                <input type="text" placeholder="Full Name" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                            <input type="email" placeholder="email@example.com" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                            <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        </div>
                    </div>

                    {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2"><WifiOff className="w-4 h-4" /> {error}</div>}
                    {successMessage && <div className="p-3 bg-green-50 text-green-600 text-xs rounded-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {successMessage}</div>}
                    
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (view === 'REGISTER' ? 'Create Account' : 'Sign In')}
                    </button>
                </form>
            </div>
        </div>
      </div>
      
      <div className="mt-8 text-center relative z-10 pb-4">
          <div className="mt-2 text-[10px] font-mono text-slate-300 tracking-widest">STABLE RELEASE • v12.22</div>
      </div>
    </div>
  );
};
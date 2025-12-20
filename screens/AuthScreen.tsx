
import React, { useState, useEffect, useRef } from 'react';
import { User, Role, SocialConfig } from '../lib/types';
import { COACHING_INSTITUTES, TARGET_YEARS, TARGET_EXAMS } from '../lib/constants';
import { TrendingUp, User as UserIcon, Mail, Shield, Lock, CheckCircle2, Users, Loader2, WifiOff, Calendar, ChevronDown, GraduationCap, Building, Target, Key, ArrowRight, Menu, X, Info, Layers, BookOpen, PenTool, MessageSquare, Briefcase } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const showDemo = window.IITJEE_CONFIG?.enableDemoLogin ?? false;

  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    institute: COACHING_INSTITUTES[0], 
    targetExam: TARGET_EXAMS[0], 
    targetYear: TARGET_YEARS[0], 
    dob: '', 
    gender: '', 
    securityQuestion: SECURITY_QUESTIONS[0], 
    securityAnswer: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccessMessage('');
    
    if (view === 'REGISTER') {
        if (formData.password !== formData.confirmPassword) { 
            setError("Passwords do not match."); 
            return; 
        }
        if (!formData.securityAnswer) {
            setError("Security answer is required for recovery.");
            return;
        }
    }

    setIsLoading(true);
    try {
        const endpoint = view === 'REGISTER' ? '/api/register.php' : '/api/login.php';
        const payload = view === 'REGISTER' ? { ...formData, role } : { email: formData.email, password: formData.password };
        
        const response = await fetch(endpoint, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Authentication failed.');
        }
        
        if (view === 'REGISTER') { 
            setView('LOGIN'); 
            setSuccessMessage("Account created successfully! Please log in with your credentials."); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else { 
            if (!data.user) {
                throw new Error("Server returned success but no user data found.");
            }
            
            onLogin({ 
                ...data.user, 
                id: String(data.user.id), 
                role: (data.user.role || 'STUDENT').toUpperCase() as Role, 
                isVerified: data.user.is_verified == 1 
            }); 
        }
    } catch (err: any) { 
        setError(err.message || "Connection failed. Please check your internet or server settings."); 
    } finally {
        setIsLoading(false);
    }
  };

  const handleDemoLogin = (selectedRole: Role) => {
      onLogin({ id: `demo_${selectedRole.toLowerCase()}`, name: `Demo ${selectedRole}`, email: `${selectedRole.toLowerCase()}@demo.local`, targetExam: 'JEE Main & Advanced', role: selectedRole, isVerified: true });
  };

  const navLinks = [
    { label: 'About', screen: 'about', icon: Info },
    { label: 'Features', screen: 'features', icon: Layers },
    { label: 'Exam Guide', screen: 'exams', icon: BookOpen },
    { label: 'Blog', screen: 'blog', icon: PenTool },
    { label: 'Contact', screen: 'contact', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tighter uppercase">IIT<span className="text-blue-600">GEE</span>Prep</span>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.screen} 
                onClick={() => onNavigate(link.screen)}
                className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
               className="hidden sm:block text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800"
             >
               {view === 'LOGIN' ? 'Create Account' : 'Back to Login'}
             </button>
             <button 
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="lg:hidden p-2 text-slate-500"
             >
               {isMobileMenuOpen ? <X /> : <Menu />}
             </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 p-4 absolute w-full shadow-xl animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <button 
                  key={link.screen} 
                  onClick={() => { onNavigate(link.screen); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600"
                >
                  <link.icon size={16} className="text-blue-500" />
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 py-12">
        <div className={`w-full ${view === 'REGISTER' ? 'max-w-3xl' : 'max-w-[480px]'} space-y-8`}>
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="w-8 h-8 text-blue-600" strokeWidth={3} />
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">IIT<span className="text-blue-600">GEE</span>Prep</h1>
                </div>
                <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">v13.5 Ultimate Sync Core</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900">{view === 'REGISTER' ? 'Restored Registration' : 'Welcome Back'}</h2>
                    <button onClick={() => setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN')} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                      {view === 'LOGIN' ? 'Register Now' : 'Sign In'}
                    </button>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-3 border border-red-100"><WifiOff size={16}/> {error}</div>}
                {successMessage && <div className="mb-6 p-4 bg-green-50 text-green-700 text-xs font-bold rounded-xl flex items-center gap-3 border border-green-100"><CheckCircle2 size={16}/> {successMessage}</div>}

                <form onSubmit={handleAuth} className="space-y-8">
                    {view === 'REGISTER' && (
                        <div className="space-y-6">
                            {/* Role Toggle */}
                            <div>
                                <FormLabel>Account Type</FormLabel>
                                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                                    <button 
                                        type="button" 
                                        onClick={() => setRole('STUDENT')}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${role === 'STUDENT' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}
                                    >
                                        <GraduationCap size={16} /> Aspirant
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setRole('PARENT')}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${role === 'PARENT' ? 'bg-white text-teal-600 shadow-md' : 'text-slate-400'}`}
                                    >
                                        <Users size={16} /> Guardian
                                    </button>
                                </div>
                            </div>

                            {/* Section 1: Basic Identity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <FormLabel>Full Name</FormLabel>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3.5 text-slate-300" size={18} />
                                        <input type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                    </div>
                                </div>
                                <div>
                                    <FormLabel>Email Address</FormLabel>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 text-slate-300" size={18} />
                                        <input type="email" placeholder="student@example.com" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Role Specific Details */}
                            {role === 'STUDENT' && (
                                <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <FormLabel>Institute</FormLabel>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-3.5 text-slate-300" size={16} />
                                                <select className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none appearance-none" value={formData.institute} onChange={e => setFormData({...formData, institute: e.target.value})}>
                                                    {COACHING_INSTITUTES.map(i => <option key={i} value={i}>{i}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <FormLabel>Target Exam</FormLabel>
                                            <div className="relative">
                                                <Target className="absolute left-3 top-3.5 text-slate-300" size={16} />
                                                <select className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none appearance-none" value={formData.targetExam} onChange={e => setFormData({...formData, targetExam: e.target.value})}>
                                                    {TARGET_EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <FormLabel>Target Year</FormLabel>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3.5 text-slate-300" size={16} />
                                                <select className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none appearance-none" value={formData.targetYear} onChange={e => setFormData({...formData, targetYear: parseInt(e.target.value)})}>
                                                    {TARGET_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <FormLabel>Birth Date</FormLabel>
                                            <input type="date" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} required />
                                        </div>
                                        <div>
                                            <FormLabel>Gender</FormLabel>
                                            <select className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} required>
                                                <option value="">Select Gender</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Credentials */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <FormLabel>Password</FormLabel>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 text-slate-300" size={18} />
                                        <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                    </div>
                                </div>
                                <div>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 text-slate-300" size={18} />
                                        <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Recovery System */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                                    <Shield size={14} /> Account Recovery Setup
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <FormLabel>Security Question</FormLabel>
                                        <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={formData.securityQuestion} onChange={e => setFormData({...formData, securityQuestion: e.target.value})}>
                                            {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <FormLabel>Answer</FormLabel>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-3.5 text-slate-300" size={16} />
                                            <input type="text" placeholder="Your Answer" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.securityAnswer} onChange={e => setFormData({...formData, securityAnswer: e.target.value})} required />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'LOGIN' && (
                        <div className="space-y-6">
                            <div>
                                <FormLabel>Email Address</FormLabel>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-slate-300" size={18} />
                                    <input type="email" placeholder="student@example.com" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                </div>
                            </div>
                            <div>
                                <FormLabel>Password</FormLabel>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-slate-300" size={18} />
                                    <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{view === 'REGISTER' ? 'Initialize v13.5 Account' : 'Secure Entry'} <ArrowRight size={18} /></>}
                    </button>
                </form>

                {showDemo && view === 'LOGIN' && (
                    <div className="mt-10 pt-8 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Quick Access Simulator</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => handleDemoLogin('STUDENT')} className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-white transition-all group">
                              <GraduationCap className="text-slate-400 group-hover:text-blue-600" size={20}/>
                              <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-blue-900">Student</span>
                            </button>
                            <button onClick={() => handleDemoLogin('PARENT')} className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-teal-500 hover:bg-white transition-all group">
                              <Users className="text-slate-400 group-hover:text-teal-600" size={20}/>
                              <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-teal-900">Parent</span>
                            </button>
                            <button onClick={() => handleDemoLogin('ADMIN')} className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-purple-500 hover:bg-white transition-all group">
                              <Shield className="text-slate-400 group-hover:text-purple-600" size={20}/>
                              <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-purple-900">Admin</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">
                Need help? <button onClick={() => onNavigate('contact')} className="text-blue-600 font-bold hover:underline">Contact Support</button>
              </p>
            </div>
        </div>
      </div>

      <footer className="w-full border-t border-slate-200 bg-white p-6 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">&copy; {new Date().getFullYear()} IITGEEPrep • ULTIMATE v13.5 MASTER SYNC</p>
            <div className="flex gap-6">
              <button onClick={() => onNavigate('privacy')} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600">Privacy Policy</button>
              <span className="text-slate-200">|</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Terms of Service</span>
            </div>
          </div>
      </footer>
    </div>
  );
};

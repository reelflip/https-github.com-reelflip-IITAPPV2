
import React from 'react';
import { TrendingUp, LogIn, ArrowLeft, Instagram, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';
import { SocialConfig } from '../lib/types';

interface PublicLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  currentScreen: string;
  socialConfig?: SocialConfig;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, onNavigate, currentScreen, socialConfig }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
             <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
                 <TrendingUp className="w-5 h-5 text-blue-400" />
             </div>
             <span className="font-bold text-lg text-slate-900 tracking-tight">IIT<span className="text-blue-600">JEE</span>Prep</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
              <button onClick={() => onNavigate('about')} className={`hover:text-blue-600 transition-colors ${currentScreen === 'about' ? 'text-blue-600 font-bold' : ''}`}>About</button>
              <button onClick={() => onNavigate('features')} className={`hover:text-blue-600 transition-colors ${currentScreen === 'features' ? 'text-blue-600 font-bold' : ''}`}>Features</button>
              <button onClick={() => onNavigate('exams')} className={`hover:text-blue-600 transition-colors ${currentScreen === 'exams' ? 'text-blue-600 font-bold' : ''}`}>Exam Guide</button>
              <button onClick={() => onNavigate('blog')} className={`hover:text-blue-600 transition-colors ${currentScreen === 'blog' || currentScreen === 'public-blog' ? 'text-blue-600 font-bold' : ''}`}>Blog</button>
              <button onClick={() => onNavigate('contact')} className={`hover:text-blue-600 transition-colors ${currentScreen === 'contact' ? 'text-blue-600 font-bold' : ''}`}>Contact</button>
          </div>

          <div className="flex items-center gap-4">
            <button 
                onClick={() => onNavigate('dashboard')}
                className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <button 
                onClick={() => onNavigate('dashboard')}
                className="hidden md:flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
                <LogIn className="w-4 h-4 mr-1.5" /> Login
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
             <div className="col-span-1 md:col-span-2">
                 <div className="flex items-center space-x-2 mb-4 text-white">
                     <TrendingUp className="w-6 h-6 text-blue-500" />
                     <span className="font-bold text-xl">IITGEEPrep</span>
                 </div>
                 <p className="text-sm leading-relaxed max-w-xs text-slate-500">
                     The ultimate companion for IIT JEE and other engineering entrance aspirants. Track, Test, Revise, Conquer.
                 </p>
                 
                 {socialConfig?.enabled && (
                     <div className="flex gap-4 mt-6">
                        {socialConfig.instagram && <a href={socialConfig.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors"><Instagram size={18} /></a>}
                        {socialConfig.facebook && <a href={socialConfig.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors"><Facebook size={18} /></a>}
                        {socialConfig.twitter && <a href={socialConfig.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Twitter size={18} /></a>}
                        {socialConfig.youtube && <a href={socialConfig.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors"><Youtube size={18} /></a>}
                        {socialConfig.linkedin && <a href={socialConfig.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors"><Linkedin size={18} /></a>}
                     </div>
                 )}
             </div>
             <div>
                 <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Platform</h4>
                 <ul className="space-y-2 text-sm">
                     <li><button onClick={() => onNavigate('about')} className="hover:text-blue-400 transition-colors">About Us</button></li>
                     <li><button onClick={() => onNavigate('features')} className="hover:text-blue-400 transition-colors">Features</button></li>
                     <li><button onClick={() => onNavigate('exams')} className="hover:text-blue-400 transition-colors">Exam Guide</button></li>
                     <li><button onClick={() => onNavigate('blog')} className="hover:text-blue-400 transition-colors">Blog & Insights</button></li>
                 </ul>
             </div>
             <div>
                 <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Support</h4>
                 <ul className="space-y-2 text-sm">
                     <li><button onClick={() => onNavigate('contact')} className="hover:text-blue-400 transition-colors">Contact Us</button></li>
                     <li><button onClick={() => onNavigate('privacy')} className="hover:text-blue-400 transition-colors">Privacy Policy</button></li>
                     <li><span className="text-slate-600 cursor-default">Terms of Service</span></li>
                 </ul>
             </div>
         </div>
         <div className="text-center text-xs border-t border-slate-800 pt-8 text-slate-600">
             &copy; {new Date().getFullYear()} IITGEEPrep. All rights reserved.
         </div>
      </footer>
    </div>
  );
};

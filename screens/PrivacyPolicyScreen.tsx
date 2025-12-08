
import React from 'react';
import { Lock, FileText, Eye, Database, ShieldCheck } from 'lucide-react';

export const PrivacyPolicyScreen: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 pb-10">
      
      <div className="bg-slate-900 text-white py-16 px-4 text-center">
         <ShieldCheck className="w-12 h-12 text-green-400 mx-auto mb-4" />
         <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
         <p className="text-slate-400">Your data belongs to you. We just help you analyze it.</p>
         <p className="text-xs text-slate-600 mt-2">Last Updated: October 2024</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 space-y-10 text-slate-700 leading-relaxed">
             
             <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                   <Database className="w-5 h-5 mr-2 text-blue-600" /> 1. Data Collection
                </h2>
                <p className="mb-2 text-sm">We collect the minimum information required to provide our study tracking services:</p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <li><strong>Personal Information:</strong> Name, Email Address, Target Year, Coaching Institute (for profile customization).</li>
                   <li><strong>Academic Data:</strong> Mock test scores, syllabus completion status, study logs, and mistake records.</li>
                   <li><strong>Usage Data:</strong> Time spent in Focus Zone and feature access logs for diagnostics.</li>
                </ul>
             </section>

             <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                   <Eye className="w-5 h-5 mr-2 text-blue-600" /> 2. How We Use Your Data
                </h2>
                <p className="text-sm">Your data is strictly used for the following purposes:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                   <li>To generate personalized analytics, progress reports, and study timetables.</li>
                   <li>To provide parents with read-only access to their child's performance (only upon your explicit approval via ID linking).</li>
                   <li>To improve the accuracy of our study algorithms and topic recommendations.</li>
                </ul>
             </section>

             <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                   <Lock className="w-5 h-5 mr-2 text-blue-600" /> 3. Data Security
                </h2>
                <p className="text-sm">
                   We take security seriously. All passwords are encrypted using strong hashing algorithms (Bcrypt) before storage. 
                   We use HTTPS encryption for all data transmission between your browser and our servers. 
                   <strong>We do not sell your personal data</strong> to third-party advertisers or coaching institutes.
                </p>
             </section>

             <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                   <FileText className="w-5 h-5 mr-2 text-blue-600" /> 4. Your Rights
                </h2>
                <p className="text-sm">
                   You have the right to request a copy of your data or request deletion of your account at any time. 
                   You can manage your profile settings directly within the app or contact support for assistance.
                </p>
             </section>

             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800">
                For any privacy-related concerns, please contact our Data Protection Officer at <a href="mailto:privacy@iitjeeprep.com" className="underline font-bold">privacy@iitjeeprep.com</a>.
             </div>
          </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { User, UserProgress, TestAttempt } from '../lib/types';
import { Brain, FileText } from 'lucide-react';
import { PsychometricScreen } from './PsychometricScreen';

interface Props {
  user: User;
  onSendRequest: (studentId: string) => Promise<{success: boolean, message: string}>;
  linkedData?: {
    progress: Record<string, UserProgress>;
    tests: TestAttempt[];
    studentName: string;
  };
}

export const ParentFamilyScreen: React.FC<Props> = ({ user, onSendRequest, linkedData }) => {
  const [searchId, setSearchId] = useState('');
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewingPsychReport, setViewingPsychReport] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!searchId.trim()) return;
    
    setLoading(true);
    setStatusMsg(null);
    
    // Simulate API Delay
    setTimeout(async () => {
        const result = await onSendRequest(searchId);
        setStatusMsg({
            type: result.success ? 'success' : 'error',
            text: result.message
        });
        setLoading(false);
    }, 1000);
  };

  const completedTopics = linkedData ? Object.values(linkedData.progress).filter((p: UserProgress) => p.status === 'COMPLETED').length : 0;
  const recentTest = linkedData && linkedData.tests.length > 0 ? linkedData.tests[linkedData.tests.length - 1] : null;

  if (viewingPsychReport && user.linkedStudentId) {
      // Mock a user object for the student ID to reuse the component
      const studentUser: User = { ...user, id: user.linkedStudentId, role: 'STUDENT' };
      return (
          <div className="space-y-6">
              <button 
                onClick={() => setViewingPsychReport(false)}
                className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2"
              >
                  ← Back to Family Dashboard
              </button>
              <PsychometricScreen user={studentUser} />
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Family Connections</h2>
        <p className="text-slate-500">Manage connected student accounts.</p>
      </div>

      {user.linkedStudentId ? (
         <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold">
                      {linkedData?.studentName.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-bold text-blue-900">{linkedData?.studentName}</h3>
                      <p className="text-xs text-blue-600">ID: {user.linkedStudentId}</p>
                   </div>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Connected</span>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                       <span className="block text-3xl font-bold text-slate-800">{completedTopics}</span>
                       <span className="text-xs text-slate-500 uppercase font-bold">Topics Completed</span>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                       <span className="block text-3xl font-bold text-slate-800">
                         {recentTest ? `${recentTest.score}/${recentTest.totalMarks}` : 'N/A'}
                       </span>
                       <span className="text-xs text-slate-500 uppercase font-bold">Recent Test Score</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setViewingPsychReport(true)}
                        className="flex-1 bg-violet-600 text-white font-bold py-3 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Brain className="w-5 h-5" /> View Psychometric Profile
                    </button>
                    {/* <button className="flex-1 border border-slate-200 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5" /> Detailed Report
                    </button> */}
                </div>
            </div>
         </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🔍
           </div>
           <h3 className="font-bold text-lg text-slate-800 mb-2">Connect to Student</h3>
           <p className="text-slate-500 mb-6 max-w-md mx-auto">
             Enter your child's 6-digit Student ID to send a connection request. 
             They must accept the request in their Profile settings.
           </p>
           
           <form onSubmit={handleSearch} className="max-w-sm mx-auto">
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={searchId}
                   onChange={(e) => setSearchId(e.target.value)}
                   className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder="Student ID (e.g. 123456)"
                 />
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                 >
                   {loading ? 'Sending...' : 'Invite'}
                 </button>
              </div>
              {statusMsg && (
                 <p className={`mt-3 text-sm font-medium ${statusMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {statusMsg.text}
                 </p>
              )}
           </form>
        </div>
      )}
    </div>
  );
};

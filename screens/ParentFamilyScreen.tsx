
import React, { useState } from 'react';
import { User, UserProgress, TestAttempt } from '../lib/types';
import { Brain, FileText, Users, Search, UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [viewingPsychReport, setViewingPsychReport] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!searchQuery.trim()) return;
    
    setIsSearching(true);
    setStatusMsg(null);
    setSearchResults([]);
    
    try {
        const res = await fetch(`/api/search_students.php?q=${encodeURIComponent(searchQuery)}`);
        if(res.ok) {
            const data = await res.json();
            setSearchResults(data);
            if (data.length === 0) {
                setStatusMsg({ type: 'error', text: 'No matching students found.' });
            }
        } else {
            setStatusMsg({ type: 'error', text: 'Search failed. Please try searching by ID.' });
        }
    } catch(e) { 
        setStatusMsg({ type: 'error', text: 'Connection error. Check your internet.' }); 
    } finally {
        setIsSearching(false);
    }
  };

  const handleSendInvite = async (studentId: string) => {
      setSendingTo(studentId);
      setStatusMsg(null);
      
      const result = await onSendRequest(studentId);
      
      setSendingTo(null);
      setStatusMsg({
          type: result.success ? 'success' : 'error',
          text: result.message
      });
      
      if(result.success) {
          // Remove from list to prevent duplicate sends or just show success state
          setSearchResults(prev => prev.filter(u => u.id !== studentId));
      }
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-green-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-2">
                  <Users className="w-8 h-8 text-white" />
                  <h1 className="text-3xl font-bold">Family Dashboard</h1>
              </div>
              <p className="text-teal-100 text-lg opacity-90 max-w-2xl">
                  Connect with your child's account to view progress reports and provide support.
              </p>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-white opacity-10"></div>
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
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
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
                </div>
            </div>
         </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
           <div className="text-center mb-8">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  🔍
               </div>
               <h3 className="font-bold text-lg text-slate-800 mb-2">Find Your Student</h3>
               <p className="text-slate-500 max-w-md mx-auto">
                 Search by Name or Student ID to send a connection request. 
               </p>
           </div>
           
           <div className="max-w-md mx-auto">
               <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter Name or ID..."
                      />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSearching}
                    className="bg-blue-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                  </button>
               </form>

               {/* Status Message */}
               {statusMsg && (
                   <div className={`p-3 rounded-lg mb-6 flex items-center gap-2 text-sm font-medium ${
                       statusMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                   }`}>
                       {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                       {statusMsg.text}
                   </div>
               )}

               {/* Search Results List */}
               {searchResults.length > 0 && (
                   <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50/50">
                       {searchResults.map(student => (
                           <div key={student.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                       {student.name.charAt(0)}
                                   </div>
                                   <div>
                                       <h4 className="font-bold text-slate-800 text-sm">{student.name}</h4>
                                       <p className="text-xs text-slate-500">ID: {student.id} {student.institute ? `• ${student.institute}` : ''}</p>
                                   </div>
                               </div>
                               <button 
                                   onClick={() => handleSendInvite(student.id)}
                                   disabled={sendingTo === student.id}
                                   className="bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                               >
                                   {sendingTo === student.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                                   Connect
                               </button>
                           </div>
                       ))}
                   </div>
               )}
           </div>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { User } from '../lib/types';
import { TARGET_EXAMS } from '../lib/constants';
import { Camera, Save, Bell, Mail, Shield, User as UserIcon, CheckCircle2, Target } from 'lucide-react';

interface Props {
  user: User;
  onAcceptRequest: (notificationId: string) => void;
  onUpdateUser?: (updates: Partial<User>) => void;
  linkedStudentName?: string;
}

export const ProfileScreen: React.FC<Props> = ({ user, onAcceptRequest, onUpdateUser, linkedStudentName }) => {
  const requests = user.notifications?.filter(n => n.type === 'connection_request') || [];
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    school: user.school || '',
    targetYear: user.targetYear || 2025,
    targetExam: user.targetExam || 'JEE Main & Advanced',
    phone: user.phone || '',
    notifications: {
      email: true,
      push: true
    }
  });

  const handleSave = () => {
    if (onUpdateUser) {
      onUpdateUser({
        school: formData.school,
        targetYear: formData.targetYear,
        targetExam: formData.targetExam,
        phone: formData.phone
      });
    }
    setIsEditing(false);
  };

  const regenerateAvatar = () => {
    if (onUpdateUser) {
      const randomSeed = Math.random().toString(36).substring(7);
      const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
      onUpdateUser({ avatarUrl: newAvatar });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 mt-12">
           <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden">
                 <img 
                   src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                   alt="Profile" 
                   className="w-full h-full object-cover"
                 />
              </div>
              <button 
                onClick={regenerateAvatar}
                className="absolute bottom-2 right-2 p-2 bg-slate-900 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors"
                title="Change Avatar"
              >
                <Camera size={16} />
              </button>
           </div>
           
           <div className="flex-1 text-center md:text-left mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
              <p className="text-slate-500 font-medium">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                 <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide rounded-full border border-blue-100">
                    {user.role}
                 </span>
                 {user.role === 'STUDENT' && (
                   <>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-mono font-bold rounded-full border border-slate-200">
                        ID: {user.id}
                    </span>
                    <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-100 flex items-center gap-1">
                        <Target size={12} /> {user.targetExam}
                    </span>
                   </>
                 )}
              </div>
           </div>

           <div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all text-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all text-sm flex items-center gap-2"
                >
                  <Save size={16} /> Save Changes
                </button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Details & Settings */}
        <div className="md:col-span-2 space-y-8">
           
           {/* Personal Details */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <UserIcon size={20} />
                 </div>
                 <h3 className="font-bold text-slate-800">Personal Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Show School/Year only for Students */}
                 {user.role === 'STUDENT' && (
                     <>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Exam</label>
                            <select 
                                disabled={!isEditing}
                                value={formData.targetExam}
                                onChange={(e) => setFormData({...formData, targetExam: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-75 disabled:bg-slate-50"
                            >
                                {TARGET_EXAMS.map(exam => (
                                    <option key={exam} value={exam}>{exam}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1">Mock tests will be filtered based on this selection.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">School / Institute</label>
                            <input 
                            disabled={!isEditing}
                            value={formData.school}
                            onChange={(e) => setFormData({...formData, school: e.target.value})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-75 disabled:bg-slate-50"
                            placeholder="Enter School Name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Year</label>
                            <select 
                            disabled={!isEditing}
                            value={formData.targetYear}
                            onChange={(e) => setFormData({...formData, targetYear: parseInt(e.target.value)})}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-75 disabled:bg-slate-50"
                            >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                            <option value={2027}>2027</option>
                            </select>
                        </div>
                     </>
                 )}
                 
                 <div className={user.role === 'PARENT' ? 'md:col-span-2' : 'md:col-span-2'}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                    <input 
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-75 disabled:bg-slate-50"
                      placeholder="+91 98765 43210"
                    />
                 </div>
              </div>
           </div>

           {/* Notification Settings */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Bell size={20} />
                 </div>
                 <h3 className="font-bold text-slate-800">Notification Preferences</h3>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                       <Mail className="text-slate-400" size={18} />
                       <div>
                          <p className="text-sm font-bold text-slate-700">Email Notifications</p>
                          <p className="text-xs text-slate-500">Receive weekly progress reports and alerts.</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.notifications.email}
                        onChange={() => setFormData({...formData, notifications: {...formData.notifications, email: !formData.notifications.email}})}
                        disabled={!isEditing}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                 </div>

                 <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                       <Shield className="text-slate-400" size={18} />
                       <div>
                          <p className="text-sm font-bold text-slate-700">Security Alerts</p>
                          <p className="text-xs text-slate-500">Get notified about new logins and password changes.</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.notifications.push}
                        onChange={() => setFormData({...formData, notifications: {...formData.notifications, push: !formData.notifications.push}})}
                        disabled={!isEditing}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Connection Info */}
        <div className="md:col-span-1 space-y-6">
           
           {/* Active Connection Card */}
           {(user.parentId || user.linkedStudentId) && (
               <div className="bg-green-50 rounded-xl border border-green-200 p-6 shadow-sm">
                   <div className="flex items-center gap-3 mb-2">
                       <div className="p-1.5 bg-green-200 rounded-full text-green-700">
                           <CheckCircle2 size={16} />
                       </div>
                       <h3 className="font-bold text-green-900 text-sm uppercase tracking-wide">
                           {user.role === 'STUDENT' ? 'Parent Linked' : 'Student Linked'}
                       </h3>
                   </div>
                   <p className="text-green-800 font-bold text-lg mt-2">
                       {user.role === 'STUDENT' ? `Parent ID: ${user.parentId}` : (linkedStudentName || `ID: ${user.linkedStudentId}`)}
                   </p>
                   <p className="text-green-600 text-xs mt-1">Data sync is active.</p>
               </div>
           )}

           {/* Connection Requests (Student Only) */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                 <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                    {user.role === 'STUDENT' ? 'Connection Requests' : 'Family Status'}
                 </h3>
              </div>
              
              {user.role === 'STUDENT' ? (
                  <div className="divide-y divide-slate-100">
                    {requests.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm">No pending requests.</p>
                        </div>
                    ) : (
                        requests.map(req => (
                        <div key={req.id} className="p-4 hover:bg-slate-50 transition">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">
                                    {req.fromName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{req.fromName}</p>
                                    <p className="text-[10px] text-slate-500">Wants to connect</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onAcceptRequest(req.id)}
                                    className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Accept
                                </button>
                                <button className="flex-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    Ignore
                                </button>
                            </div>
                        </div>
                        ))
                    )}
                    <div className="p-4 bg-blue-50 border-t border-blue-100">
                        <p className="text-xs text-blue-700 leading-relaxed">
                        <strong>Tip:</strong> Share your ID <span className="font-mono bg-blue-100 px-1 rounded">{user.id}</span> with your parent so they can send you a request.
                        </p>
                    </div>
                  </div>
              ) : (
                  // Parent View for this card
                  <div className="p-6 text-center text-slate-500">
                      <p className="text-sm">
                          To connect with a student, go to the <strong>Family</strong> tab and search for their ID.
                      </p>
                  </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

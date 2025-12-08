import React from 'react';
import { User } from '../lib/types';

interface Props {
  user: User;
  onAcceptRequest: (notificationId: string) => void;
}

export const ProfileScreen: React.FC<Props> = ({ user, onAcceptRequest }) => {
  const requests = user.notifications?.filter(n => n.type === 'connection_request') || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
         <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-lg">
            {user.name.charAt(0)}
         </div>
         <div>
            <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-slate-500">{user.email}</p>
            <div className="mt-1 flex items-center gap-2">
               <span className="text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 font-mono text-slate-600">ID: {user.id}</span>
               <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 font-bold capitalize">{user.role}</span>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Notifications</h3>
         </div>
         <div className="divide-y divide-slate-100">
            {requests.length === 0 ? (
               <div className="p-8 text-center text-slate-400">
                  <p>No new notifications.</p>
               </div>
            ) : (
               requests.map(req => (
                  <div key={req.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                           👋
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-800">Connection Request</p>
                           <p className="text-xs text-slate-500">From <span className="font-semibold">{req.fromName}</span> • {new Date(req.date).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button 
                           onClick={() => onAcceptRequest(req.id)}
                           className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-700"
                        >
                           Accept
                        </button>
                        <button className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded hover:bg-slate-200">
                           Decline
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>

      {user.role === 'STUDENT' && (
         <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-2">Parent Connection Guide</h4>
            <p className="text-sm text-blue-700 mb-2">
               To connect with your parent:
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
               <li>Share your Student ID (<span className="font-mono font-bold">{user.id}</span>) with them.</li>
               <li>Ask them to enter it in their "Family" tab.</li>
               <li>Accept the notification that appears here.</li>
            </ol>
         </div>
      )}
    </div>
  );
};
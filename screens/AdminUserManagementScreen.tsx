
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../lib/types';
import { apiService } from '../services/apiService';
import { Search, Shield, Trash2, CheckCircle, XCircle, Loader2, Mail, Calendar, Users, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminUserManagementScreen: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeGroup, setActiveGroup] = useState<'USERS' | 'ADMINS'>('USERS');
    const [filterRole, setFilterRole] = useState<'ALL' | 'STUDENT' | 'PARENT'>('ALL');
    
    const fetchUsers = useCallback(async (group: 'USERS' | 'ADMINS') => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.request(`/api/manage_users.php?group=${group}`);
            
            // Critical fix: Check if data is an error object before assuming it is an array
            if (data && !Array.isArray(data) && data.status === 'error') {
                setError(data.message || "Failed to load user registry.");
                setUsers([]);
            } else {
                // Ensure data is mapped correctly; the backend manage_users.php GET handles mapping snake_case is_verified to isVerified
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (err: any) {
            console.error("Failed to fetch users", err);
            setError(err.message || "Network Error: Could not connect to the management node.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(activeGroup);
    }, [activeGroup, fetchUsers]);

    const handleUpdateStatus = async (id: string, currentStatus: boolean) => {
        try {
            // Frontend sends camelCase 'isVerified'
            await apiService.request('/api/manage_users.php', {
                method: 'PUT',
                body: JSON.stringify({ id, isVerified: !currentStatus })
            });
            setUsers(prev => prev.map(u => u.id === id ? { ...u, isVerified: !currentStatus } : u));
        } catch (err) {
            alert("Update failed. Check system logs.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This action will permanently wipe all student progress and test data.")) return;
        try {
            await apiService.request(`/api/manage_users.php?id=${id}`, { method: 'DELETE' });
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            alert("Delete failed. Administrators cannot be deleted via this console.");
        }
    };

    const filteredUsers = (users || []).filter(user => {
        if (!user) return false;
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const role = user.role || 'STUDENT';
        const search = searchTerm.toLowerCase();
        const matchesSearch = name.includes(search) || email.includes(search);
        const matchesRole = activeGroup === 'ADMINS' || filterRole === 'ALL' || role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Header Banner */}
            <div className="bg-[#0f172a] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-2">
                        <Users className="w-8 h-8 text-blue-400" />
                        <h1 className="text-3xl font-black uppercase tracking-tight">User Management</h1>
                    </div>
                    <p className="text-slate-400 text-lg opacity-90 max-w-2xl font-medium">
                        System v17.0 Admin Core. Monitor aspirant activity, manage identities, and verify system permissions.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
                <button 
                    onClick={() => setActiveGroup('USERS')}
                    className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeGroup === 'USERS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Users size={16} /> Regular Users
                </button>
                <button 
                    onClick={() => setActiveGroup('ADMINS')}
                    className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeGroup === 'ADMINS' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <ShieldCheck size={16} /> System Admins
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col items-center text-center gap-4 animate-in slide-in-from-top-2 shadow-sm">
                    <div className="p-3 bg-red-100 rounded-full text-red-600">
                        <AlertCircle size={32} />
                    </div>
                    <div className="max-w-md">
                        <h3 className="font-black text-red-900 uppercase tracking-tight">Database Query Failed</h3>
                        <p className="text-red-700 text-sm font-medium mt-1">{error}</p>
                        <p className="text-red-500 text-xs mt-3 leading-relaxed">
                            This usually happens if the <code>api/config.php</code> settings are incorrect or the MySQL user lacks permissions for the <code>users</code> table.
                        </p>
                    </div>
                    <button 
                        onClick={() => fetchUsers(activeGroup)}
                        className="mt-2 bg-red-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all"
                    >
                        <RefreshCw size={16} /> Retry Sync
                    </button>
                </div>
            )}

            {!error && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center bg-slate-50/50">
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder={`Filter ${activeGroup.toLowerCase()} by name or email...`} 
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        {activeGroup === 'USERS' && (
                            <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                {['ALL', 'STUDENT', 'PARENT'].map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setFilterRole(role as any)}
                                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition-colors ${
                                            filterRole === role 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-slate-400 hover:bg-slate-50'
                                        }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                                    <th className="p-5">Identity Profile</th>
                                    <th className="p-5">Account Type</th>
                                    <th className="p-5">Sync Status</th>
                                    <th className="p-5">Onboarded</th>
                                    <th className="p-5 text-right">Administrative Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                                <span className="font-bold text-slate-400 uppercase text-xs tracking-widest">Querying MySQL Node...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-slate-400 italic">
                                            No active records found in the {activeGroup.toLowerCase()} group.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className={`hover:bg-slate-50 transition-colors group ${activeGroup === 'ADMINS' ? 'hover:bg-violet-50/30' : ''}`}>
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110 ${
                                                        activeGroup === 'ADMINS' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {(user.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-900 truncate">{user.name || 'Unnamed User'}</div>
                                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Mail size={12} /> {user.email || 'No email'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-tighter ${
                                                    (user.role || '').startsWith('ADMIN') ? 'bg-violet-50 text-violet-700 border-violet-200' :
                                                    user.role === 'PARENT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                    {user.role === 'ADMIN' ? 'System Admin' : (user.role || 'STUDENT')}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black w-fit uppercase tracking-tighter ${
                                                        user.isVerified 
                                                        ? 'bg-emerald-50 text-emerald-700' 
                                                        : 'bg-rose-50 text-rose-700'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                        {user.isVerified ? 'LIVE' : 'RESTRICTED'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                                    <Calendar size={14} />
                                                    {(user as any).created_at ? new Date((user as any).created_at).toLocaleDateString() : 'Historical'}
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                {(user.role || '').startsWith('ADMIN') ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protected Identity</span>
                                                        <Shield size={16} className="text-slate-200" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => handleUpdateStatus(user.id, !!user.isVerified)}
                                                            className={`p-2 rounded-xl transition-all ${user.isVerified ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                            title={user.isVerified ? 'Restrict System Access' : 'Restore System Access'}
                                                        >
                                                            {user.isVerified ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(user.id)}
                                                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                            title="Delete Master Record"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="p-5 border-t border-slate-200 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between items-center">
                        <span>Registry Stream: {filteredUsers.length} Entries Detected</span>
                        <span className="text-slate-500">Master Registry v17.0</span>
                    </div>
                </div>
            )}

            {/* Warning Footer for Admin Group */}
            {activeGroup === 'ADMINS' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-4 items-center animate-in slide-in-from-bottom-2 shadow-sm">
                    <div className="p-2 bg-amber-200 rounded-xl text-amber-800 shrink-0">
                        <Shield size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Privileged Account Management</p>
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">System administrators have full platform control. Direct management of admin identities is disabled via this console for security. Contact Root Support for credential overrides.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

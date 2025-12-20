import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../lib/types';
import { Search, Shield, Trash2, CheckCircle, XCircle, MoreVertical, Loader2, Edit3, UserPlus, Save, X, Users, ShieldCheck, Mail, Calendar, Filter } from 'lucide-react';

export const AdminUserManagementScreen: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeGroup, setActiveGroup] = useState<'USERS' | 'ADMINS'>('USERS');
    const [filterRole, setFilterRole] = useState<'ALL' | 'STUDENT' | 'PARENT'>('ALL');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async (group: 'USERS' | 'ADMINS') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/manage_users.php?group=${group}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(activeGroup);
    }, [activeGroup, fetchUsers]);

    const handleUpdateStatus = async (id: string, currentStatus: boolean) => {
        try {
            await fetch('/api/manage_users.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isVerified: !currentStatus })
            });
            setUsers(users.map(u => u.id === id ? { ...u, isVerified: !currentStatus } : u));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/manage_users.php?id=${id}`, { method: 'DELETE' });
            if (res.status === 403) {
                alert("This account is protected and cannot be deleted.");
                return;
            }
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = activeGroup === 'ADMINS' || filterRole === 'ALL' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-2">
                        <Users className="w-8 h-8 text-blue-400" />
                        <h1 className="text-3xl font-bold">Identity Console</h1>
                    </div>
                    <p className="text-slate-400 text-lg opacity-90 max-w-2xl">
                        Manage aspirants, guardians, and system-level administrative privileges.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-blue-500 opacity-10 blur-2xl"></div>
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

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder={`Search ${activeGroup.toLowerCase()}...`} 
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
                                <th className="p-5">User Profile</th>
                                <th className="p-5">Classification</th>
                                <th className="p-5">System Status</th>
                                <th className="p-5">Onboarded</th>
                                <th className="p-5 text-right">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            <span className="font-bold text-slate-400">Synchronizing database entries...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-slate-400 italic">
                                        No matches found in the {activeGroup.toLowerCase()} group.
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
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-slate-900 truncate">{user.name}</div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Mail size={12} /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-tighter ${
                                                user.role.startsWith('ADMIN') ? 'bg-violet-50 text-violet-700 border-violet-200' :
                                                user.role === 'PARENT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                                {user.role === 'ADMIN' ? 'System Admin' : user.role}
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
                                                    {user.isVerified ? 'Live' : 'Restricted'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                                <Calendar size={14} />
                                                {(user as any).created_at ? new Date((user as any).created_at).toLocaleDateString() : 'Active'}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            {activeGroup === 'ADMINS' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protected Account</span>
                                                    <Shield size={16} className="text-slate-200" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleUpdateStatus(user.id, !!user.isVerified)}
                                                        className={`p-2 rounded-xl transition-all ${user.isVerified ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                        title={user.isVerified ? 'Restrict Access' : 'Restore Access'}
                                                    >
                                                        {user.isVerified ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="Wipe Account Data"
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
                    <span>Listing {filteredUsers.length} entries</span>
                    <span className="text-slate-500">System v12.42 Identity Core</span>
                </div>
            </div>

            {/* Warning Footer for Admin Group */}
            {activeGroup === 'ADMINS' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-4 items-center animate-in slide-in-from-bottom-2">
                    <div className="p-2 bg-amber-200 rounded-xl text-amber-800">
                        <Shield size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Privileged Access Warning</p>
                        <p className="text-xs text-amber-700 font-medium">System administrators have full platform control. Management of these accounts is restricted to the Root Administrator.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
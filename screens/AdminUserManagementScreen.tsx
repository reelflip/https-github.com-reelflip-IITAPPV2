
import React, { useState, useEffect } from 'react';
import { User } from '../lib/types';
import { Search, Shield, Trash2, CheckCircle, XCircle, MoreVertical, Loader2, Edit3, UserPlus, Save, X, Users } from 'lucide-react';

interface Props {}

export const AdminUserManagementScreen: React.FC<Props> = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'ALL' | 'STUDENT' | 'PARENT' | 'ADMIN'>('ALL');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/manage_users.php');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, currentStatus: boolean) => {
        try {
            await fetch('/api/manage_users.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isVerified: !currentStatus })
            });
            // Optimistic update
            setUsers(users.map(u => u.id === id ? { ...u, isVerified: !currentStatus } : u));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;
        try {
            await fetch(`/api/manage_users.php?id=${id}`, { method: 'DELETE' });
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const handleSaveEdit = async () => {
        if(!editingUser) return;
        setEditingUser(null);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-700 to-gray-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-2">
                        <Users className="w-8 h-8 text-white" />
                        <h1 className="text-3xl font-bold">User Management</h1>
                    </div>
                    <p className="text-slate-200 text-lg opacity-90 max-w-2xl">
                        Oversee registered students, parents, and administrators on the platform.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-white opacity-10"></div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['ALL', 'STUDENT', 'PARENT', 'ADMIN'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role as any)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                                    filterRole === role 
                                    ? 'bg-slate-800 text-white' 
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Joined</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{user.name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase ${
                                                user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                user.role === 'PARENT' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold ${
                                                user.isVerified 
                                                ? 'bg-green-50 text-green-700' 
                                                : 'bg-red-50 text-red-700'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {user.isVerified ? 'Active' : 'Blocked'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 text-xs">
                                            {/* Date placeholder if not in DB response, or parse it */}
                                            {new Date().toLocaleDateString()} 
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleUpdateStatus(user.id, !!user.isVerified)}
                                                    className={`p-1.5 rounded transition-colors ${user.isVerified ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                                                    title={user.isVerified ? 'Block User' : 'Unblock User'}
                                                >
                                                    {user.isVerified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
                    <span>Showing {filteredUsers.length} users</span>
                    <span>Total Registered: {users.length}</span>
                </div>
            </div>
        </div>
    );
};

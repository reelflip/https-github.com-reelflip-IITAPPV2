import React, { useState, useEffect, useCallback } from 'react';
import { ContactMessage } from '../lib/types';
// Fixed missing import: ChevronRight
import { Inbox, Mail, Clock, Trash2, User, Search, RefreshCw, AlertTriangle, FileWarning, HelpCircle, ChevronRight } from 'lucide-react';

export const AdminInboxScreen: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | string | null>(null);
    const [error, setError] = useState<{ type: 'api' | 'data' | 'net', msg: string } | null>(null);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/manage_contact.php', { cache: 'no-store' });
            const text = await res.text();
            
            if (res.status === 404) {
                setError({ type: 'api', msg: "Endpoint 'manage_contact.php' not found. Please re-run the System Setup to restore API files." });
                setMessages([]);
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${text.slice(0, 50)}`);
            }

            if (!text || text.trim() === "") {
                setMessages([]);
                return;
            }

            try {
                const data = JSON.parse(text);
                if (Array.isArray(data)) {
                    setMessages(data.filter(m => m && typeof m === 'object' && m.id));
                } else {
                    setMessages([]);
                    if (data?.error) setError({ type: 'data', msg: data.error });
                }
            } catch (parseErr) {
                setError({ type: 'data', msg: "Invalid data received. The API file might be corrupted." });
            }
        } catch (e: any) {
            setError({ type: 'net', msg: e.message || "Failed to reach server." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleDelete = async (id: number | string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm("Permanently delete this message?")) return;
        setMessages(prev => prev.filter(m => String(m.id) !== String(id)));
        try {
            await fetch(`/api/manage_contact.php?id=${id}`, { method: 'DELETE' });
        } catch (err) {
            fetchMessages();
        }
    };

    const safeMessages = Array.isArray(messages) ? messages : [];
    const filteredMessages = safeMessages.filter(m => {
        if (!m) return false;
        const s = search.toLowerCase();
        return (
            (m.name?.toLowerCase().includes(s) || false) || 
            (m.subject?.toLowerCase().includes(s) || false) ||
            (m.email?.toLowerCase().includes(s) || false)
        );
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-2">
                        <Inbox className="w-8 h-8 text-white" />
                        <h1 className="text-3xl font-bold">Admin Inbox</h1>
                    </div>
                    <p className="text-violet-100 opacity-90 max-w-2xl">
                        Monitor public inquiries safely. If this screen fails, check the System Health tab.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
            </div>

            {error && (
                <div className={`p-5 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-2 border ${error.type === 'api' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {error.type === 'api' ? <FileWarning className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                    <div className="flex-1">
                        <p className="font-black uppercase text-xs tracking-widest mb-1">{error.type === 'api' ? 'Missing Component' : 'System Error'}</p>
                        <p className="text-sm font-bold">{error.msg}</p>
                        {error.type === 'api' && (
                            <div className="mt-3 flex gap-2">
                                <a href="/deployment" className="text-[10px] font-bold bg-orange-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">Go to Deployment Center <ChevronRight size={10}/></a>
                            </div>
                        )}
                    </div>
                    <button onClick={fetchMessages} className="p-2 hover:bg-black/5 rounded-full"><RefreshCw size={18} /></button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Filter inbox..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-100 outline-none"
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-400">{filteredMessages.length} Messages</span>
                </div>

                {loading && safeMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm font-bold">Synchronizing with server...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                        <Mail className="w-16 h-16 mb-2 opacity-20" />
                        <p className="font-bold italic">{error ? 'System unreachable' : 'Inbox is clean'}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredMessages.map(msg => (
                            <div 
                                key={msg.id} 
                                onClick={() => setExpandedId(String(expandedId) === String(msg.id) ? null : msg.id)}
                                className={`group p-4 transition-all cursor-pointer hover:bg-slate-50 ${String(expandedId) === String(msg.id) ? 'bg-purple-50/30' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm bg-white border border-slate-100 text-slate-400">
                                            {(msg.name || "U").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={`font-bold text-sm truncate ${String(expandedId) === String(msg.id) ? 'text-purple-700' : 'text-slate-800'}`}>
                                                {msg.subject || "(No Subject)"}
                                            </h4>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {msg.name} &bull; {msg.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <span className="text-[10px] font-bold text-slate-300 whitespace-nowrap">
                                            {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'Just now'}
                                        </span>
                                        <button 
                                            onClick={(e) => handleDelete(msg.id, e)}
                                            className="text-slate-200 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {String(expandedId) === String(msg.id) && (
                                    <div className="mt-4 pl-14 pr-4 animate-in fade-in slide-in-from-top-1">
                                        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm relative">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-600"><Mail size={48}/></div>
                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap relative z-10">
                                                {msg.message}
                                            </p>
                                            <div className="mt-4 flex justify-end">
                                                <a href={`mailto:${msg.email}`} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Reply to {msg.name}</a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
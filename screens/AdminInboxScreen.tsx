import React, { useState, useEffect, useCallback } from 'react';
import { ContactMessage } from '../lib/types';
import { Inbox, Mail, Clock, Trash2, User, Search, RefreshCw, AlertTriangle, FileWarning } from 'lucide-react';

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
                setError({ type: 'api', msg: "Endpoint 'manage_contact.php' not found on server. Please ensure the /api folder is uploaded correctly." });
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
                    // Filter out any non-object items to prevent render crashes
                    setMessages(data.filter(m => m && typeof m === 'object' && m.id));
                } else {
                    console.warn("Expected array, got:", data);
                    setMessages([]);
                    if (data?.error) setError({ type: 'data', msg: data.error });
                }
            } catch (parseErr) {
                setError({ type: 'data', msg: "The server returned invalid JSON. Check for PHP errors in manage_contact.php" });
            }
        } catch (e: any) {
            setError({ type: 'net', msg: e.message || "Network error while loading inbox." });
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
            const res = await fetch(`/api/manage_contact.php?id=${id}`, { method: 'DELETE' });
            if (!res.ok) fetchMessages(); // Revert on failure
        } catch (err) {
            console.error("Delete failed", err);
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
                        <h1 className="text-3xl font-bold">Message Inbox</h1>
                    </div>
                    <p className="text-violet-100 text-lg opacity-90 max-w-2xl">
                        Monitor inquiries from the public contact form.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-700">All Messages ({safeMessages.length})</h3>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search inbox..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-100 outline-none"
                        />
                    </div>
                    <button 
                        onClick={fetchMessages}
                        disabled={loading}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {error && (
                <div className={`p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 ${error.type === 'api' ? 'bg-orange-50 border border-orange-200 text-orange-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {error.type === 'api' ? <FileWarning className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                    <div className="flex-1">
                        <p className="text-sm font-bold">{error.type === 'api' ? 'API Configuration Issue' : 'System Error'}</p>
                        <p className="text-xs opacity-90 mt-0.5">{error.msg}</p>
                    </div>
                    <button onClick={fetchMessages} className="text-xs font-bold uppercase underline">Retry</button>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                {loading && safeMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm">Loading messages...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 opacity-60">
                        <Mail className="w-12 h-12 mb-2" />
                        <p className="text-sm font-medium">{error ? "Fetch failed" : "Inbox is empty"}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredMessages.map(msg => (
                            <div 
                                key={msg.id} 
                                onClick={() => setExpandedId(String(expandedId) === String(msg.id) ? null : msg.id)}
                                className={`group p-4 transition-all cursor-pointer hover:bg-slate-50 ${String(expandedId) === String(msg.id) ? 'bg-slate-50' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm bg-slate-100 text-slate-500">
                                            {(msg.name || "U").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={`font-bold text-sm truncate ${String(expandedId) === String(msg.id) ? 'text-purple-700' : 'text-slate-800'}`}>
                                                {msg.subject || "(No Subject)"}
                                            </h4>
                                            <p className="text-xs text-slate-500 truncate">
                                                {msg.name} &bull; {msg.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'Just now'}
                                        </span>
                                        <button 
                                            onClick={(e) => handleDelete(msg.id, e)}
                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {String(expandedId) === String(msg.id) && (
                                    <div className="mt-4 pl-14 pr-4 animate-in fade-in slide-in-from-top-1">
                                        <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 whitespace-pre-wrap">
                                            {msg.message}
                                        </p>
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
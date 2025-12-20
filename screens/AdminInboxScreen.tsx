import React, { useState, useEffect, useCallback } from 'react';
import { ContactMessage } from '../lib/types';
// Added missing Loader2 import
import { Inbox, Mail, Clock, Trash2, User, Search, RefreshCw, AlertTriangle, FileWarning, HelpCircle, ChevronRight, X, Loader2 } from 'lucide-react';

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
            if (res.status === 404) {
                setError({ type: 'api', msg: "Inbox component 'manage_contact.php' is missing from server." });
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
            } else if (data?.error) {
                setError({ type: 'data', msg: data.error });
            }
        } catch (e: any) {
            setError({ type: 'net', msg: "Failed to establish secure connection to Inbox server." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleDelete = async (id: number | string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm("Permanently delete this inquiry?")) return;
        try {
            await fetch(`/api/manage_contact.php?id=${id}`, { method: 'DELETE' });
            setMessages(messages.filter(m => String(m.id) !== String(id)));
        } catch (err) {
            alert("Delete action failed.");
        }
    };

    const filteredMessages = messages.filter(m => {
        const s = search.toLowerCase();
        return (m.name?.toLowerCase().includes(s) || m.subject?.toLowerCase().includes(s) || m.email?.toLowerCase().includes(s));
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-2">
                        <Inbox className="w-8 h-8 text-white" />
                        <h1 className="text-3xl font-bold">Identity Communication Console</h1>
                    </div>
                    <p className="text-violet-100 opacity-90 max-w-2xl font-medium">
                        Monitor public inquiries and aspirant support tickets from the main website.
                    </p>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
            </div>

            {error && (
                <div className={`p-5 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-2 border ${error.type === 'api' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {error.type === 'api' ? <FileWarning className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                    <div className="flex-1">
                        <p className="font-black uppercase text-xs tracking-widest mb-1">{error.type === 'api' ? 'Configuration Alert' : 'System Error'}</p>
                        <p className="text-sm font-bold">{error.msg}</p>
                    </div>
                    <button onClick={fetchMessages} className="p-2 hover:bg-black/5 rounded-full"><RefreshCw size={18} /></button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Filter by sender or subject..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none bg-white"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredMessages.length} Messages Found</span>
                        <button onClick={fetchMessages} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><RefreshCw size={16} /></button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-purple-600" />
                        <p className="text-xs font-black uppercase tracking-widest">Retrieving Inbound Streams...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                        <Mail className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-bold italic">No active inquiries matched your criteria.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredMessages.map(msg => (
                            <div 
                                key={msg.id} 
                                onClick={() => setExpandedId(String(expandedId) === String(msg.id) ? null : msg.id)}
                                className={`group p-5 transition-all cursor-pointer hover:bg-slate-50 ${String(expandedId) === String(msg.id) ? 'bg-purple-50/40 border-l-4 border-purple-600' : 'border-l-4 border-transparent'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4 overflow-hidden">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm transition-all ${
                                            String(expandedId) === String(msg.id) ? 'bg-purple-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'
                                        }`}>
                                            {(msg.name || "U").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`font-bold text-base truncate ${String(expandedId) === String(msg.id) ? 'text-purple-900' : 'text-slate-800'}`}>
                                                    {msg.subject || "(No Subject)"}
                                                </h4>
                                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-tighter">Support</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium truncate">
                                                {msg.name} &bull; <span className="text-blue-600">{msg.email}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">
                                            {msg.created_at ? new Date(msg.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'Pending'}
                                        </span>
                                        <button 
                                            onClick={(e) => handleDelete(msg.id, e)}
                                            className="p-2 text-slate-200 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {String(expandedId) === String(msg.id) && (
                                    <div className="mt-5 pl-16 pr-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                        <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm relative">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-600"><Mail size={48}/></div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-purple-600"></div>
                                                Message Payload
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap relative z-10 font-medium italic">
                                                "{msg.message}"
                                            </p>
                                            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-end gap-3">
                                                <a href={`mailto:${msg.email}`} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all flex items-center gap-2">
                                                    Compose Reply <ChevronRight size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 pt-4">
                <ShieldRight className="w-3 h-3"/> End-to-End Encrypted Communication Interface
            </div>
        </div>
    );
};

const ShieldRight = ({className}: any) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);
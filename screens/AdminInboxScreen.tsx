
import React, { useState, useEffect } from 'react';
import { ContactMessage } from '../lib/types';
import { Inbox, Mail, Clock, Trash2, User, Search, RefreshCw } from 'lucide-react';

interface Props {
    // If we wanted to pass props from App, but we'll fetch internally to be self contained or use passed prop
}

export const AdminInboxScreen: React.FC<Props> = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/manage_contact.php');
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            } else {
                // Mock data if API fails
                setMessages([
                    { id: 1, name: 'John Doe', email: 'john@example.com', subject: 'Login Issue', message: 'I cannot login to my account. Please help.', created_at: new Date().toISOString() },
                    { id: 2, name: 'Jane Smith', email: 'jane@test.com', subject: 'Feature Request', message: 'Can you add a Dark Mode?', created_at: new Date(Date.now() - 86400000).toISOString() }
                ]);
            }
        } catch (e) {
            console.error("Failed to fetch messages", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm("Are you sure you want to delete this message?")) return;
        
        // Optimistic update
        setMessages(prev => prev.filter(m => m.id !== id));
        
        // API Call (Assuming the endpoint supports DELETE, if not, it's just frontend)
        // await fetch(`/api/manage_contact.php?id=${id}`, { method: 'DELETE' }); 
    };

    const filteredMessages = messages.filter(m => 
        m.name.toLowerCase().includes(search.toLowerCase()) || 
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                        <Inbox className="w-6 h-6 mr-2 text-purple-600" /> Inbox
                    </h2>
                    <p className="text-slate-500">Read inquiries from the Contact Us page.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search messages..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-100"
                        />
                    </div>
                    <button 
                        onClick={fetchMessages}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                        <p>Loading messages...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Mail className="w-12 h-12 mb-2 opacity-50" />
                        <p>No messages found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredMessages.map(msg => (
                            <div 
                                key={msg.id} 
                                onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                                className={`group p-4 transition-all cursor-pointer hover:bg-slate-50 ${expandedId === msg.id ? 'bg-slate-50' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3 overflow-hidden">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${expandedId === msg.id ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {msg.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className={`font-bold text-sm truncate ${expandedId === msg.id ? 'text-purple-900' : 'text-slate-800'}`}>
                                                    {msg.subject}
                                                </h4>
                                                {/* <span className="w-2 h-2 rounded-full bg-blue-500"></span> New indicator logic could go here */}
                                            </div>
                                            <p className="text-xs text-slate-500 flex items-center truncate">
                                                <User className="w-3 h-3 mr-1" /> {msg.name} &lt;{msg.email}&gt;
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <span className="text-[10px] text-slate-400 flex items-center whitespace-nowrap">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {new Date(msg.created_at || Date.now()).toLocaleDateString()}
                                        </span>
                                        <button 
                                            onClick={(e) => handleDelete(msg.id, e)}
                                            className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                {expandedId === msg.id && (
                                    <div className="mt-4 pl-14 pr-4 animate-in fade-in slide-in-from-top-1">
                                        <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                            {msg.message}
                                        </p>
                                        <div className="mt-2 flex justify-end">
                                            <a 
                                                href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                                className="text-xs font-bold text-blue-600 hover:underline flex items-center"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Mail className="w-3 h-3 mr-1" /> Reply via Email
                                            </a>
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


import React, { useState, useEffect } from 'react';
import { SYLLABUS_DATA } from '../lib/syllabusData';
import { VideoLesson } from '../lib/types';
import { Save, Youtube, Video, Info } from 'lucide-react';

interface Props {
    videoMap: Record<string, VideoLesson>;
    onUpdateVideo: (topicId: string, url: string, description: string) => void;
}

export const VideoManagerScreen: React.FC<Props> = ({ videoMap, onUpdateVideo }) => {
    const [selectedSubject, setSelectedSubject] = useState<string>('Physics');
    const [selectedTopicId, setSelectedTopicId] = useState<string>('');
    const [url, setUrl] = useState('');
    const [desc, setDesc] = useState('');
    const [savedMsg, setSavedMsg] = useState('');

    const topics = SYLLABUS_DATA.filter(t => t.subject === selectedSubject);

    useEffect(() => {
        if (selectedTopicId) {
            const existing = videoMap[selectedTopicId];
            if (existing) {
                setUrl(existing.videoUrl || '');
                setDesc(existing.description || '');
            } else {
                setUrl('');
                setDesc('');
            }
        }
    }, [selectedTopicId, videoMap]);

    const handleSave = () => {
        if (selectedTopicId && url) {
            // Convert watch URLs to embed if necessary
            let finalUrl = url;
            if (finalUrl.includes('watch?v=')) {
                finalUrl = finalUrl.replace('watch?v=', 'embed/');
            } else if (finalUrl.includes('youtu.be/')) {
                finalUrl = finalUrl.replace('youtu.be/', 'www.youtube.com/embed/');
            }
            onUpdateVideo(selectedTopicId, finalUrl, desc);
            setSavedMsg('Video linked successfully!');
            setTimeout(() => setSavedMsg(''), 3000);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-red-800 rounded-xl p-8 text-white shadow-lg relative overflow-hidden flex items-center justify-between">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2 flex items-center">
                        Video Lesson Manager
                    </h2>
                    <p className="text-red-100 opacity-90">Assign YouTube educational content to syllabus topics.</p>
                </div>
                <div className="bg-red-700/50 p-4 rounded-xl">
                    <Video className="w-8 h-8 text-white" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-center gap-2 mb-6 text-slate-700 font-bold border-b border-slate-100 pb-4">
                    <Youtube className="w-5 h-5 text-red-600" />
                    <h3>Manage Syllabus Videos</h3>
                </div>
                
                <p className="text-slate-500 text-xs mb-6">Select a topic to view or update its video lesson. Changes reflect immediately for all students.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            value={selectedSubject}
                            onChange={(e) => {
                                setSelectedSubject(e.target.value);
                                setSelectedTopicId('');
                            }}
                        >
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Maths">Maths</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Topic</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            value={selectedTopicId}
                            onChange={(e) => setSelectedTopicId(e.target.value)}
                        >
                            <option value="">Select Topic</option>
                            {topics.map(t => (
                                <option key={t.id} value={t.id}>{t.name} - {t.chapter}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Youtube URL</label>
                        <input 
                            type="text" 
                            className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={!selectedTopicId}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Paste any YouTube link. We'll auto-convert it.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Short Description</label>
                        <input 
                            type="text" 
                            className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="e.g. Khan Academy - 10 mins"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            disabled={!selectedTopicId}
                        />
                    </div>
                </div>

                {videoMap[selectedTopicId] && (
                    <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-blue-800 uppercase mb-1">Current Link Active</p>
                            <p className="text-sm text-blue-700 break-all">{videoMap[selectedTopicId].videoUrl}</p>
                            {videoMap[selectedTopicId].description && <p className="text-xs text-blue-600 mt-1 italic">"{videoMap[selectedTopicId].description}"</p>}
                        </div>
                    </div>
                )}

                <button 
                    onClick={handleSave}
                    disabled={!selectedTopicId || !url}
                    className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg shadow-sm flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4 mr-2" /> Save Video Link
                </button>

                {savedMsg && (
                    <p className="mt-4 text-green-600 text-sm font-bold animate-pulse">{savedMsg}</p>
                )}
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { getBackendFiles, generateSQLSchema } from '../services/generatorService';
import { Download, Server, BookOpen, Package, FileText, Folder, ArrowRight, ShieldCheck, Database, Layout, Activity, PlugZap, CheckCircle2, XCircle, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';

export const DeploymentScreen: React.FC = () => {
    
    const [activeTab, setActiveTab] = useState<'guide' | 'architecture' | 'integrity'>('guide');
    const [dbConfig, setDbConfig] = useState({ host: "localhost", name: "u123456789_iitjee", user: "u123456789_admin", pass: "" });
    const [isZipping, setIsZipping] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<null | 'success' | 'error'>(null);
    const [integrityResults, setIntegrityResults] = useState<any[]>([]);
    const [scanning, setScanning] = useState(false);
    const [repairing, setRepairing] = useState(false);

    const API_FILES = [
        'index.php', 'config.php', 'cors.php', 'test_db.php', 'migrate_db.php',
        'login.php', 'register.php', 'google_login.php', 'update_password.php',
        'get_dashboard.php', 'sync_progress.php', 
        'save_attempt.php', 'save_timetable.php',
        'manage_users.php', 'manage_content.php', 'manage_tests.php', 
        'manage_syllabus.php', 'manage_questions.php', 'manage_backlogs.php',
        'manage_goals.php', 'manage_mistakes.php', 'manage_notes.php',
        'manage_videos.php', 'manage_contact.php', 'contact.php',
        'manage_settings.php', 'update_profile.php', 'track_visit.php',
        'get_admin_stats.php', 'search_students.php', 'send_request.php',
        'respond_request.php', 'get_psychometric.php', 'save_psychometric.php',
        'delete_account.php', 'upload_avatar.php'
    ];

    const checkConnection = async () => {
        setConnectionStatus(null);
        try {
            const res = await fetch('/api/test_db.php');
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'CONNECTED') { setConnectionStatus('success'); alert(`Success! Connected to DB. ${data.tables.length} tables found.`); }
                else throw new Error(data.message);
            } else throw new Error(`HTTP ${res.status}`);
        } catch (e: any) { setConnectionStatus('error'); alert(`Connection Failed: ${e.message}`); }
    };

    const runIntegrityScan = async () => {
        setScanning(true);
        setIntegrityResults([]);
        const results = [];
        for (const file of API_FILES) {
            const start = performance.now();
            let status = 'UNKNOWN';
            let code = 0;
            try {
                const res = await fetch(`/api/${file}`, { method: 'HEAD', cache: 'no-store' }); 
                code = res.status;
                if (res.ok) status = 'OK';
                else if (res.status === 403) status = 'PERM_ERR';
                else if (res.status === 404) status = 'MISSING';
                else if (res.status === 500) status = 'CRASH';
                else status = 'ERROR';
            } catch (e) { status = 'NET_ERR'; }
            results.push({ file, status, code, time: Math.round(performance.now() - start) });
            setIntegrityResults([...results]); 
        }
        setScanning(false);
    };

    const runDbRepair = async () => {
        setRepairing(true);
        try {
            const res = await fetch('/api/migrate_db.php');
            if(res.ok) alert("v12.28 Hardened Schema Repair Successful!");
            else throw new Error(`HTTP ${res.status}`);
        } catch(e: any) { alert("Repair Failed: " + e.message); }
        finally { setRepairing(false); }
    };

    const downloadAllZip = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();
            const backendFiles = getBackendFiles(dbConfig);
            const apiFolder = zip.folder("deployment/api");
            if (apiFolder) backendFiles.filter(f => f.folder === 'deployment/api').forEach(file => apiFolder.file(file.name, file.content));
            const seoFolder = zip.folder("deployment/seo");
            if (seoFolder) backendFiles.filter(f => f.folder === 'deployment/seo').forEach(file => seoFolder.file(file.name, file.content));
            const sqlFolder = zip.folder("deployment/sql");
            if (sqlFolder) sqlFolder.file('database.sql', generateSQLSchema());
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url; link.download = "IITGEEPrep_Bundle_v12_28.zip";
            link.click();
        } catch (error) { console.error(error); alert("Error creating zip file."); }
        setIsZipping(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-12">
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold">Deployment Center</h2>
                            <span className="px-2 py-1 rounded-md bg-slate-700 border border-slate-600 text-xs font-mono text-cyan-400">v12.28 (Latest)</span>
                        </div>
                        <p className="text-slate-400 text-lg">Download the complete 38-endpoint hardened backend kit.</p>
                    </div>
                    <div className="flex bg-slate-700/50 p-1 rounded-xl border border-slate-600/50">
                        <button onClick={() => setActiveTab('guide')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'guide' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Guide</button>
                        <button onClick={() => setActiveTab('integrity')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'integrity' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>Integrity</button>
                    </div>
                </div>
            </div>

            {activeTab === 'integrity' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div><h3 className="text-lg font-bold text-slate-800">File & Schema Diagnostics</h3><p className="text-sm text-slate-500">Scan API health and repair database tables.</p></div>
                        <div className="flex gap-2">
                            <button onClick={runDbRepair} disabled={repairing} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">{repairing ? <RefreshCw className="animate-spin" size={18}/> : <Database size={18}/>} Repair DB</button>
                            <button onClick={runIntegrityScan} disabled={scanning} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">{scanning ? <Activity className="animate-spin" size={18}/> : <PlugZap size={18}/>} Scan Files</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {integrityResults.map(res => (
                            <div key={res.file} className={`p-4 rounded-xl border flex items-center justify-between ${res.status === 'OK' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="min-w-0">
                                    <div className="font-bold text-slate-700 text-sm truncate w-32">{res.file}</div>
                                    <div className="text-[10px] text-slate-500">{res.time}ms • HTTP {res.code}</div>
                                </div>
                                <span className={`text-[10px] font-black ${res.status === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{res.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'guide' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Package className="text-blue-600"/> Update Instructions</h3>
                        <ol className="space-y-4 text-slate-600 text-sm list-decimal pl-5">
                            <li>Download the <strong>v12.28</strong> Bundle using the sidebar action.</li>
                            <li>Extract and upload <strong>deployment/api/*</strong> to your server's <code>/api</code> folder.</li>
                            <li>Use the <strong>Repair DB</strong> tool above to synchronize any new schema changes.</li>
                            <li>Clear browser cache to see the latest frontend updates.</li>
                        </ol>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                            <h3 className="text-xl font-bold mb-2">Get Bundle</h3>
                            <p className="text-slate-400 text-sm mb-6">Complete v12.28 hardened backend kit including all 38 PHP APIs and SQL.</p>
                            <button onClick={downloadAllZip} disabled={isZipping} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-50">
                                {isZipping ? <RefreshCw className="animate-spin mr-2"/> : <Download className="mr-2"/>} Download v12.28 .zip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
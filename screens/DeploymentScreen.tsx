
import React, { useState } from 'react';
import { getBackendFiles, generateSQLSchema } from '../services/generatorService';
import { Download, Database, Activity, RefreshCw, Layers, AlertTriangle, Terminal, Lock } from 'lucide-react';
import JSZip from 'jszip';

export const DeploymentScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'guide' | 'integrity'>('guide');
    const [dbConfig, setDbConfig] = useState({ 
        host: "localhost", 
        name: "u123456789_prep", 
        user: "u123456789_admin", 
        pass: "password" 
    });
    
    const [isZipping, setIsZipping] = useState(false);
    const [integrityResults, setIntegrityResults] = useState<any[]>([]);
    const [dbTables, setDbTables] = useState<any[]>([]);
    const [scanning, setScanning] = useState(false);
    const [scanningDb, setScanningDb] = useState(false);

    const runIntegrityScan = async () => {
        setScanning(true);
        setIntegrityResults([]);
        const API_FILES = ['test_db.php', 'login.php', 'get_dashboard.php'];
        const results = [];
        for (const file of API_FILES) {
            const start = performance.now();
            let status = 'UNKNOWN';
            let code = 0;
            try {
                const res = await fetch(`/api/${file}`, { method: 'GET', cache: 'no-store' }); 
                code = res.status;
                if (res.ok) status = 'OK';
                else if (res.status === 404) status = 'MISSING';
                else status = 'ERROR';
            } catch (e) { status = 'NET_ERR'; }
            results.push({ file, status, code, time: Math.round(performance.now() - start) });
            setIntegrityResults([...results]); 
        }
        setScanning(false);
    };

    const scanDatabase = async () => {
        setScanningDb(true);
        try {
            const res = await fetch('/api/test_db.php', { cache: 'no-store' });
            const data = await res.json();
            if (data.status === 'success' && data.tables) {
                setDbTables(data.tables);
            } else {
                alert(`MySQL Connection Refused: ${data.message || 'Check your config.php credentials.'}`);
            }
        } catch (e) {
            alert("Database node unreachable. Please ensure your /api/ folder is uploaded to the server.");
        }
        setScanningDb(false);
    };

    const downloadAllZip = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();
            const backendFiles = getBackendFiles(dbConfig);
            const apiFolder = zip.folder("api");
            if (apiFolder) {
                backendFiles.filter(f => f.folder === 'deployment/api').forEach(file => apiFolder.file(file.name, file.content));
            }
            zip.file('database_mysql.sql', generateSQLSchema());
            
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url; link.download = `IITGEE_Master_Sync_v18.zip`;
            link.click();
        } catch (error) { alert("Zip generation failed."); }
        setIsZipping(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-12">
            {/* Deployment Console Header */}
            <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/50">
                                <Database className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight">Deployment Control</h2>
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Master Build v18.0 • Direct MySQL Sync</p>
                            </div>
                        </div>
                        <p className="text-slate-300 max-w-xl font-medium">Use this console to configure your Hostinger environment and download the required backend architecture.</p>
                    </div>
                    <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
                        <button onClick={() => setActiveTab('guide')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'guide' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Instruction</button>
                        <button onClick={() => setActiveTab('integrity')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'integrity' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}>Verification</button>
                    </div>
                </div>
            </div>

            {activeTab === 'guide' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><Terminal className="text-blue-600" /> Database Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Host (Usually localhost)</label>
                                    <input className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-blue-100 outline-none" value={dbConfig.host} onChange={e => setDbConfig({...dbConfig, host: e.target.value})}/>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Database Name</label>
                                    <input className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-blue-100 outline-none" value={dbConfig.name} onChange={e => setDbConfig({...dbConfig, name: e.target.value})}/>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">DB User</label>
                                    <input className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-blue-100 outline-none" value={dbConfig.user} onChange={e => setDbConfig({...dbConfig, user: e.target.value})}/>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">DB Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 text-slate-300 w-4 h-4" />
                                        <input className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-blue-100 outline-none" type="password" value={dbConfig.pass} onChange={e => setDbConfig({...dbConfig, pass: e.target.value})}/>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                                <h4 className="font-bold text-blue-900 text-sm mb-3">Deployment Protocol</h4>
                                <ul className="space-y-3 text-xs text-blue-800/80 font-medium">
                                    <li className="flex gap-2"><span>1.</span> Enter your Hostinger MySQL details above.</li>
                                    <li className="flex gap-2"><span>2.</span> Download the ZIP bundle containing all 38 PHP endpoints.</li>
                                    <li className="flex gap-2"><span>3.</span> Upload the extracted "api" folder to your public_html root.</li>
                                    <li className="flex gap-2"><span>4.</span> Use the "Verify" tab to check connectivity.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col justify-between h-full relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 leading-tight">Master Build <br/>Bundle</h3>
                                <p className="text-indigo-200 text-sm font-medium italic opacity-80 leading-relaxed">Contains the SQL schema and all backend logic files pre-configured with your credentials.</p>
                            </div>
                            <button onClick={downloadAllZip} disabled={isZipping} className="w-full bg-white text-indigo-900 font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-50 transition-all active:scale-95 shadow-xl mt-12 relative z-10">
                                {isZipping ? <RefreshCw className="animate-spin" /> : <Download />}
                                Download Build ZIP
                            </button>
                            <div className="absolute -bottom-10 -right-10 p-4 opacity-5 text-white scale-[2.5]"><Layers size={64}/></div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'integrity' && (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Connectivity Audit</h3>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Live Endpoint Probe</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={runIntegrityScan} disabled={scanning} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95">
                                    {scanning ? <RefreshCw className="animate-spin w-4 h-4" /> : <Activity className="w-4 h-4" />} Probe Files
                                </button>
                                <button onClick={scanDatabase} disabled={scanningDb} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 active:scale-95">
                                    {scanningDb ? <RefreshCw className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />} DB Handshake
                                </button>
                            </div>
                        </div>

                        {integrityResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                                {integrityResults.map(res => (
                                    <div key={res.file} className={`p-5 border-2 rounded-2xl flex flex-col justify-between transition-all ${res.status === 'OK' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{res.file}</span>
                                        <div className="flex justify-between items-end">
                                            <span className={`text-xl font-black ${res.code === 200 ? 'text-emerald-700' : 'text-rose-700'}`}>{res.code}</span>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${res.status === 'OK' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{res.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {dbTables.length > 0 ? (
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-1">Live Database State</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {dbTables.map(t => (
                                        <div key={t.name} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center group hover:bg-white transition-all hover:shadow-md">
                                            <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-sm font-black text-slate-700 uppercase tracking-tight">{t.name}</span></div>
                                            <span className="bg-white px-3 py-1 rounded-xl border text-[11px] font-black text-blue-600 shadow-sm">{t.rows} Rows</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-24 text-center text-slate-300 border-4 border-dashed rounded-[3rem] opacity-60">
                                <AlertTriangle size={64} className="mx-auto mb-6" />
                                <p className="font-black uppercase text-sm tracking-[0.2em]">Registry Empty</p>
                                <p className="text-xs font-bold uppercase mt-2">Upload backend and run 'DB Handshake' above.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

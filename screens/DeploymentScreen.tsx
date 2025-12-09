import React, { useState } from 'react';
import { generateSQLSchema, getBackendFiles, generateFrontendGuide, generateHtaccess, getDeploymentPhases } from '../services/generatorService';
import { Download, Database, Code, Terminal, FileCode, BookOpen, CheckCircle, Activity, Play, AlertCircle, Server, Folder, File, Settings, Key, User as UserIcon, Package, Search, ShieldCheck, Layers, Cpu, Share2, GitBranch, ArrowRight, Layout, Box, Users, GraduationCap, Lock } from 'lucide-react';
import JSZip from 'jszip';

export const DeploymentScreen: React.FC = () => {
    
    const [activeTab, setActiveTab] = useState<'deployment' | 'architecture'>('deployment');

    // Database Config State
    const [dbConfig, setDbConfig] = useState({
        host: "localhost",
        name: "u123456789_iitjee",
        user: "u123456789_admin",
        pass: ""
    });

    // Test Diagnostic State
    const [testUrl, setTestUrl] = useState('https://yourdomain.com/api');
    const [testResult, setTestResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isZipping, setIsZipping] = useState(false);

    const downloadFile = (filename: string, content: string) => {
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const downloadAllZip = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();
            const backendFiles = getBackendFiles(dbConfig);

            // Add .htaccess to root
            zip.file(".htaccess", generateHtaccess());

            // Add API files to api/ folder
            const apiFolder = zip.folder("api");
            if (apiFolder) {
                backendFiles.forEach(file => {
                    if (file.folder === 'api') {
                        apiFolder.file(file.name, file.content);
                    }
                });
            }

            // Generate blob
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = "hostinger_backend_bundle.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to zip files", error);
            alert("Error creating zip file. Please try downloading files individually.");
        }
        setIsZipping(false);
    };

    const runDiagnostics = async () => {
        setIsLoading(true);
        setTestResult(null);
        try {
            const baseUrl = testUrl.replace(/\/$/, "");
            const response = await fetch(`${baseUrl}/test_db.php`, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status} ${response.statusText}`);
            }
            
            const text = await response.text();
            
            try {
                const data = JSON.parse(text);
                setTestResult(data);
            } catch (e) {
                throw new Error(`Invalid JSON response.`);
            }
        } catch (error: any) {
            setTestResult({ status: 'ERROR', message: error.message || 'Failed to fetch.' });
        }
        setIsLoading(false);
    };

    const phases = getDeploymentPhases();
    const backendFiles = getBackendFiles(dbConfig);
    const seoFiles = backendFiles.filter(f => f.folder === 'root');
    const apiFiles = backendFiles.filter(f => f.folder === 'api');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold">System Center</h2>
                            <span className="px-2 py-1 rounded-md bg-slate-700 border border-slate-600 text-xs font-mono text-cyan-400 shadow-sm">
                                v8.0 (Stable)
                            </span>
                        </div>
                        <p className="text-slate-400 text-lg max-w-xl">Documentation, Deployment & System Architecture.</p>
                    </div>
                    
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-700/50 p-1 rounded-xl border border-slate-600/50">
                        <button 
                            onClick={() => setActiveTab('deployment')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                activeTab === 'deployment' 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Server className="w-4 h-4" /> Deployment
                        </button>
                        <button 
                            onClick={() => setActiveTab('architecture')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                activeTab === 'architecture' 
                                ? 'bg-purple-600 text-white shadow-lg' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Cpu className="w-4 h-4" /> Architecture
                        </button>
                    </div>
                </div>
                {/* Decor */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-green-600/10 rounded-full blur-3xl"></div>
                <div className="absolute top-0 right-1/3 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            </div>

            {activeTab === 'deployment' ? (
                /* ================= DEPLOYMENT VIEW ================= */
                <div className="animate-in fade-in">
                    {/* Deployment Steps */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center"><BookOpen className="mr-2 w-6 h-6 text-blue-600"/> Deployment Walkthrough</h3>
                            <button 
                                onClick={() => downloadFile('HOSTINGER_GUIDE.md', generateFrontendGuide())}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-colors text-sm font-bold"
                            >
                                <Download className="w-4 h-4 mr-2" /> Download Full Manual
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {phases.map((phase, idx) => (
                                <div key={idx} className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition-all ${phase.bg} ${idx === 4 ? 'lg:col-span-1 md:col-span-2' : ''}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className={`font-bold text-lg ${phase.color}`}>{phase.title}</h4>
                                        <span className="text-[10px] uppercase font-bold bg-white/50 px-2 py-1 rounded text-slate-600">{phase.subtitle}</span>
                                    </div>
                                    <ul className="space-y-2">
                                        {phase.steps.map((step, sIdx) => (
                                            <li key={sIdx} className="flex items-start text-sm text-slate-700">
                                                <CheckCircle className={`w-4 h-4 mr-2 mt-0.5 shrink-0 ${phase.color}`} />
                                                <span className="leading-tight">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. DB Config */}
                        <div className="md:col-span-1 bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-slate-800 font-bold flex items-center mb-4 text-lg">
                                <Settings className="mr-2 w-5 h-5 text-blue-600"/> 1. Database Configuration
                            </h3>
                            <p className="text-slate-500 text-xs mb-4">Enter Hostinger MySQL details. Generated PHP files will use these.</p>
                            
                            <div className="space-y-3">
                                {Object.entries(dbConfig).map(([key, val]) => (
                                    <div key={key}>
                                        <label className="text-xs font-bold text-slate-500 uppercase">MySQL {key}</label>
                                        <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 mt-1">
                                            {key === 'pass' ? <Key className="w-4 h-4 text-slate-400 mr-2"/> : <Terminal className="w-4 h-4 text-slate-400 mr-2"/>}
                                            <input 
                                                type="text" 
                                                value={val}
                                                onChange={(e) => setDbConfig({...dbConfig, [key]: e.target.value})}
                                                className="w-full text-sm outline-none text-slate-700 font-mono"
                                                placeholder={key === 'pass' ? 'Password' : 'Value'}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. SQL Schema */}
                        <div className="md:col-span-1 bg-slate-900 text-slate-300 p-6 rounded-2xl overflow-hidden shadow-lg font-mono text-xs border border-slate-800">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                                <h3 className="text-white font-bold flex items-center text-sm"><Database className="mr-2 w-4 h-4 text-green-400"/> 2. MySQL Schema</h3>
                                <button onClick={() => downloadFile('database.sql', generateSQLSchema())} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded flex items-center transition-colors border border-slate-600"><Download className="w-3 h-3 mr-1" /> .sql</button>
                            </div>
                            <pre className="overflow-x-auto h-64 text-green-400 no-scrollbar p-2 bg-black/20 rounded-lg">{generateSQLSchema().substring(0, 500)}...</pre>
                        </div>

                        {/* 3. PHP Backend */}
                        <div className="md:col-span-1 bg-slate-900 text-slate-300 p-6 rounded-2xl overflow-hidden shadow-lg font-mono text-xs border border-slate-800">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                                <h3 className="text-white font-bold flex items-center text-sm"><Code className="mr-2 w-4 h-4 text-purple-400"/> 3. PHP Backend API</h3>
                                <button onClick={downloadAllZip} disabled={isZipping} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded flex items-center transition-colors shadow-lg border border-purple-500 disabled:opacity-50">
                                    {isZipping ? <Activity className="w-3 h-3 mr-1 animate-spin" /> : <Package className="w-3 h-3 mr-1" />} Download .zip
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                {apiFiles.map((file, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
                                        <div className="flex items-center space-x-2"><FileCode className="w-4 h-4 text-purple-400" /> <span>{file.name}</span></div>
                                        <button onClick={() => downloadFile(file.name, file.content)}><Download className="w-4 h-4 text-slate-400 hover:text-white" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 5. Live Tester */}
                        <div className="md:col-span-1 bg-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl">
                            <h3 className="text-white font-bold flex items-center mb-4 text-xl"><Activity className="mr-2 w-6 h-6 text-green-400"/> 5. Connection Tester</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">API Base URL</label>
                                    <input type="text" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none" value={testUrl} onChange={(e) => setTestUrl(e.target.value)} />
                                </div>
                                <button onClick={runDiagnostics} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center transition-all disabled:opacity-50">
                                    {isLoading ? <Activity className="w-4 h-4 animate-spin mr-2"/> : <Play className="w-4 h-4 mr-2" />} Run Diagnostics
                                </button>
                                {testResult && (
                                    <div className={`p-4 rounded-lg border ${testResult.status === 'CONNECTED' ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {testResult.status === 'CONNECTED' ? <CheckCircle className="w-5 h-5 text-green-400"/> : <AlertCircle className="w-5 h-5 text-red-400"/>}
                                            <span className={`font-bold ${testResult.status === 'CONNECTED' ? 'text-green-400' : 'text-red-400'}`}>{testResult.status === 'CONNECTED' ? 'SUCCESS' : 'FAILED'}</span>
                                        </div>
                                        <div className="text-xs font-mono text-slate-400 break-all">{testResult.message || JSON.stringify(testResult)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ================= ARCHITECTURE VIEW ================= */
                <div className="animate-in fade-in space-y-8">
                    
                    {/* 1. Tech Stack Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                            <div className="bg-blue-50 p-4 rounded-full mb-4">
                                <Layout className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">Frontend (Client)</h3>
                            <p className="text-sm text-slate-500 mt-2">React 18 + TypeScript</p>
                            <div className="flex gap-2 mt-4">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded">Vite</span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded">TailwindCSS</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                            <div className="bg-purple-50 p-4 rounded-full mb-4">
                                <Server className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">Backend (API)</h3>
                            <p className="text-sm text-slate-500 mt-2">Vanilla PHP (REST)</p>
                            <div className="flex gap-2 mt-4">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded">PDO</span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded">JSON</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                            <div className="bg-green-50 p-4 rounded-full mb-4">
                                <Database className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">Database</h3>
                            <p className="text-sm text-slate-500 mt-2">MySQL / MariaDB</p>
                            <div className="flex gap-2 mt-4">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded">Relational</span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded">Normalized</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. User Roles & Responsibilities */}
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            <Users className="mr-2 w-5 h-5 text-indigo-600"/> User Roles & Permissions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Student */}
                            <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl relative group">
                                <div className="absolute top-4 right-4 text-blue-200 group-hover:text-blue-300 transition-colors">
                                    <GraduationCap className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-bold text-blue-900 mb-2">Student</h4>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-3">Core User</p>
                                <ul className="text-sm text-blue-800/80 space-y-2">
                                    <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-blue-500"/> Full access to study tools</li>
                                    <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-blue-500"/> Take Mock Tests & Analytics</li>
                                    <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-blue-500"/> Track Syllabus & Revision</li>
                                </ul>
                            </div>

                            {/* Parent */}
                            <div className="p-5 bg-green-50 border border-green-100 rounded-xl relative group">
                                <div className="absolute top-4 right-4 text-green-200 group-hover:text-green-300 transition-colors">
                                    <Users className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-bold text-green-900 mb-2">Parent</h4>
                                <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-3">Guardian / Monitor</p>
                                <ul className="text-sm text-green-800/80 space-y-2">
                                    <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-green-500"/> Read-only access to progress</li>
                                    <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-green-500"/> Family Dashboard View</li>
                                    <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-green-500"/> Connect via Student ID</li>
                                </ul>
                            </div>

                            {/* Admin */}
                            <div className="p-5 bg-purple-50 border border-purple-100 rounded-xl relative group">
                                <div className="absolute top-4 right-4 text-purple-200 group-hover:text-purple-300 transition-colors">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-bold text-purple-900 mb-2">Admin</h4>
                                <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">System Controller</p>
                                <ul className="text-sm text-purple-800/80 space-y-2">
                                    <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-purple-500"/> User Management (Block/Delete)</li>
                                    <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-purple-500"/> Create Tests, Blogs & Videos</li>
                                    <li className="flex items-start"><CheckCircle className="w-3.5 h-3.5 mr-2 mt-0.5 text-purple-500"/> System Diagnostics & Health</li>
                                </ul>
                            </div>

                        </div>
                    </div>

                    {/* 3. Component Hierarchy & Flow */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Structure */}
                        <div className="bg-slate-900 rounded-xl p-8 shadow-lg border border-slate-800">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                <GitBranch className="mr-2 w-5 h-5 text-yellow-400"/> Component Hierarchy
                            </h3>
                            <div className="space-y-4 font-mono text-sm">
                                <div className="flex items-center text-blue-300">
                                    <Box className="w-4 h-4 mr-2" /> App.tsx <span className="text-slate-500 ml-2">// Root Controller & State</span>
                                </div>
                                <div className="ml-6 space-y-4 border-l border-slate-700 pl-4">
                                    <div className="flex items-center text-purple-300">
                                        <Layout className="w-4 h-4 mr-2" /> Navigation <span className="text-slate-500 ml-2">// Sidebar & Routing</span>
                                    </div>
                                    <div className="flex items-center text-green-300">
                                        <Lock className="w-4 h-4 mr-2" /> AuthScreen <span className="text-slate-500 ml-2">// Login / Register / Google</span>
                                    </div>
                                    <div className="flex items-center text-orange-300">
                                        <Layers className="w-4 h-4 mr-2" /> Feature Screens
                                    </div>
                                    <div className="ml-6 space-y-2 border-l border-slate-700 pl-4 text-slate-300 text-xs">
                                        <div>├── DashboardScreen (Stats, Goals)</div>
                                        <div>├── SyllabusScreen (Tracker, Videos)</div>
                                        <div>├── TestScreen (Practice, History)</div>
                                        <div>├── AdminDashboardScreen (Manager)</div>
                                        <div>└── ... (15+ Feature Screens)</div>
                                    </div>
                                    <div className="flex items-center text-slate-400">
                                        <Share2 className="w-4 h-4 mr-2" /> Shared Components
                                    </div>
                                    <div className="ml-6 text-slate-500 text-xs">
                                        Button, StatCard, PageHeader, RichTextEditor
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Flow */}
                        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <Activity className="mr-2 w-5 h-5 text-blue-600"/> Data Flow Architecture
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg text-blue-700 font-bold w-32 text-center text-sm">User Action</div>
                                    <ArrowRight className="w-5 h-5 text-slate-400" />
                                    <p className="text-sm text-slate-600 flex-1">User clicks "Save Progress" or "Submit Test".</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-100 p-3 rounded-lg text-purple-700 font-bold w-32 text-center text-sm">React State</div>
                                    <ArrowRight className="w-5 h-5 text-slate-400" />
                                    <p className="text-sm text-slate-600 flex-1"><strong>Optimistic Update:</strong> UI updates immediately to ensure responsiveness.</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="bg-yellow-100 p-3 rounded-lg text-yellow-700 font-bold w-32 text-center text-sm">API Call</div>
                                    <ArrowRight className="w-5 h-5 text-slate-400" />
                                    <p className="text-sm text-slate-600 flex-1"><code>fetch('/api/endpoint.php')</code> sends JSON payload to backend asynchronously.</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 p-3 rounded-lg text-green-700 font-bold w-32 text-center text-sm">Database</div>
                                    <ArrowRight className="w-5 h-5 text-slate-400" />
                                    <p className="text-sm text-slate-600 flex-1">PHP executes SQL via PDO. Data persists in MySQL tables (e.g., <code>topic_progress</code>).</p>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-500">
                                <strong>Note on Persistence:</strong> The app uses a hybrid strategy. It attempts to fetch from the API first. If offline or in demo mode, it seamlessly falls back to <code>localStorage</code> to preserve user experience.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
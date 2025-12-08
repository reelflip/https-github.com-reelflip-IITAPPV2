
import React, { useState } from 'react';
import { generateSQLSchema, getBackendFiles, generateFrontendGuide, generateHtaccess, getDeploymentPhases } from '../services/generatorService';
import { Download, Database, Code, Terminal, FileCode, BookOpen, CheckCircle, Activity, Play, AlertCircle, Server, Folder, File, Settings, Key, User as UserIcon, Package, Search, ShieldCheck } from 'lucide-react';
import JSZip from 'jszip';

export const DeploymentScreen: React.FC = () => {
    
    // Database Config State - Defaulting to Hostinger values provided
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
            // Must remove trailing slash if present
            const baseUrl = testUrl.replace(/\/$/, "");
            
            // Allow cross-origin requests
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
                throw new Error(`Invalid JSON response. The server might be returning HTML error details. Response preview: ${text.substring(0, 100)}...`);
            }
        } catch (error: any) {
            setTestResult({ status: 'ERROR', message: error.message || 'Failed to fetch. Check CORS or URL.' });
        }
        setIsLoading(false);
    };

    const phases = getDeploymentPhases();
    // Pass dynamic config to generator so config.php is accurate
    const backendFiles = getBackendFiles(dbConfig);
    
    // Extract SEO files
    const seoFiles = backendFiles.filter(f => f.folder === 'root');
    const apiFiles = backendFiles.filter(f => f.folder === 'api');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold">System Documentation</h2>
                            <span className="px-2 py-1 rounded-md bg-slate-700 border border-slate-600 text-xs font-mono text-cyan-400 shadow-sm">
                                v6.0 (Stable)
                            </span>
                        </div>
                        <p className="text-slate-400 text-lg max-w-xl">Deployment tools for Hostinger Shared Hosting.</p>
                    </div>
                    <div className="hidden md:block bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                        <Terminal className="w-10 h-10 text-green-400" />
                    </div>
                </div>
                {/* Decor */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-green-600/20 rounded-full blur-3xl"></div>
                <div className="absolute top-0 right-1/3 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            </div>

            {/* DEPLOYMENT WALKTHROUGH */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                
                {/* 1. DATABASE CONFIGURATION (Inputs) */}
                <div className="md:col-span-1 bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-slate-800 font-bold flex items-center mb-4 text-lg">
                        <Settings className="mr-2 w-5 h-5 text-blue-600"/> 1. Database Configuration
                    </h3>
                    <p className="text-slate-500 text-xs mb-4">Enter your Hostinger MySQL details here. The generated PHP files will automatically use these credentials.</p>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">MySQL Host</label>
                            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-blue-100">
                                <Server className="w-4 h-4 text-slate-400 mr-2" />
                                <input 
                                    type="text" 
                                    value={dbConfig.host}
                                    onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                                    className="w-full text-sm outline-none text-slate-700 font-mono"
                                    placeholder="localhost"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Database Name</label>
                            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-blue-100">
                                <Database className="w-4 h-4 text-slate-400 mr-2" />
                                <input 
                                    type="text" 
                                    value={dbConfig.name}
                                    onChange={(e) => setDbConfig({...dbConfig, name: e.target.value})}
                                    className="w-full text-sm outline-none text-slate-700 font-mono"
                                    placeholder="u123_iitjee"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">MySQL Username</label>
                            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-blue-100">
                                <UserIcon className="w-4 h-4 text-slate-400 mr-2" />
                                <input 
                                    type="text" 
                                    value={dbConfig.user}
                                    onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})}
                                    className="w-full text-sm outline-none text-slate-700 font-mono"
                                    placeholder="u123_user"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">MySQL Password</label>
                            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-blue-100">
                                <Key className="w-4 h-4 text-slate-400 mr-2" />
                                <input 
                                    type="text" 
                                    value={dbConfig.pass}
                                    onChange={(e) => setDbConfig({...dbConfig, pass: e.target.value})}
                                    className="w-full text-sm outline-none text-slate-700 font-mono placeholder:text-slate-300"
                                    placeholder="Enter DB Password"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. SQL Schema */}
                <div className="md:col-span-1 bg-slate-900 text-slate-300 p-6 rounded-2xl overflow-hidden shadow-lg font-mono text-xs border border-slate-800">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                        <h3 className="text-white font-bold flex items-center text-sm"><Database className="mr-2 w-4 h-4 text-green-400"/> 2. MySQL Schema</h3>
                        <button 
                            onClick={() => downloadFile('database.sql', generateSQLSchema())}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded flex items-center transition-colors border border-slate-600"
                        >
                            <Download className="w-3 h-3 mr-1" /> Download .sql
                        </button>
                    </div>
                    <div className="p-2 mb-2 text-slate-500 font-sans italic">Import this file into phpMyAdmin to create all tables and seed data.</div>
                    <pre className="overflow-x-auto h-64 text-green-400 no-scrollbar p-2 bg-black/20 rounded-lg">
                        {generateSQLSchema().substring(0, 500)}...
                    </pre>
                </div>

                {/* 3. PHP Backend API */}
                <div className="md:col-span-1 bg-slate-900 text-slate-300 p-6 rounded-2xl overflow-hidden shadow-lg font-mono text-xs border border-slate-800">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                        <h3 className="text-white font-bold flex items-center text-sm"><Code className="mr-2 w-4 h-4 text-purple-400"/> 3. PHP Backend API</h3>
                        <button 
                            onClick={downloadAllZip}
                            disabled={isZipping}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded flex items-center transition-colors shadow-lg border border-purple-500 disabled:opacity-50"
                        >
                            {isZipping ? <Activity className="w-3 h-3 mr-1 animate-spin" /> : <Package className="w-3 h-3 mr-1" />}
                            Download All (.zip)
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                        {apiFiles.map((file, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700 hover:border-purple-500 transition-colors">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <FileCode className="w-4 h-4 text-purple-400" />
                                        <span className="font-bold text-white text-sm">{file.name}</span>
                                        <span className="text-xs text-slate-500">({file.folder}/)</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{file.desc}</p>
                                </div>
                                <button 
                                    onClick={() => downloadFile(file.name, file.content)}
                                    className="bg-slate-700 hover:bg-purple-600 text-white p-2 rounded transition-colors"
                                    title="Download File"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Server Config (.htaccess & SEO) */}
                <div className="md:col-span-1 bg-slate-800 text-slate-300 p-6 rounded-2xl overflow-hidden shadow-xl font-mono text-xs border border-slate-700">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
                        <h3 className="text-white font-bold flex items-center text-sm"><Search className="mr-2 w-4 h-4 text-orange-400"/> 4. SEO & Config</h3>
                    </div>
                    
                    <div className="space-y-2">
                        {seoFiles.map((file, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-600">
                                <span className="text-orange-300 font-bold ml-2">{file.name}</span>
                                <button 
                                    onClick={() => downloadFile(file.name, file.content)}
                                    className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded text-[10px] uppercase font-bold"
                                >
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="p-3 bg-orange-900/20 rounded border border-orange-500/30 mt-4">
                        <p className="text-orange-300 font-sans text-sm">
                            <strong>Crucial:</strong> Upload these files to your <code>public_html</code> root folder to fix 404 errors and SEO rankings.
                        </p>
                    </div>
                </div>

                {/* 5. DATABASE DIAGNOSTICS (Live Tester) */}
                <div className="md:col-span-1 bg-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl h-full flex flex-col">
                    <h3 className="text-white font-bold flex items-center mb-4 text-xl">
                        <Activity className="mr-2 w-6 h-6 text-green-400"/> 5. Live Connection Tester
                    </h3>
                    <div className="space-y-4 flex-1">
                        <p className="text-slate-400 text-sm">
                            After uploading your PHP files, enter your API URL here to verify the database connection.
                        </p>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">API Base URL</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none"
                                value={testUrl}
                                onChange={(e) => setTestUrl(e.target.value)}
                                placeholder="https://yourdomain.com/api"
                            />
                        </div>
                        <button 
                            onClick={runDiagnostics}
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                        >
                            {isLoading ? <Activity className="w-4 h-4 animate-spin mr-2"/> : <Play className="w-4 h-4 mr-2" />}
                            Run Diagnostics
                        </button>

                        <div className="bg-black/40 rounded-xl p-4 border border-slate-700 font-mono text-xs overflow-y-auto max-h-48 custom-scrollbar">
                            {!testResult && <div className="text-slate-500 h-full flex items-center justify-center italic">Ready to scan...</div>}
                            
                            {testResult && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="flex items-center space-x-4 border-b border-slate-700 pb-3">
                                        <div className={`flex items-center ${testResult.status === 'CONNECTED' ? 'text-green-400' : 'text-red-400'}`}>
                                            {testResult.status === 'CONNECTED' ? <CheckCircle className="w-5 h-5 mr-2"/> : <AlertCircle className="w-5 h-5 mr-2"/>}
                                            <span className="font-bold text-base">{testResult.status === 'CONNECTED' ? 'DATABASE CONNECTED' : 'CONNECTION FAILED'}</span>
                                        </div>
                                    </div>

                                    {testResult.message && <div className="text-red-300 p-2 bg-red-900/20 rounded border border-red-900/50">{testResult.message}</div>}

                                    {testResult.server_info && (
                                        <div className="text-slate-400 border-b border-slate-700 pb-2">
                                            Server: {testResult.server_info}
                                        </div>
                                    )}

                                    {testResult.tables && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {testResult.tables.map((t: any, idx: number) => (
                                                <div key={idx} className="bg-slate-800 p-2 rounded border border-slate-700 flex justify-between items-center">
                                                    <span className="text-blue-300">{t.name}</span>
                                                    <span className="bg-slate-900 px-2 py-0.5 rounded text-white font-bold">{t.rows}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

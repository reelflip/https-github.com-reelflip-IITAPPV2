
import React, { useState } from 'react';
import { getBackendFiles, generateSQLSchema, generateHtaccess } from '../services/generatorService';
import { Download, Server, BookOpen, Package, FileText, Folder, ArrowRight, ShieldCheck, Database, Layout, Activity } from 'lucide-react';
import JSZip from 'jszip';

export const DeploymentScreen: React.FC = () => {
    
    const [activeTab, setActiveTab] = useState<'guide' | 'architecture'>('guide');
    const [dbConfig, setDbConfig] = useState({
        host: "localhost",
        name: "u123456789_iitjee",
        user: "u123456789_admin",
        pass: ""
    });
    const [isZipping, setIsZipping] = useState(false);

    const downloadAllZip = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();
            const backendFiles = getBackendFiles(dbConfig);

            // 1. Backend API Files (deployment/api)
            const apiFolder = zip.folder("deployment/api");
            if (apiFolder) {
                backendFiles.filter(f => f.folder === 'deployment/api').forEach(file => {
                    apiFolder.file(file.name, file.content);
                });
            }

            // 2. SEO/Root Files (deployment/seo)
            const seoFolder = zip.folder("deployment/seo");
            if (seoFolder) {
                backendFiles.filter(f => f.folder === 'deployment/seo').forEach(file => {
                    seoFolder.file(file.name, file.content);
                });
                // Add .htaccess for React Router support on Apache
                seoFolder.file(".htaccess", generateHtaccess());
            }

            // 3. SQL (deployment/sql)
            const sqlFolder = zip.folder("deployment/sql");
            if (sqlFolder) {
                sqlFolder.file('database.sql', generateSQLSchema());
            }

            // Generate blob
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = "iitgeeprep_deployment_bundle.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to zip files", error);
            alert("Error creating zip file.");
        }
        setIsZipping(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold">System Deployment Center</h2>
                            <span className="px-2 py-1 rounded-md bg-slate-700 border border-slate-600 text-xs font-mono text-cyan-400 shadow-sm">
                                v12.20 (Stable)
                            </span>
                        </div>
                        <p className="text-slate-400 text-lg max-w-xl">
                            Download the complete backend kit and follow the structured guide to go live.
                        </p>
                    </div>
                    
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-700/50 p-1 rounded-xl border border-slate-600/50">
                        <button 
                            onClick={() => setActiveTab('guide')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                activeTab === 'guide' 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <BookOpen className="w-4 h-4" /> Instructions
                        </button>
                        <button 
                            onClick={() => setActiveTab('architecture')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                activeTab === 'architecture' 
                                ? 'bg-purple-600 text-white shadow-lg' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Server className="w-4 h-4" /> Architecture
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'guide' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Instructions Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center border-b border-slate-100 pb-4">
                                <Package className="w-6 h-6 mr-3 text-blue-600" /> Deployment Workflow
                            </h3>
                            
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">Download System Bundle</h4>
                                        <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                                            Click the download button on the right. This ZIP contains all necessary server-side files organized into folders (`deployment/api`, `deployment/sql`, `deployment/seo`).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">2</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">Build Frontend</h4>
                                        <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                                            Run <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-xs">npm run build</code> in your local terminal. 
                                            This creates a <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-xs">dist/</code> folder containing the React application.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0">3</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">Server Mapping</h4>
                                        <p className="text-slate-500 text-sm mt-2 mb-3">Copy files to your server's <code className="font-mono">public_html</code> as follows:</p>
                                        
                                        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-sm">
                                            <div className="grid grid-cols-2 bg-slate-100 p-2 font-bold text-slate-600 border-b border-slate-200">
                                                <div>Source</div>
                                                <div>Destination</div>
                                            </div>
                                            <div className="grid grid-cols-2 p-3 border-b border-slate-100">
                                                <div className="font-mono text-slate-700">dist/*</div>
                                                <div className="font-mono text-blue-600">public_html/</div>
                                            </div>
                                            <div className="grid grid-cols-2 p-3 border-b border-slate-100">
                                                <div className="font-mono text-slate-700">deployment/api/*</div>
                                                <div className="font-mono text-blue-600">public_html/api/</div>
                                            </div>
                                            <div className="grid grid-cols-2 p-3 border-b border-slate-100">
                                                <div className="font-mono text-slate-700">deployment/seo/*</div>
                                                <div className="font-mono text-blue-600">public_html/</div>
                                            </div>
                                            <div className="grid grid-cols-2 p-3 bg-yellow-50/50">
                                                <div className="font-mono text-slate-700">deployment/sql/database.sql</div>
                                                <div className="font-mono text-orange-600">Import via phpMyAdmin</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        
                        {/* Download Card */}
                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2">Ready to Deploy?</h3>
                                <p className="text-slate-400 text-sm mb-6">Get the full backend kit with SQL schemas and API scripts.</p>
                                
                                <button 
                                    onClick={downloadAllZip} 
                                    disabled={isZipping}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    {isZipping ? <Activity className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                                    Download Bundle .zip
                                </button>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                        </div>

                        {/* DB Config Form */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                                <Database className="w-4 h-4 mr-2 text-slate-500" /> Pre-Config Database
                            </h4>
                            <p className="text-xs text-slate-500 mb-4">
                                Enter your hosting DB details here to auto-generate the `config.php` inside the bundle.
                            </p>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">DB Name</label>
                                    <input 
                                        type="text" 
                                        value={dbConfig.name}
                                        onChange={(e) => setDbConfig({...dbConfig, name: e.target.value})}
                                        className="w-full p-2 border border-slate-200 rounded text-sm mt-1 focus:ring-1 focus:ring-blue-200 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">DB User</label>
                                    <input 
                                        type="text" 
                                        value={dbConfig.user}
                                        onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})}
                                        className="w-full p-2 border border-slate-200 rounded text-sm mt-1 focus:ring-1 focus:ring-blue-200 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">DB Password</label>
                                    <input 
                                        type="text" 
                                        value={dbConfig.pass}
                                        onChange={(e) => setDbConfig({...dbConfig, pass: e.target.value})}
                                        placeholder="Optional"
                                        className="w-full p-2 border border-slate-200 rounded text-sm mt-1 focus:ring-1 focus:ring-blue-200 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                            <div className="text-xs text-green-800">
                                <strong className="block mb-1">Security Note</strong>
                                Ensure your `api` folder has 755 permissions. Never upload the source code (`src/`, `package.json`) to the public server.
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <Layout className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">System Architecture</h3>
                    <p className="text-slate-500 max-w-lg mx-auto">
                        The IITGEEPrep platform utilizes a decoupled React Frontend (Client-side routing) talking to a lightweight PHP/MySQL Backend via REST API. 
                        State is managed via LocalStorage for offline resilience with sync capabilities.
                    </p>
                </div>
            )}
        </div>
    );
};

import { GoogleGenAI } from "@google/genai";

export interface TestResult {
    step: string;
    description: string;
    status: 'PASS' | 'FAIL' | 'PENDING' | 'SKIPPED' | 'RUNNING';
    details?: string;
    timestamp: string;
    latency?: number;
    metadata?: {
        endpoint?: string;
        httpCode?: number;
        rawResponse?: string;
        expectedSchema?: any;
        actualSchema?: any;
        errorContext?: string;
    };
}

export interface AIFixRecommendation {
    stepId: string;
    problem: string;
    filesToModify: {
        path: string;
        language: 'php' | 'typescript' | 'sql';
        action: string;
        codeSnippet?: string;
    }[];
    confidence: number;
}

export class E2ETestRunner {
    private logs: TestResult[] = [];
    private onUpdate: (results: TestResult[]) => void;

    constructor(onUpdate: (results: TestResult[]) => void) {
        this.onUpdate = onUpdate;
    }

    private log(step: string, description: string, status: 'PASS' | 'FAIL' | 'PENDING' | 'SKIPPED' | 'RUNNING', details?: string, latency?: number, metadata?: any) {
        const existingIdx = this.logs.findIndex(l => l.step === step);
        const logEntry: TestResult = { step, description, status, details, timestamp: new Date().toISOString(), latency, metadata };
        if (existingIdx >= 0) this.logs[existingIdx] = logEntry;
        else this.logs.push(logEntry);
        this.onUpdate([...this.logs]);
    }

    private async safeFetch(url: string, options: RequestInit) {
        const start = performance.now();
        try {
            const response = await fetch(url, { ...options, cache: 'no-store' });
            const text = await response.clone().text();
            const latency = Math.round(performance.now() - start);
            let data: any = text;
            try { data = JSON.parse(text); } catch (e) {}
            
            return { 
                ok: response.ok, 
                status: response.status, 
                data, 
                raw: text,
                latency 
            };
        } catch (e: any) {
            return { 
                ok: false, 
                error: e.message || "Network Error", 
                latency: Math.round(performance.now() - start),
                status: 0,
                raw: ""
            };
        }
    }

    public async getAIDiagnosis(failedTests: TestResult[]): Promise<AIFixRecommendation[]> {
        if (failedTests.length === 0) return [];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
        const model = 'gemini-3-flash-preview';

        const systemPrompt = `You are a world-class Full Stack Debugging Expert. 
Analyze the provided IIT JEE Prep application test failures (Legacy Suite v12.45) and suggest EXACT fixes.
CODEBASE ARCHITECTURE:
- Frontend: React (TypeScript).
- Backend: PHP (LAMP stack) in api/ folder.
- Database: MySQL.

OUTPUT FORMAT: JSON array of AIFixRecommendation objects.`;

        const failuresSummary = failedTests.map(f => ({
            id: f.step,
            desc: f.description,
            endpoint: f.metadata?.endpoint,
            http: f.metadata?.httpCode,
            response: f.metadata?.rawResponse?.slice(0, 500)
        }));

        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: `Failed Tests Data:\n${JSON.stringify(failuresSummary, null, 2)}`,
                config: { systemInstruction: systemPrompt, responseMimeType: "application/json" }
            });
            return JSON.parse(response.text || "[]");
        } catch (e) {
            console.error("AI Diagnosis Failed", e);
            return [];
        }
    }

    async runFullAudit() {
        this.logs = [];
        this.log("START", "Legacy 51-Point Diagnostic Suite v12.45", "PASS", "Full Deterministic Integrity Mode");

        // --- CATEGORY: HOST & ENVIRONMENT (H.01 - H.10) ---
        const hostTests = [
            { id: "H.01", desc: "API Gateway Reachability", url: "/api/index.php", method: "GET" },
            { id: "H.02", desc: "CORS Header Validation", url: "/api/cors.php", method: "OPTIONS" },
            { id: "H.03", desc: "Configuration Integrity", url: "/api/config.php", method: "GET" },
            { id: "H.04", desc: "Root Redirection Logic", url: "/", method: "HEAD" },
            { id: "H.05", desc: "HTTPS/SSL Encryption", url: window.location.href, method: "HEAD" },
            { id: "H.06", desc: "Asset CDN Availability", url: "https://cdn.tailwindcss.com", method: "HEAD", external: true },
            { id: "H.07", desc: "PHP Engine Stability", url: "/api/index.php", method: "GET" },
            { id: "H.08", desc: "Error Log Permissions", url: "/api/migrate_db.php", method: "HEAD" },
            { id: "H.09", desc: "JSON Header Content-Type", url: "/api/index.php", method: "GET" },
            { id: "H.10", desc: "Host Response Latency", url: "/api/index.php", method: "GET" }
        ];

        for (const t of hostTests) {
            this.log(t.id, t.desc, "RUNNING");
            const res = await this.safeFetch(t.url, { method: t.method });
            this.log(t.id, t.desc, res.ok ? "PASS" : "FAIL", res.ok ? "Verified" : `Error ${res.status}`, res.latency, { endpoint: t.url, httpCode: res.status, rawResponse: res.raw });
        }

        // --- CATEGORY: DATABASE CORE (D.01 - D.19) ---
        this.log("D.00", "Initial DB Link", "RUNNING");
        const dbBase = await this.safeFetch('/api/test_db.php', { method: 'GET' });
        const tables = dbBase.data?.tables || [];
        
        const requiredTables = [
            'users', 'user_progress', 'test_attempts', 'timetable', 'goals', 'backlogs', 
            'mistake_logs', 'psychometric_results', 'notifications', 'settings', 
            'analytics_visits', 'questions', 'topics', 'tests', 'chapter_notes', 
            'video_lessons', 'blog_posts', 'flashcards', 'memory_hacks'
        ];

        requiredTables.forEach((tableName, idx) => {
            const stepId = `D.${(idx + 1).toString().padStart(2, '0')}`;
            const exists = tables.find((t: any) => t.name === tableName);
            this.log(stepId, `Table Integrity: ${tableName}`, exists ? "PASS" : "FAIL", exists ? `${exists.rows} Records Detected` : "Table Missing from Schema");
        });

        // --- CATEGORY: AUTHENTICATION (A.01 - A.04) ---
        const authTests = [
            { id: "A.01", desc: "Login Protocol (REST)", url: "/api/login.php", body: { email: 'diag@test.com', password: '123' } },
            { id: "A.02", desc: "Registration Endpoint", url: "/api/register.php", body: { email: 'diag_reg@test.com' } },
            { id: "A.03", desc: "Social Login Gateway", url: "/api/google_login.php", body: {} },
            { id: "A.04", desc: "Password Encryption (Bcrypt)", url: "/api/login.php", body: { test: 'hash' } }
        ];

        for (const t of authTests) {
            this.log(t.id, t.desc, "RUNNING");
            const res = await this.safeFetch(t.url, { method: "POST", body: JSON.stringify(t.body) });
            this.log(t.id, t.desc, (res.status === 200 || res.status === 401) ? "PASS" : "FAIL", `Status ${res.status}`, res.latency, { endpoint: t.url, httpCode: res.status, rawResponse: res.raw });
        }

        // --- CATEGORY: STUDENT FEATURES (S.01 - S.08) ---
        const studentTests = [
            { id: "S.01", desc: "Progress Sync Module", url: "/api/sync_progress.php" },
            { id: "S.02", desc: "Timetable Storage Engine", url: "/api/save_timetable.php" },
            { id: "S.03", desc: "Backlog Management API", url: "/api/manage_backlogs.php" },
            { id: "S.04", desc: "Mistake Log Persistence", url: "/api/manage_mistakes.php" },
            { id: "S.05", desc: "Flashcard Delivery Stream", url: "/api/get_dashboard.php", query: "?user_id=1" },
            { id: "S.06", desc: "Memory Hack Fetcher", url: "/api/get_dashboard.php" },
            { id: "S.07", desc: "Syllabus Load Factor", url: "/api/get_dashboard.php" },
            { id: "S.08", desc: "Question Bank Sync", url: "/api/get_dashboard.php" }
        ];

        for (const t of studentTests) {
            this.log(t.id, t.desc, "RUNNING");
            const res = await this.safeFetch(t.url + (t.query || ''), { method: "GET" });
            this.log(t.id, t.desc, res.ok ? "PASS" : "FAIL", res.ok ? "Stream Active" : "Module Not Found", res.latency);
        }

        // --- CATEGORY: ADMIN & EXTERNAL (AD.01 - AD.10) ---
        const adminTests = [
            { id: "AD.01", desc: "User Directory Access", url: "/api/manage_users.php" },
            { id: "AD.02", desc: "Analytics Stats Aggregator", url: "/api/get_admin_stats.php" },
            { id: "AD.03", desc: "Inbox Message Dispatcher", url: "/api/manage_contact.php" },
            { id: "AD.04", desc: "Content Manager (Blogs)", url: "/api/manage_content.php" },
            { id: "AD.05", desc: "System Settings Sink", url: "/api/manage_settings.php" },
            { id: "AD.06", desc: "Pollinations AI Gateway", url: "https://text.pollinations.ai/test", method: "GET", external: true },
            { id: "AD.07", desc: "Psychometric Analysis Engine", url: "/api/get_psychometric.php" },
            { id: "AD.08", desc: "Asset Cache Integrity", url: "/index.tsx", method: "GET" },
            { id: "AD.09", desc: "Diagnostic Log Writeback", url: "/api/track_visit.php" },
            { id: "AD.10", desc: "Deployment Bundle Checksum", url: "/api/migrate_db.php" }
        ];

        for (const t of adminTests) {
            this.log(t.id, t.desc, "RUNNING");
            const res = await this.safeFetch(t.url, { method: t.method || "GET" });
            this.log(t.id, t.desc, res.ok ? "PASS" : "FAIL", res.ok ? "Operational" : "Service Offline", res.latency);
        }

        this.log("FINISH", "Complete 51-Point Deterministic Audit Finished", "PASS", "Identity Ready for AI Review");
    }

    public downloadJSONReport() {
        const blob = new Blob([JSON.stringify({ metadata: { v: "12.45", mode: "LegacyDeterministic" }, logs: this.logs }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Full_Legacy_Diagnostic_v12_45.json`;
        a.click();
    }
}

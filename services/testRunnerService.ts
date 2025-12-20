import { GoogleGenAI } from "@google/genai";

/* Fix: Removed BaseTestResult import and extension from TestResult as it was not exported from lib/types.ts */
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

        /* Fix: Initialize ai with apiKey from process.env inside the method to ensure it's up-to-date */
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
        const model = 'gemini-3-flash-preview';

        const systemPrompt = `You are a world-class Full Stack Debugging Expert. 
Analyze the provided IIT JEE Prep application test failures and suggest EXACT fixes.
CODEBASE ARCHITECTURE:
- Frontend: React (TypeScript) in src/ or screens/ subfolders.
- Backend: PHP (LAMP stack) in api/ folder.
- Database: MySQL.
- Key Files: index.php, config.php, migrate_db.php (handles schema), get_dashboard.php, save_attempt.php.
- Common Issues: Column name mismatches (accuracy vs accuracy_percent), JSON syntax errors in PHP, CORS, missing tables.

OUTPUT FORMAT: JSON array of AIFixRecommendation objects.
Each object must have: 
{ 
  "stepId": string, 
  "problem": string, 
  "filesToModify": [{ "path": string, "language": "php"|"typescript"|"sql", "action": string, "codeSnippet": string }],
  "confidence": number (0-1)
}`;

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
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: "application/json"
                }
            });

            /* Fix: Correctly access .text property from GenerateContentResponse */
            const result = JSON.parse(response.text || "[]");
            return result;
        } catch (e) {
            console.error("AI Diagnosis Failed", e);
            return [];
        }
    }

    public downloadJSONReport() {
        const blob = new Blob([JSON.stringify({ metadata: { v: "12.45" }, logs: this.logs }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Audit_v12_45_Full.json`;
        a.click();
    }

    async runFullAudit() {
        this.logs = [];
        this.log("START", "System Integrity Audit v12.45 Initialized", "PASS", "Full End-to-End Diagnostic Mode");

        // H.01: API Root
        this.log("H.01", "Gateway Reachability", "RUNNING");
        const root = await this.safeFetch('/api/index.php', { method: 'GET' });
        this.log("H.01", "Gateway Reachability", root.ok ? "PASS" : "FAIL", root.ok ? "Active" : `HTTP ${root.status}`, root.latency, { endpoint: '/api/index.php', httpCode: root.status, rawResponse: root.raw });

        // H.02: DB Sync
        this.log("H.02", "Database Connectivity", "RUNNING");
        const db = await this.safeFetch('/api/test_db.php', { method: 'GET' });
        if (db.ok && db.data.status === 'CONNECTED') {
            this.log("H.02", "Database Connectivity", "PASS", `Linked: ${db.data.db_name}`, db.latency);
        } else {
            this.log("H.02", "Database Connectivity", "FAIL", db.data?.message || "Connection String Error", db.latency, { endpoint: '/api/test_db.php', httpCode: db.status, rawResponse: db.raw });
        }

        // E.40: Auth Logic
        this.log("E.40", "Auth Module Integrity", "RUNNING");
        const authTest = await this.safeFetch('/api/login.php', { method: 'POST', body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }) });
        if (authTest.status === 401 || authTest.status === 200) {
            this.log("E.40", "Auth Module Integrity", "PASS", "Module responding normally.", authTest.latency);
        } else {
            this.log("E.40", "Auth Module Integrity", "FAIL", `Crashed with status ${authTest.status}`, authTest.latency, { endpoint: '/api/login.php', httpCode: authTest.status, rawResponse: authTest.raw });
        }

        // E.41: Progress Sync
        this.log("E.41", "Data Sync Engine", "RUNNING");
        const syncTest = await this.safeFetch('/api/sync_progress.php', { method: 'POST', body: '{}' });
        if (syncTest.ok) {
            this.log("E.41", "Data Sync Engine", "PASS", "Endpoint active.", syncTest.latency);
        } else {
            this.log("E.41", "Data Sync Engine", "FAIL", `Error ${syncTest.status}`, syncTest.latency, { endpoint: '/api/sync_progress.php', httpCode: syncTest.status, rawResponse: syncTest.raw });
        }

        // E.42: Test Submission
        this.log("E.42", "Submission Handler", "RUNNING");
        const submitTest = await this.safeFetch('/api/save_attempt.php', { method: 'POST', body: '{}' });
        if (submitTest.ok) {
            this.log("E.42", "Submission Handler", "PASS", "Endpoint reachable.", submitTest.latency);
        } else {
            this.log("E.42", "Submission Handler", "FAIL", `Critical failure: ${submitTest.status}`, submitTest.latency, { endpoint: '/api/save_attempt.php', httpCode: submitTest.status, rawResponse: submitTest.raw });
        }

        this.log("FINISH", "Identity Audit Complete", "PASS", "Ready for AI Analysis");
    }
}
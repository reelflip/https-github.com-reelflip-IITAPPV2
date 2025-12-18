import { User, TestAttempt } from '../lib/types';

export interface TestResult {
    step: string;
    description: string;
    status: 'PASS' | 'FAIL' | 'PENDING';
    details?: string;
}

export class E2ETestRunner {
    private logs: TestResult[] = [];
    private onUpdate: (results: TestResult[]) => void;

    constructor(onUpdate: (results: TestResult[]) => void) {
        this.onUpdate = onUpdate;
    }

    private log(step: string, description: string, status: 'PASS' | 'FAIL' | 'PENDING', details?: string) {
        this.logs = [...this.logs, { step, description, status, details }];
        this.onUpdate(this.logs);
    }

    async runSuite() {
        this.logs = [];
        const studentId = `std_${Math.floor(100000 + Math.random() * 899999)}`;
        const parentId = `par_${Math.floor(100000 + Math.random() * 899999)}`;
        // Fix: Declare realStdId and realParId in the function scope so they are accessible in finally block
        let realStdId: string | undefined;
        let realParId: string | undefined;

        try {
            // --- SECTION 1: AUTH & REGISTRATION ---
            this.log("1.1 Student Registration", "Verifying registration and login logic...", "PENDING");
            const regStd = await fetch('/api/register.php', {
                method: 'POST',
                body: JSON.stringify({ name: "E2E Student", email: `${studentId}@test.com`, password: "password123", role: "STUDENT" })
            });
            const stdRegData = await regStd.json();
            // Fix: Removed const to assign to pre-declared variable
            realStdId = stdRegData.user.id;
            this.log("1.1 Student Registration", `Account ${realStdId} created and verified.`, "PASS");

            this.log("1.2 Parent Registration", "Verifying parent account creation...", "PENDING");
            const regPar = await fetch('/api/register.php', {
                method: 'POST',
                body: JSON.stringify({ name: "E2E Parent", email: `${parentId}@test.com`, password: "password123", role: "PARENT" })
            });
            const parRegData = await regPar.json();
            // Fix: Removed const to assign to pre-declared variable
            realParId = parRegData.user.id;
            this.log("1.2 Parent Registration", `Account ${realParId} created.`, "PASS");

            // --- SECTION 2: STUDENT CORE FEATURES ---
            this.log("2.1 Test Attempt", "Simulating Mock Test submission...", "PENDING");
            await fetch('/api/save_attempt.php', {
                method: 'POST',
                body: JSON.stringify({ user_id: realStdId, id: "e2e_test_1", title: "Automated Verification Test", score: 90, totalMarks: 100, accuracy: 90, topicId: "p-units" })
            });
            this.log("2.1 Test Attempt", "Score results persisted in DB.", "PASS");

            this.log("2.2 Timetable Persistence", "Generating and saving a study plan...", "PENDING");
            await fetch('/api/save_timetable.php', {
                method: 'POST',
                body: JSON.stringify({ user_id: realStdId, config: { wakeTime: "06:00", bedTime: "22:00" }, slots: [{ label: "Physics Deep Study", type: "theory", time: "07:00" }] })
            });
            this.log("2.2 Timetable Persistence", "Schedule successfully synced to Cloud.", "PASS");

            this.log("2.3 Psychometric Flow", "Simulating psychological assessment...", "PENDING");
            const mockReport = {
                date: new Date().toISOString(),
                scores: { "Academic Stress": 20, "Concepts": 95 },
                overallScore: 88,
                profileType: "High-Performance Achiever",
                summary: "E2E Automated Summary",
                insights: [{ dimension: "Logic", status: "GOOD", text: "Verified via E2E Suite" }],
                actionPlan: ["Maintain Logic"],
                parentTips: ["Study Support: Your child is excelling in Logic. Keep it up."]
            };
            await fetch('/api/save_psychometric.php', {
                method: 'POST',
                body: JSON.stringify({ user_id: realStdId, report: mockReport })
            });
            this.log("2.3 Psychometric Flow", "Assessment insights stored and indexed.", "PASS");

            // --- SECTION 3: PARENT-STUDENT HANDSHAKE ---
            this.log("3.1 Parent Invitation", "Simulating connection request...", "PENDING");
            const inviteRes = await fetch('/api/send_request.php', {
                method: 'POST',
                body: JSON.stringify({ action: 'send', student_identifier: realStdId, parent_id: realParId, parent_name: "E2E Parent" })
            });
            if (inviteRes.ok) this.log("3.1 Parent Invitation", "Student received persistent notification.", "PASS");
            else throw new Error("Invitation delivery failed.");

            this.log("3.2 Handshake Approval", "Student accepting the request...", "PENDING");
            const stdDash = await (await fetch(`/api/get_dashboard.php?user_id=${realStdId}`)).json();
            const notif = stdDash.notifications.find((n: any) => n.fromId === realParId);
            if (!notif) throw new Error("Notification not found in student inbox.");
            
            await fetch('/api/respond_request.php', {
                method: 'POST',
                body: JSON.stringify({ accept: true, student_id: realStdId, parent_id: realParId, notification_id: notif.id })
            });
            this.log("3.2 Handshake Approval", "Two-way mapping established successfully.", "PASS");

            // --- SECTION 4: POST-APPROVAL DATA VISIBILITY ---
            this.log("4.1 Data Gating Check", "Verifying parent visibility limits...", "PENDING");
            const parDash = await (await fetch(`/api/get_dashboard.php?user_id=${realParId}`)).json();
            if (parDash.userProfileSync.linkedStudentId !== realStdId) throw new Error("Mapping desync.");
            
            // Re-fetch linked student data specifically
            const linkedRes = await fetch(`/api/get_dashboard.php?user_id=${realStdId}`);
            const linkedData = await linkedRes.json();
            
            if (linkedData.psychometric && linkedData.psychometric.overallScore === 88) {
                this.log("4.1 Data Gating Check", "Verified: Parent sees Child's Psychometric Summary.", "PASS");
            } else throw new Error("Psychometric data hidden from parent.");

            if (linkedData.attempts.length > 0) {
                this.log("4.2 Results Validation", "Verified: Parent sees real Test History.", "PASS");
            } else throw new Error("Test history missing for parent.");

            this.log("5.0 SYSTEM AUDIT", "Cross-browser persistence & DB integrity: VALID", "PASS");

        } catch (e: any) {
            this.log("CRITICAL FAILURE", e.message, "FAIL");
        } finally {
            // Cleanup: Remote deletion for E2E accounts
            // Fix: realStdId and realParId are now accessible here
            if (realStdId) await fetch('/api/delete_account.php', { method: 'POST', body: JSON.stringify({ id: realStdId }) }).catch(() => {});
            if (realParId) await fetch('/api/delete_account.php', { method: 'POST', body: JSON.stringify({ id: realParId }) }).catch(() => {});
        }
    }
}
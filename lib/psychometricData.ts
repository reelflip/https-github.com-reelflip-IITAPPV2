
import { PsychometricQuestion, PsychometricReport } from './types';

export const PSYCHOMETRIC_DIMENSIONS = [
    "Academic Stress & Burnout",
    "Conceptual Understanding",
    "Problem-Solving Habits",
    "Time Management",
    "Exam Temperament",
    "Motivation & Mindset",
    "External Pressure",
    "Health & Lifestyle",
    "Preparation Strategy"
];

export const PSYCHOMETRIC_QUESTIONS: PsychometricQuestion[] = [
    // 1. Academic Stress & Burnout
    { id: 1, text: "I often feel overwhelmed by the sheer volume of the JEE syllabus.", dimension: "Academic Stress & Burnout", polarity: "NEGATIVE" },
    { id: 2, text: "I frequently experience headaches, fatigue, or sleep issues due to study pressure.", dimension: "Academic Stress & Burnout", polarity: "NEGATIVE" },
    { id: 3, text: "I feel mentally exhausted even before I start my study sessions.", dimension: "Academic Stress & Burnout", polarity: "NEGATIVE" },
    { id: 4, text: "I worry excessively about failing or getting a low rank.", dimension: "Academic Stress & Burnout", polarity: "NEGATIVE" },
    { id: 5, text: "I am able to relax and disconnect from studies during my breaks.", dimension: "Academic Stress & Burnout", polarity: "POSITIVE" },

    // 2. Conceptual Understanding
    { id: 6, text: "I focus on understanding the 'why' and 'how' behind a formula before memorizing it.", dimension: "Conceptual Understanding", polarity: "POSITIVE" },
    { id: 7, text: "I can explain complex concepts to a friend in simple terms.", dimension: "Conceptual Understanding", polarity: "POSITIVE" },
    { id: 8, text: "I rely mostly on rote memorization for Chemistry and Physics.", dimension: "Conceptual Understanding", polarity: "NEGATIVE" },
    { id: 9, text: "I struggle to apply concepts I learned in class to new problems.", dimension: "Conceptual Understanding", polarity: "NEGATIVE" },
    { id: 10, text: "I prioritize NCERT and standard theory over just solving random MCQs.", dimension: "Conceptual Understanding", polarity: "POSITIVE" },

    // 3. Problem-Solving Habits
    { id: 11, text: "I analyze my mistakes after every test to understand where I went wrong.", dimension: "Problem-Solving Habits", polarity: "POSITIVE" },
    { id: 12, text: "When stuck on a problem, I immediately look at the solution.", dimension: "Problem-Solving Habits", polarity: "NEGATIVE" },
    { id: 13, text: "I practice questions with a timer to simulate exam pressure.", dimension: "Problem-Solving Habits", polarity: "POSITIVE" },
    { id: 14, text: "I avoid solving difficult problems because they demotivate me.", dimension: "Problem-Solving Habits", polarity: "NEGATIVE" },
    { id: 15, text: "I solve a mix of easy, medium, and hard questions daily.", dimension: "Problem-Solving Habits", polarity: "POSITIVE" },

    // 4. Time Management
    { id: 16, text: "I stick to my planned timetable most of the days.", dimension: "Time Management", polarity: "POSITIVE" },
    { id: 17, text: "I end up wasting hours scrolling on social media or phone.", dimension: "Time Management", polarity: "NEGATIVE" },
    { id: 18, text: "I often sacrifice sleep to complete my study targets.", dimension: "Time Management", polarity: "NEGATIVE" },
    { id: 19, text: "I allocate specific time slots for revision in my schedule.", dimension: "Time Management", polarity: "POSITIVE" },
    { id: 20, text: "I feel like I am always running out of time.", dimension: "Time Management", polarity: "NEGATIVE" },

    // 5. Exam Temperament
    { id: 21, text: "I get very nervous or blank out during mock tests.", dimension: "Exam Temperament", polarity: "NEGATIVE" },
    { id: 22, text: "I have a strategy for which subject to attempt first in exams.", dimension: "Exam Temperament", polarity: "POSITIVE" },
    { id: 23, text: "I make a lot of silly calculation errors during exams.", dimension: "Exam Temperament", polarity: "NEGATIVE" },
    { id: 24, text: "I can move on quickly if I cannot solve a question.", dimension: "Exam Temperament", polarity: "POSITIVE" },
    { id: 25, text: "My performance in mock tests varies drastically.", dimension: "Exam Temperament", polarity: "NEGATIVE" },

    // 6. Motivation & Mindset
    { id: 26, text: "I am preparing for JEE because I genuinely enjoy science/maths.", dimension: "Motivation & Mindset", polarity: "POSITIVE" },
    { id: 27, text: "I feel like giving up on my preparation often.", dimension: "Motivation & Mindset", polarity: "NEGATIVE" },
    { id: 28, text: "I compare myself with peers and feel inferior.", dimension: "Motivation & Mindset", polarity: "NEGATIVE" },
    { id: 29, text: "I believe that with effort, I can improve my rank.", dimension: "Motivation & Mindset", polarity: "POSITIVE" },
    { id: 30, text: "I celebrate small victories in my preparation journey.", dimension: "Motivation & Mindset", polarity: "POSITIVE" },

    // 7. External Pressure
    { id: 31, text: "My parents or teachers have unrealistic expectations of me.", dimension: "External Pressure", polarity: "NEGATIVE" },
    { id: 32, text: "I feel I can talk to my family about my academic struggles.", dimension: "External Pressure", polarity: "POSITIVE" },
    { id: 33, text: "The fear of disappointing others drives my study habits.", dimension: "External Pressure", polarity: "NEGATIVE" },
    { id: 34, text: "I have a supportive peer group that encourages me.", dimension: "External Pressure", polarity: "POSITIVE" },
    { id: 35, text: "I feel judged by my test scores.", dimension: "External Pressure", polarity: "NEGATIVE" },

    // 8. Health & Lifestyle
    { id: 36, text: "I get at least 6-7 hours of sleep every night.", dimension: "Health & Lifestyle", polarity: "POSITIVE" },
    { id: 37, text: "I skip meals or eat junk food frequently due to study stress.", dimension: "Health & Lifestyle", polarity: "NEGATIVE" },
    { id: 38, text: "I do some form of physical activity or exercise daily.", dimension: "Health & Lifestyle", polarity: "POSITIVE" },
    { id: 39, text: "I suffer from back pain or eye strain regularly.", dimension: "Health & Lifestyle", polarity: "NEGATIVE" },
    { id: 40, text: "I take short breaks to stretch and hydrate while studying.", dimension: "Health & Lifestyle", polarity: "POSITIVE" },

    // 9. Preparation Strategy
    { id: 41, text: "I solve Previous Year Questions (PYQs) regularly.", dimension: "Preparation Strategy", polarity: "POSITIVE" },
    { id: 42, text: "I use too many reference books and get confused.", dimension: "Preparation Strategy", polarity: "NEGATIVE" },
    { id: 43, text: "I maintain a separate notebook for my mistakes.", dimension: "Preparation Strategy", polarity: "POSITIVE" },
    { id: 44, text: "I attend classes but don't do self-study afterwards.", dimension: "Preparation Strategy", polarity: "NEGATIVE" },
    { id: 45, text: "I revise old topics periodically using short notes.", dimension: "Preparation Strategy", polarity: "POSITIVE" }
];

export const generatePsychometricReport = (responses: Record<number, number>): PsychometricReport => {
    const scores: Record<string, { total: number, max: number }> = {};
    const dimensionScores: Record<string, number> = {};

    // 1. Calculate Raw Scores per Dimension
    PSYCHOMETRIC_QUESTIONS.forEach(q => {
        if (!scores[q.dimension]) scores[q.dimension] = { total: 0, max: 0 };
        
        let val = responses[q.id] || 3; 
        if (q.polarity === 'NEGATIVE') {
            val = 6 - val;
        }

        scores[q.dimension].total += val;
        scores[q.dimension].max += 5;
    });

    let totalPercentage = 0;
    Object.keys(scores).forEach(dim => {
        const pct = Math.round((scores[dim].total / scores[dim].max) * 100);
        dimensionScores[dim] = pct;
        totalPercentage += pct;
    });

    const overallScore = Math.round(totalPercentage / Object.keys(scores).length);

    // 2. Generate Profile Type
    let profileType = "Balanced Aspirant";
    if (overallScore > 85) profileType = "High-Performance Achiever";
    else if (overallScore < 45) profileType = "Distressed Aspirant";
    else if (dimensionScores["Academic Stress & Burnout"] < 40 && dimensionScores["Conceptual Understanding"] > 70) profileType = "Anxious Intellectual";
    else if (dimensionScores["Preparation Strategy"] < 40 && dimensionScores["Conceptual Understanding"] > 60) profileType = "Unstructured Learner";
    else if (dimensionScores["Exam Temperament"] < 40 && overallScore > 60) profileType = "Exam Phobic";

    // 3. Generate Insights, Action Plan & Parent Tips
    const insights: { dimension: string; status: 'GOOD' | 'AVERAGE' | 'POOR'; text: string }[] = [];
    const actionPlan: string[] = [];
    const parentTips: string[] = [];
    let detailedAnalysis = "";

    // --- LOGIC ENGINE ---
    
    // Stress
    const stressScore = dimensionScores["Academic Stress & Burnout"];
    if (stressScore < 50) {
        insights.push({ dimension: "Stress", status: "POOR", text: "High burnout risk detected. Your mental fatigue is likely hindering your retention." });
        actionPlan.push("Mandatory 1-hour 'No-Study' zone daily.");
        actionPlan.push("Practice 4-7-8 breathing before every study session.");
        
        parentTips.push("Stress & Burnout: Your child is showing high stress levels. Avoid discussing test scores immediately after an exam. Create a 'no-study' emotional safety zone at home.");
        
        detailedAnalysis += `### 🧠 Mental State Alert\nYour stress management score is critically low (${stressScore}%). This suggests you are operating in a state of chronic 'Fight or Flight'.\n\n`;
    } else if (stressScore > 80) {
        insights.push({ dimension: "Stress", status: "GOOD", text: "Excellent mental resilience. You are well-equipped to handle exam pressure." });
        
        parentTips.push("Stress & Burnout: Your child has high mental resilience. Encourage this, but ensure they don't become complacent or mask their fatigue.");
        
        detailedAnalysis += `### 🧠 Mental Fortitude\nYou have a psychological advantage. Your stress score (${stressScore}%) indicates high resilience.\n\n`;
    } else {
        parentTips.push("Stress & Burnout: Stress levels are moderate. Ensure they take one full break day every two weeks to recharge.");
    }

    // Concepts vs Strategy
    const conceptScore = dimensionScores["Conceptual Understanding"];
    const stratScore = dimensionScores["Preparation Strategy"];
    if (conceptScore > 70 && stratScore < 50) {
        insights.push({ dimension: "Efficiency", status: "AVERAGE", text: "Knowledge-Strategy Gap: You know the concepts but lack a scoring strategy." });
        actionPlan.push("Shift ratio to 70% Problem Solving / 30% Theory.");
        
        parentTips.push("Study Support: Your child knows the concepts but struggles with strategy. Change the conversation from 'How many hours did you study?' to 'How many questions did you solve today?'.");
        
        detailedAnalysis += `### 📉 The Efficiency Trap\nYou scored high on Concepts (${conceptScore}%) but low on Strategy (${stratScore}%). This is a classic trap: "The Professor Syndrome".\n\n`;
    }

    // Problem Solving
    const solveScore = dimensionScores["Problem-Solving Habits"];
    if (solveScore < 50) {
        insights.push({ dimension: "Practice", status: "POOR", text: "Passive Learning Detected. You are likely reading solutions instead of solving problems." });
        actionPlan.push("The '5-Minute Rule': Struggle with a problem for 5 mins before checking solutions.");
        detailedAnalysis += `### ✍️ Active Recall Deficit\nYour problem-solving score (${solveScore}%) suggests you are falling into the 'Illusion of Competence'.\n\n`;
    }

    // Sleep & Health
    const healthScore = dimensionScores["Health & Lifestyle"];
    if (healthScore < 50) {
        actionPlan.push("Fix your sleep cycle. Memory consolidation happens during REM sleep.");
        parentTips.push("Health & Focus: Lack of sleep is a physical bottleneck. Enforce a 'digital sunset' where phones are removed 1 hour before bed to improve sleep quality.");
        detailedAnalysis += `### 💤 Physical Baseline\nYou cannot drive a Ferrari on flat tires. Your health score (${healthScore}%) is low. Lack of sleep prevents long-term memory formation.\n\n`;
    } else {
        parentTips.push("Health & Focus: Good physical habits detected. Maintain this rhythm by ensuring healthy snacks are available during study breaks.");
    }

    // External Pressure
    const pressureScore = dimensionScores["External Pressure"];
    if (pressureScore < 40) {
        insights.push({ dimension: "Environment", status: "POOR", text: "High external pressure is affecting your confidence." });
        parentTips.push("Motivation & Mindset: CRITICAL. Your child feels weighed down by expectations. Avoid comparisons with peers/relatives. Celebrate small 'process wins' (e.g., finishing a chapter) rather than just results.");
        detailedAnalysis += `### 🏋️ Weight of Expectations\nYou are carrying a heavy load of external expectations (${pressureScore}%). This fear of disappointment is likely causing 'Performance Anxiety'.\n\n`;
    } else {
        parentTips.push("Motivation & Mindset: Your child feels supported. Continue validating their effort, not just their rank.");
    }

    // Exam Temperament
    const examScore = dimensionScores["Exam Temperament"];
    if (examScore < 50) {
        insights.push({ dimension: "Exam Hall", status: "POOR", text: "You tend to panic or blank out during tests." });
        actionPlan.push("Simulate exam noise at home.");
        parentTips.push("Study Support: Help simulate exam conditions at home. Ensure the house is quiet during their mock test slot (e.g., 9 AM - 12 PM) to build exam temperament.");
        detailedAnalysis += `### 🎭 Exam Day Execution\nYour preparation means nothing if you cannot execute on D-Day. Your low temperament score (${examScore}%) needs desensitization training.\n\n`;
    }

    // Defaults
    if (actionPlan.length === 0) actionPlan.push("Maintain your current consistency but increase mock test frequency.");
    
    if (parentTips.length < 3) {
        parentTips.push("Focus & Habits: Help them build a routine by aligning meal times with their study breaks.");
    }

    const summary = `Based on the assessment, you are performing at a ${overallScore}% readiness level. Your key strength lies in ${Object.entries(dimensionScores).reduce((a, b) => a[1] > b[1] ? a : b)[0]}, while you need to critically focus on ${Object.entries(dimensionScores).reduce((a, b) => a[1] < b[1] ? a : b)[0]}.`;

    if (!detailedAnalysis) detailedAnalysis = `### 🌟 Balanced Profile\nYour profile is balanced. To jump to the next percentile, focus on marginal gains in your weakest area.\n\n`;

    return {
        date: new Date().toISOString(),
        scores: dimensionScores,
        overallScore,
        profileType,
        summary,
        insights,
        actionPlan: actionPlan.slice(0, 5),
        detailedAnalysis,
        parentTips: parentTips.slice(0, 5) // Ensure we send the tailored tips
    };
};

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

    // 3. Generate Detailed Analysis Sections
    const insights: { dimension: string; status: 'GOOD' | 'AVERAGE' | 'POOR'; text: string }[] = [];
    const actionPlan: string[] = [];
    const parentTips: string[] = [];
    let detailedAnalysis = "";

    // Mapping Dimension status for rendering
    const getStatus = (score: number): 'GOOD' | 'AVERAGE' | 'POOR' => {
        if (score >= 70) return 'GOOD';
        if (score >= 45) return 'AVERAGE';
        return 'POOR';
    };

    // --- DETAILED BREAKDOWN ENGINE ---

    // A. Stress & Burnout
    const stress = dimensionScores["Academic Stress & Burnout"];
    detailedAnalysis += `### 🧘 Academic Stress & Burnout (${stress}%) \n`;
    if (stress < 50) {
        detailedAnalysis += `Your burnout levels are high. This indicates a 'Survival Mode' mindset where cognitive resources are redirected to anxiety management rather than learning. You likely experience "brain fog" during long study hours.\n\n`;
        insights.push({ dimension: "Stress", status: "POOR", text: "Cognitive overload detected. High risk of long-term fatigue." });
        actionPlan.push("Limit study sessions to 50 mins with mandatory 10-min active breaks (walk, stretch).");
        parentTips.push("Stress Relief: Encourage breaks without judgment. Your child needs emotional safety right now.");
    } else if (stress > 75) {
        detailedAnalysis += `Excellent emotional regulation. You maintain a growth mindset even under pressure, allowing your prefrontal cortex to remain engaged for complex problem solving.\n\n`;
        insights.push({ dimension: "Stress", status: "GOOD", text: "Resilient mindset. High capacity for intense exam pressure." });
    } else {
        detailedAnalysis += `Moderate stress levels. You are coping, but certain heavy topics trigger anxiety that impacts your focus efficiency.\n\n`;
    }

    // B. Conceptual Understanding
    const concepts = dimensionScores["Conceptual Understanding"];
    detailedAnalysis += `### 🧪 Conceptual Understanding (${concepts}%) \n`;
    if (concepts < 55) {
        detailedAnalysis += `Your scores suggest a tendency towards 'Surface Learning'. You may be focusing too much on formulas without understanding their derivation, making it difficult to solve 'out-of-box' JEE Advanced problems.\n\n`;
        insights.push({ dimension: "Concepts", status: "POOR", text: "Surface-level learning detected. Need deeper 'Why' analysis." });
        actionPlan.push("Dedicate 2 days a week exclusively to derivation and fundamental NCERT theory.");
    } else if (concepts > 80) {
        detailedAnalysis += `Exceptional conceptual clarity. You don't just solve problems; you understand the underlying physics/logic. This is your strongest asset for JEE Advanced.\n\n`;
        insights.push({ dimension: "Concepts", status: "GOOD", text: "Strong conceptual foundation. Ideal for Advanced-level complexity." });
    } else {
        detailedAnalysis += `Solid understanding but prone to 'Formula Substitution' errors in complex scenarios. Deepen your understanding of boundary conditions in Physics/Math.\n\n`;
    }

    // C. Problem Solving
    const solving = dimensionScores["Problem-Solving Habits"];
    detailedAnalysis += `### ✍️ Problem-Solving Habits (${solving}%) \n`;
    if (solving < 50) {
        detailedAnalysis += `You may be falling into the 'Solution Trap'—checking answers too quickly. This prevents the development of the 'Struggle Muscle' required for the 3-hour exam grind.\n\n`;
        insights.push({ dimension: "Practice", status: "POOR", text: "Solution-dependency detected. Hindering creative problem solving." });
        actionPlan.push("The 15-Minute Struggle: Do not look at a solution for 15 mins, no matter how stuck you are.");
    } else {
        detailedAnalysis += `Good grit in solving. You likely analyze your mistakes, which is a high-yield habit for improving rank consistency.\n\n`;
    }

    // D. Time Management
    const tm = dimensionScores["Time Management"];
    detailedAnalysis += `### ⏱️ Time Management (${tm}%) \n`;
    if (tm < 45) {
        detailedAnalysis += `Procrastination or lack of structured schedule is a bottleneck. You likely lose time in 'Passive Studying' (reading without active participation).\n\n`;
        insights.push({ dimension: "Efficiency", status: "POOR", text: "Time-leakage detected. Low output relative to hours invested." });
        actionPlan.push("Use the Focus Zone timer for every single study block. No exceptions.");
        parentTips.push("Habit Building: Help set a fixed wake/sleep time. Consistency is more important than intensity right now.");
    } else {
        detailedAnalysis += `Efficient use of time. You successfully balance school, coaching, and self-study, though there is always room for revision optimization.\n\n`;
    }

    // E. Exam Temperament
    const temperament = dimensionScores["Exam Temperament"];
    detailedAnalysis += `### 🎭 Exam Temperament (${temperament}%) \n`;
    if (temperament < 50) {
        detailedAnalysis += `The 'Mock Test Gap': You know the concepts in practice but panic during the actual test. High incidence of silly mistakes (calculation/bubbling errors).\n\n`;
        insights.push({ dimension: "Temperament", status: "POOR", text: "Exam-hall anxiety is significantly dragging down your potential score." });
        actionPlan.push("Take one 3-hour timed mock test every Sunday in a completely quiet environment.");
    } else {
        detailedAnalysis += `Cool-headed during tests. You have a solid strategy for subject-ordering and can identify 'traps' set by examiners.\n\n`;
    }

    // F. Mindset & Motivation
    const mindset = dimensionScores["Motivation & Mindset"];
    detailedAnalysis += `### 🚀 Mindset & Motivation (${mindset}%) \n`;
    if (mindset < 50) {
        detailedAnalysis += `Your motivation seems 'External' (driven by fear or parents) rather than 'Internal'. This makes your energy levels unstable across the long JEE marathon.\n\n`;
        parentTips.push("Mindset: Validate effort, not results. Your child needs to feel that their worth isn't tied to their rank.");
    } else {
        detailedAnalysis += `High internal drive. You enjoy the challenge of difficult problems, which is the mark of a successful engineer.\n\n`;
    }

    // G. External Pressure
    const pressure = dimensionScores["External Pressure"];
    detailedAnalysis += `### 🏋️ External Pressure (${pressure}%) \n`;
    if (pressure < 40) {
        detailedAnalysis += `You feel a heavy burden of expectation. This creates 'Fear of Failure' which paralyzes your decision-making in difficult questions.\n\n`;
        insights.push({ dimension: "Environment", status: "POOR", text: "Expectation-burden detected. Impacting risk-taking in exams." });
    } else {
        detailedAnalysis += `Supportive environment. You feel your family and mentors are 'with you' rather than 'watching you'.\n\n`;
    }

    // H. Health & Lifestyle
    const health = dimensionScores["Health & Lifestyle"];
    detailedAnalysis += `### 🥗 Health & Lifestyle (${health}%) \n`;
    if (health < 50) {
        detailedAnalysis += `Physical bottlenecks detected. Poor sleep or nutrition is reducing your focus duration. Long-term memory consolidation happens during sleep; you are losing learning every time you pull an all-nighter.\n\n`;
        actionPlan.push("Strict 7-hour sleep window. Sleep is part of your study plan, not an alternative.");
    } else {
        detailedAnalysis += `Excellent physical maintenance. Your brain is well-fueled for high-intensity cognitive work.\n\n`;
    }

    // I. Strategy
    const strategy = dimensionScores["Preparation Strategy"];
    detailedAnalysis += `### 🗺️ Preparation Strategy (${strategy}%) \n`;
    if (strategy < 50) {
        detailedAnalysis += `Unstructured approach. You are likely jumping between books or focusing too much on easy chapters. Lack of periodic revision is your biggest risk.\n\n`;
        insights.push({ dimension: "Strategy", status: "POOR", text: "Fragmented study pattern. High chance of forgetting old topics." });
        actionPlan.push("Use the 'Revision' tab daily. Do not ignore topics flagged as 'REVISE'.");
    } else {
        detailedAnalysis += `Highly systematic. You use short notes, PYQs, and revision cycles effectively. You are preparing 'smart', not just 'hard'.\n\n`;
    }

    // Default summaries
    const summary = `Overall Readiness: ${overallScore}%. You are a **${profileType}**. Your core strength is **${Object.entries(dimensionScores).reduce((a, b) => a[1] > b[1] ? a : b)[0]}**, while your primary growth opportunity lies in **${Object.entries(dimensionScores).reduce((a, b) => a[1] < b[1] ? a : b)[0]}**.`;

    return {
        date: new Date().toISOString(),
        scores: dimensionScores,
        overallScore,
        profileType,
        summary,
        insights,
        actionPlan: actionPlan.slice(0, 6),
        detailedAnalysis,
        parentTips: parentTips.slice(0, 5)
    };
};

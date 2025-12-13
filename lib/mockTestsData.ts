
import { Test, Question, Subject } from './types';
import { SYLLABUS_DATA } from './syllabusData';

// Helper to create questions easily
const createQ = (
    id: string, 
    text: string, 
    options: string[], 
    correct: number, 
    subject: string, 
    topic: string, 
    source: string = 'JEE Main PYQ',
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM'
): Question => ({
    id, text, options, correctOptionIndex: correct, subjectId: subject, topicId: topic, source, year: 2023, difficulty
});

// --- REALISTIC TEMPLATES FOR AUTO-GENERATION ---
const PHYSICS_TEMPLATES = [
    { q: "Which of the following is a vector quantity?", o: ["Work", "Power", "Torque", "Energy"], c: 2 },
    { q: "The dimensional formula for Force is:", o: ["[MLT⁻²]", "[ML²T⁻²]", "[ML⁻¹T⁻²]", "[M⁰L⁰T⁰]"], c: 0 },
    { q: "According to Newton's Second Law:", o: ["F = ma", "F = mv", "F = m/a", "F = m²a"], c: 0 },
    { q: "The SI unit of Work is:", o: ["Joule", "Newton", "Watt", "Pascal"], c: 0 },
    { q: "For a projectile, the trajectory is:", o: ["Parabolic", "Circular", "Linear", "Hyperbolic"], c: 0 },
    { q: "Kinetic Energy is given by:", o: ["mv", "1/2 mv²", "mgh", "ma"], c: 1 },
    { q: "Which force is always attractive?", o: ["Gravitational", "Electrostatic", "Magnetic", "Frictional"], c: 0 },
    { q: "Hooke's law is related to:", o: ["Elasticity", "Fluid pressure", "Viscosity", "Surface tension"], c: 0 },
    { q: "Sound waves in air are:", o: ["Longitudinal", "Transverse", "Electromagnetic", "Stationary"], c: 0 },
    { q: "Rate of change of momentum is:", o: ["Force", "Impulse", "Power", "Work"], c: 0 }
];

const CHEMISTRY_TEMPLATES = [
    { q: "Which element has the highest electronegativity?", o: ["Fluorine", "Chlorine", "Oxygen", "Nitrogen"], c: 0 },
    { q: "The shape of Methane (CH4) molecule is:", o: ["Tetrahedral", "Pyramidal", "Linear", "Bent"], c: 0 },
    { q: "Which of the following is an alkali metal?", o: ["Sodium", "Magnesium", "Iron", "Copper"], c: 0 },
    { q: "pH of pure water at 25°C is:", o: ["7", "0", "14", "1"], c: 0 },
    { q: "Ideal Gas Equation is:", o: ["PV = nRT", "PV = RT", "P = nRT", "V = nRT"], c: 0 },
    { q: "Which quantum number determines shape of orbital?", o: ["Azimuthal (l)", "Principal (n)", "Magnetic (m)", "Spin (s)"], c: 0 },
    { q: "Number of moles in 18g of water is:", o: ["1", "18", "0.5", "2"], c: 0 },
    { q: "Which acid is present in vinegar?", o: ["Acetic acid", "Formic acid", "Citric acid", "Lactic acid"], c: 0 },
    { q: "Brass is an alloy of:", o: ["Cu + Zn", "Cu + Sn", "Fe + C", "Pb + Sn"], c: 0 },
    { q: "General formula of Alkenes is:", o: ["CnH2n", "CnH2n+2", "CnH2n-2", "CnHn"], c: 0 }
];

const MATHS_TEMPLATES = [
    { q: "The derivative of sin(x) is:", o: ["cos(x)", "-cos(x)", "tan(x)", "sec(x)"], c: 0 },
    { q: "Value of log(1) is:", o: ["0", "1", "10", "Infinity"], c: 0 },
    { q: "Roots of x² - 1 = 0 are:", o: ["1, -1", "1, 1", "0, 1", "-1, -1"], c: 0 },
    { q: "Value of sin(30°) is:", o: ["1/2", "√3/2", "1/√2", "1"], c: 0 },
    { q: "Slope of the line y = 2x + 3 is:", o: ["2", "3", "1", "-2"], c: 0 },
    { q: "Sum of first n natural numbers is:", o: ["n(n+1)/2", "n²", "n(n-1)/2", "n(n+1)"], c: 0 },
    { q: "If A is a matrix of order 2x3, order of A' is:", o: ["3x2", "2x3", "2x2", "3x3"], c: 0 },
    { q: "Integration of x dx is:", o: ["x²/2 + c", "x + c", "x² + c", "1 + c"], c: 0 },
    { q: "Distance between (0,0) and (3,4) is:", o: ["5", "7", "1", "25"], c: 0 },
    { q: "Which of these is an irrational number?", o: ["π", "22/7", "0", "1"], c: 0 }
];

const getTemplate = (subject: Subject, index: number, topicId: string) => {
    // Generate a consistent pseudo-random index based on topicId string to vary content between chapters
    const hash = topicId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const combinedIndex = index + hash;
    
    if (subject === 'Physics') return PHYSICS_TEMPLATES[combinedIndex % PHYSICS_TEMPLATES.length];
    if (subject === 'Chemistry') return CHEMISTRY_TEMPLATES[combinedIndex % CHEMISTRY_TEMPLATES.length];
    return MATHS_TEMPLATES[combinedIndex % MATHS_TEMPLATES.length];
};

// --- GENERATE INITIAL QUESTION BANK ---
export const generateInitialQuestionBank = (): Question[] => {
    const questions: Question[] = [];
    
    SYLLABUS_DATA.forEach(topic => {
        // Keep Specific content for "Units and Dimensions" (Physics) manually if needed
        if (topic.id === 'p-units') {
            questions.push(createQ(`q_p_units_1`, "Dimensional formula of Planck's Constant is:", ['[ML²T⁻¹]', '[ML²T⁻²]', '[MLT⁻¹]', '[MLT⁻²]'], 0, 'phys', topic.id, 'JEE Main 2022', 'EASY'));
            questions.push(createQ(`q_p_units_2`, "Which pair has same dimensions?", ['Work & Torque', 'Force & Impulse', 'Elastic Modulus & Strain', 'Power & Energy'], 0, 'phys', topic.id, 'JEE Main 2021', 'EASY'));
            questions.push(createQ(`q_p_units_3`, "Percentage error in measurement of mass and speed are 2% and 3%. Max error in KE is:", ['8%', '5%', '1%', '6%'], 0, 'phys', topic.id, 'JEE Main 2023', 'MEDIUM'));
            questions.push(createQ(`q_p_units_4`, "In equation y = A sin(ωt - kx), dimension of ω/k is:", ['[LT⁻¹]', '[L⁻¹T]', '[L]', '[T]'], 0, 'phys', topic.id, 'JEE Adv 2019', 'MEDIUM'));
            questions.push(createQ(`q_p_units_5`, "If Force (F), Length (L) and Time (T) are fundamental, dimension of Mass is:", ['[FL⁻¹T²]', '[FLT⁻²]', '[F⁻¹L⁻¹T⁻¹]', '[FL²T]'], 0, 'phys', topic.id, 'JEE Adv 2020', 'HARD'));
        }
        
        // Generate realistic placeholders for ALL chapters
        // Loop for Easy
        for (let i = 1; i <= 4; i++) {
            const tmpl = getTemplate(topic.subject, i, topic.id);
            questions.push({
                id: `q_${topic.id}_easy_${i}`,
                subjectId: topic.subject === 'Physics' ? 'phys' : topic.subject === 'Chemistry' ? 'chem' : 'math',
                topicId: topic.id,
                text: tmpl.q,
                options: tmpl.o,
                correctOptionIndex: tmpl.c,
                difficulty: 'EASY',
                source: 'Practice Bank',
                year: 2024
            });
        }
        // Loop for Medium
        for (let i = 1; i <= 4; i++) {
            const tmpl = getTemplate(topic.subject, i + 5, topic.id); // Offset index to vary questions
            questions.push({
                id: `q_${topic.id}_med_${i}`,
                subjectId: topic.subject === 'Physics' ? 'phys' : topic.subject === 'Chemistry' ? 'chem' : 'math',
                topicId: topic.id,
                text: tmpl.q,
                options: tmpl.o,
                correctOptionIndex: tmpl.c,
                difficulty: 'MEDIUM',
                source: 'JEE Main PYQ',
                year: 2023
            });
        }
        // Loop for Hard
        for (let i = 1; i <= 4; i++) {
            const tmpl = getTemplate(topic.subject, i + 10, topic.id);
            questions.push({
                id: `q_${topic.id}_hard_${i}`,
                subjectId: topic.subject === 'Physics' ? 'phys' : topic.subject === 'Chemistry' ? 'chem' : 'math',
                topicId: topic.id,
                text: tmpl.q,
                options: tmpl.o,
                correctOptionIndex: tmpl.c,
                difficulty: 'HARD',
                source: 'JEE Advanced',
                year: 2022
            });
        }
    });

    return questions;
};

// --- MOCK TESTS DATA ---
// Using a smaller subset for the Tests tab
export const MOCK_TESTS_DATA: Test[] = [
    {
        id: 'test_jee_main_1',
        title: 'JEE Main 2024 - Full Mock 1',
        durationMinutes: 180,
        category: 'ADMIN',
        difficulty: 'MAINS',
        examType: 'JEE',
        questions: generateInitialQuestionBank().slice(0, 30) // Grab first 30 valid questions
    },
    {
        id: 'test_jee_adv_1',
        title: 'JEE Advanced Paper 1',
        durationMinutes: 180,
        category: 'ADMIN',
        difficulty: 'ADVANCED',
        examType: 'JEE',
        questions: generateInitialQuestionBank().slice(30, 50)
    }
];

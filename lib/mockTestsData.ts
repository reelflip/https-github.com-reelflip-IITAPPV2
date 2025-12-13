
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

// --- GENERATE INITIAL QUESTION BANK ---
export const generateInitialQuestionBank = (): Question[] => {
    const questions: Question[] = [];
    
    // For each topic in syllabus, generate 12 dummy questions (4 Easy, 4 Medium, 4 Hard)
    // plus some specific real ones for demo topics.
    
    SYLLABUS_DATA.forEach(topic => {
        // Specific content for "Units and Dimensions" (Physics)
        if (topic.id === 'p-units') {
            questions.push(createQ(`q_p_units_1`, "Dimensional formula of Planck's Constant is:", ['[ML²T⁻¹]', '[ML²T⁻²]', '[MLT⁻¹]', '[MLT⁻²]'], 0, 'phys', topic.id, 'JEE Main 2022', 'EASY'));
            questions.push(createQ(`q_p_units_2`, "Which pair has same dimensions?", ['Work & Torque', 'Force & Impulse', 'Elastic Modulus & Strain', 'Power & Energy'], 0, 'phys', topic.id, 'JEE Main 2021', 'EASY'));
            questions.push(createQ(`q_p_units_3`, "Percentage error in measurement of mass and speed are 2% and 3%. Max error in KE is:", ['8%', '5%', '1%', '6%'], 0, 'phys', topic.id, 'JEE Main 2023', 'MEDIUM'));
            questions.push(createQ(`q_p_units_4`, "In equation y = A sin(ωt - kx), dimension of ω/k is:", ['[LT⁻¹]', '[L⁻¹T]', '[L]', '[T]'], 0, 'phys', topic.id, 'JEE Adv 2019', 'MEDIUM'));
            questions.push(createQ(`q_p_units_5`, "If Force (F), Length (L) and Time (T) are fundamental, dimension of Mass is:", ['[FL⁻¹T²]', '[FLT⁻²]', '[F⁻¹L⁻¹T⁻¹]', '[FL²T]'], 0, 'phys', topic.id, 'JEE Adv 2020', 'HARD'));
        }
        
        // Generate generic placeholders to meet "10-15 questions" requirement for ALL chapters
        for (let i = 1; i <= 5; i++) {
            questions.push({
                id: `q_${topic.id}_easy_${i}`,
                subjectId: topic.subject === 'Physics' ? 'phys' : topic.subject === 'Chemistry' ? 'chem' : 'math',
                topicId: topic.id,
                text: `[${topic.name}] Conceptual Question #${i}: Basic definition and formula application. What is the correct relation?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctOptionIndex: 0,
                difficulty: 'EASY',
                source: 'Practice Bank',
                year: 2024
            });
        }
        for (let i = 1; i <= 5; i++) {
            questions.push({
                id: `q_${topic.id}_med_${i}`,
                subjectId: topic.subject === 'Physics' ? 'phys' : topic.subject === 'Chemistry' ? 'chem' : 'math',
                topicId: topic.id,
                text: `[${topic.name}] Problem #${i}: A numerical involving standard formulas. Calculate the value of X given Y and Z.`,
                options: ['10.5', '20.2', '5.5', '0.0'],
                correctOptionIndex: 1,
                difficulty: 'MEDIUM',
                source: 'JEE Main PYQ',
                year: 2023
            });
        }
        for (let i = 1; i <= 5; i++) {
            questions.push({
                id: `q_${topic.id}_hard_${i}`,
                subjectId: topic.subject === 'Physics' ? 'phys' : topic.subject === 'Chemistry' ? 'chem' : 'math',
                topicId: topic.id,
                text: `[${topic.name}] Advanced Problem #${i}: Multi-concept application involving calculus or derived constraints.`,
                options: ['Statement 1 is true', 'Statement 2 is true', 'Both are true', 'Both are false'],
                correctOptionIndex: 2,
                difficulty: 'HARD',
                source: 'JEE Advanced',
                year: 2022
            });
        }
    });

    return questions;
};

// --- MOCK TESTS DATA ---
// Using a smaller subset for the Tests tab, distinct from the Chapter Question Bank
export const MOCK_TESTS_DATA: Test[] = [
    {
        id: 'test_jee_main_1',
        title: 'JEE Main 2024 - Full Mock 1',
        durationMinutes: 180,
        category: 'ADMIN',
        difficulty: 'MAINS',
        examType: 'JEE',
        questions: generateInitialQuestionBank().slice(0, 30) // Just grab first 30 for demo
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

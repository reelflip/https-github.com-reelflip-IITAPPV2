
import { Test, Question } from './types';

// Helper to create questions easily
const createQ = (id: string, text: string, options: string[], correct: number, subject: 'phys' | 'chem' | 'math', topic: string, source: string = 'JEE Main PYQ'): Question => ({
    id, text, options, correctOptionIndex: correct, subjectId: subject, topicId: topic, source, year: 2023
});

// --- BASE POOL OF QUESTIONS (Used to populate tests) ---
const PHYSICS_POOL = [
    createQ('p1', 'Dimensions of magnetic flux are:', ['[ML²T⁻²A⁻¹]', '[ML²T⁻²A⁻²]', '[MLT⁻¹A⁻¹]', '[ML²T⁻¹A²]'], 0, 'phys', 'p-units'),
    createQ('p2', 'A projectile is fired at 30° to horizontal. If it crosses two walls of equal height h at t=1s and t=3s, find h. (g=10)', ['10m', '15m', '20m', '5m'], 1, 'phys', 'p-kin-2d'),
    createQ('p3', 'Moment of inertia of a disc about a tangent in its plane is:', ['5/4 MR²', '3/2 MR²', '1/2 MR²', '5/2 MR²'], 0, 'phys', 'p-rot'),
    createQ('p4', 'Efficiency of a Carnot engine working between 300K and 600K is:', ['50%', '25%', '75%', '100%'], 0, 'phys', 'p-thermo'),
    createQ('p5', 'Which series of Hydrogen spectrum lies in visible region?', ['Lyman', 'Balmer', 'Paschen', 'Brackett'], 1, 'phys', 'p-atoms'),
    createQ('p6', 'Two capacitors 2µF and 4µF are in series. Equivalent C is:', ['6', '2', '4/3', '3/4'], 2, 'phys', 'p-capacitance'),
    createQ('p7', 'Bohr radius for n=2 orbit of H-atom is (r₀=0.529Å):', ['r₀', '2r₀', '4r₀', 'r₀/2'], 2, 'phys', 'p-atoms'),
    createQ('p8', 'Escape velocity from earth is 11.2 km/s. From a planet with double mass and double radius, it is:', ['11.2', '22.4', '11.2', '5.6'], 0, 'phys', 'p-grav'),
    createQ('p9', 'Unit of permittivity ε₀ is:', ['C²/Nm²', 'Nm²/C²', 'C/V', 'F/m²'], 0, 'phys', 'p-electro'),
    createQ('p10', 'Specific heat ratio γ for monoatomic gas:', ['1.4', '1.67', '1.33', '1.5'], 1, 'phys', 'p-ktg')
];

const CHEM_POOL = [
    createQ('c1', 'Hybridization of Xe in XeF4 is:', ['sp³', 'sp³d', 'sp³d²', 'sp³d³'], 2, 'chem', 'c-bond'),
    createQ('c2', 'Which ore contains both Iron and Copper?', ['Cuprite', 'Chalcocite', 'Chalcopyrite', 'Malachite'], 2, 'chem', 'c-class'),
    createQ('c3', 'IUPAC name of [Co(NH₃)₅ONO]Cl₂ is:', ['Pentaamminenitritocobalt(III) chloride', 'Pentaamminenitrocobalt(III) chloride', '...nitrito...', '...cobaltate...'], 0, 'chem', 'c-coord'),
    createQ('c4', 'Reaction of phenol with CHCl₃/NaOH gives:', ['Salicylic Acid', 'Salicylaldehyde', 'Benzoic Acid', 'Benzaldehyde'], 1, 'chem', 'c-oxy'),
    createQ('c5', 'Number of chiral carbons in Glucose is:', ['3', '4', '5', '6'], 1, 'chem', 'c-bio'),
    createQ('c6', 'pH of 10⁻⁸ M HCl is:', ['8', '7', '6.96', '7.04'], 2, 'chem', 'c-equil'),
    createQ('c7', 'Which is strongest acid?', ['HCOOH', 'CH₃COOH', 'C₆H₅COOH', 'ClCH₂COOH'], 3, 'chem', 'c-goc'),
    createQ('c8', 'Shape of SF₄ is:', ['Tetrahedral', 'Square Planar', 'See-Saw', 'Trigonal Bipyramidal'], 2, 'chem', 'c-bond'),
    createQ('c9', 'Which vitamin is water soluble?', ['A', 'D', 'C', 'K'], 2, 'chem', 'c-bio'),
    createQ('c10', 'Bond order of O₂ is:', ['1', '2', '1.5', '2.5'], 1, 'chem', 'c-bond')
];

const MATH_POOL = [
    createQ('m1', 'If A = {1,2,3}, number of reflexive relations on A is:', ['64', '8', '27', '512'], 0, 'math', 'm-sets'),
    createQ('m2', 'Value of i + i² + i³ + i⁴ is:', ['1', '-1', 'i', '0'], 3, 'math', 'm-complex'),
    createQ('m3', 'Area bounded by y=x² and y=x is:', ['1/2', '1/3', '1/6', '1/4'], 2, 'math', 'm-integral'),
    createQ('m4', 'Sum of infinite GP 1, 1/2, 1/4... is:', ['1', '2', '3', '1.5'], 1, 'math', 'm-seq'),
    createQ('m5', 'Distance of point (1,2,3) from xy-plane is:', ['1', '2', '3', '√14'], 2, 'math', 'm-3d'),
    createQ('m6', 'General solution of sin x = 1/2 is:', ['nπ ± π/6', 'nπ + (-1)ⁿπ/6', '2nπ ± π/6', 'nπ + π/3'], 1, 'math', 'm-trigo'),
    createQ('m7', 'Equation of circle with center (0,0) and radius 5:', ['x²+y²=5', 'x²+y²=25', 'x²+y²=10', 'x+y=5'], 1, 'math', 'm-coord'),
    createQ('m8', 'Derivative of ln(sec x) is:', ['sec x', 'tan x', 'cot x', 'cos x'], 1, 'math', 'm-aod'),
    createQ('m9', 'If det(A) = 5 for order 3, det(2A) is:', ['10', '40', '5', '20'], 1, 'math', 'm-matrices'),
    createQ('m10', 'Number of ways to arrange letters of APPLE:', ['120', '60', '24', '720'], 1, 'math', 'm-pnc')
];

// --- GENERATE TESTS ---

const generateMock = (id: string, title: string, diff: 'MAINS' | 'ADVANCED', count: number): Test => {
    // Round robin selection from pools to ensure variety
    const questions: Question[] = [];
    for(let i=0; i<count; i++) {
        if(i % 3 === 0) questions.push({ ...PHYSICS_POOL[i % PHYSICS_POOL.length], id: `${id}_p_${i}` });
        else if(i % 3 === 1) questions.push({ ...CHEM_POOL[i % CHEM_POOL.length], id: `${id}_c_${i}` });
        else questions.push({ ...MATH_POOL[i % MATH_POOL.length], id: `${id}_m_${i}` });
    }

    return {
        id,
        title,
        durationMinutes: 180,
        category: 'ADMIN',
        difficulty: diff,
        examType: 'JEE',
        questions
    };
};

export const MOCK_TESTS_DATA: Test[] = [
    generateMock('test_jee_main_1', 'JEE Main 2024 - Full Mock 1', 'MAINS', 25),
    generateMock('test_jee_main_2', 'JEE Main 2024 - Full Mock 2', 'MAINS', 25),
    generateMock('test_jee_adv_1', 'JEE Advanced Paper 1 (High Difficulty)', 'ADVANCED', 20),
    generateMock('test_jee_part_1', 'Part Test 1: Class 11 Syllabus', 'MAINS', 20),
    generateMock('test_jee_part_2', 'Part Test 2: Class 12 Syllabus', 'MAINS', 20),
    generateMock('test_jee_chem_special', 'Chemistry Special: Inorganic + Organic', 'MAINS', 25),
    generateMock('test_jee_phys_special', 'Physics Special: Mechanics', 'ADVANCED', 20),
    generateMock('test_jee_math_special', 'Maths Special: Calculus', 'ADVANCED', 20),
    generateMock('test_bitsat_1', 'BITSAT Full Length Mock', 'MAINS', 30),
    generateMock('test_viteee_1', 'VITEEE Speed Test', 'MAINS', 30)
];

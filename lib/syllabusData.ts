
import { Topic, Subject } from './types';

export const SYLLABUS_DATA: Topic[] = [
  // PHYSICS - Mechanics
  { id: 'p-units', name: 'Units & Dimensions', chapter: 'Basics', subject: 'Physics' },
  { id: 'p-kinematics', name: 'Kinematics (1D & 2D)', chapter: 'Mechanics', subject: 'Physics' },
  { id: 'p-nlm', name: 'Newton\'s Laws of Motion', chapter: 'Mechanics', subject: 'Physics' },
  { id: 'p-friction', name: 'Friction', chapter: 'Mechanics', subject: 'Physics' },
  { id: 'p-wep', name: 'Work, Energy & Power', chapter: 'Mechanics', subject: 'Physics' },
  { id: 'p-com', name: 'Center of Mass & Collisions', chapter: 'Mechanics', subject: 'Physics' },
  { id: 'p-rot', name: 'Rotational Motion', chapter: 'Mechanics', subject: 'Physics' },
  { id: 'p-grav', name: 'Gravitation', chapter: 'Mechanics', subject: 'Physics' },
  // PHYSICS - Electrodynamics
  { id: 'p-electro1', name: 'Electrostatics', chapter: 'Electrodynamics', subject: 'Physics' },
  { id: 'p-curr', name: 'Current Electricity', chapter: 'Electrodynamics', subject: 'Physics' },
  { id: 'p-mag', name: 'Magnetic Effects of Current', chapter: 'Electrodynamics', subject: 'Physics' },
  { id: 'p-emi', name: 'EMI & AC', chapter: 'Electrodynamics', subject: 'Physics' },
  
  // CHEMISTRY - Physical
  { id: 'c-mole', name: 'Mole Concept', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  { id: 'c-atomic', name: 'Atomic Structure', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  { id: 'c-equil', name: 'Chemical Equilibrium', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  { id: 'c-ionic', name: 'Ionic Equilibrium', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  { id: 'c-thermo', name: 'Thermodynamics', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  { id: 'c-electro', name: 'Electrochemistry', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  // CHEMISTRY - Organic
  { id: 'c-goc', name: 'GOC (General Organic Chemistry)', chapter: 'Organic Chemistry', subject: 'Chemistry' },
  { id: 'c-hydro', name: 'Hydrocarbons', chapter: 'Organic Chemistry', subject: 'Chemistry' },
  { id: 'c-halo', name: 'Haloalkanes & Haloarenes', chapter: 'Organic Chemistry', subject: 'Chemistry' },
  { id: 'c-alc', name: 'Alcohols, Phenols & Ethers', chapter: 'Organic Chemistry', subject: 'Chemistry' },

  // MATHS - Algebra
  { id: 'm-quad', name: 'Quadratic Equations', chapter: 'Algebra', subject: 'Maths' },
  { id: 'm-seq', name: 'Sequence & Series', chapter: 'Algebra', subject: 'Maths' },
  { id: 'm-complex', name: 'Complex Numbers', chapter: 'Algebra', subject: 'Maths' },
  { id: 'm-bino', name: 'Binomial Theorem', chapter: 'Algebra', subject: 'Maths' },
  { id: 'm-pnc', name: 'Permutation & Combination', chapter: 'Algebra', subject: 'Maths' },
  // MATHS - Calculus
  { id: 'm-func', name: 'Functions', chapter: 'Calculus', subject: 'Maths' },
  { id: 'm-lcd', name: 'Limits, Continuity & Differentiability', chapter: 'Calculus', subject: 'Maths' },
  { id: 'm-aod', name: 'Application of Derivatives', chapter: 'Calculus', subject: 'Maths' },
  { id: 'm-int', name: 'Indefinite Integration', chapter: 'Calculus', subject: 'Maths' },
  { id: 'm-def', name: 'Definite Integration', chapter: 'Calculus', subject: 'Maths' },
];

export const getTopicsBySubject = (subject: Subject) => 
  SYLLABUS_DATA.filter(t => t.subject === subject);

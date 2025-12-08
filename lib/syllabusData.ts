
import { Topic, Subject } from './types';

export const SYLLABUS_DATA: Topic[] = [
  // ==========================================
  // PHYSICS (20 Units)
  // ==========================================
  
  // UNIT 1: Units and Measurements
  { id: 'p-units', name: 'Units & Dimensions', chapter: 'Units and Measurements', subject: 'Physics' },
  { id: 'p-errors', name: 'Errors in Measurement', chapter: 'Units and Measurements', subject: 'Physics' },

  // UNIT 2: Kinematics
  { id: 'p-kin-1d', name: 'Motion in a Straight Line', chapter: 'Kinematics', subject: 'Physics' },
  { id: 'p-kin-2d', name: 'Motion in a Plane (Projectile & Circular)', chapter: 'Kinematics', subject: 'Physics' },

  // UNIT 3: Laws of Motion
  { id: 'p-nlm', name: 'Newton\'s Laws of Motion', chapter: 'Laws of Motion', subject: 'Physics' },
  { id: 'p-friction', name: 'Friction', chapter: 'Laws of Motion', subject: 'Physics' },
  
  // UNIT 4: Work, Energy and Power
  { id: 'p-wep', name: 'Work, Energy & Power', chapter: 'Work, Energy and Power', subject: 'Physics' },
  { id: 'p-collisions', name: 'Collisions', chapter: 'Work, Energy and Power', subject: 'Physics' },

  // UNIT 5: Rotational Motion
  { id: 'p-com', name: 'Center of Mass', chapter: 'Rotational Motion', subject: 'Physics' },
  { id: 'p-rot', name: 'Rotational Mechanics', chapter: 'Rotational Motion', subject: 'Physics' },

  // UNIT 6: Gravitation
  { id: 'p-grav', name: 'Gravitation', chapter: 'Gravitation', subject: 'Physics' },

  // UNIT 7: Properties of Solids and Liquids
  { id: 'p-solids', name: 'Elasticity (Solids)', chapter: 'Properties of Solids and Liquids', subject: 'Physics' },
  { id: 'p-fluids', name: 'Fluid Mechanics', chapter: 'Properties of Solids and Liquids', subject: 'Physics' },
  { id: 'p-thermal-prop', name: 'Thermal Properties of Matter', chapter: 'Properties of Solids and Liquids', subject: 'Physics' },

  // UNIT 8: Thermodynamics
  { id: 'p-thermo', name: 'Thermodynamics Laws & Processes', chapter: 'Thermodynamics', subject: 'Physics' },

  // UNIT 9: Kinetic Theory of Gases
  { id: 'p-ktg', name: 'Kinetic Theory of Gases', chapter: 'Kinetic Theory of Gases', subject: 'Physics' },

  // UNIT 10: Oscillations and Waves
  { id: 'p-shm', name: 'Oscillations (SHM)', chapter: 'Oscillations and Waves', subject: 'Physics' },
  { id: 'p-waves', name: 'Waves (Sound & String)', chapter: 'Oscillations and Waves', subject: 'Physics' },

  // UNIT 11: Electrostatics
  { id: 'p-electro', name: 'Electric Charges & Fields', chapter: 'Electrostatics', subject: 'Physics' },
  { id: 'p-potential', name: 'Electrostatic Potential', chapter: 'Electrostatics', subject: 'Physics' },
  { id: 'p-capacitance', name: 'Capacitors', chapter: 'Electrostatics', subject: 'Physics' },

  // UNIT 12: Current Electricity
  { id: 'p-current', name: 'Current Electricity', chapter: 'Current Electricity', subject: 'Physics' },

  // UNIT 13: Magnetic Effects of Current and Magnetism
  { id: 'p-mag-eff', name: 'Moving Charges & Magnetism', chapter: 'Magnetic Effects', subject: 'Physics' },
  { id: 'p-magnetism', name: 'Magnetism & Matter', chapter: 'Magnetic Effects', subject: 'Physics' },

  // UNIT 14: EMI and AC
  { id: 'p-emi', name: 'Electromagnetic Induction', chapter: 'EMI and AC', subject: 'Physics' },
  { id: 'p-ac', name: 'Alternating Current', chapter: 'EMI and AC', subject: 'Physics' },

  // UNIT 15: Electromagnetic Waves
  { id: 'p-emw', name: 'Electromagnetic Waves', chapter: 'Electromagnetic Waves', subject: 'Physics' },

  // UNIT 16: Optics
  { id: 'p-ray', name: 'Ray Optics', chapter: 'Optics', subject: 'Physics' },
  { id: 'p-wave-optics', name: 'Wave Optics', chapter: 'Optics', subject: 'Physics' },

  // UNIT 17: Dual Nature
  { id: 'p-dual', name: 'Dual Nature of Radiation & Matter', chapter: 'Dual Nature', subject: 'Physics' },

  // UNIT 18: Atoms and Nuclei
  { id: 'p-atoms', name: 'Atoms', chapter: 'Atoms and Nuclei', subject: 'Physics' },
  { id: 'p-nuclei', name: 'Nuclei', chapter: 'Atoms and Nuclei', subject: 'Physics' },

  // UNIT 19: Electronic Devices
  { id: 'p-semicon', name: 'Semiconductors', chapter: 'Electronic Devices', subject: 'Physics' },

  // UNIT 20: Experimental Skills
  { id: 'p-exp', name: 'Experimental Skills', chapter: 'Experimental Skills', subject: 'Physics' },


  // ==========================================
  // CHEMISTRY (20 Units)
  // ==========================================

  // PHYSICAL CHEMISTRY
  // Unit 1
  { id: 'c-basic', name: 'Some Basic Concepts', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  // Unit 2
  { id: 'c-atom', name: 'Atomic Structure', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  // Unit 3
  { id: 'c-bond', name: 'Chemical Bonding', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  // Unit 4
  { id: 'c-thermo', name: 'Chemical Thermodynamics', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  // Unit 5
  { id: 'c-sol', name: 'Solutions', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  // Unit 6
  { id: 'c-equil', name: 'Equilibrium (Chemical & Ionic)', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  // Unit 7
  { id: 'c-redox', name: 'Redox & Electrochemistry', chapter: 'Physical Chemistry', subject: 'Chemistry' },
  // Unit 8
  { id: 'c-kinetics', name: 'Chemical Kinetics', chapter: 'Physical Chemistry', subject: 'Chemistry' },

  // INORGANIC CHEMISTRY
  // Unit 9
  { id: 'c-class', name: 'Classification of Elements', chapter: 'Inorganic Chemistry', subject: 'Chemistry' },
  // Unit 10
  { id: 'c-pblock', name: 'p-Block Elements (Group 13-18)', chapter: 'Inorganic Chemistry', subject: 'Chemistry' },
  // Unit 11
  { id: 'c-dfblock', name: 'd- and f- Block Elements', chapter: 'Inorganic Chemistry', subject: 'Chemistry' },
  // Unit 12
  { id: 'c-coord', name: 'Coordination Compounds', chapter: 'Inorganic Chemistry', subject: 'Chemistry' },

  // ORGANIC CHEMISTRY
  // Unit 13
  { id: 'c-purif', name: 'Purification & Characterisation', chapter: 'Organic Chemistry', subject: 'Chemistry' },
  // Unit 14
  { id: 'c-goc', name: 'Some Basic Principles (GOC)', chapter: 'Organic Chemistry', subject: 'Chemistry' },
  // Unit 15
  { id: 'c-hydro', name: 'Hydrocarbons', chapter: 'Organic Chemistry', subject: 'Chemistry' },
  // Unit 16
  { id: 'c-halo', name: 'Organic Compounds Containing Halogens', chapter: 'Organic Chemistry', subject: 'Chemistry' },
  // Unit 17
  { id: 'c-oxy', name: 'Organic Compounds Containing Oxygen', chapter: 'Organic Chemistry', subject: 'Chemistry' },
  // Unit 18
  { id: 'c-nitro', name: 'Organic Compounds Containing Nitrogen', chapter: 'Organic Chemistry', subject: 'Chemistry' },
  // Unit 19
  { id: 'c-bio', name: 'Biomolecules', chapter: 'Organic Chemistry', subject: 'Chemistry' },
  // Unit 20
  { id: 'c-prac', name: 'Principles Related to Practical Chemistry', chapter: 'Organic Chemistry', subject: 'Chemistry' },


  // ==========================================
  // MATHEMATICS (14 Units)
  // ==========================================

  // Unit 1
  { id: 'm-sets', name: 'Sets, Relations & Functions', chapter: 'Sets, Relations & Functions', subject: 'Maths' },
  
  // Unit 2
  { id: 'm-complex', name: 'Complex Numbers & Quadratic Eq', chapter: 'Algebra', subject: 'Maths' },
  
  // Unit 3
  { id: 'm-matrices', name: 'Matrices & Determinants', chapter: 'Algebra', subject: 'Maths' },
  
  // Unit 4
  { id: 'm-pnc', name: 'Permutations & Combinations', chapter: 'Algebra', subject: 'Maths' },
  
  // Unit 5
  { id: 'm-bino', name: 'Binomial Theorem', chapter: 'Algebra', subject: 'Maths' },
  
  // Unit 6
  { id: 'm-seq', name: 'Sequence & Series', chapter: 'Algebra', subject: 'Maths' },
  
  // Unit 7
  { id: 'm-limits', name: 'Limit, Continuity & Differentiability', chapter: 'Calculus', subject: 'Maths' },
  { id: 'm-aod', name: 'Applications of Derivatives', chapter: 'Calculus', subject: 'Maths' },
  
  // Unit 8
  { id: 'm-integral', name: 'Integral Calculus', chapter: 'Calculus', subject: 'Maths' },
  
  // Unit 9
  { id: 'm-diffeq', name: 'Differential Equations', chapter: 'Calculus', subject: 'Maths' },
  
  // Unit 10
  { id: 'm-coord', name: 'Co-ordinate Geometry', chapter: 'Coordinate Geometry', subject: 'Maths' },
  
  // Unit 11
  { id: 'm-3d', name: 'Three Dimensional Geometry', chapter: '3D & Vectors', subject: 'Maths' },
  
  // Unit 12
  { id: 'm-vector', name: 'Vector Algebra', chapter: '3D & Vectors', subject: 'Maths' },
  
  // Unit 13
  { id: 'm-stats', name: 'Statistics & Probability', chapter: 'Statistics & Probability', subject: 'Maths' },
  
  // Unit 14
  { id: 'm-trigo', name: 'Trigonometry', chapter: 'Trigonometry', subject: 'Maths' },
];

export const getTopicsBySubject = (subject: Subject) => 
  SYLLABUS_DATA.filter(t => t.subject === subject);


// Comprehensive IIT JEE Preparation Notes
// Content Source: NCERT + JEE Advanced Standard Reference Materials
// Format: HTML strings optimized for the Rich Text Editor

export const DEFAULT_CHAPTER_NOTES: Record<string, { title: string, pages: string[] }> = {
  // ================= PHYSICS (20 Units) =================
  'p-units': {
    title: 'Units, Dimensions & Errors',
    pages: [
      `<h1>1. Fundamental & Derived Quantities</h1>
       <p>Physics explains nature through measurement. Physical quantities are categorized into:</p>
       <ul>
         <li><strong>Fundamental Quantities:</strong> The 7 basic building blocks defined by SI.</li>
         <li><strong>Derived Quantities:</strong> Combinations of fundamental quantities (e.g., Force = Mass × Acc).</li>
       </ul>
       <div class="concept-box">
         <strong>The 7 SI Base Units:</strong>
         <ol>
           <li>Length (meter, m)</li>
           <li>Mass (kilogram, kg)</li>
           <li>Time (second, s)</li>
           <li>Electric Current (Ampere, A)</li>
           <li>Thermodynamic Temperature (Kelvin, K)</li>
           <li>Amount of Substance (mole, mol)</li>
           <li>Luminous Intensity (candela, cd)</li>
         </ol>
       </div>`,
       `<h1>2. Dimensional Analysis</h1>
       <div class="formula-box">[Force] = [MLT⁻²] <br/> [Energy] = [ML²T⁻²] <br/> [Power] = [ML²T⁻³]</div>
       <p><strong>Principle of Homogeneity:</strong> Only quantities with the same dimensions can be added, subtracted, or equated.</p>`,
       `<h1>3. Error Analysis</h1>
       <p><strong>Propagation:</strong> Max Error in Z = Aⁿ is ΔZ/Z = n(ΔA/A).</p>
       <div class="tip-box">Always add percentage errors, never subtract them.</div>`
    ]
  },
  'p-errors': {
    title: 'Errors in Measurement',
    pages: [
      `<h1>1. Significant Figures</h1>
       <p>Rules for determining significant figures. Non-zero digits are significant. Zeros between non-zeros are significant.</p>`,
       `<h1>2. Vernier Caliper & Screw Gauge</h1>
       <div class="formula-box">LC = 1 MSD - 1 VSD</div>
       <p><strong>Zero Error:</strong> Subtract positive error, add negative error.</p>`
    ]
  },
  'p-kin-1d': {
    title: 'Motion in Straight Line',
    pages: [
      `<h1>1. Equations of Motion</h1>
       <div class="formula-box">v = u + at <br/> s = ut + ½at² <br/> v² = u² + 2as</div>
       <p>Valid only for constant acceleration.</p>`,
       `<h1>2. Relative Motion (1D)</h1>
       <p>v_AB = v_A - v_B. a_AB = a_A - a_B.</p>`
    ]
  },
  'p-kin-2d': {
    title: 'Motion in a Plane',
    pages: [
      `<h1>1. Projectile Motion</h1>
       <div class="formula-box">T = 2u sinθ/g <br/> H = u² sin²θ/2g <br/> R = u² sin2θ/g</div>
       <p><strong>Trajectory:</strong> y = x tanθ (1 - x/R).</p>`,
       `<h1>2. Circular Motion</h1>
       <p>a_c = v²/r (Centripetal). a_t = dv/dt (Tangential).</p>`
    ]
  },
  'p-nlm': {
    title: 'Newton\'s Laws',
    pages: [
      `<h1>1. Laws of Motion</h1>
       <p>F_net = ma. Action-Reaction pairs act on different bodies.</p>`,
       `<h1>2. Constraint Motion</h1>
       <p>String: Σ T·v = 0. Wedge: Normal components of acceleration are equal.</p>`
    ]
  },
  'p-friction': {
    title: 'Friction',
    pages: [
      `<h1>1. Static vs Kinetic</h1>
       <p>Static is self-adjusting (f ≤ μsN). Kinetic is constant (f = μkN).</p>`,
       `<h1>2. Two Block Problems</h1>
       <div class="concept-box">Check if required friction for common acceleration exceeds limiting friction.</div>`
    ]
  },
  'p-wep': {
    title: 'Work, Energy & Power',
    pages: [
      `<h1>1. Work Energy Theorem</h1>
       <div class="formula-box">W_all = ΔK</div>
       <p>Valid for all frames and all forces.</p>`,
       `<h1>2. Potential Energy</h1>
       <p>F = -dU/dx. Stable equilibrium if d²U/dx² > 0.</p>`
    ]
  },
  'p-collisions': {
    title: 'Collisions & COM',
    pages: [
      `<h1>1. Center of Mass</h1>
       <p>R_cm = Σmr / Σm.</p>`,
       `<h1>2. Collisions</h1>
       <p>e = Velocity of Separation / Velocity of Approach.</p>
       <div class="formula-box">e=1 (Elastic), 0 < e < 1 (Inelastic), e=0 (Perfectly Inelastic)</div>`
    ]
  },
  'p-com': {
    title: 'Center of Mass',
    pages: [
        `<h1>1. System of Particles</h1>
         <p>R_cm = (m₁r₁ + m₂r₂)/(m₁+m₂). For continuous bodies: R_cm = (1/M) ∫ r dm.</p>`,
        `<h1>2. Motion of COM</h1>
         <p>F_ext = M a_cm. Internal forces do not affect the motion of the center of mass.</p>`
    ]
  },
  'p-rot': {
    title: 'Rotational Mechanics',
    pages: [
      `<h1>1. Moment of Inertia</h1>
       <p>I = Σmr². Ring: MR², Disc: MR²/2, Sphere: 2/5 MR².</p>`,
       `<h1>2. Torque & Rolling</h1>
       <p>τ = Iα. Pure Rolling: v = ωR. Friction is static in pure rolling.</p>`
    ]
  },
  'p-grav': {
    title: 'Gravitation',
    pages: [
      `<h1>1. Law of Gravitation</h1>
       <p>F = Gm₁m₂/r². g = GM/R².</p>`,
       `<h1>2. Satellites</h1>
       <div class="formula-box">v_orbital = √(GM/r) <br/> v_escape = √(2GM/R)</div>`
    ]
  },
  'p-solids': {
    title: 'Solids (Elasticity)',
    pages: [
      `<h1>1. Stress & Strain</h1>
       <p>Young's Modulus Y = Stress/Strain. Energy Density = ½ × Stress × Strain.</p>`
    ]
  },
  'p-fluids': {
    title: 'Fluid Mechanics',
    pages: [
      `<h1>1. Buoyancy & Pressure</h1>
       <p>P = P₀ + ρgh. Archimedes Principle.</p>`,
       `<h1>2. Bernoulli's Principle</h1>
       <div class="formula-box">P + ρgh + ½ρv² = Constant</div>`
    ]
  },
  'p-thermal-prop': {
    title: 'Thermal Properties',
    pages: [
      `<h1>1. Calorimetry</h1>
       <p>Heat Lost = Heat Gained. Q = mcΔT.</p>`,
       `<h1>2. Heat Transfer</h1>
       <p>Conduction (Fourier's Law), Radiation (Stefan's Law: E = σT⁴).</p>`
    ]
  },
  'p-thermo': {
    title: 'Thermodynamics',
    pages: [
      `<h1>1. First Law</h1>
       <p>Q = ΔU + W. ΔU = nCvΔT.</p>`,
       `<h1>2. Processes</h1>
       <p>Isothermal (T const), Adiabatic (PV^γ = const), Isobaric (P const).</p>`
    ]
  },
  'p-ktg': {
    title: 'Kinetic Theory of Gases',
    pages: [
      `<h1>1. Ideal Gas</h1>
       <p>PV = nRT. v_rms = √(3RT/M).</p>`,
       `<h1>2. Degrees of Freedom</h1>
       <p>f=3 (Mono), f=5 (Dia). γ = 1 + 2/f.</p>`
    ]
  },
  'p-shm': {
    title: 'Oscillations (SHM)',
    pages: [
      `<h1>1. Basics</h1>
       <p>F = -kx. x = A sin(ωt + φ).</p>`,
       `<h1>2. Systems</h1>
       <p>Spring-Block: T = 2π√(m/k). Pendulum: T = 2π√(l/g).</p>`
    ]
  },
  'p-waves': {
    title: 'Waves',
    pages: [
      `<h1>1. Wave Equation</h1>
       <p>y = A sin(ωt - kx). v = ω/k.</p>`,
       `<h1>2. Doppler Effect</h1>
       <p>f' = f (v ± vo)/(v ∓ vs).</p>`
    ]
  },
  'p-electro': {
    title: 'Electrostatics',
    pages: [
      `<h1>1. Field & Potential</h1>
       <p>E = kQ/r². V = kQ/r. Relation: E = -dV/dr.</p>`,
       `<h1>2. Gauss Law</h1>
       <div class="formula-box">Φ = ∮E.dA = q_in/ε₀</div>`
    ]
  },
  'p-potential': {
    title: 'Electrostatic Potential',
    pages: [
      `<h1>1. Potential Energy</h1>
       <p>U = k q₁q₂/r. Work done = ΔU.</p>`,
       `<h1>2. Dipole</h1>
       <p>V = k p cosθ / r². Stable equilibrium at θ=0.</p>`
    ]
  },
  'p-capacitance': {
    title: 'Capacitors',
    pages: [
      `<h1>1. Parallel Plate</h1>
       <p>C = ε₀A/d. With dielectric: C = Kε₀A/d.</p>`,
       `<h1>2. Circuits</h1>
       <p>Series: 1/C = 1/C₁ + 1/C₂. Parallel: C = C₁ + C₂.</p>`
    ]
  },
  'p-current': {
    title: 'Current Electricity',
    pages: [
      `<h1>1. Ohm's Law</h1>
       <p>V = IR. R = ρl/A.</p>`,
       `<h1>2. Kirchhoff's Laws</h1>
       <p>KCL (Junction), KVL (Loop). Wheatstone Bridge condition.</p>`
    ]
  },
  'p-mag-eff': {
    title: 'Moving Charges',
    pages: [
      `<h1>1. Biot Savart Law</h1>
       <p>dB = (μ₀/4π) Idl sinθ / r².</p>`,
       `<h1>2. Ampere's Law</h1>
       <p>∮B.dl = μ₀ I_enclosed.</p>`
    ]
  },
  'p-magnetism': {
    title: 'Magnetism & Matter',
    pages: [
      `<h1>1. Earth's Magnetism</h1>
       <p>Dip angle, Declination. B_H = B cosδ.</p>`,
       `<h1>2. Magnetic Materials</h1>
       <p>Dia (repelled), Para (weakly attracted), Ferro (strongly attracted).</p>`
    ]
  },
  'p-emi': {
    title: 'EMI',
    pages: [
      `<h1>1. Faraday's Law</h1>
       <p>ε = -dΦ/dt. Lenz Law gives direction.</p>`,
       `<h1>2. Inductance</h1>
       <p>Self (L), Mutual (M). Energy = ½ LI².</p>`
    ]
  },
  'p-ac': {
    title: 'Alternating Current',
    pages: [
      `<h1>1. LCR Circuit</h1>
       <p>Z = √(R² + (XL-XC)²). Resonance when XL = XC.</p>`,
       `<h1>2. Power</h1>
       <p>P_avg = V_rms I_rms cosφ. (cosφ is Power Factor).</p>`
    ]
  },
  'p-emw': {
    title: 'EM Waves',
    pages: [
      `<h1>1. Properties</h1>
       <p>c = 1/√(μ₀ε₀). E₀/B₀ = c.</p>`,
       `<h1>2. Spectrum</h1>
       <p>Radio > Micro > IR > Visible > UV > X-ray > Gamma.</p>`
    ]
  },
  'p-ray': {
    title: 'Ray Optics',
    pages: [
      `<h1>1. Reflection & Refraction</h1>
       <p>Mirror Formula: 1/v + 1/u = 1/f. Snell's Law: n₁sin i = n₂sin r.</p>`,
       `<h1>2. Lenses & Prism</h1>
       <p>Lens Maker: 1/f = (n-1)(1/R₁ - 1/R₂). Prism: A + δ = i + e.</p>`
    ]
  },
  'p-wave-optics': {
    title: 'Wave Optics',
    pages: [
      `<h1>1. Interference (YDSE)</h1>
       <p>Path diff Δx = dsinθ. Maxima: nλ. Minima: (n+½)λ.</p>`,
       `<h1>2. Diffraction</h1>
       <p>Single slit minima: a sinθ = nλ.</p>`
    ]
  },
  'p-dual': {
    title: 'Dual Nature',
    pages: [
      `<h1>1. Photoelectric Effect</h1>
       <div class="formula-box">hν = Φ + K_max</div>`,
       `<h1>2. Matter Waves</h1>
       <p>λ = h/p. De-Broglie wavelength.</p>`
    ]
  },
  'p-atoms': {
    title: 'Atoms',
    pages: [
      `<h1>1. Bohr Model</h1>
       <p>L = nh/2π. r ∝ n²/Z. E ∝ -Z²/n².</p>`
    ]
  },
  'p-nuclei': {
    title: 'Nuclei',
    pages: [
      `<h1>1. Radioactivity</h1>
       <p>N = N₀ e^(-λt). Half life = 0.693/λ.</p>`,
       `<h1>2. Binding Energy</h1>
       <p>Mass defect Δm. BE = Δm c².</p>`
    ]
  },
  'p-semicon': {
    title: 'Semiconductors',
    pages: [
      `<h1>1. PN Junction</h1>
       <p>Forward bias (conducts), Reverse bias (blocks).</p>`,
       `<h1>2. Logic Gates</h1>
       <p>AND, OR, NOT, NAND, NOR truth tables.</p>`
    ]
  },
  'p-exp': {
    title: 'Experimental Physics',
    pages: [
      `<h1>1. Instruments</h1>
       <p>Vernier Calipers, Screw Gauge, Spherometer logic.</p>`,
       `<h1>2. Optical Experiments</h1>
       <p>Focal length of concave mirror and convex lens using u-v method.</p>`
    ]
  },

  // ================= CHEMISTRY (20 Units) =================
  'c-basic': {
    title: 'Basic Concepts',
    pages: [
      `<h1>1. Mole Concept</h1>
       <p>n = W/M = N/NA = V_stp/22.4.</p>`,
       `<h1>2. Stoichiometry</h1>
       <p>Limiting Reagent concept. Concentration terms (Molarity, Molality).</p>`
    ]
  },
  'c-atom': {
    title: 'Atomic Structure',
    pages: [
      `<h1>1. Quantum Numbers</h1>
       <p>n, l, m, s. Pauli Exclusion, Aufbau Principle, Hund's Rule.</p>`,
       `<h1>2. Bohr Model</h1>
       <p>Applicable for 1-electron species. Radius and Energy formulas.</p>`
    ]
  },
  'c-bond': {
    title: 'Chemical Bonding',
    pages: [
      `<h1>1. VSEPR Theory</h1>
       <p>Predicting geometry based on repulsion: lp-lp > lp-bp > bp-bp.</p>`,
       `<h1>2. MOT</h1>
       <p>Bond Order = ½ (Nb - Na). Paramagnetism of O₂.</p>`
    ]
  },
  'c-thermo': {
    title: 'Thermodynamics (Chem)',
    pages: [
      `<h1>1. Enthalpy</h1>
       <p>ΔH = ΔU + ΔngRT. Hess's Law.</p>`,
       `<h1>2. Entropy & Gibbs Energy</h1>
       <p>ΔG = ΔH - TΔS. Spontaneity condition: ΔG < 0.</p>`
    ]
  },
  'c-sol': {
    title: 'Solutions',
    pages: [
      `<h1>1. Colligative Properties</h1>
       <p>RLVP, Elevation in BP, Depression in FP, Osmotic Pressure.</p>`,
       `<h1>2. Van't Hoff Factor</h1>
       <p>i = 1 + (n-1)α for dissociation.</p>`
    ]
  },
  'c-equil': {
    title: 'Equilibrium',
    pages: [
      `<h1>1. Chemical Equilibrium</h1>
       <p>Kp = Kc (RT)^Δng. Le Chatelier's Principle.</p>`,
       `<h1>2. Ionic Equilibrium</h1>
       <p>pH calculation. Buffer solutions. Solubility product (Ksp).</p>`
    ]
  },
  'c-redox': {
    title: 'Redox & Electrochemistry',
    pages: [
      `<h1>1. Nernst Equation</h1>
       <div class="formula-box">E = E° - (0.059/n) log Q</div>`,
       `<h1>2. Conductance</h1>
       <p>Kohlrausch Law. Faraday's Laws of Electrolysis.</p>`
    ]
  },
  'c-kinetics': {
    title: 'Chemical Kinetics',
    pages: [
      `<h1>1. Rate Laws</h1>
       <p>Zero Order (Rate = k), First Order (Rate = k[A]).</p>`,
       `<h1>2. Arrhenius Equation</h1>
       <p>k = A e^(-Ea/RT). Temperature dependence of rate.</p>`
    ]
  },
  'c-class': {
    title: 'Periodic Classification',
    pages: [
      `<h1>1. Periodic Trends</h1>
       <p>Radius, Ionization Energy, Electron Gain Enthalpy, Electronegativity trends.</p>`
    ]
  },
  'c-pblock': {
    title: 'p-Block Elements',
    pages: [
      `<h1>1. Group 13 & 14</h1>
       <p>Inert pair effect. Boranes. Silicates and Silicones.</p>`,
       `<h1>2. Group 15-18</h1>
       <p>Hydrides, Oxides, and Oxyacids of N, P, S, halogens.</p>`
    ]
  },
  'c-dfblock': {
    title: 'd & f Block',
    pages: [
      `<h1>1. Transition Elements</h1>
       <p>Variable valency, color, magnetic properties. KMnO4 and K2Cr2O7.</p>`,
       `<h1>2. Lanthanoids</h1>
       <p>Lanthanoid Contraction (Size decreases).</p>`
    ]
  },
  'c-coord': {
    title: 'Coordination Compounds',
    pages: [
      `<h1>1. Isomerism</h1>
       <p>Structural and Stereo (Geometrical & Optical).</p>`,
       `<h1>2. Bonding</h1>
       <p>VBT and CFT (Crystal Field Splitting). Spectrochemical series.</p>`
    ]
  },
  'c-purif': {
    title: 'Purification & Analysis',
    pages: [
      `<h1>1. Methods</h1>
       <p>Distillation, Chromatography, Crystallization.</p>`,
       `<h1>2. Qualitative Analysis</h1>
       <p>Lassaigne's Test. Detection of N, S, Halogens.</p>`
    ]
  },
  'c-goc': {
    title: 'GOC',
    pages: [
      `<h1>1. Electronic Effects</h1>
       <p>Inductive, Mesomeric, Hyperconjugation.</p>`,
       `<h1>2. Intermediates</h1>
       <p>Stability of Carbocations, Carbanions, Free Radicals.</p>`
    ]
  },
  'c-hydro': {
    title: 'Hydrocarbons',
    pages: [
      `<h1>1. Alkanes, Alkenes, Alkynes</h1>
       <p>Wurtz reaction, Markovnikov's rule, Ozonolysis.</p>`,
       `<h1>2. Aromatic Hydrocarbons</h1>
       <p>Benzene EAS reactions (Nitration, Friedel-Crafts).</p>`
    ]
  },
  'c-halo': {
    title: 'Haloalkanes',
    pages: [
      `<h1>1. SN1 vs SN2</h1>
       <p>SN1 (Carbocation, Racemization). SN2 (Transition state, Inversion).</p>`,
       `<h1>2. Elimination</h1>
       <p>E1 vs E2 mechanisms. Saytzeff rule.</p>`
    ]
  },
  'c-oxy': {
    title: 'Oxygen Compounds',
    pages: [
      `<h1>1. Alcohols & Phenols</h1>
       <p>Lucas test. Reimer-Tiemann reaction.</p>`,
       `<h1>2. Aldehydes & Ketones</h1>
       <p>Aldol Condensation, Cannizzaro Reaction.</p>`
    ]
  },
  'c-nitro': {
    title: 'Nitrogen Compounds',
    pages: [
      `<h1>1. Amines</h1>
       <p>Basicity order. Hoffmann Bromamide reaction.</p>`,
       `<h1>2. Diazonium Salts</h1>
       <p>Sandmeyer reaction. Coupling reactions.</p>`
    ]
  },
  'c-bio': {
    title: 'Biomolecules',
    pages: [
      `<h1>1. Carbohydrates</h1>
       <p>Glucose structure. Glycosidic linkage.</p>`,
       `<h1>2. Proteins & Nucleic Acids</h1>
       <p>Amino acids, Peptide bonds. DNA/RNA structure.</p>`
    ]
  },
  'c-prac': {
    title: 'Practical Chemistry',
    pages: [
      `<h1>1. Salt Analysis</h1>
       <p>Cation groups and Anion tests.</p>`,
       `<h1>2. Titration</h1>
       <p>Acid-Base and Redox titrations.</p>`
    ]
  },

  // ================= MATHS (14 Units) =================
  'm-sets': {
    title: 'Sets, Relations & Functions',
    pages: [
      `<h1>1. Sets & Relations</h1>
       <p>Types of relations: Reflexive, Symmetric, Transitive (Equivalence).</p>`,
       `<h1>2. Functions</h1>
       <p>Domain, Range. One-One, Onto functions. Inverses.</p>`
    ]
  },
  'm-complex': {
    title: 'Complex Numbers',
    pages: [
      `<h1>1. Algebra</h1>
       <p>Modulus, Argument. Triangle Inequality.</p>`,
       `<h1>2. Geometry</h1>
       <p>Cube roots of unity. Rotation theorem. Locus problems.</p>`
    ]
  },
  'm-matrices': {
    title: 'Matrices & Determinants',
    pages: [
      `<h1>1. Matrices</h1>
       <p>Types, Transpose, Adjoint, Inverse. System of equations.</p>`,
       `<h1>2. Determinants</h1>
       <p>Properties. Cramer's Rule.</p>`
    ]
  },
  'm-pnc': {
    title: 'Permutations & Combinations',
    pages: [
      `<h1>1. Basics</h1>
       <p>nPr, nCr. Fundamental Principle of Counting.</p>`,
       `<h1>2. Applications</h1>
       <p>Circular permutation. Derangements. Distribution of objects.</p>`
    ]
  },
  'm-bino': {
    title: 'Binomial Theorem',
    pages: [
      `<h1>1. Expansion</h1>
       <div class="formula-box">(x+y)ⁿ = Σ nCr x^(n-r) y^r</div>`,
       `<h1>2. Properties</h1>
       <p>Sum of coefficients. Middle term. Greatest term.</p>`
    ]
  },
  'm-seq': {
    title: 'Sequence & Series',
    pages: [
      `<h1>1. AP, GP, HP</h1>
       <p>nth term and Sum formulas. AM-GM-HM inequality.</p>`,
       `<h1>2. Special Series</h1>
       <p>Sigma notation. Method of differences.</p>`
    ]
  },
  'm-limits': {
    title: 'Limits & Continuity',
    pages: [
      `<h1>1. Limits</h1>
       <p>L'Hospital Rule. 1^∞ form. Standard limits.</p>`,
       `<h1>2. Continuity & Differentiability</h1>
       <p>Conditions for continuity. Relationship with differentiability.</p>`
    ]
  },
  'm-aod': {
    title: 'Applications of Derivatives',
    pages: [
      `<h1>1. Tangents & Normals</h1>
       <p>Equation of tangent/normal.</p>`,
       `<h1>2. Monotonicity & Maxima/Minima</h1>
       <p>Increasing/Decreasing functions. First/Second derivative tests.</p>`
    ]
  },
  'm-integral': {
    title: 'Integral Calculus',
    pages: [
      `<h1>1. Indefinite Integration</h1>
       <p>Substitution, By Parts, Partial Fractions.</p>`,
       `<h1>2. Definite Integration</h1>
       <p>Properties (King's Property). Area under curves.</p>`
    ]
  },
  'm-diffeq': {
    title: 'Differential Equations',
    pages: [
      `<h1>1. First Order</h1>
       <p>Variable Separable. Homogeneous. Linear Differential Equation (LDE).</p>`
    ]
  },
  'm-coord': {
    title: 'Coordinate Geometry',
    pages: [
      `<h1>1. Straight Lines & Circles</h1>
       <p>Slope forms. Distance formulas. Tangents to circles.</p>`,
       `<h1>2. Conics</h1>
       <p>Parabola, Ellipse, Hyperbola. Standard equations and tangents.</p>`
    ]
  },
  'm-3d': {
    title: '3D Geometry',
    pages: [
      `<h1>1. Lines & Planes</h1>
       <p>Direction Cosines. Equation of Line and Plane. Shortest distance.</p>`
    ]
  },
  'm-vector': {
    title: 'Vector Algebra',
    pages: [
      `<h1>1. Dot & Cross Product</h1>
       <p>Scalar product (Work). Vector product (Torque).</p>`,
       `<h1>2. Triple Products</h1>
       <p>Scalar Triple Product (Volume). Vector Triple Product.</p>`
    ]
  },
  'm-stats': {
    title: 'Statistics & Probability',
    pages: [
      `<h1>1. Statistics</h1>
       <p>Mean, Variance, Standard Deviation.</p>`,
       `<h1>2. Probability</h1>
       <p>Conditional Probability. Bayes Theorem. Binomial Distribution.</p>`
    ]
  },
  'm-trigo': {
    title: 'Trigonometry',
    pages: [
      `<h1>1. Identities & Equations</h1>
       <p>Sum/Difference formulas. General solutions of equations.</p>`,
       `<h1>2. Solution of Triangles</h1>
       <p>Sine Rule, Cosine Rule.</p>`
    ]
  }
};

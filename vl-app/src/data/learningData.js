// ============================================================
// Virtual Labs — Learning Platform Data
// ============================================================

export const SUBJECTS = [
  {
    id: 'computer-science',
    title: 'Computer Science',
    icon: '💻',
    gradient: 'from-blue-600 to-indigo-700',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    description: 'Explore algorithms, data structures, programming and computation through interactive simulations.',
  },
  {
    id: 'chemistry',
    title: 'Chemistry',
    icon: '🧪',
    gradient: 'from-purple-600 to-violet-700',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    description: 'Understand chemical reactions, molecular structures and analytical lab techniques.',
  },
  {
    id: 'physics',
    title: 'Physics',
    icon: '⚛️',
    gradient: 'from-cyan-600 to-blue-700',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    description: 'Discover laws of nature — from Newtonian mechanics to optics and electromagnetism.',
  },
  {
    id: 'biology',
    title: 'Biology',
    icon: '🔬',
    gradient: 'from-emerald-600 to-green-700',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    description: 'Explore living systems, cell biology, genetics and the molecular basis of life.',
  },
  {
    id: 'mathematics',
    title: 'Mathematics',
    icon: '📐',
    gradient: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    description: 'Visualize calculus, algebra, linear transformations and statistical models.',
  },
  {
    id: 'electronics',
    title: 'Electronics',
    icon: '⚡',
    gradient: 'from-rose-500 to-red-600',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    description: 'Build circuits, understand signals, logic gates and electronic components.',
  },
  {
    id: 'chemical-science',
    title: 'Chemical Science',
    icon: '🧪',
    gradient: 'from-teal-600 to-cyan-700',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    description: 'Explore chemical systems, molecular reactions, and physical chemistry principles.',
  },
];

export const LABS = [
  // Computer Science
  { id: 'data-structures', subjectId: 'computer-science', title: 'Data Structures Lab', description: 'Master arrays, stacks, queues, trees and graphs through interactive simulations', icon: '🗂️', experimentCount: 4 },
  { id: 'algorithms',      subjectId: 'computer-science', title: 'Algorithms Lab',       description: 'Visualize sorting, searching and graph traversal algorithms step by step',  icon: '🔍', experimentCount: 3 },
  { id: 'computer-org',    subjectId: 'computer-science', title: 'Computer Organization Lab', description: 'Explore CPU architecture, memory hierarchy and instruction execution', icon: '🖥️', experimentCount: 3 },
  // Chemistry
  { id: 'organic-chem', subjectId: 'chemistry', title: 'Organic Chemistry Lab',   description: 'Explore organic reactions, mechanisms and molecular structures',   icon: '⚗️', experimentCount: 4 },
  { id: 'analytical',   subjectId: 'chemistry', title: 'Analytical Chemistry Lab', description: 'Learn titration, chromatography and spectroscopic analysis',       icon: '🧫', experimentCount: 3 },
  // Physics
  { id: 'mechanics',    subjectId: 'physics', title: 'Mechanics Lab',              description: 'Study Newton\'s laws, projectile motion and energy conservation',   icon: '🎯', experimentCount: 4 },
  { id: 'optics',       subjectId: 'physics', title: 'Optics Lab',                description: 'Explore reflection, refraction, lenses and wave phenomena',        icon: '🔭', experimentCount: 3 },
  { id: 'electricity',  subjectId: 'physics', title: 'Electricity & Magnetism Lab', description: 'Understand electric fields, circuits and magnetic forces',       icon: '🔋', experimentCount: 3 },
  // Biology
  { id: 'cell-biology', subjectId: 'biology', title: 'Cell Biology Lab', description: 'Explore cell structure, organelles and cellular processes',  icon: '🦠', experimentCount: 4 },
  { id: 'genetics',     subjectId: 'biology', title: 'Genetics Lab',      description: 'Understand DNA, heredity, mutation and genetic engineering', icon: '🧬', experimentCount: 3 },
  // Mathematics
  { id: 'calculus',       subjectId: 'mathematics', title: 'Calculus Lab',       description: 'Visualize derivatives, integrals and limits interactively', icon: '📊', experimentCount: 4 },
  { id: 'linear-algebra', subjectId: 'mathematics', title: 'Linear Algebra Lab', description: 'Explore vectors, matrices, eigenvalues and transformations',  icon: '📐', experimentCount: 3 },
  // Electronics
  { id: 'basic-circuits',    subjectId: 'electronics', title: 'Basic Electronics Lab',    description: 'Build and analyse fundamental electronic circuits',          icon: '💡', experimentCount: 4 },
  { id: 'digital-circuits',  subjectId: 'electronics', title: 'Digital Electronics Lab',  description: 'Implement logic gates, flip-flops and digital systems',     icon: '🔌', experimentCount: 3 },
  // Chemical Science
  { id: 'physical-chemistry', subjectId: 'chemical-science', title: 'Physical Chemistry Virtual Lab', description: 'Explore spectrophotometry, cryoscopy, ebullioscopy and EMF measurement.', icon: '⚗️', experimentCount: 4 },
];

export const EXPERIMENTS = [
  // Data Structures
  { id: 'stack-ops',   labId: 'data-structures', title: 'Stack Operations',        description: 'Understand LIFO principle through push, pop and peek operations',          duration: '45 min', difficulty: 'Beginner' },
  { id: 'queue-ops',   labId: 'data-structures', title: 'Queue Operations',        description: 'Explore FIFO principle with enqueue and dequeue operations',               duration: '45 min', difficulty: 'Beginner' },
  { id: 'linked-list', labId: 'data-structures', title: 'Linked List Traversal',   description: 'Navigate through singly and doubly linked lists',                         duration: '60 min', difficulty: 'Intermediate' },
  { id: 'bst',         labId: 'data-structures', title: 'Binary Search Tree',      description: 'Perform insertion, deletion and traversal on BST',                        duration: '75 min', difficulty: 'Intermediate' },
  // Algorithms
  { id: 'bubble-sort',    labId: 'algorithms', title: 'Bubble Sort Visualization', description: 'Step-by-step visualization of bubble sort algorithm',                     duration: '30 min', difficulty: 'Beginner' },
  { id: 'binary-search',  labId: 'algorithms', title: 'Binary Search',             description: 'Understand divide-and-conquer in binary search',                          duration: '30 min', difficulty: 'Beginner' },
  { id: 'dijkstra',       labId: 'algorithms', title: "Dijkstra's Shortest Path",  description: 'Find shortest paths in a weighted graph',                                 duration: '90 min', difficulty: 'Advanced' },
  // Mechanics
  { id: 'projectile',       labId: 'mechanics', title: 'Projectile Motion',            description: 'Analyse the trajectory of a projectile under gravity',                duration: '45 min', difficulty: 'Beginner' },
  { id: 'simple-harmonic',  labId: 'mechanics', title: 'Simple Harmonic Motion',       description: 'Study oscillation in springs and pendulums',                          duration: '60 min', difficulty: 'Intermediate' },
  { id: 'collision',        labId: 'mechanics', title: 'Elastic & Inelastic Collisions', description: 'Conservation of momentum in different collision types',              duration: '60 min', difficulty: 'Intermediate' },
  { id: 'free-fall',        labId: 'mechanics', title: 'Free Fall & Gravity',          description: 'Measure gravitational acceleration experimentally',                    duration: '45 min', difficulty: 'Beginner' },
  // Optics
  { id: 'snells-law',  labId: 'optics', title: "Snell's Law of Refraction",        description: 'Verify the relationship between angles of incidence and refraction',      duration: '45 min', difficulty: 'Beginner' },
  { id: 'convex-lens', labId: 'optics', title: 'Convex Lens & Focal Length',       description: 'Determine focal length of a convex lens using image formation',          duration: '60 min', difficulty: 'Intermediate' },
  { id: 'double-slit', labId: 'optics', title: "Young's Double Slit Experiment",   description: 'Demonstrate wave nature of light through interference patterns',          duration: '75 min', difficulty: 'Advanced' },
  // Organic Chemistry
  { id: 'esterification',    labId: 'organic-chem', title: 'Esterification Reaction',   description: 'Synthesis of esters from alcohols and carboxylic acids',            duration: '60 min', difficulty: 'Intermediate' },
  { id: 'aldol-condensation', labId: 'organic-chem', title: 'Aldol Condensation',       description: 'Study carbonyl chemistry and C-C bond formation',                   duration: '90 min', difficulty: 'Advanced' },
  // Cell Biology
  { id: 'mitosis',  labId: 'cell-biology', title: 'Mitosis & Cell Division', description: 'Observe stages of mitosis in plant and animal cells',                         duration: '60 min', difficulty: 'Beginner' },
  { id: 'osmosis',  labId: 'cell-biology', title: 'Osmosis & Diffusion',     description: 'Movement of molecules across semi-permeable membranes',                       duration: '45 min', difficulty: 'Beginner' },
  // Calculus
  { id: 'derivatives', labId: 'calculus', title: 'Derivatives & Tangent Lines', description: 'Visualize derivatives as slopes of tangent lines to curves',               duration: '45 min', difficulty: 'Intermediate' },
  { id: 'riemann',     labId: 'calculus', title: 'Riemann Sum & Integration',   description: 'Approximate definite integrals using Riemann sums',                       duration: '60 min', difficulty: 'Intermediate' },
  // Electronics
  { id: 'ohms-law',   labId: 'basic-circuits',   title: "Ohm's Law Verification", description: 'Verify voltage-current-resistance relationship',                         duration: '45 min', difficulty: 'Beginner' },
  { id: 'wheatstone', labId: 'basic-circuits',   title: 'Wheatstone Bridge',      description: 'Measure unknown resistance using a balanced bridge circuit',             duration: '60 min', difficulty: 'Intermediate' },
  { id: 'logic-gates', labId: 'digital-circuits', title: 'Basic Logic Gates',     description: 'Implement and verify AND, OR, NOT, NAND, NOR, XOR gates',               duration: '45 min', difficulty: 'Beginner' },
  { id: 'flip-flops',  labId: 'digital-circuits', title: 'SR and D Flip-Flops',   description: 'Understand sequential logic and memory elements',                       duration: '60 min', difficulty: 'Intermediate' },
  // Physical Chemistry
  { id: 'spectrophotometry',   labId: 'physical-chemistry', title: 'Spectrophotometry',   description: 'Measure the absorption of light by a chemical substance as a function of wavelength.', duration: '60 min', difficulty: 'Intermediate' },
  { id: 'cryoscopy',          labId: 'physical-chemistry', title: 'Cryoscopy',          description: 'Determine the depression of freezing point to calculate molecular mass.', duration: '60 min', difficulty: 'Intermediate' },
  { id: 'ebullioscopy',       labId: 'physical-chemistry', title: 'Ebullioscopy',       description: 'Determine the elevation of boiling point of a solvent due to a solute.',  duration: '60 min', difficulty: 'Intermediate' },
  { id: 'emf-measurement',    labId: 'physical-chemistry', title: 'EMF Measurement',    description: 'Measure electromotive force of galvanic cells to study thermodynamics.',  duration: '60 min', difficulty: 'Advanced' },
];

// ── Detailed Experiment Content ────────────────────────────────
const DEFAULT_CONTENT = {
  aim: 'To study and understand the fundamental concepts of this experiment through interactive simulation, observation and hands-on virtual exploration.',
  theory: `## Background\n\nThis experiment is designed to reinforce classroom concepts through interactive virtual simulation. Students should read the theory carefully before proceeding.\n\n## Key Concepts\n\n- Fundamental principles governing this experiment\n- Mathematical models and governing equations\n- Real-world applications and significance in engineering/science\n\n## Instructions\n\nComplete the **Pretest** to assess prior knowledge, then interact with the **Simulation**, and finally take the **Posttest** to assess what you learned.`,
  pretest: [
    { id: 1, question: 'What is the best way to approach a virtual lab experiment?', options: ['Skip theory directly to simulation', 'Read theory, do pretest, simulate, do posttest', 'Only watch the animation', 'Complete without reading instructions'], correct: 1 },
    { id: 2, question: 'What does a virtual lab simulation help you do?', options: ['Memorise formulas', 'Visualise and interact with abstract concepts', 'Complete assignments faster', 'Replace textbooks entirely'], correct: 1 },
  ],
  procedure: [
    'Read the Aim and Theory sections carefully before starting.',
    'Complete the Pretest to assess your prior knowledge.',
    'Open the Simulation panel and familiarise yourself with all the controls.',
    'Follow the on-screen instructions in the simulation step by step.',
    'Adjust parameters and observe how outcomes change.',
    'Record your observations and measurements.',
    'Complete the Posttest to consolidate your understanding.',
    'Submit Feedback to help improve the virtual lab.',
  ],
  posttest: [
    { id: 1, question: 'What was the primary learning outcome of this experiment?', options: ['Memorising the formula', 'Understanding the concept through interactive observation', 'Completing the lab record', 'None of the above'], correct: 1 },
  ],
  references: [
    { title: 'Virtual Labs — MHRD, Govt. of India', url: 'https://vlabs.ac.in', type: 'web' },
    { title: 'NPTEL Online Courses', url: 'https://nptel.ac.in', type: 'web' },
  ],
  contributors: [
    { name: 'Virtual Labs Consortium', role: 'Development Team', institution: 'IIT / NIT Partners, India' },
  ],
};

export const EXPERIMENT_CONTENT = {
  'stack-ops': {
    aim: 'To study and implement the fundamental operations of a Stack data structure — Push, Pop, and Peek — and understand the Last-In, First-Out (LIFO) principle through interactive simulation.',
    theory: `## What is a Stack?\n\nA **Stack** is a linear data structure that follows the **Last-In, First-Out (LIFO)** principle. The last element added is always the first one removed — like a pile of plates.\n\n## Core Operations\n\n| Operation | Description | Time Complexity |\n|---|---|---|\n| **Push** | Add element to top | O(1) |\n| **Pop** | Remove element from top | O(1) |\n| **Peek** | View top element | O(1) |\n| **isEmpty** | Check if stack is empty | O(1) |\n\n## Real-World Applications\n\n1. **Function call stack** — Tracks active subroutines in programs\n2. **Undo/Redo** — Text editors use stacks for undo history\n3. **Expression parsing** — Bracket matching, postfix evaluation\n4. **Browser history** — Back button navigation\n5. **DFS traversal** — Depth-first search in graphs\n\n## Stack Overflow vs Underflow\n\n- **Stack Overflow**: Pushing to a full stack\n- **Stack Underflow**: Popping from an empty stack`,
    pretest: [
      { id: 1, question: 'Which principle does a Stack data structure follow?', options: ['FIFO', 'LIFO', 'FILO', 'Random Access'], correct: 1 },
      { id: 2, question: 'Which operation adds an element to the top of a stack?', options: ['Pop', 'Peek', 'Push', 'Insert'], correct: 2 },
      { id: 3, question: 'What is the time complexity of the Push operation?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correct: 2 },
    ],
    procedure: [
      'Note the maximum capacity of the stack shown in the simulation (default: 5).',
      'Type a value in the "Element" input field (e.g., 10) and click Push.',
      'Observe how the element appears at the top of the stack visualisation.',
      'Push 4 more elements (20, 30, 40, 50) and watch the stack fill up.',
      'Click Pop and observe which element is removed first — verify it is the last pushed.',
      'Use Peek to view the current top element without removing it.',
      'Try pushing an element when the stack is full — observe the "Stack Overflow" message.',
      'Pop all elements and try popping again — observe the "Stack Underflow" message.',
      'Reset the simulation and repeat with a different sequence.',
      'Record observations and confirm the LIFO principle is maintained throughout.',
    ],
    posttest: [
      { id: 1, question: 'If elements A, B, C are pushed in order, what is popped first?', options: ['A', 'B', 'C', 'Random'], correct: 2 },
      { id: 2, question: 'What error occurs when you pop from an empty stack?', options: ['Stack Overflow', 'Stack Underflow', 'Null Pointer Exception', 'Segmentation Fault'], correct: 1 },
      { id: 3, question: 'Which traversal algorithm naturally uses a stack?', options: ['Breadth-First Search', 'Depth-First Search', 'Dijkstra\'s Algorithm', 'Prim\'s Algorithm'], correct: 1 },
    ],
    references: [
      { title: 'Introduction to Algorithms — Cormen, Leiserson, Rivest & Stein', url: '#', type: 'book' },
      { title: 'Data Structures Using C — Aaron Tenenbaum', url: '#', type: 'book' },
      { title: 'GeeksForGeeks: Stack Data Structure', url: 'https://www.geeksforgeeks.org/stack-data-structure/', type: 'web' },
      { title: 'Visualgo: Stack Visualisation', url: 'https://visualgo.net/en/list', type: 'web' },
    ],
    contributors: [
      { name: 'Prof. Ramesh Kumar', role: 'Principal Investigator', institution: 'IIT Bombay' },
      { name: 'Dr. Sunita Sharma', role: 'Co-Investigator', institution: 'NIT Calicut' },
      { name: 'Arjun Menon', role: 'Developer', institution: 'CDAC Thiruvananthapuram' },
    ],
  },

  'projectile': {
    aim: 'To study projectile motion by analysing the trajectory of an object launched at different angles and velocities, and to verify the equations of motion under uniform gravitational acceleration.',
    theory: `## Projectile Motion\n\nA **projectile** is an object thrown into space upon which only the force of **gravity** acts. The path followed is a **parabola**.\n\n## Equations of Motion\n\n**Horizontal (no acceleration):**\n- x = u·cos θ · t\n\n**Vertical (gravitational acceleration g = 9.8 m/s²):**\n- y = u·sin θ · t − ½g·t²\n- vy = u·sin θ − g·t\n\n## Key Quantities\n\n| Quantity | Formula |\n|---|---|\n| **Time of Flight** | T = 2u·sin θ / g |\n| **Max Height** | H = u²·sin²θ / 2g |\n| **Range** | R = u²·sin 2θ / g |\n\n## Maximum Range\n\nRange is **maximum at 45°** launch angle.`,
    pretest: [
      { id: 1, question: 'What is the shape of a projectile\'s trajectory?', options: ['Circle', 'Straight line', 'Parabola', 'Ellipse'], correct: 2 },
      { id: 2, question: 'At what angle is the horizontal range maximum?', options: ['30°', '45°', '60°', '90°'], correct: 1 },
      { id: 3, question: 'Which force acts on a projectile during flight?', options: ['Normal force', 'Friction', 'Gravity', 'Magnetic force'], correct: 2 },
    ],
    procedure: [
      'Set the initial velocity (e.g., 20 m/s) using the velocity slider.',
      'Set the launch angle to 30° and click Launch.',
      'Observe and record the maximum height and horizontal range.',
      'Repeat for angles 45°, 60°, and 75°.',
      'Compare the ranges and identify which angle gives maximum range.',
      'Change the initial velocity to 30 m/s and repeat for 45°.',
      'Verify that range is proportional to u² using your recorded values.',
      'Plot angle vs. range on graph paper and identify the parabolic relationship.',
    ],
    posttest: [
      { id: 1, question: 'If you double the initial velocity, the range becomes:', options: ['Same', 'Double', 'Four times', 'Half'], correct: 2 },
      { id: 2, question: 'Which component of velocity remains constant throughout the flight?', options: ['Vertical', 'Horizontal', 'Both', 'Neither'], correct: 1 },
      { id: 3, question: 'At the highest point of the trajectory, vertical velocity is:', options: ['Maximum', 'Equal to horizontal velocity', 'Zero', 'Negative'], correct: 2 },
    ],
    references: [
      { title: 'Concepts of Physics — H.C. Verma', url: '#', type: 'book' },
      { title: 'University Physics — Young & Freedman', url: '#', type: 'book' },
      { title: 'PhET: Projectile Motion Simulation', url: 'https://phet.colorado.edu/en/simulations/projectile-motion', type: 'web' },
    ],
    contributors: [
      { name: 'Prof. Anita Desai', role: 'Principal Investigator', institution: 'IIT Madras' },
      { name: 'Ravi Shankar', role: 'Developer', institution: 'NIT Trichy' },
    ],
  },

  'spectrophotometry': {
    aim: 'To verify Beer-Lambert\'s Law and determine the concentration of an unknown solution using a virtual spectrophotometer.',
    theory: `## Spectrophotometry\n\n**Spectrophotometry** is a method to measure how much a chemical substance absorbs light by measuring the intensity of light as a beam of light passes through sample solution.\n\n## Beer-Lambert Law\n\nThe fundamental law governing spectrophotometry is the **Beer-Lambert Law**:\n\n$$A = \\epsilon \\cdot c \\cdot l$$\n\nWhere:\n- **A** = Absorbance (no units)\n- **$\\epsilon$** = Molar absorptivity (L·mol⁻¹·cm⁻¹)\n- **c** = Concentration of the solute (mol·L⁻¹)\n- **l** = Path length of the cuvette (cm)\n\n## Key Components of a Spectrophotometer\n\n1. **Light Source** — Provides light of various wavelengths.\n2. **Monochromator** — Selects a specific wavelength of light.\n3. **Sample Holder** — Holds the cuvette with solution.\n4. **Detector** — Measures the intensity of transmitted light.`,
    pretest: [
      { id: 1, question: 'What does Beer-Lambert\'s Law relate absorbance to?', options: ['Temperature', 'Concentration and path length', 'Pressure', 'Solubility'], correct: 1 },
      { id: 2, question: 'Which component of a spectrophotometer selects a single wavelength of light?', options: ['Light source', 'Monochromator', 'Cuvette', 'Detector'], correct: 1 },
    ],
    procedure: [
      'Turn on the virtual spectrophotometer and allow it to warm up.',
      'Select the target wavelength ($\lambda_{max}$) for your sample.',
      'Insert a blank cuvette containing only the solvent to calibrate the instrument to zero absorbance.',
      'Prepare a series of standard solutions with known concentrations.',
      'Measure the absorbance of each standard solution and record the values.',
      'Plot absorbance vs. concentration to obtain the calibration curve.',
      'Measure the absorbance of the unknown solution.',
      'Use the calibration curve (or Beer-Lambert equation) to calculate the unknown concentration.',
    ],
    posttest: [
      { id: 1, question: 'If the concentration of a solution is doubled, what happens to its absorbance?', options: ['Remains the same', 'It is halved', 'It is doubled', 'It increases exponentially'], correct: 2 },
      { id: 2, question: 'Why is a blank solution used in spectrophotometry?', options: ['To clean the machine', 'To subtract any absorbance caused by the solvent/cuvette', 'To increase signal sensitivity', 'To dilute the sample'], correct: 1 },
    ],
    references: [
      { title: 'Vogel\'s Textbook of Quantitative Chemical Analysis', url: '#', type: 'book' },
      { title: 'Spectrophotometry: Principles and Applications', url: 'https://en.wikipedia.org/wiki/Spectrophotometry', type: 'web' },
    ],
    contributors: [
      { name: 'Dr. Amit Patel', role: 'Subject Matter Expert', institution: 'IIT Delhi' },
    ],
  },

  'cryoscopy': {
    aim: 'To determine the molecular weight of a non-volatile solute by measuring the freezing point depression of a solvent.',
    theory: `## Cryoscopy (Freezing Point Depression)\n\n**Cryoscopy** is the study of freezing point depression in liquid solvents when non-volatile solutes are dissolved. It is a **colligative property** — meaning it depends only on the number of solute particles, not their chemical identity.\n\n## Mathematical Model\n\nThe freezing point depression is given by:\n\n$$\\Delta T_f = T_f^{\\text{solvent}} - T_f^{\\text{solution}} = K_f \\cdot m \\cdot i$$\n\nWhere:\n- **$\\Delta T_f$** = Depression in freezing point\n- **$K_f$** = Cryoscopic constant (molal freezing point depression constant)\n- **$m$** = Molality of the solution (moles of solute / kg of solvent)\n- **$i$** = van 't Hoff factor (number of ions per formula unit)\n\n## Finding Molecular Mass ($M_2$)\n\n$$M_2 = \\frac{K_f \\cdot w_2 \\cdot 1000}{\\Delta T_f \\cdot w_1}$$\n\nWhere $w_2$ is mass of solute, and $w_1$ is mass of solvent.`,
    pretest: [
      { id: 1, question: 'Why does adding solute depress the freezing point of a solvent?', options: ['It decreases the solvent\'s chemical potential / vapor pressure', 'It raises the boiling point', 'It makes the solution colder', 'It prevents molecules from moving'], correct: 0 },
      { id: 2, question: 'Molality is defined as:', options: ['Moles of solute per liter of solution', 'Moles of solute per kg of solvent', 'Grams of solute per liter of solution', 'Moles of solvent per kg of solute'], correct: 1 },
    ],
    procedure: [
      'Weigh a precise quantity of pure solvent (e.g. benzene or water) and place it in the cryoscopic tube.',
      'Insert the thermometer and stirrer, then place the tube into a freezing mixture.',
      'Record the temperature of the pure solvent at regular intervals (e.g., every 30 seconds) until it freezes and the temperature stabilizes.',
      'Melt the solvent, add a weighed amount of non-volatile solute, and stir to dissolve completely.',
      'Repeat the cooling process, recording the temperature of the solution at regular intervals.',
      'Determine the freezing points of both pure solvent and solution from their respective cooling curves.',
      'Calculate $\\Delta T_f$ and use the cryoscopy formula to determine the molecular weight of the solute.',
    ],
    posttest: [
      { id: 1, question: 'Which of the following is a colligative property?', options: ['Viscosity', 'Freezing point depression', 'Refractive index', 'Surface tension'], correct: 1 },
      { id: 2, question: 'For a non-electrolyte solute, the van \'t Hoff factor (i) is:', options: ['0', '1', '2', 'Depends on concentration'], correct: 1 },
    ],
    references: [
      { title: 'Physical Chemistry — Peter Atkins & Julio de Paula', url: '#', type: 'book' },
    ],
    contributors: [
      { name: 'Dr. Amit Patel', role: 'Subject Matter Expert', institution: 'IIT Delhi' },
    ],
  },

  'ebullioscopy': {
    aim: 'To determine the molecular weight of a non-volatile solute using ebullioscopy (elevation of boiling point).',
    theory: `## Ebullioscopy (Boiling Point Elevation)\n\n**Ebullioscopy** is the measurement of the boiling point elevation of a liquid solvent when a non-volatile solute is dissolved. This is a colligative property.\n\n## Mathematical Model\n\nThe boiling point elevation is defined as:\n\n$$\\Delta T_b = T_b^{\\text{solution}} - T_b^{\\text{solvent}} = K_b \\cdot m \\cdot i$$\n\nWhere:\n- **$\\Delta T_b$** = Elevation of boiling point\n- **$K_b$** = Ebullioscopic constant (molal boiling point elevation constant)\n- **$m$** = Molality of the solution\n- **$i$** = van \'t Hoff factor`,
    pretest: [
      { id: 1, question: 'What happens to the vapor pressure of a liquid when a non-volatile solute is added?', options: ['Increases', 'Decreases', 'Remains unchanged', 'Fluctuates randomly'], correct: 1 },
    ],
    procedure: [
      'Pour a measured volume of pure solvent into the ebulliometer.',
      'Heat the solvent to boiling and record its steady boiling point temperature ($T_b^{\\text{solvent}}$).',
      'Cool the apparatus slightly, add a precisely weighed amount of solute, and stir to dissolve.',
      'Reheat the solution and record the new steady boiling point temperature ($T_b^{\\text{solution}}$).',
      'Calculate the elevation of boiling point $\\Delta T_b$.',
      'Calculate the molecular weight of the solute using the ebullioscopy equation.',
    ],
    posttest: [
      { id: 1, question: 'Ebullioscopic constant is also known as:', options: ['Molal depression constant', 'Molal elevation constant', 'Gas constant', 'Cryoscopic constant'], correct: 1 },
    ],
    references: [
      { title: 'Physical Chemistry — Peter Atkins & Julio de Paula', url: '#', type: 'book' },
    ],
    contributors: [
      { name: 'Dr. Amit Patel', role: 'Subject Matter Expert', institution: 'IIT Delhi' },
    ],
  },

  'emf-measurement': {
    aim: 'To measure the Electromotive Force (EMF) of a galvanic cell and evaluate the thermodynamic parameters of the cell reaction.',
    theory: `## EMF Measurement & Thermodynamics\n\nThe **Electromotive Force (EMF)** of a electrochemical cell is the maximum potential difference between the electrodes of the cell when no current is flowing.\n\n## Nernst Equation\n\n$$E = E^\\circ - \\frac{RT}{nF} \\ln Q$$\n\nAt 298 K, this simplifies to:\n\n$$E = E^\\circ - \\frac{0.0592}{n} \\log_{10} Q$$\n\n## Thermodynamic Relations\n\n1. **Gibbs Free Energy Change ($\\Delta G$):**\n   $$\\Delta G = -nFE_{\\text{cell}}$$\n\n2. **Entropy Change ($\\Delta S$):**\n   $$\\Delta S = nF \\left( \\frac{\\partial E}{\\partial T} \\right)_P$$\n\n3. **Enthalpy Change ($\\Delta H$):**\n   $$\\Delta H = \\Delta G + T\\Delta S$$`,
    pretest: [
      { id: 1, question: 'An electrochemical cell convert chemical energy into:', options: ['Heat energy', 'Electrical energy', 'Nuclear energy', 'Mechanical energy'], correct: 1 },
      { id: 2, question: 'In the Nernst equation, what does "n" represent?', options: ['Number of moles of reactants', 'Number of electrons transferred', 'Molality of solution', 'Temperature in Celsius'], correct: 1 },
    ],
    procedure: [
      'Prepare two half-cells (e.g., zinc in $ZnSO_4$ and copper in $CuSO_4$) of known concentrations.',
      'Connect the two half-cells using a salt bridge to allow ion flow.',
      'Connect the electrodes to a high-impedance digital potentiometer / voltmeter.',
      'Record the stable EMF reading of the cell ($E_{\\text{cell}}$) at room temperature.',
      'Vary the concentrations of the electrolyte solutions to observe the change in EMF and verify the Nernst Equation.',
      'Measure EMF at different temperatures using a water bath to determine the temperature coefficient $(\\partial E / \\partial T)_P$.',
      'Calculate thermodynamic quantities: $\\Delta G$, $\\Delta S$, and $\\Delta H$.',
    ],
    posttest: [
      { id: 1, question: 'What happens to the cell potential (EMF) when a cell reaches equilibrium?', options: ['It becomes maximum', 'It becomes zero', 'It remains constant at $E^\\circ$', 'It becomes negative'], correct: 1 },
      { id: 2, question: 'The function of a salt bridge in a galvanic cell is to:', options: ['Provide electrical connection and maintain electrical neutrality', 'Increase the voltage of the cell', 'Speed up the oxidation reaction', 'Filter out impurities'], correct: 0 },
    ],
    references: [
      { title: 'Modern Electrochemistry — Bockris & Reddy', url: '#', type: 'book' },
    ],
    contributors: [
      { name: 'Dr. Amit Patel', role: 'Subject Matter Expert', institution: 'IIT Delhi' },
    ],
  },

  default: DEFAULT_CONTENT,
};

// ── Helpers ────────────────────────────────────────────────────
export const getSubject      = (id) => SUBJECTS.find((s) => s.id === id);
export const getLabsBySubject = (subjectId) => LABS.filter((l) => l.subjectId === subjectId);
export const getLab          = (id) => LABS.find((l) => l.id === id);
export const getExperimentsByLab = (labId) => EXPERIMENTS.filter((e) => e.labId === labId);
export const getExperiment   = (id) => EXPERIMENTS.find((e) => e.id === id);
export const getExperimentContent = (id) => EXPERIMENT_CONTENT[id] || EXPERIMENT_CONTENT.default;
export const getLabForExperiment = (expId) => {
  const exp = getExperiment(expId);
  return exp ? getLab(exp.labId) : null;
};
export const getSubjectForLab = (labId) => {
  const lab = getLab(labId);
  return lab ? getSubject(lab.subjectId) : null;
};

export const DIFFICULTY_STYLE = {
  Beginner:     'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-amber-500/20  text-amber-400  border-amber-500/30',
  Advanced:     'bg-red-500/20    text-red-400    border-red-500/30',
};

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

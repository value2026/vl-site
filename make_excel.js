const XLSX = require('xlsx');

// Create a new workbook
const wb = XLSX.utils.book_new();

// --- Sheet 1: Students ---
const studentsData = [
  ['Name of the institute :'],
  ['Name of the co-ordinator :'],
  ['Total no of students:'],
  [],
  [
    'SI No',
    'Institute ID',
    'Name of student (Without any special characters)',
    'Email ID',
    'Gender (M/F)',
    'Contact Number',
    'UG/PG',
    'Course name\n[eg: ME, EEE, Physics, Chemistry etc.]',
    'Year of Join',
    'Optional: USER ID of the faculty under which the student should be assigned (please mention the name of faculty if you are requesting login ID for the first time)'
  ]
];

const wsStudents = XLSX.utils.aoa_to_sheet(studentsData);

// Set column widths for better readability
wsStudents['!cols'] = [
  { wch: 10 }, // SI No
  { wch: 15 }, // Institute ID
  { wch: 45 }, // Name of student
  { wch: 30 }, // Email ID
  { wch: 12 }, // Gender
  { wch: 15 }, // Contact Number
  { wch: 10 }, // UG/PG
  { wch: 35 }, // Course name
  { wch: 12 }, // Year of Join
  { wch: 100 } // Optional USER ID
];

XLSX.utils.book_append_sheet(wb, wsStudents, "Students");

// --- Sheet 2: Faculty ---
const facultyData = [
  ['Name of the institute :'],
  ['Name of the co-ordinator :'],
  [],
  [
    'SI No',
    'Name of faculty member',
    'Gender (M/F)',
    'Designation',
    'Course(UG/PG)',
    'Branch taught',
    'Batch(I,II,III year) taught',
    'Email address',
    'Contact no'
  ]
];

const wsFaculty = XLSX.utils.aoa_to_sheet(facultyData);

wsFaculty['!cols'] = [
  { wch: 10 }, // SI No
  { wch: 35 }, // Name of faculty member
  { wch: 12 }, // Gender
  { wch: 20 }, // Designation
  { wch: 15 }, // Course
  { wch: 25 }, // Branch taught
  { wch: 25 }, // Batch taught
  { wch: 30 }, // Email address
  { wch: 15 }  // Contact no
];

XLSX.utils.book_append_sheet(wb, wsFaculty, "Faculty");

// Save the file to public directory
XLSX.writeFile(wb, 'vl-app/public/login_id_template.xlsx');
console.log('Template generated at vl-app/public/login_id_template.xlsx');

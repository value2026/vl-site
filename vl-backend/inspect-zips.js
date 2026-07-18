const AdmZip = require('adm-zip');
const path = require('path');

const docZipPath = path.join(__dirname, 'sample', 'sample-doc', 'doc1.zip');
const simZipPath = path.join(__dirname, 'sample', 'sample-simulation', 'cybersecuriry-exp1.zip');

function inspectZip(zipPath, name) {
  try {
    console.log(`\n=== Inspecting ${name} (${zipPath}) ===`);
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    console.log(`Total entries: ${entries.length}`);
    
    // Print first 15 entries
    entries.slice(0, 15).forEach(e => {
      console.log(`- ${e.entryName} ${e.isDirectory ? '[DIR]' : `(${e.header.size} bytes)`}`);
    });
    if (entries.length > 15) {
      console.log(`... and ${entries.length - 15} more entries`);
    }
  } catch (err) {
    console.error(`Error reading ${name}:`, err.message);
  }
}

inspectZip(docZipPath, 'Documentation Zip');
inspectZip(simZipPath, 'Simulation Zip');

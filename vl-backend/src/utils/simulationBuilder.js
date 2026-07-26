const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const PUBLIC_UPLOADS = path.join(__dirname, '..', '..', 'uploads');

/**
 * Ensures index.html is located at the root of the target simulation directory.
 * If index.html is nested inside a wrapper folder or build/dist directory, its contents are moved up to the root.
 */
function ensureRootIndexHtml(dir) {
  if (!fs.existsSync(dir)) return;
  const rootIndex = path.join(dir, 'index.html');
  if (fs.existsSync(rootIndex)) return;

  const findIndexRecursive = (currentDir, depth = 0) => {
    if (depth > 4) return null;
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      if (item.toLowerCase() === 'index.html') {
        return path.join(currentDir, item);
      }
    }
    for (const item of items) {
      const full = path.join(currentDir, item);
      if (fs.statSync(full).isDirectory()) {
        const found = findIndexRecursive(full, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };

  const foundIndex = findIndexRecursive(dir);
  if (foundIndex) {
    const parentDir = path.dirname(foundIndex);
    console.log(`📦 SimulationBuilder: Found index.html inside "${parentDir}". Moving contents up to root "${dir}"...`);
    for (const item of fs.readdirSync(parentDir)) {
      const src = path.join(parentDir, item);
      const dst = path.join(dir, item);
      if (src !== dst) {
        fs.cpSync(src, dst, { recursive: true, force: true });
      }
    }
    // Clean up the empty parent directory if it's not the root itself
    try {
      if (parentDir !== dir && fs.existsSync(parentDir)) {
        fs.rmSync(parentDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.warn('Warning: Could not remove old wrapper directory after moving files:', e.message);
    }
  } else {
    console.warn(`⚠️ Warning: No index.html found in uploaded simulation package at "${dir}".`);
  }
}

/**
 * Deploys an uploaded simulation ZIP package by extracting it and ensuring index.html is at the root.
 * @param {string} zipFilePath - Path to the uploaded zip file
 * @param {string} outputSubDir - Target sub-directory relative to uploads/ (e.g. experiments/{id}/simulation)
 */
async function compileSimulation(zipFilePath, outputSubDir) {
  const zip = new AdmZip(zipFilePath);
  const targetDir = path.join(PUBLIC_UPLOADS, outputSubDir);

  console.log(`✅ Simulation Deployer: Extracting simulation build package to: ${targetDir}`);
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  zip.extractAllTo(targetDir, true);
  ensureRootIndexHtml(targetDir);

  console.log('✅ Simulation Deployer: Static simulation build deployed successfully!');
  return outputSubDir.replace(/\\/g, '/');
}

module.exports = {
  compileSimulation,
  ensureRootIndexHtml
};

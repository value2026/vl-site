const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const AdmZip = require('adm-zip');

const BUILDER_DIR = path.join(__dirname, '..', '..', 'simulation-builder');
const PUBLIC_UPLOADS = path.join(__dirname, '..', '..', 'uploads');

const packageJsonContent = {
  name: "simulation-builder",
  private: true,
  version: "0.0.0",
  type: "module",
  scripts: {
    build: "vite build"
  },
  dependencies: {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "redux": "^5.0.1",
    "react-redux": "^9.1.2",
    "bootstrap": "^5.3.3",
    "three": "^0.166.1",
    "@react-three/fiber": "^8.16.8",
    "@react-three/cannon": "^6.6.0",
    "@fortawesome/react-fontawesome": "^0.2.2",
    "@fortawesome/free-solid-svg-icons": "^6.5.2",
    "@reduxjs/toolkit": "^2.2.5",
    "@mui/material": "^5.15.20",
    "@mui/icons-material": "^5.15.20",
    "@emotion/react": "^11.11.4",
    "@emotion/styled": "^11.11.5",
    "@react-three/drei": "^9.106.0",
    "@react-spring/three": "^9.7.3",
    "md5": "^2.3.0",
    "react-spinners": "^0.13.8",
    "react-syntax-highlighter": "^15.5.0"
  },
  devDependencies: {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.1"
  }
};

const viteConfigContent = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative path resolutions inside iframe
  build: {
    emptyOutDir: true
  }
})
`;

const indexHtmlContent = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Simulation</title>
    <script>
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'INIT_GA') {
          var measurementId = event.data.measurementId;
          if (window.gaInitialized) return;
          window.gaInitialized = true;
          var script = document.createElement('script');
          script.async = true;
          script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
          document.head.appendChild(script);
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', measurementId, { debug_mode: true });
        }
      });
    </script>
  </head>
  <body style="margin: 0; padding: 0; overflow: hidden; background-color: #3CA4AB;">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

/**
 * Initializes the compiler workspace if not present.
 */
function ensureBuilderInitialized() {
  if (!fs.existsSync(BUILDER_DIR)) {
    fs.mkdirSync(BUILDER_DIR, { recursive: true });
  }

  const pJsonPath = path.join(BUILDER_DIR, 'package.json');
  const viteConfigPath = path.join(BUILDER_DIR, 'vite.config.js');
  const indexHtmlPath = path.join(BUILDER_DIR, 'index.html');

  // Always write package.json to stay in sync with dependencies
  fs.writeFileSync(pJsonPath, JSON.stringify(packageJsonContent, null, 2));

  if (!fs.existsSync(viteConfigPath)) {
    fs.writeFileSync(viteConfigPath, viteConfigContent);
  }
  if (!fs.existsSync(indexHtmlPath)) {
    fs.writeFileSync(indexHtmlPath, indexHtmlContent);
  }

  // Check if node_modules exists or is missing the new packages
  const nodeModulesPath = path.join(BUILDER_DIR, 'node_modules');
  const muiPath = path.join(nodeModulesPath, '@mui');
  const md5Path = path.join(nodeModulesPath, 'md5');
  const highlighterPath = path.join(nodeModulesPath, 'react-syntax-highlighter');

  if (!fs.existsSync(nodeModulesPath) || !fs.existsSync(muiPath) || !fs.existsSync(md5Path) || !fs.existsSync(highlighterPath)) {
    console.log('🏗️ SimulationBuilder: Workspace dependencies missing or outdated. Installing dependencies (this may take a few seconds)...');
    try {
      execSync('npm install --no-audit --no-fund', { cwd: BUILDER_DIR, stdio: 'inherit' });
      console.log('✅ SimulationBuilder: Workspace dependencies updated successfully!');
    } catch (err) {
      console.error('❌ SimulationBuilder: Failed to install workspace dependencies.', err.message);
    }
  }
}

/**
 * Compiles a raw React simulation ZIP file and outputs static build files.
 * @param {string} zipFilePath - Path to the uploaded zip file
 * @param {string} outputSubDir - Target sub-directory relative to uploads/ (e.g. experiments/{id}/simulation)
 */
async function compileSimulation(zipFilePath, outputSubDir) {
  const zip = new AdmZip(zipFilePath);
  const targetDir = path.join(PUBLIC_UPLOADS, outputSubDir);

  // Check if index.html is present in the root of the uploaded zip
  const hasIndexHtml = zip.getEntries().some(e => e.entryName === 'index.html');

  if (hasIndexHtml) {
    console.log(`✅ SimulationBuilder: Pre-compiled static HTML simulation detected. Direct extraction to: ${targetDir}`);
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });

    zip.extractAllTo(targetDir, true);
    console.log('✅ SimulationBuilder: Static simulation deployed successfully!');
    return outputSubDir.replace(/\\/g, '/');
  }

  // Fallback to Vite compiler for React source zip uploads
  ensureBuilderInitialized();

  const srcDir = path.join(BUILDER_DIR, 'src');
  
  // 1. Clean previous source files
  if (fs.existsSync(srcDir)) {
    fs.rmSync(srcDir, { recursive: true, force: true });
  }
  fs.mkdirSync(srcDir, { recursive: true });

  // 2. Extract uploaded zip file into src/
  console.log(`🏗️ SimulationBuilder: Extracting simulation code from ${zipFilePath} into ${srcDir}`);
  zip.extractAllTo(srcDir, true);

  // 2.5 Scan extracted files for missing npm dependencies
  console.log('🏗️ SimulationBuilder: Scanning source code for external dependencies...');
  try {
    const pkgJsonPath = path.join(BUILDER_DIR, 'package.json');
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    let packageChanged = false;

    // Recursive file walker
    const walkFiles = (dir, filesList = []) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          walkFiles(filePath, filesList);
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
          filesList.push(filePath);
        }
      }
      return filesList;
    };

    const sourceFiles = walkFiles(srcDir);
    const discoveredPackages = new Set();

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const importMatches = content.match(/import\s+.*\s+from\s+['"]([^.'"]+)['"]/g) || [];
      const dynamicMatches = content.match(/import\(['"]([^.'"]+)['"]\)/g) || [];
      
      const allImports = [...importMatches, ...dynamicMatches];
      for (const imp of allImports) {
        const cleanMatch = imp.match(/['"]([^'"]+)['"]/);
        if (cleanMatch && cleanMatch[1]) {
          const importPath = cleanMatch[1];
          if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
            let basePkg = '';
            if (importPath.startsWith('@')) {
              basePkg = importPath.split('/').slice(0, 2).join('/');
            } else {
              basePkg = importPath.split('/')[0];
            }
            if (basePkg) discoveredPackages.add(basePkg);
          }
        }
      }
    }

    // Add missing packages to package.json
    for (const pkg of discoveredPackages) {
      if (!pkgJson.dependencies[pkg] && !pkgJson.devDependencies[pkg] && pkg !== 'react' && pkg !== 'react-dom') {
        console.log(`➕ SimulationBuilder: Discovered missing dependency "${pkg}". Adding to package.json...`);
        pkgJson.dependencies[pkg] = 'latest';
        packageChanged = true;
      }
    }

    if (packageChanged) {
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
      console.log('🏗️ SimulationBuilder: Running npm install to fetch newly discovered dependencies...');
      execSync('npm install --no-audit --no-fund', { cwd: BUILDER_DIR, stdio: 'pipe' });
      console.log('✅ SimulationBuilder: New dependencies installed successfully!');
    }
  } catch (err) {
    console.warn('⚠️ SimulationBuilder: Dependency scanner encountered an error, proceeding with build:', err.message);
  }

  // 3. Trigger Vite Build
  console.log('🏗️ SimulationBuilder: Running Vite build...');
  try {
    execSync('npm run build', { cwd: BUILDER_DIR, stdio: 'pipe' });
    console.log('✅ SimulationBuilder: Vite build successful!');
  } catch (err) {
    const buildErrorLog = err.stderr ? err.stderr.toString() : err.message;
    console.error('❌ SimulationBuilder: Build failed.', buildErrorLog);
    throw new Error(`Simulation compilation failed: ${buildErrorLog}`);
  }

  // 4. Move built files to output destination
  const distDir = path.join(BUILDER_DIR, 'dist');

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy dist contents to targetDir
  console.log(`🏗️ SimulationBuilder: Copying build assets from ${distDir} to ${targetDir}`);
  fs.cpSync(distDir, targetDir, { recursive: true });
  console.log('✅ SimulationBuilder: Simulation deployed successfully!');
  
  return outputSubDir.replace(/\\/g, '/');
}

// Pre-initialize workspace on boot/require has been removed to prevent blocking server startup
// ensureBuilderInitialized();

module.exports = {
  compileSimulation,
};

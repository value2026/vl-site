const { PrismaClient } = require('../src/generated/client');
const fs = require('fs');
const path = require('path');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function linkUploads() {
  const prisma = new PrismaClient();
  try {
    console.log('🔗 Scanning uploads/ directory to auto-link content and simulations...');

    const experiments = await prisma.experiment.findMany({ include: { lab: true } });

    console.log(`Found ${experiments.length} total experiments in database.`);

    const uploadsDir = __dirname;
    
    function scanDir(dir, relativePath = '') {
      if (!fs.existsSync(dir)) return [];
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      const hasContent = items.some(i => i.isDirectory() && i.name === 'content');
      const hasSim = items.some(i => i.isDirectory() && (i.name === 'simulation' || i.name === 'sim-root'));

      if (hasContent || hasSim) {
        const folderName = path.basename(dir);
        
        const match = experiments.find(exp => {
          if (folderName === exp.id || relativePath.includes(exp.id)) return true;
          const titleSlug = slugify(exp.title);
          const folderSlug = slugify(folderName);
          const cleanTitle = titleSlug.replace(/-/g, '');
          const cleanFolder = folderSlug.replace(/-/g, '');
          return titleSlug.includes(folderSlug) || folderSlug.includes(titleSlug) || cleanTitle.includes(cleanFolder) || cleanFolder.includes(cleanTitle);
        });

        if (match) {
          let targetRelPath = relativePath.replace(/\\/g, '/');
          const cleanIdPath = `labs/${match.labId}/${match.id}`;
          if (targetRelPath !== cleanIdPath) {
            const targetAbsDir = path.join(uploadsDir, 'labs', match.labId, match.id);
            console.log(`📦 Migrating folder "${targetRelPath}" -> "${cleanIdPath}"...`);
            if (!fs.existsSync(targetAbsDir)) {
              fs.mkdirSync(targetAbsDir, { recursive: true });
            }
            for (const item of fs.readdirSync(dir)) {
              const src = path.join(dir, item);
              const dst = path.join(targetAbsDir, item);
              fs.cpSync(src, dst, { recursive: true, force: true });
            }
            try {
              fs.rmSync(dir, { recursive: true, force: true });
            } catch (e) {
              console.warn('Warning: Could not remove old folder after migration:', e.message);
            }
            targetRelPath = cleanIdPath;
          }

          // Write human-readable meta.json files for easy identification
          try {
            const labMetaDir = path.join(uploadsDir, 'labs', match.labId);
            if (!fs.existsSync(labMetaDir)) fs.mkdirSync(labMetaDir, { recursive: true });
            fs.writeFileSync(path.join(labMetaDir, 'meta.json'), JSON.stringify({ labId: match.labId, labTitle: match.lab?.title || '' }, null, 2));

            const expMetaDir = path.join(uploadsDir, 'labs', match.labId, match.id);
            if (!fs.existsSync(expMetaDir)) fs.mkdirSync(expMetaDir, { recursive: true });
            fs.writeFileSync(path.join(expMetaDir, 'meta.json'), JSON.stringify({ experimentId: match.id, experimentTitle: match.title, labId: match.labId, labTitle: match.lab?.title || '' }, null, 2));
          } catch (e) {
            console.warn('Warning: Could not write meta.json files:', e.message);
          }

          const updateData = {};
          if (hasContent) {
            updateData.contentPath = `${targetRelPath}/content`;
          }
          if (hasSim) {
            const simFolderName = items.find(i => i.isDirectory() && (i.name === 'simulation' || i.name === 'sim-root')).name;
            
            // If it's sim-root, the actual HTML is inside sim-root/simulation
            if (simFolderName === 'sim-root' && fs.existsSync(path.join(dir, 'sim-root', 'simulation'))) {
              updateData.simulationPath = `${targetRelPath}/sim-root/simulation`;
            } else {
              updateData.simulationPath = `${targetRelPath}/${simFolderName}`;
            }
          }

          console.log(`✅ Matched [${match.title}] to folder "${targetRelPath}" ->`, updateData);
          return { matchId: match.id, updateData };
        }
      }

      const updates = [];
      for (const item of items) {
        if (item.isDirectory() && item.name !== 'content' && item.name !== 'simulation' && item.name !== 'sim-root') {
          const subDirPath = path.join(dir, item.name);
          const subRelPath = relativePath ? `${relativePath}/${item.name}` : item.name;
          const res = scanDir(subDirPath, subRelPath);
          if (Array.isArray(res)) {
            updates.push(...res);
          } else if (res) {
            updates.push(res);
          }
        }
      }
      return updates;
    }

    const foundUpdates = scanDir(uploadsDir);

    for (const u of foundUpdates) {
      await prisma.experiment.update({
        where: { id: u.matchId },
        data: u.updateData
      });
    }

    function removeEmptyDirs(dirPath) {
      if (!fs.existsSync(dirPath)) return;
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          removeEmptyDirs(fullPath);
        }
      }
      if (dirPath !== uploadsDir && fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`🧹 Removed empty directory: ${path.relative(uploadsDir, dirPath)}`);
      }
    }
    removeEmptyDirs(uploadsDir);

    console.log(`🎉 Auto-linking complete! Updated ${foundUpdates.length} experiments in database.`);
  } catch (err) {
    console.error('Error in linkUploads:', err);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  linkUploads();
}

module.exports = linkUploads;

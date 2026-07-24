const fs = require('fs');
const path = require('path');
const prisma = require('./src/db');

function parseTextData(rawContent) {
  // Join multiline quoted fields into single lines
  const normalizedContent = rawContent.replace(/"([^"]*)"/g, (match, p1) => '"' + p1.replace(/\r?\n/g, ' ') + '"');
  const lines = normalizedContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Determine delimiter: tab (\t) or comma (,)
  const firstLine = lines[0];
  const isTab = firstLine.includes('\t');
  const delimiter = isTab ? '\t' : ',';

  // Check if first line is header
  const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase());
  const hasHeader = headers.some(h => h.includes('institute') || h.includes('college') || h.includes('name'));

  const startIndex = hasHeader ? 1 : 0;
  const results = [];

  for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 2) continue;

    // Header layout: Sl No | College ID | Institute Name | college abrivation | Created date
    let legacyId = null;
    let name = '';
    let code = '';
    let oldCreatedAt = '';

    if (hasHeader) {
      const collegeIdIdx = headers.findIndex(h => h.includes('college id') || h.includes('college_id') || h.includes('id'));
      const nameIdx = headers.findIndex(h => h.includes('institute') || h.includes('name'));
      const codeIdx = headers.findIndex(h => h.includes('abrivation') || h.includes('abbreviation') || h.includes('code'));
      const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('created'));

      if (nameIdx !== -1 && cols[nameIdx]) name = cols[nameIdx];
      if (collegeIdIdx !== -1 && cols[collegeIdIdx]) legacyId = cols[collegeIdIdx];
      if (codeIdx !== -1 && cols[codeIdx]) code = cols[codeIdx];
      if (dateIdx !== -1 && cols[dateIdx]) oldCreatedAt = cols[dateIdx];
    } else {
      if (cols.length >= 5) {
        legacyId = cols[1];
        name = cols[2];
        code = cols[3];
        oldCreatedAt = cols[4];
      } else if (cols.length >= 3) {
        legacyId = cols[0];
        name = cols[1];
        code = cols[2];
      } else {
        name = cols[0];
      }
    }

    if (name) {
      results.push({ legacyId, name, code, oldCreatedAt });
    }
  }

  return results;
}

async function importColleges() {
  const filePath = process.argv[2] || path.join(__dirname, 'data', 'colleges.tsv');
  const fallbackJsonPath = path.join(__dirname, 'data', 'colleges.json');
  const fallbackCsvPath = path.join(__dirname, 'data', 'colleges.csv');

  let targetPath = filePath;
  if (!fs.existsSync(targetPath)) {
    if (fs.existsSync(fallbackCsvPath)) targetPath = fallbackCsvPath;
    else if (fs.existsSync(fallbackJsonPath)) targetPath = fallbackJsonPath;
    else {
      console.error(`❌ Colleges file not found. Place your data in:`);
      console.error(`   - ${path.join(__dirname, 'data', 'colleges.tsv')} (copied from Excel)`);
      console.error(`   - ${path.join(__dirname, 'data', 'colleges.csv')}`);
      console.error(`   - ${path.join(__dirname, 'data', 'colleges.json')}`);
      process.exit(1);
    }
  }

  console.log(`📦 Loading legacy colleges from: ${targetPath}`);
  const raw = fs.readFileSync(targetPath, 'utf8');

  let colleges = [];
  if (targetPath.endsWith('.json')) {
    colleges = JSON.parse(raw);
  } else {
    colleges = parseTextData(raw);
  }

  console.log(`🏛️ Found ${colleges.length} institutions to import...`);

  let importedCount = 0;
  for (const c of colleges) {
    try {
      const parsedLegacyId = c.legacyId ? parseInt(c.legacyId, 10) : null;
      
      let existing = await prisma.institution.findFirst({
        where: {
          OR: [
            { name: c.name },
            ...(parsedLegacyId ? [{ legacyId: parsedLegacyId }] : [])
          ]
        }
      });

      if (existing) {
        await prisma.institution.update({
          where: { id: existing.id },
          data: {
            name: c.name,
            code: c.code || null,
            legacyId: parsedLegacyId,
            oldCreatedAt: c.oldCreatedAt || null,
            isActive: true
          }
        });
      } else {
        await prisma.institution.create({
          data: {
            name: c.name,
            code: c.code || null,
            legacyId: parsedLegacyId,
            oldCreatedAt: c.oldCreatedAt || null,
            isActive: true
          }
        });
      }

      importedCount++;
      console.log(`  ✅ [ID: ${parsedLegacyId || 'N/A'}] ${c.name} (${c.code || 'No code'})`);
    } catch (err) {
      console.error(`  ❌ Error importing "${c.name}":`, err.message);
    }
  }

  console.log(`\n🎉 Successfully imported/updated ${importedCount} institutions!`);
}

importColleges()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

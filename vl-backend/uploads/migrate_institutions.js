const fs = require('fs');
const path = require('path');

module.exports = async function migrateInstitutions(prisma) {
  const tsvPath = path.join(__dirname, 'colleges.tsv');
  const migratedTsvPath = path.join(__dirname, 'colleges_migrated.tsv');

  if (!fs.existsSync(tsvPath)) {
    return;
  }

  console.log('🚀 Found colleges.tsv in uploads! Starting institution migration...');
  const csv = require('csv-parser');
  const BATCH_SIZE = 500;
  
  // Find an admin user to act as the "Creator" for these bulk uploads
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  const createdById = adminUser ? adminUser.id : null;
  
  await new Promise((resolve, reject) => {
    let currentBatch = [];
    let totalProcessed = 0;
    let totalInserted = 0;
    let failedRows = [];

    const processBatch = async (batchToProcess) => {
      try {
        const result = await prisma.institution.createMany({
          data: batchToProcess,
          skipDuplicates: true
        });
        totalInserted += result.count;
      } catch (error) {
        console.error('❌ Database batch insert error for institutions:', error.message);
      }
    };

    const stream = fs.createReadStream(tsvPath)
      .pipe(csv({ 
        separator: '\t',
        mapHeaders: ({ header }) => header.trim() 
      }));

    stream.on('data', async (row) => {
      totalProcessed++;

      try {
        const name = row['Institute Name']?.trim();
        const collegeId = row['College ID']?.trim() || null;
        const code = row['college abrivation']?.trim() || null;

        if (!name) {
          failedRows.push({ row, reason: 'Missing Institute Name' });
          return;
        }

        currentBatch.push({
          name,
          collegeId,
          code,
          createdById, // Automatically assigned to the admin user
          isActive: true
        });

        if (currentBatch.length >= BATCH_SIZE) {
          stream.pause();
          const batchCopy = [...currentBatch];
          currentBatch = [];
          processBatch(batchCopy).then(() => stream.resume());
        }
      } catch (err) {
        failedRows.push({ row, reason: err.message });
      }
    });

    stream.on('end', async () => {
      if (currentBatch.length > 0) {
        await processBatch(currentBatch);
      }
      console.log('✅ Institution Migration Complete!');
      console.log(`📊 Total rows processed: ${totalProcessed}`);
      console.log(`🎉 Successfully inserted: ${totalInserted}`);
      console.log(`⚠️  Skipped (duplicates/errors): ${totalProcessed - totalInserted}`);
      
      if (failedRows.length > 0) {
        fs.writeFileSync(path.join(__dirname, 'failed_institution_migrations.json'), JSON.stringify(failedRows, null, 2));
      }

      // Rename file so it doesn't run again on next restart
      try {
         if (fs.existsSync(migratedTsvPath)) {
             fs.unlinkSync(migratedTsvPath);
         }
         fs.renameSync(tsvPath, migratedTsvPath);
         console.log('📁 Renamed colleges.tsv to colleges_migrated.tsv to prevent re-running.');
      } catch (e) {
         console.log('Could not rename file, you may need to delete it manually.');
      }
      resolve();
    });

    stream.on('error', reject);
  });
};

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

module.exports = async function migrateStudents(prisma) {
  const studentCsvPath = path.join(__dirname, 'student.csv');
  const migratedCsvPath = path.join(__dirname, 'student_migrated.csv');

  if (!fs.existsSync(studentCsvPath)) {
    return;
  }

  console.log('🚀 Found student.csv in uploads! Starting automatic migration...');
  const csv = require('csv-parser');
  const BATCH_SIZE = 1000;
  
  // Build a fast lookup map for Institutions
  const allInstitutions = await prisma.institution.findMany({
    select: { id: true, collegeId: true }
  });
  const collegeIdMap = new Map();
  allInstitutions.forEach(inst => {
    if (inst.collegeId) {
      collegeIdMap.set(inst.collegeId, inst.id);
    }
  });
  
  await new Promise((resolve, reject) => {
    let currentBatch = [];
    let totalProcessed = 0;
    let totalInserted = 0;
    let failedRows = [];

    const processBatch = async (batchRows) => {
      try {
        let toInsert = [];
        for (const row of batchRows) {
          totalProcessed++;
          try {
            const username = row['Username']?.trim();
            const firstName = row['Firstname']?.trim() || '';
            const lastName = row['LastName']?.trim() || '';
            const name = `${firstName} ${lastName}`.trim();
            let email = row['email id']?.trim().toLowerCase();
            const dept = row['Specialization/Class']?.trim() || null;
            const org = row['College/School']?.trim() || 'Virtual Labs Partner';
            const studentId = row['university id']?.trim() || null;
            const plainTextPassword = row['Password']?.trim() || 'default_password';
            
            const schoolId = row['School id']?.trim() || row['College ID']?.trim() || null;
            const nodalCentreId = schoolId ? collegeIdMap.get(schoolId) || null : null;
            
            if (!email || !name || !username) {
              failedRows.push({ row, reason: 'Missing required fields' });
              continue;
            }

            // This is asynchronous! It yields the event loop and won't freeze your computer!
            const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

            toInsert.push({
              username,
              name,
              email,
              password: hashedPassword,
              role: 'student',
              isActive: true,
              dept,
              org,
              studentId,
              country: 'India',
              course: null,
              yearSemester: null,
              batch: null,
              section: null,
              mobile: null,
              nodalCentreId,
            });
          } catch (err) {
            failedRows.push({ row, reason: err.message });
          }
        }

        if (toInsert.length > 0) {
          const result = await prisma.user.createMany({
            data: toInsert,
            skipDuplicates: true
          });
          totalInserted += result.count;
          console.log(`✅ Progress: Inserted ${totalInserted} students so far...`);
        }
      } catch (error) {
        console.error('❌ Database batch insert error:', error.message);
      }
    };

    const stream = fs.createReadStream(studentCsvPath)
      .pipe(csv({ 
        separator: '\t',
        mapHeaders: ({ header }) => header.trim() 
      }));

    stream.on('data', (row) => {
      currentBatch.push(row);
      if (currentBatch.length >= BATCH_SIZE) {
        stream.pause();
        const batchCopy = [...currentBatch];
        currentBatch = [];
        processBatch(batchCopy).then(() => stream.resume());
      }
    });

    stream.on('end', async () => {
      if (currentBatch.length > 0) {
        await processBatch(currentBatch);
      }
      console.log('✅ Migration Complete!');
      console.log(`📊 Total rows processed: ${totalProcessed}`);
      console.log(`🎉 Successfully inserted: ${totalInserted}`);
      console.log(`⚠️  Skipped (duplicates/errors): ${totalProcessed - totalInserted}`);
      
      if (failedRows.length > 0) {
        fs.writeFileSync(path.join(__dirname, 'failed_migrations.json'), JSON.stringify(failedRows, null, 2));
        console.log('📄 A log of failed rows has been saved to: uploads/failed_migrations.json');
      }

      // Rename file so it doesn't run again on next restart
      try {
         if (fs.existsSync(migratedCsvPath)) {
             fs.unlinkSync(migratedCsvPath);
         }
         fs.renameSync(studentCsvPath, migratedCsvPath);
         console.log('📁 Renamed student.csv to student_migrated.csv to prevent re-running.');
      } catch (e) {
         console.log('Could not rename file, you may need to delete it manually.');
      }
      resolve();
    });

    stream.on('error', reject);
  });
};

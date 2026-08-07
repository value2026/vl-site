const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../src/generated/client');

const prisma = new PrismaClient();

// The path to your CSV file
const argsFilePath = process.argv[2];
const CSV_FILE_PATH = argsFilePath 
  ? path.resolve(process.cwd(), argsFilePath)
  : path.join(__dirname, '..', 'data', 'student.csv');

// How many records to process and insert at once
const BATCH_SIZE = 1000;

async function runMigration() {
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ Error: CSV file not found at ${CSV_FILE_PATH}`);
    console.error('Please place your old_students.csv file in the vl-backend folder and try again.');
    process.exit(1);
  }

  console.log('🚀 Starting Student Migration...');
  
  let batch = [];
  let totalProcessed = 0;
  let successCount = 0;
  let failedRows = [];

  const processBatch = async (currentBatch) => {
    try {
      // Create users in DB
      const result = await prisma.user.createMany({
        data: currentBatch,
        skipDuplicates: true, // If the email/username exists, it skips it safely
      });
      successCount += result.count;
    } catch (error) {
      console.error('❌ Database batch insert error:', error.message);
      failedRows.push({ batch: currentBatch, error: error.message });
    }
  };

  const stream = fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv({ 
      separator: '\t',
      mapHeaders: ({ header }) => header.trim() 
    }));

    for await (const row of stream) {
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
        
        if (!email || !name || !username) {
          failedRows.push({ row, reason: 'Missing required fields (Username, Name, or Email)' });
          continue;
        }

      // We hash the password synchronously. Using salt round 10 is fast enough and secure.
      const hashedPassword = bcrypt.hashSync(plainTextPassword, 10);

      batch.push({
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
      });

      // If batch is full, process it
      if (batch.length >= BATCH_SIZE) {
        const currentBatch = [...batch];
        batch = [];
        console.log(`Processing batch... (Total processed so far: ${totalProcessed})`);
        await processBatch(currentBatch);
      }

    } catch (err) {
      failedRows.push({ row, reason: err.message });
    }
  }

  // Process the final batch
  if (batch.length > 0) {
    console.log(`Processing final batch of ${batch.length}...`);
    await processBatch(batch);
  }

  console.log('\n✅ Migration Complete!');
  console.log(`📊 Total rows processed: ${totalProcessed}`);
  console.log(`🎉 Successfully inserted: ${successCount}`);
  console.log(`⚠️  Skipped (duplicates/errors): ${totalProcessed - successCount}`);

  if (failedRows.length > 0) {
    const failedPath = path.join(__dirname, '..', 'failed_migrations.json');
    fs.writeFileSync(failedPath, JSON.stringify(failedRows, null, 2));
    console.log(`\n📄 A log of failed rows has been saved to: vl-backend/failed_migrations.json`);
  }

  await prisma.$disconnect();
}

runMigration().catch(e => {
  console.error(e);
  process.exit(1);
});

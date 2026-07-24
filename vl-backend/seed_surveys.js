async function main() {
  const { seedPage } = require('./src/controllers/pagesController.js');
  
  const mockRes = {
    json: (data) => console.log('Seeded:', data.slug),
    status: (code) => ({ json: (err) => console.error(code, err) })
  };
  
  await seedPage({ params: { slug: 'student-survey' } }, mockRes);
  await seedPage({ params: { slug: 'faculty-survey' } }, mockRes);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

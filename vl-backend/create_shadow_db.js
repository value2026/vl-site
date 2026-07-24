const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:5435/postgres"
  });

  try {
    await client.connect();
    console.log('Connected to postgres database');
    await client.query('CREATE DATABASE shadow_db');
    console.log('Successfully created database shadow_db');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database shadow_db already exists');
    } else {
      console.error('Error creating database shadow_db:', err);
    }
  } finally {
    await client.end();
  }
}

main();

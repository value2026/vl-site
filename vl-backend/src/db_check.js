const prisma = require('./db');

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true
    }
  });
  console.log("USERS:", JSON.stringify(users, null, 2));
}

main().catch(err => {
  console.error("ERROR:", err);
});

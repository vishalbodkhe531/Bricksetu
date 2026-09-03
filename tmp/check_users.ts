import { prisma } from '../lib/prisma';

async function main() {
  try {
    const users = await prisma.users.findMany();
    console.log('USERS_IN_DB:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

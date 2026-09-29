import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
try {
  const materials = await p.catalogue.findMany({ take: 10, select: { id: true, name: true, business_unit_id: true, is_active: true } });
  console.log('Materials in DB:', JSON.stringify(materials, null, 2));
  const users = await p.users.findMany({ take: 5, select: { id: true, email: true, business_unit_id: true, role: true, is_active: true } });
  console.log('Users in DB:', JSON.stringify(users, null, 2));
} catch(e) {
  console.error('Error:', e.message);
} finally {
  await p.$disconnect();
}

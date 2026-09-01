import bcrypt from 'bcryptjs';

const hash = '$2b$10$/ZgZjdR.1ZgGLGjPqsL88seV.vCgwcQK00DbLpcLEzYBopTMtyerI2';
const candidates = [
  'admin123',
  'Admin123',
  'Admin@123',
  'password',
  'Password123',
  'admin',
  '123456',
  '12345678',
  'bricksetu',
  'bricksetu123',
];

for (const cand of candidates) {
  if (bcrypt.compareSync(cand, hash)) {
    console.log('MATCH_FOUND:', cand);
  }
}

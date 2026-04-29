const bcrypt = require('bcryptjs');
const hash = '$2a$06$hAWbe6BuBaRG50aVGp8G2esji'; // Use the full hash from your DB
const password = '12345';

bcrypt.compare(password, hash, (err, res) => {
  if (err) throw err;
  console.log('Password matches:', res);
});

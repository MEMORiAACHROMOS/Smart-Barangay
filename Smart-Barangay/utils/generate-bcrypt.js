const bcrypt = require('bcryptjs');
const password = '12345';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Bcrypt hash for 12345:', hash);
});

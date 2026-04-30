// Password hashing utility - using web crypto API for browser-safe hashing
// Note: For production, use bcryptjs: npm install bcryptjs
// import bcrypt from 'bcryptjs';

// Simple hash function using Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// For production use with bcryptjs (uncomment and install bcryptjs):
/*
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
*/

// Verify password
async function verifyPassword(password, hash) {
  const hashAttempt = await hashPassword(password);
  return hashAttempt === hash;
}

export { hashPassword, verifyPassword };

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  // Fetch user from LoginTbl
  const { data: user, error } = await supabase
    .from('LoginTbl')
    .select('*')
    .eq('Username', username)
    .eq('Status', 'active')
    .single();

  if (error || !user) return res.status(401).json({ error: 'Invalid username or status' });

  // Compare password with bcrypt hash
  const match = await bcrypt.compare(password, user.PasswordHash);
  if (!match) return res.status(401).json({ error: 'Invalid password' });

  // Optionally update Last_Login here

  res.json({ success: true, user: { id: user.User_ID, username: user.Username, role: user.Role_ID } });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Login API running on port ${PORT}`));

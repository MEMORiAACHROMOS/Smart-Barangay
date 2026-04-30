// Supabase database utility for user management
// Handles all database operations for LoginTbl

const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Add a new user to the LoginTbl
 * @param {string} username - Username
 * @param {string} passwordHash - Hashed password
 * @param {string} role - User role (Admin, Nurse, Staff)
 * @param {string} status - User status (Active, Inactive)
 * @returns {Promise<Object>} - Result object with success status
 */
async function addUser(username, passwordHash, role, status = 'Active') {
  try {
    const { data, error } = await supabase
      .from('LoginTbl')
      .insert([
        {
          Username: username,
          PasswordHash: passwordHash,
          Role_ID: getRoleId(role),
          Status: status,
          Created_At: new Date(),
          Last_Login: null
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all users from LoginTbl
 * @returns {Promise<Object>} - Array of users or error
 */
async function getUsers() {
  try {
    const { data, error } = await supabase
      .from('LoginTbl')
      .select('*')
      .order('Created_At', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a single user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object>} - User object or error
 */
async function getUserByUsername(username) {
  try {
    const { data, error } = await supabase
      .from('LoginTbl')
      .select('*')
      .eq('Username', username)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user role
 * @param {number} userId - User ID
 * @param {string} role - New role (Admin, Nurse, Staff)
 * @returns {Promise<Object>} - Result object
 */
async function updateUserRole(userId, role) {
  try {
    const { data, error } = await supabase
      .from('LoginTbl')
      .update({ Role_ID: getRoleId(role) })
      .eq('User_ID', userId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating role:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user status
 * @param {number} userId - User ID
 * @param {string} status - New status (Active, Inactive)
 * @returns {Promise<Object>} - Result object
 */
async function updateUserStatus(userId, status) {
  try {
    const { data, error } = await supabase
      .from('LoginTbl')
      .update({ Status: status })
      .eq('User_ID', userId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a user
 * @param {number} userId - User ID to delete
 * @returns {Promise<Object>} - Result object
 */
async function deleteUser(userId) {
  try {
    const { error } = await supabase
      .from('LoginTbl')
      .delete()
      .eq('User_ID', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update last login timestamp
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Result object
 */
async function updateLastLogin(userId) {
  try {
    const { data, error } = await supabase
      .from('LoginTbl')
      .update({ Last_Login: new Date() })
      .eq('User_ID', userId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating last login:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get role ID from role name
 * @param {string} role - Role name (Admin, Nurse, Staff)
 * @returns {number} - Role ID
 */
function getRoleId(role) {
  const roles = {
    'Admin': 1,
    'Nurse': 2,
    'Staff': 3
  };
  return roles[role] || 3;
}

/**
 * Get role name from role ID
 * @param {number} roleId - Role ID
 * @returns {string} - Role name
 */
function getRoleName(roleId) {
  const roles = {
    1: 'Admin',
    2: 'Nurse',
    3: 'Staff'
  };
  return roles[roleId] || 'Staff';
}

export {
  addUser,
  getUsers,
  getUserByUsername,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  updateLastLogin,
  getRoleId,
  getRoleName
};

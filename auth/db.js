/**
 * auth/db.js
 * ──────────────────────────────────────────────────────────────
 * Simple file-based user storage. Replace with MongoDB/PostgreSQL in production.
 * ──────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { ROLES } = require('./config');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Initialize users file with default admin if it doesn't exist
 */
function initializeUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
      {
        id: uuidv4(),
        email: 'admin@ins.tn',
        name: 'Admin User',
        passwordHash: bcrypt.hashSync('admin123', 10),
        role: ROLES.ADMIN,
        provider: 'local',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  }
}

/**
 * Get all users
 */
function getAllUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      initializeUsersFile();
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Find user by email
 */
function findUserByEmail(email) {
  return getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Find user by ID
 */
function findUserById(id) {
  return getAllUsers().find(u => u.id === id);
}

/**
 * Create new user
 */
function createUser(data) {
  const users = getAllUsers();
  
  if (findUserByEmail(data.email)) {
    throw new Error('User with this email already exists');
  }

  const newUser = {
    id: uuidv4(),
    email: data.email.toLowerCase(),
    name: data.name,
    passwordHash: data.password ? bcrypt.hashSync(data.password, 10) : null,
    role: data.role || ROLES.VIEWER,
    provider: data.provider || 'local',
    googleId: data.googleId || null,
    facebookId: data.facebookId || null,
    twitterId: data.twitterId || null,
    githubId: data.githubId || null,
    profilePicture: data.profilePicture || null,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    isActive: true
  };

  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  const { passwordHash, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

/**
 * Verify password
 */
function verifyPassword(plainPassword, hash) {
  return bcrypt.compareSync(plainPassword, hash);
}

/**
 * Update user
 */
function updateUser(id, data) {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    throw new Error('User not found');
  }

  const updatedUser = {
    ...users[index],
    ...data,
    id: users[index].id, // Preserve ID
    createdAt: users[index].createdAt // Preserve creation date
  };

  users[index] = updatedUser;
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

/**
 * Update last login timestamp
 */
function updateLastLogin(id) {
  return updateUser(id, { lastLogin: new Date().toISOString() });
}

/**
 * Delete user
 */
function deleteUser(id) {
  const users = getAllUsers();
  const filtered = users.filter(u => u.id !== id);
  fs.writeFileSync(USERS_FILE, JSON.stringify(filtered, null, 2));
}

// Initialize on module load
initializeUsersFile();

module.exports = {
  getAllUsers,
  findUserByEmail,
  findUserById,
  createUser,
  verifyPassword,
  updateUser,
  updateLastLogin,
  deleteUser
};

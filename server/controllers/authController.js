const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../data/store');
const { JWT_SECRET } = require('../middleware/auth');

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please enter Email or Mobile Number and Password.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = store.data.users.find(u => 
      u.email.toLowerCase() === cleanIdentifier || 
      u.mobile === cleanIdentifier ||
      (u.employeeId && u.employeeId.toLowerCase() === cleanIdentifier)
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is currently inactive. Please contact Administrator.' });
    }

    let isMatch = false;
    // Check bcrypt hash or standard demo password
    if (password === 'admin123' || password === 'password123' || password === user.mobile) {
      isMatch = true;
    } else if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    store.logAudit(user.name, user.role, 'User Logged In', 'Authentication', `Logged in from ${req.ip || '127.0.0.1'}`, user.id);

    // Return safe user object
    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

const getProfile = (req, res) => {
  const { passwordHash, ...safeUser } = req.user;
  res.json({ success: true, user: safeUser });
};

const updateProfile = (req, res) => {
  const { name, mobile, email, address, avatar } = req.body;
  const user = store.data.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (name) user.name = name;
  if (mobile) user.mobile = mobile;
  if (email) user.email = email;
  if (address !== undefined) user.address = address;
  if (avatar !== undefined) user.avatar = avatar;

  store.save();
  store.logAudit(user.name, user.role, 'Updated Profile', 'User', 'Updated profile information', user.id);

  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, message: 'Profile updated successfully.', user: safeUser });
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = store.data.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let isMatch = false;
    if (currentPassword === 'admin123' || currentPassword === 'password123' || currentPassword === user.mobile) {
      isMatch = true;
    } else if (user.passwordHash) {
      isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    }

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    store.save();

    store.logAudit(user.name, user.role, 'Changed Password', 'Authentication', 'User successfully changed password', user.id);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
};

const forgotPassword = (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Please provide registered email or mobile number.' });
  }
  const cleanId = identifier.trim().toLowerCase();
  const user = store.data.users.find(u => u.email.toLowerCase() === cleanId || u.mobile === cleanId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'No registered account found with these details.' });
  }

  // Generate demo reset token/pin
  const tempPin = '123456';
  return res.json({
    success: true,
    message: `Password reset instructions and verification code sent to ${user.email}. (Demo PIN: ${tempPin})`,
    demoPin: tempPin,
    userId: user.id
  });
};

const resetPasswordWithPin = async (req, res) => {
  const { userId, pin, newPassword } = req.body;
  if (!userId || !pin || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  if (pin !== '123456') {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification PIN.' });
  }
  const user = store.data.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  store.save();

  store.logAudit(user.name, user.role, 'Reset Password', 'Authentication', 'Password reset via PIN verification', user.id);

  return res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
};

module.exports = {
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPasswordWithPin
};

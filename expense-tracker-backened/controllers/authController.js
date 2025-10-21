// controllers/authController.js
//------------------------------------------------------------
//  Authentication, OTP, and password-management logic
//------------------------------------------------------------
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const Otp    = require('../models/Otp');
const { generateOTP, sendOtpEmail, sendOtpSms } = require('../utils/otpService');

//─────────────────────────────────────────────────────────────
//  Registration – send OTP
//─────────────────────────────────────────────────────────────
exports.registerRequest = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (await User.findOne({ email  })) return res.status(400).json({ error: 'Email already exists' });
    if (await User.findOne({ mobile })) return res.status(400).json({ error: 'Mobile already exists' });

    const otp = generateOTP();
    await Otp.findOneAndUpdate(
      { email },
      { code: otp, expires: Date.now() + 5 * 60 * 1000, attempts: 0,
        formData: { name, email, mobile, password } },
      { upsert: true }
    );

  if (email) await sendOtpEmail(email, otp);
  if (mobile) await sendOtpSms(mobile, otp);
  res.json({ message: 'OTP sent to email and mobile (if provided)' });
  } catch {
    res.status(500).json({ error: 'Error sending OTP' });
  }
};

//─────────────────────────────────────────────────────────────
//  Resend OTP
//─────────────────────────────────────────────────────────────
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const record = await Otp.findOne({ email });
    if (!record) return res.status(404).json({ error: 'No pending verification' });

    record.code     = generateOTP();
    record.expires  = Date.now() + 5 * 60 * 1000;
    record.attempts = 0;
    await record.save();

  if (email) await sendOtpEmail(email, record.code);
  if (record.formData?.mobile) await sendOtpSms(record.formData.mobile, record.code);
  res.json({ message: 'New OTP sent to email and mobile (if provided)' });
  } catch {
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

//─────────────────────────────────────────────────────────────
//  Verify OTP & create account
//─────────────────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email });

    if (!record || Date.now() > record.expires)
      return res.status(400).json({ error: 'Invalid or expired OTP' });

    record.attempts += 1;
    if (record.attempts > 5) {
      await record.deleteOne();
      return res.status(429).json({ error: 'Too many incorrect attempts' });
    }

    if (record.code !== otp) {
      await record.save();
      return res.status(400).json({ error: 'Incorrect OTP' });
    }

    // password will be hashed by pre-save hook
    const newUser = new User({
      ...record.formData,
      isVerified: true,
      permissions: {
        canAdd: true, canEdit: true, canDelete: true,
        canViewTeam: false, canManageUsers: false,
        canExport: true, canAccessReports: true,
      },
    });
    await newUser.save();
    await record.deleteOne();

    res.json({ message: 'Registration complete' });
  } catch {
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

//─────────────────────────────────────────────────────────────
//  Login
//─────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier & password required' });
    }

    // find by email OR mobile and include the password hash
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    }).select('+password');

    if (!user)         return res.status(404).json({ error: 'User not found' });
    if (!user.isVerified)
      return res.status(401).json({ error: 'User not verified' });

    /* ---------- critical check ---------- */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)     return res.status(401).json({ error: 'Invalid credentials' });
    /* ------------------------------------ */

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      permissions: user.permissions ?? {},
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

//─────────────────────────────────────────────────────────────
//  Forgot-password – request OTP
//─────────────────────────────────────────────────────────────
exports.requestReset = async (req, res) => {
  const { email } = req.body;

  // avoid user-enumeration leaks
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: 'OTP sent if account exists' });

  const otp = generateOTP();
  await Otp.findOneAndUpdate(
    { email },
    { code: otp, expires: Date.now() + 5 * 60 * 1000, attempts: 0, formData: null },
    { upsert: true }
  );

  await sendOtpEmail(email, otp);
  res.json({ message: 'OTP sent if account exists' });
};

//─────────────────────────────────────────────────────────────
//  Forgot-password – confirm OTP & set new password
//─────────────────────────────────────────────────────────────
exports.confirmReset = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const record = await Otp.findOne({ email });

  if (!record || Date.now() > record.expires)
    return res.status(400).json({ error: 'Invalid or expired OTP' });

  record.attempts += 1;
  if (record.attempts > 5) {
    await record.deleteOne();
    return res.status(429).json({ error: 'Too many incorrect attempts' });
  }

  if (record.code !== otp) {
    await record.save();
    return res.status(400).json({ error: 'Incorrect OTP' });
  }

  // set new password (will be hashed by pre-save when saving user)
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.password = newPassword;
  await user.save();
  await record.deleteOne();

  res.json({ message: 'Password has been reset. You can now log in.' });
};

//─────────────────────────────────────────────────────────────
//  Logged-in password change
//─────────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Current password incorrect' });

  user.password = newPassword; // hook will hash
  await user.save();

  res.json({ message: 'Password updated successfully' });
};

//─────────────────────────────────────────────────────────────
//  Verify current token (stateless)
//─────────────────────────────────────────────────────────────
exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ valid: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify token' });
  }
};

//─────────────────────────────────────────────────────────────
//  Stateless logout (client deletes token)
//─────────────────────────────────────────────────────────────
exports.logout = (_req, res) => {
  res.json({ message: 'Logged out (client should discard token)' });
};

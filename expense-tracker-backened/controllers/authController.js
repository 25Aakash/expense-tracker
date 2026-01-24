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

  // Try to send OTP via SMS and Email
  let smsSent = false;
  let emailSent = false;
  
  // Try SMS first
  try {
    if (mobile) {
      await sendOtpSms(mobile, otp);
      smsSent = true;
      console.log(`OTP SMS sent successfully to ${mobile.slice(0, 3)}****${mobile.slice(-3)}`);
    }
  } catch (smsErr) {
    console.error('Failed to send OTP SMS:', smsErr.message);
  }
  
  // Try Email as backup (or primary if SMS fails)
  try {
    if (email) {
      await sendOtpEmail(email, otp);
      emailSent = true;
      console.log(`OTP Email sent successfully to ${email}`);
    }
  } catch (emailErr) {
    console.error('Failed to send OTP Email:', emailErr.message);
  }
  
  console.log(`OTP for ${email}: ${otp}`); // Debug log - remove in production
  
  // Provide detailed feedback to the user
  if (smsSent || emailSent) {
    const channels = [];
    if (smsSent) channels.push('mobile');
    if (emailSent) channels.push('email');
    
    res.json({ 
      message: `OTP sent to your ${channels.join(' and ')}`,
      smsSent,
      emailSent
    });
  } else {
    // Both failed - still return success but with warning
    console.warn(`OTP delivery failed for ${email}, OTP: ${otp}`);
    res.json({ 
      message: 'Registration initiated. If you do not receive OTP, please check your contact details or contact support.',
      smsSent: false,
      emailSent: false,
      warning: 'OTP delivery may be delayed. Please wait a few minutes.',
      // In development, you might want to include the OTP for testing
      ...(process.env.NODE_ENV === 'development' && { debugOtp: otp })
    });
  }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error sending OTP', details: error.message });
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

    let smsSent = false;
    let emailSent = false;
    
    // Try to send OTP via SMS
    try {
      if (record.formData?.mobile) {
        await sendOtpSms(record.formData.mobile, record.code);
        smsSent = true;
      }
    } catch (smsErr) {
      console.error('Failed to resend OTP SMS:', smsErr.message);
    }
    
    // Try to send OTP via Email
    try {
      if (email) {
        await sendOtpEmail(email, record.code);
        emailSent = true;
      }
    } catch (emailErr) {
      console.error('Failed to resend OTP Email:', emailErr.message);
    }
    
    console.log(`Resent OTP for ${email}: ${record.code}`); // Debug log
    
    const channels = [];
    if (smsSent) channels.push('mobile');
    if (emailSent) channels.push('email');
    
    res.json({ 
      message: channels.length > 0 
        ? `New OTP sent to your ${channels.join(' and ')}` 
        : 'OTP resend attempted. Please wait a few minutes.',
      smsSent,
      emailSent,
      ...(process.env.NODE_ENV === 'development' && { debugOtp: record.code })
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
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

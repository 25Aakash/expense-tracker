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

  // Send OTP via SMS only (faster than email)
  let smsSent = false;
  
  try {
    if (mobile) {
      await sendOtpSms(mobile, otp);
      smsSent = true;
      console.log(`OTP SMS sent successfully to ${mobile.slice(0, 3)}****${mobile.slice(-3)}`);
    }
  } catch (smsErr) {
    console.error('Failed to send OTP SMS:', smsErr.message);
  }
  
  console.log(`OTP for ${email}: ${otp}`); // Debug log - remove in production
  
  // Provide feedback to the user
  if (smsSent) {
    res.json({ 
      message: 'OTP sent to your mobile',
      smsSent: true,
      emailSent: false
    });
  } else {
    // SMS failed - still return success but with warning
    console.warn(`OTP delivery failed for ${email}, OTP: ${otp}`);
    res.json({ 
      message: 'Registration initiated. If you do not receive OTP, please contact support.',
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
//  Forgot-password – request OTP (supports email or mobile)
//─────────────────────────────────────────────────────────────
exports.requestReset = async (req, res) => {
  console.log('requestReset called with body:', req.body);
  const { identifier } = req.body; // Can be email or mobile
  
  if (!identifier) {
    return res.status(400).json({ error: 'Email or mobile number is required' });
  }

  // Determine if identifier is email or mobile
  const isEmail = identifier.includes('@');
  const isMobile = /^[0-9]{10}$/.test(identifier.replace(/\D/g, '').slice(-10));
  
  let user;
  let lookupKey; // Key for OTP record lookup
  
  if (isEmail) {
    user = await User.findOne({ email: identifier });
    lookupKey = { email: identifier };
  } else if (isMobile) {
    const formattedMobile = identifier.replace(/\D/g, '').slice(-10);
    user = await User.findOne({ mobile: formattedMobile });
    lookupKey = { mobile: formattedMobile };
  } else {
    return res.json({ message: 'OTP sent if account exists' }); // Invalid format, but don't reveal
  }

  // Avoid user-enumeration leaks
  if (!user) return res.json({ message: 'OTP sent if account exists' });

  const otp = generateOTP();
  
  // Delete any existing OTP records for this user (to avoid duplicate key errors)
  if (isEmail) {
    await Otp.deleteMany({ email: identifier });
  } else {
    const formattedMobile = identifier.replace(/\D/g, '').slice(-10);
    await Otp.deleteMany({ mobile: formattedMobile });
  }
  
  // Create new OTP record with only the lookup field set
  const otpData = {
    code: otp,
    expires: Date.now() + 5 * 60 * 1000,
    attempts: 0,
    formData: { 
      resetFor: isEmail ? 'email' : 'mobile', 
      identifier: isEmail ? identifier : user.mobile,
      userEmail: user.email // Store for later user lookup
    }
  };
  
  // Only set the field we're using for lookup (to avoid unique index conflicts)
  if (isEmail) {
    otpData.email = identifier;
  } else {
    otpData.mobile = user.mobile;
  }
  
  await Otp.create(otpData);

  let smsSent = false;
  let emailSent = false;

  // Send OTP via the channel user specified
  if (isEmail) {
    try {
      await sendOtpEmail(identifier, otp);
      emailSent = true;
    } catch (err) {
      console.error('Failed to send reset OTP email:', err.message);
    }
  } else {
    // Send via SMS
    try {
      await sendOtpSms(user.mobile, otp);
      smsSent = true;
    } catch (err) {
      console.error('Failed to send reset OTP SMS:', err.message);
    }
  }

  console.log(`Password reset OTP for ${isEmail ? 'email' : 'mobile'} ${identifier}: ${otp}`);
  
  res.json({ 
    message: 'OTP sent if account exists',
    channel: isEmail ? 'email' : 'sms',
    smsSent,
    emailSent
  });
};

//─────────────────────────────────────────────────────────────
//  Forgot-password – confirm OTP & set new password (supports email or mobile)
//─────────────────────────────────────────────────────────────
exports.confirmReset = async (req, res) => {
  const { identifier, email, otp, newPassword } = req.body;
  
  // Support both 'identifier' (new) and 'email' (legacy) for backward compatibility
  const lookupValue = identifier || email;
  
  if (!lookupValue) {
    return res.status(400).json({ error: 'Email or mobile number is required' });
  }
  
  // Determine if it's email or mobile
  const isEmail = lookupValue.includes('@');
  let record;
  
  if (isEmail) {
    record = await Otp.findOne({ email: lookupValue });
  } else {
    const formattedMobile = lookupValue.replace(/\D/g, '').slice(-10);
    record = await Otp.findOne({ mobile: formattedMobile });
    // If not found by mobile field, try by email stored in record
    if (!record) {
      record = await Otp.findOne({ 'formData.identifier': formattedMobile });
    }
  }

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

  // Find user by the email stored in formData or by email/mobile
  let user;
  if (record.email) {
    user = await User.findOne({ email: record.email }).select('+password');
  } else if (record.formData?.userEmail) {
    user = await User.findOne({ email: record.formData.userEmail }).select('+password');
  } else if (record.mobile) {
    user = await User.findOne({ mobile: record.mobile }).select('+password');
  }
  
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

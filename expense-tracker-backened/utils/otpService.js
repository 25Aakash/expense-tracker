
const nodemailer = require('nodemailer');
const axios = require('axios');
// Send OTP via SMS using STPL API
async function sendOtpSms(mobile, otp) {
  const msg = `Dear user, ${otp} is your OTP to login to Riddhi Siddhi Trading Co. mobile app. This OTP is valid for 15 minutes. Do not share it with anyone. Login at http://riddhisiddhitrading.co.in/index.html`;
  const url = `https://smsnotify.one/SMSApi/send`;
  const params = {
    userid: 'riddhisiddhi',
    password: 'eNyv6gCE',
    sendMethod: 'quick',
    mobile,
    msg,
    senderid: 'RIDSID',
    msgType: 'text',
    format: 'text',
  };
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error sending OTP SMS:', error.response?.data || error.message);
    throw error;
  }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(email, otp) {
  await transporter.sendMail({
    to: email,
    subject: 'Your OTP for Registration',
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in <b>5&nbsp;minutes</b>.</p>`,
  });
}

module.exports = { generateOTP, sendOtpEmail, sendOtpSms };

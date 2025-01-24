const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const { sendOtpToEmail } = require('./mailservice');
const mongoose = require('mongoose')

const router = express.Router();
const users = require('../models/Users');

router.use(express.json())

let otpStore = {}
  
  // Generate OTP (6 digits)
  function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Find user by email or phone using async/await
      const user = await users.findOne({ Email: email });
  
      if (!user) {
        return res.status(404).send({ message: 'User not found.' });
      }
  
      // Generate OTP and save it in the store with a timestamp
      const otp = generateOtp();
      otpStore[email] = {
        otp,
        timestamp: Date.now(), // Store the current timestamp
    };
      await sendOtpToEmail(email, otp);
      // global.otpStore[email] = otp;
      
      return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Failed to send OTP.' });
    }
  });
      
  
  // Verify OTP
  router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
  
    // Check if OTP exists and is within 5 minutes
    if (!otpStore[email]) {
      return res.status(404).send({ message: 'OTP not sent or expired.' });
    }
  
    const { otp: storedOtp, timestamp } = otpStore[email];
    console.log(`otp : ${otp}, storedotp : ${storedOtp} timestamp : ${timestamp}`);
    
    if (storedOtp !== otp) {
      return res.status(400).send({ message: 'Invalid OTP.' });
    }
  
    if (Date.now() - timestamp > 5 * 60 * 1000) {  // 5 minutes expiration
      delete otpStore[email];  // Remove expired OTP
      return res.status(400).send({ message: 'OTP expired.' });
    }
  
    // OTP is valid, delete it after verification
    delete otpStore[email];
    return res.status(200).send({
      success: true,  // Add success field
      message: 'OTP verified successfully.'
    });
  });
  
  // Change Password
  router.post('/change-password', async(req, res) => {
    const { email, oldPassword, newPassword } = req.body;
  
    // Find user by email
    const user = await users.findOne({ Email: email });
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }
  
    // Verify old password
    // if (user.Password !== oldPassword) {
    //   return res.status(400).send({ message: 'Incorrect old password.' });
    // }
  
    // Update the password
    user.Password = newPassword;
    await user.save();
    console.log(user);
    res.status(200).send({ success: true, message: 'Password changed successfully.' });
  });

module.exports = router;

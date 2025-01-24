// mailService.js (or any other name)
const nodemailer = require('nodemailer');

// Set up the transporter with Mailtrap SMTP details
var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mailsenderfromfromecommerce@gmail.com",
      pass: "eqpi engo xvcc cmef"
    },
    debug: true,  // Enable debug logging
  });

const sendOtpToEmail = async (email, otp) => {
    try {
        // Define the email content
        const mailOptions = {
            from: 'mailsenderfromfromecommerce@gmail.com',  // Replace with your email
            to: email,
            subject: 'Your OTP for Password Reset',
            text: `Your OTP is: ${otp}. Please use it to reset your password.`,
        };

        // Send the email
        const info = await transport.sendMail(mailOptions);
        console.log(info);
        return info;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
};

module.exports = { sendOtpToEmail };

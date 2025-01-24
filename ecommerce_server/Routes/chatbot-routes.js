const express = require('express');
const router = express.Router();
const Chat = require('../models/Chatbot');

router.post('/message', async (req, res) => {
  const { userMessage, userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ error: 'User email is required.' });
  }

  let botReply = '';
  let options = [];

  try {
    const lowerCaseMessage = userMessage.toLowerCase();

    if (/hi|hello|main|menu/.test(lowerCaseMessage)) {
      botReply = 'Hello there! 👋 How can I assist you today?';
      options = [
        'Explore our product catalog 🛍️',
        'Track your order 📦',
        'Need help with an order? 🛒',
        'Chat with customer support 📞',
        'Exit 🏃',
      ];
    } else if (/exit/.test(lowerCaseMessage)) {
      botReply = 'Okay, let me know if you need my help. Bye 🤗';
    } else if (/price/.test(lowerCaseMessage)) {
      botReply = 'You can find detailed pricing information on our Products page. 📃';
      options = [
        'Browse Products',
        'See Discounts & Offers',
        'Return to Main Menu',
      ];
    } else if (/products|product/.test(lowerCaseMessage)) {
      botReply = 'Sure, let me take you to the Products page. 📃';
    } else if (/track/.test(lowerCaseMessage)) {
      botReply = 'You can track your order by following these steps: \n\n👉 Go to your account (top right of the page) \n👉 Select the "Your Orders" section \n👉 Click on "Track My Order" 📦';
      options = ['Go to My Account'];
    } else if (/account/.test(lowerCaseMessage)) {
      botReply = "Here's your account! 📦";
    } else if (/cart/.test(lowerCaseMessage)) {
      botReply = "Alright, let's take a look at your cart! 🛒";
    } else if (/help|support/.test(lowerCaseMessage)) {
      botReply = 'You can reach us at our customer support helpline: 💬 +2122 556226, +2122 557226';
      options = [
        'Return to Main Menu',
      ];
    } else if (/order/.test(lowerCaseMessage)) {
      botReply = 'To place an order, head over to the "Products" page, add your items to the cart, and proceed to checkout. 🛒';
      options = [
        'Browse Products',
        'View Cart',
        'Return to Main Menu',
      ];
    } else if (/discount|offer/.test(lowerCaseMessage)) {
      botReply = 'We have some fantastic discounts starting from 1st April! Till then, explore all our products and buy them on 1st april at almost half prices. 🎉';
      options = [
        'Browse Products',
        'Return to Main Menu',
      ];
    } else {
      botReply = "Oops! I didn't quite catch that. Could you please rephrase? 🤔";
      options = [
        'Hi 👋',
        'What are the product prices?',
        'How can I place an order?',
        'Track my order status',
        'Contact Customer Support',
      ];
    }    

    const userChat = await Chat.findOneAndUpdate(
      { email: userEmail },
      {
        $push: { msg: { userMessage, botReply } },
      },
      { upsert: true, new: true }
    );

    res.json({ botReply, options });
  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).json({ botReply: 'Something went wrong. Please try again later.', options: [] });
  }
});

module.exports = router;
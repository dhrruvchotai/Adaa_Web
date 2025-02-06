const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require('../models/Chatbot'); // Import the Chat model

const genAI = new GoogleGenerativeAI("AIzaSyCaGzT2zbyXvbAawOkYWq6sSZ_tZGZYjpY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post('/message', async (req, res) => {
  const { userMessage, userEmail } = req.body;

  let botReply = '';
  let options = [
    'Hi 👋',
    'What are the product prices?',
    'How can I place an order?',
    'Track my order status',
    'Contact Customer Support',
  ];

  try {
    const lowerCaseMessage = userMessage.toLowerCase();

    if (/hi|hello|main|menu/.test(lowerCaseMessage)) {
      botReply = 'Hello there! 👋 How can I assist you today?';
      options = [
        'Explore our product catalog 🛍',
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
    }
    else if (lowerCaseMessage === 'explore our product catalog 🛍') {
      botReply = 'Sure! Here is our product catalog: [Product Catalog Link]';
    } else if (lowerCaseMessage === 'track your order 📦') {
      botReply = 'Please provide your order number to track the status of your order.';
    } else if (lowerCaseMessage === 'need help with an order? 🛒') {
      botReply = 'How can I assist you with your order?';
    } else if (lowerCaseMessage === 'chat with customer support 📞') {
      botReply = 'Our customer support is available at [Support Contact Link].';
    } else if (lowerCaseMessage === 'exit 🏃') {
      botReply = 'Okay, let me know if you need any help later. Goodbye!';
    } else {

      // Use AI response only if the user input doesn't match any predefined options
      try {
        // Modify the AI prompt to reflect the e-commerce clothing context
        const aiPrompt = `
        You are a virtual assistant for an online clothing store named Adda Jaipur, an Indian shopping store, Provide a response in the context of Indian fashion and valid information.. The user has asked the following question:
        "${userMessage}"
        Please provide a helpful response related to clothing, such as product details, shipping, promotions, returns, or other relevant e-commerce topics. 
        Respond in a friendly and informative way as if you are an employee at the store. and please provide valid information for sure`;

        const result = await model.generateContent(aiPrompt);
        botReply = result.response.text().trim();
        botReply += "\nDon't forget to use our coupon codes: DISCOUNT10 for 10% off, DISCOUNT20 for 20% off, or SUMMER30 for 30% off on your next purchase.";
      } catch (error) {
        console.error('Error with Google Generative AI:', error);
        botReply = 'Sorry, there was an issue. Please try again later.';
      }

      // Provide additional options for the user to choose from
      options = [
        'Browse latest collections 👗',
        'Check shipping information 🚚',
        'Get details on promotions and discounts 💸',
        'Customer support',
        'Go back to main menu',
      ];
    }

    // Save conversation in the database
    const userChat = await Chat.findOneAndUpdate(
      { email: userEmail },
      { $push: { msg: { userMessage, botReply } } },
      { upsert: true, new: true }
    );

    return res.json({ botReply, options });
  } catch (error) {
    console.error('Error with chatbot route:', error);
    return res.status(500).json({ botReply: 'Something went wrong. Please try again later.', options: [] });
  }
});

module.exports = router;
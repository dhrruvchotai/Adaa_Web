const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRouter=require('./Routes/auth-routes');
const productRouter=require('./Routes/product-routes');
const orderRouter=require('./Routes/order-routes');
const cartRouter=require('./Routes/cart-routes');
const chatRoutes = require('./Routes/chatbot-routes');
const paymentRoutes = require('./Routes/payment-routes');
const forgotRoutes = require('./Routes/forgot-routes');
const wishlistRoutes = require('./Routes/wishlist-routes');
const bgRoutes = require('./Routes/background-routes');

require('dotenv').config();

const connectionString = process.env.MONGO_URI;
mongoose.connect(connectionString).then(() => {
  console.log("Connected");
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended:true}));
  app.use('/auth',authRouter);
  app.use('/',productRouter);
  app.use('/',orderRouter);
  app.use('/',cartRouter);
  app.use('/chat', chatRoutes);
  app.use('/', paymentRoutes);
  app.use('/', forgotRoutes);
  app.use('/', wishlistRoutes);
  app.use('/', bgRoutes);

  app.listen(3001, () => {
    console.log("Server started @ "+3001);
  });
});
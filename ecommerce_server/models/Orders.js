const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    Email:String,
    No:Number,
    Items: [],
    PaymentMethod: String, 
    TotalAmount: Number,    
    OrderDate: String
});

module.exports = mongoose.model("orders", orderSchema);
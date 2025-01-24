const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    Email:String,
    Cart:[]
});

module.exports = mongoose.model("carts", cartSchema);
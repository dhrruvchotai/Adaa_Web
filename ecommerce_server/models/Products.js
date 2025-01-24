const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    No:Number,
    Image: String,
    Title: String,
    Category: String,
    Price: Number,
    SalePrice: Number,
    Stock: Number,
    isOutOfStock: { type: Boolean, default: false }
});

productSchema.pre('save', function (next) {
    this.isOutOfStock = this.Stock <= 0;
    next();
});

productSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.$set && 'Stock' in update.$set) {
        update.$set.isOutOfStock = update.$set.Stock <= 0;
    }
    next();
});

module.exports = mongoose.model("products", productSchema);
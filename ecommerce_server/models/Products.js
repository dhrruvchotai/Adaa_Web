const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    No:Number,
    Image: String,
    Title: String,
    Brand: String,
    Category: String,
    Price: Number,
    SalePrice: Number,
    Stock: Number,
    Details: String,
    Similarity: Number,
    purchaseCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    isOutOfStock: { type: Boolean, default: false },
    Reviews:[]
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
const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const Product = require('../models/Products');
const mongoose = require('mongoose')

router.use(express.json());

router.get('/wishlist/:email', async (req, res) => {
    try {
        const user = await User.findOne({ Email: req.params.email });
        if (!user) {
            console.log("User not found:", req.params.email); 
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ wishlist: user.wishlist || [] });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/wishlist', async (req, res) => {
    try {
        const { email, productId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        const objectId = new mongoose.Types.ObjectId(productId);

        const user = await User.findOne({ Email: email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const product = await Product.findById(objectId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productExistsInWishlist = user.wishlist.some((id) => id.equals(objectId));

        let update;
        if (productExistsInWishlist) {
            update = { $pull: { wishlist: objectId } };
        } else {
            update = { $addToSet: { wishlist: objectId } };
        }

        const updatedUser = await User.findOneAndUpdate(
            { Email: email },
            update,
            { new: true }
        );

        const message = productExistsInWishlist
            ? 'Product removed from wishlist'
            : 'Product added to wishlist';

        return res.status(200).json({ message, wishlist: updatedUser.wishlist });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.delete('/wishlist/:email', async (req, res) => {
    const { productId } = req.body;
    try {
        const user = await User.findOne({ Email: req.params.email });
        if (!user) return res.status(404).json({ message: "User not found" });
        user.wishlist = user.wishlist.filter(id => id !== productId);
        await user.save();
        res.json({ message: "Product removed from wishlist" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

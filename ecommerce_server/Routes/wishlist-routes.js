const express = require('express');
const router = express.Router();
const User = require('../models/Users'); // Assuming you have a User model
const Product = require('../models/Products');
const mongoose = require('mongoose')

// Use express.json() middleware to parse the request body as JSON
router.use(express.json());

// Get user's wishlist
// Backend API response modification
router.get('/wishlist/:email', async (req, res) => {
    try {
        const user = await User.findOne({ Email: req.params.email });
        if (!user) {
            console.log("User not found:", req.params.email);  // Log if user is not found
            return res.status(404).json({ message: "User not found" });
        }

        console.log('Wishlist:', user.wishlist);  // Log the user's wishlist
        res.json({ wishlist: user.wishlist || [] }); // Default empty wishlist if none exists
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: error.message });
    }
});



// Add to wishlist
router.post('/wishlist', async (req, res) => {
    try {
        // Parse the incoming JSON data
        const { email, productId } = req.body;

        console.log(email, productId);
        console.log(mongoose.Types.ObjectId.isValid(productId));
        
        // Validate productId format (ensure it's a valid MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: 'Invalid product ID format' }));
        }

        // Convert the productId to ObjectId
        const objectId = new mongoose.Types.ObjectId(productId);

        // Find the user by email
        const user = await User.findOne({ Email : email });
        console.log(user);
        if (!user) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ message: 'User not found' }));
        }

        // Find the product by productId
        const product = await Product.findById(objectId);
        if (!product) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ message: 'Product not found' }));
        }

        // Add or Remove product from the wishlist
        const productExistsInWishlist = user.wishlist.some((id) => id.equals(objectId));

        if (productExistsInWishlist) {
            // Remove product from wishlist
            user.wishlist = user.wishlist.filter((id) => !id.equals(objectId));
            await user.save();
            res.statusCode = 200;
            return res.end(JSON.stringify({ message: 'Product removed from wishlist' }));
        } else {
            // Add product to wishlist
            user.wishlist.push(objectId);
            console.log(user.wishlist);
            await user.save();
            res.statusCode = 200;
            return res.end(JSON.stringify({ message: 'Product added to wishlist' }));
        }

    } catch (error) {
        console.error('Error:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Internal server error' }));
    }
});



// Remove from wishlist
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

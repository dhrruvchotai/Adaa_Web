const express = require('express');
const cart = require('../models/Cart');

const router = express.Router();

router.put("/cart/remove", async (req, res) => {
    const { userEmail, productId } = req.body;
    try {
        const user = await cart.findOne({ Email: userEmail });
        if (user === null) {
            return res.status(404).json({ message: "User not found" });
        }
        const updatedCart = [];
        for (let item of user.Cart) {
            if (item != productId) {
                updatedCart.push(item);
            }
        }
        const result = await cart.updateOne(
            { Email: userEmail },
            { Cart: updatedCart }
        );
        if (result.modifiedCount > 0) {
            return res.status(200).json(
                {
                    success: true,
                    message: "Product removed from cart",
                    updatedCart,
                }
            );
        } else {
            return res.status(400).json({ message: "Product not found in cart or no changes made" });
        }
    } catch (error) {
        console.error("Error removing product from cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/cart/:email', async (req, res) => {
    try {
        const email = req.params.email.trim().toLowerCase();
        const user = await cart.findOne({ Email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by email:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put("/cart/add", async (req, res) => {
    const { userEmail, productId } = req.body;
    try {
        const user = await cart.findOne({ Email: userEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.Cart.includes(productId)) {
            return res.status(400).json({ message: "Product already in cart" });
        }
        const updatedCart = [...user.Cart, parseInt(productId)];
        const result = await cart.updateOne(
            { Email: userEmail },
            { Cart: updatedCart }
        );
        if (result.modifiedCount > 0) {
            return res.status(200).json({
                message: "Product added to cart",
                updatedCart,
            }
            );
        } else {
            return res.status(400).json({ message: "Product not added to cart or no changes made" });
        }
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put('/cart/empty', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await cart.findOne({ Email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.Cart = [];
        await user.save();
        res.status(200).json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;
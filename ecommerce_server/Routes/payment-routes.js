const express = require("express");
require('dotenv').config();

const stripe = require("stripe")(process.env.PAYMENT_KEY);
const router = express.Router();

const coupons = [
    { code: 'DISCOUNT10', discount: 10 },  // 10% discount
    { code: 'DISCOUNT20', discount: 20 },  // 20% discount
    { code: 'SUMMER30', discount: 30 },    // 30% discount
];

router.post('/verify-coupon', (req, res) => {
    const { couponCode } = req.body;

    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());

    if (coupon) {
        // Coupon is valid
        res.json({
            success: true,
            discount: coupon.discount,
            message: 'Coupon applied successfully!',
        });
    } else {
        // Invalid coupon
        res.json({
            success: false,
            message: 'Invalid or expired coupon code.',
        });
    }
});

router.post("/create-payment-intent", async (req, res) => {
    try {
        const { totalAmount } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100, // Stripe expects the amount in cents
            currency: "inr", // or any other currency you are using
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).send({ error: "Payment failed" });
    }
});

module.exports = router;
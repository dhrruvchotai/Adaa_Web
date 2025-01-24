const express = require("express");
const stripe = require("stripe")("sk_test_51QiIllP7psTNMuKWlw3RGJlaBKK5ndo0bIKBj4YAHTbOvAoMDfbDzv6XQjlKBHotc8iFEMxLBZEi2ejnYIIcknKt00mSkN7IN8");
const router = express.Router();

const coupons = [
    { code: 'DISCOUNT10', discount: 10 },  // 10% discount
    { code: 'DISCOUNT20', discount: 20 },  // 20% discount
    { code: 'SUMMER30', discount: 30 },    // 30% discount
];

router.post('/verify-coupon', (req, res) => {
    const { couponCode } = req.body;

    // Find the coupon in the list
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

        // Create a PaymentIntent with the order amount
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

const crypto = require("crypto");
const express = require("express");
const Razorpay = require("razorpay");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: 100, // ₹1 in paise
      currency: "INR",
      receipt: `EX_${Date.now()}`,
      notes: {
        orderNumber: req.body.orderNumber,
        customerEmail: req.body.customerEmail,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to create Razorpay order.",
    });
  }
});

router.post("/verify-payment", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({
        success: true,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Payment verification failed.",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Verification failed.",
    });
  }
});

module.exports = router;
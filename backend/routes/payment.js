const express = require("express");
const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID,
  process.env.CASHFREE_CLIENT_SECRET
);

const router = express.Router();

router.post("/create-order", async (req, res) => {
  try {
    const { orderNumber, customerEmail } = req.body;

    const request = {
      order_amount: 199,
      order_currency: "INR",
      order_id: `EX_${Date.now()}`,
      customer_details: {
        customer_id: orderNumber,
        customer_email: customerEmail,
        customer_phone: "9999999999",
      },
      order_meta: {},
    };

    const response = await cashfree.PGCreateOrder(request);

    res.json({
      success: true,
      paymentSessionId: response.data.payment_session_id,
      orderId: response.data.order_id,
    });

  } catch (err) {
    console.error(err.response?.data || err);

    res.status(500).json({
      success: false,
      message: "Unable to create payment order.",
    });
  }
});

module.exports = router;
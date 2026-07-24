const express = require("express");
const router = express.Router();

const { shopifyGet } = require("../services/shopify");

/**
 * Verify Order
 */
router.post("/verify-order", async (req, res) => {
  try {
    const { orderNumber, email } = req.body;

    if (!orderNumber || !email) {
      return res.status(400).json({
        success: false,
        message: "Order number and email are required",
      });
    }

    const data = await shopifyGet(
      `orders.json?name=${encodeURIComponent(orderNumber)}&status=any`
    );

    if (!data.orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = data.orders[0];

    if (order.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: "Email does not match this order",
      });
    }

    // ========================================
    // 7 DAY EXCHANGE ELIGIBILITY CHECK
    // ========================================

    const fulfillment = order.fulfillments?.[0];

console.log("===== FULFILLMENT =====");
console.log(JSON.stringify(fulfillment, null, 2));
console.log("=======================");

if (
  !fulfillment ||
  fulfillment.shipment_status !== "delivered"
) {
  return res.status(400).json({
    success: false,
    message:
      "This order has not been delivered yet, so it is not eligible for exchange.",
  });
}

const deliveredDate = new Date(fulfillment.updated_at);
    const today = new Date();
    console.log("Delivered Date:", deliveredDate);
console.log("Today:", today);
console.log("Difference (ms):", today - deliveredDate);
console.log(
  "Difference (days):",
  Math.floor((today - deliveredDate) / (1000 * 60 * 60 * 24))
  
);

    const diffDays = Math.floor(
      (today - deliveredDate) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 7) {
      return res.status(400).json({
        success: false,
        message: "Your 7-day exchange window has expired.",
      });
    }

    res.json({
      success: true,
      order,
      daysRemaining: 7 - diffDays,
    });

  } catch (err) {
    console.error(err.response?.data || err);

    res.status(500).json({
      success: false,
      message: err.response?.data || err.message,
    });
  }
});

/**
 * Get Order Items
 */
router.get("/:orderId/items", async (req, res) => {
  try {
    const { orderId } = req.params;

    const data = await shopifyGet(`orders/${orderId}.json`);

    const order = data.order;

    const items = await Promise.all(

      order.line_items.map(async (item) => {

        let image = null;

        if (item.product_id) {

          try {

            const productData = await shopifyGet(
              `products/${item.product_id}.json`
            );

            image =
              productData.product?.image?.src ||
              productData.product?.images?.[0]?.src ||
              null;

          } catch (e) {

            console.log(
              `Unable to fetch image for product ${item.product_id}`
            );

          }

        }

        return {

          lineItemId: item.id,
          productId: item.product_id,
          variantId: item.variant_id,
          title: item.title,
          variantTitle: item.variant_title,
          quantity: item.quantity,
          image,

        };

      })

    );

    res.json({
      success: true,
      orderId: order.id,
      orderNumber: order.name,
      items,
    });

  } catch (err) {

    console.error(err.response?.data || err);

    res.status(500).json({
      success: false,
      message: err.response?.data || err.message,
    });

  }
});

module.exports = router;
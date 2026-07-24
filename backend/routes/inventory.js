const express = require("express");
const router = express.Router();

const { shopifyGet } = require("../services/shopify");

router.post("/check", async (req, res) => {
  try {
    const { productId, size } = req.body;

    if (!productId || !size) {
      return res.status(400).json({
        success: false,
        message: "Product ID and size are required",
      });
    }

    // Get product details from Shopify
    const data = await shopifyGet(`products/${productId}.json`);

    const product = data.product;

    // Find the selected size variant
    const variant = product.variants.find(
      (v) => v.option1.toLowerCase() === size.toLowerCase()
    );

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    res.json({
      success: true,
      variantId: variant.id,
      size: variant.option1,
      available: variant.inventory_quantity > 0,
      stock: variant.inventory_quantity,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.response?.data || err.message,
    });
  }
});

module.exports = router;
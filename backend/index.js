require("dotenv").config();
console.log("🔥 THIS IS THE INDEX.JS I'M RUNNING");

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const orderRoutes = require("./routes/orders");
const inventoryRoutes = require("./routes/inventory");
const exchangeRoutes = require("./routes/exchange");
const paymentRoutes = require("./routes/payment");

const { sendEmail } = require("./services/emailService");

const app = express();

/* =========================
   Middleware
========================= */

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

console.log("Store:", process.env.SHOPIFY_STORE);

console.log(
  "BREVO_API_KEY:",
  process.env.BREVO_API_KEY
    ? process.env.BREVO_API_KEY.substring(0, 15) + "..."
    : "NOT FOUND"
);

/* =========================
   Home Route
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Crunk Thread Exchange API is running 🚀",
    store: process.env.SHOPIFY_STORE,
  });
});

/* =========================
   Generate Access Token
========================= */

app.get("/token", async (req, res) => {
  try {
    const params = new URLSearchParams();

    params.append("grant_type", "client_credentials");
    params.append("client_id", process.env.SHOPIFY_CLIENT_ID);
    params.append("client_secret", process.env.SHOPIFY_CLIENT_SECRET);

    const response = await axios.post(
      `https://${process.env.SHOPIFY_STORE}/admin/oauth/access_token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json({
      success: true,
      scope: response.data.scope,
      expires_in: response.data.expires_in,
      access_token: response.data.access_token,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.response?.data || error.message,
    });

  }
});

/* =========================
   Test Shopify Connection
========================= */

app.get("/shop", async (req, res) => {

  try {

    const params = new URLSearchParams();

    params.append("grant_type", "client_credentials");
    params.append("client_id", process.env.SHOPIFY_CLIENT_ID);
    params.append("client_secret", process.env.SHOPIFY_CLIENT_SECRET);

    const tokenResponse = await axios.post(
      `https://${process.env.SHOPIFY_STORE}/admin/oauth/access_token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const shopResponse = await axios.get(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2025-10/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      shop: shopResponse.data,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.response?.data || error.message,
    });

  }

});

/* =========================
   API Routes
========================= */

app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/payment", paymentRoutes);

/* =========================
   Test Email
========================= */

app.get("/test-email", async (req, res) => {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "✅ Brevo Test Email",
    html: `
      <h2>Congratulations 🎉</h2>
      <p>Your Brevo integration is working successfully.</p>
    `,
  });

  res.send("Test Email Sent");
});

/* =========================
   404
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   Start Server
========================= */


const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
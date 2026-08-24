require("dotenv").config();
console.log("🔥 THIS IS THE INDEX.JS I'M RUNNING");


const express = require("express");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const auth = require("./middleware/auth");
const supabase = require("./supabase");

const orderRoutes = require("./routes/orders");
const inventoryRoutes = require("./routes/inventory");
const exchangeRoutes = require("./routes/exchange");
const paymentRoutes = require("./routes/payment");

const { sendEmail } = require("./services/emailService");

const app = express();
app.set("trust proxy", 1);

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

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

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

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many login attempts. Please try again after 15 minutes.",
  },
});

/* =========================
   Admin Login
========================= */

app.post("/api/admin/login", adminLoginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminUsername || !adminPasswordHash || !jwtSecret) {
      return res.status(500).json({
        success: false,
        message: "Admin authentication is not configured.",
      });
    }

    if (username !== adminUsername) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      adminPasswordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const token = jwt.sign(
  {
    username,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

    return res.json({
      success: true,
      token,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
});

app.get("/api/admin/verify", auth, (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});

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
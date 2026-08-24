const express = require("express");
const fs = require("fs");
const path = require("path");
const { sendEmail } = require("../services/emailService");
const auth = require("../middleware/auth");
const supabase = require("../supabase");

const router = express.Router();

const filePath = path.join(__dirname, "../exchange_requests.json");

/*
========================================
CREATE EXCHANGE
========================================
*/

router.post("/create", async (req, res) => {
  try {
    let exchanges = [];

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");

      if (data.trim()) {
        exchanges = JSON.parse(data);
      }
    }

    /*
    ========================================
    DUPLICATE ACTIVE EXCHANGE CHECK
    ========================================
    */

    const activeExchange = exchanges.find(
      (item) =>
        item.lineItemId === req.body.lineItemId &&
        [
          "Pending",
          "Approved",
          "Pickup Scheduled",
          "Picked Up",
          "Received",
          "Replacement Packed",
          "Replacement Shipped",
        ].includes(item.status)
    );

    if (activeExchange) {
      return res.status(400).json({
        success: false,
        message:
          "An active exchange request already exists for this product.",
      });
    }

    /*
    ========================================
    CREATE NEW EXCHANGE
    ========================================
    */

    const exchange = {
      exchangeId: `EX${Date.now()}`,
      createdAt: new Date().toISOString(),

      status: "Pending",

      orderId: req.body.orderId,
      orderNumber: req.body.orderNumber,

      customerEmail: req.body.customerEmail,

      productId: req.body.productId,
      productTitle: req.body.productTitle,
      productImage: req.body.productImage,

      lineItemId: req.body.lineItemId,
      variantId: req.body.variantId,

      currentSize: req.body.currentSize,
      newSize: req.body.newSize,

      reason: req.body.reason,

adminNotes: "",
customerNotes: "",

courierName: "",
pickupDate: "",
pickupTime: "",

trackingNumber: "",
trackingUrl: "",

timeline: [
        {
          status: "Pending",
          date: new Date().toISOString(),
          by: "Customer",
        },
      ],
    };

    // =========================
    // SAVE EXCHANGE TO SUPABASE
    // =========================

    const { error: supabaseInsertError } = await supabase
      .from("exchange_requests")
      .insert({
        exchange_id: exchange.exchangeId,
        order_number: String(exchange.orderNumber || ""),
        customer_email: exchange.customerEmail || null,

        product_id: exchange.productId
          ? String(exchange.productId)
          : null,

        variant_id: exchange.variantId
          ? String(exchange.variantId)
          : null,

        line_item_id: exchange.lineItemId
          ? String(exchange.lineItemId)
          : null,

        product_title: exchange.productTitle || null,

        old_size: exchange.currentSize || null,
        new_size: exchange.newSize || null,

        reason: exchange.reason || null,

        status: exchange.status,

        exchange_fee: Number(req.body.exchangeFee || 0),

        razorpay_order_id:
          req.body.razorpayOrderId || null,

        razorpay_payment_id:
          req.body.razorpayPaymentId || null,

        payment_status:
          req.body.paymentStatus || null,

        tracking_number:
          exchange.trackingNumber || null,

        admin_notes:
          exchange.adminNotes || null,

        request_data: exchange,

        created_at: exchange.createdAt,
        updated_at: exchange.createdAt
      });

    if (supabaseInsertError) {
      console.error(
        "❌ SUPABASE SAVE ERROR:",
        supabaseInsertError
      );

      return res.status(500).json({
        success: false,
        message:
          "Exchange request could not be securely saved."
      });
    }

    console.log("✅ Exchange saved to Supabase");

    exchanges.push(exchange);

    fs.writeFileSync(
      filePath,
      JSON.stringify(exchanges, null, 2),
      "utf8"
    );
    


    console.log("✅ Exchange Saved");
    console.log("Request customerEmail:", req.body.customerEmail);
    console.log("Exchange customerEmail:", exchange.customerEmail);
    console.log("Admin email:", process.env.ADMIN_EMAIL);
    console.log("--------------------------------");

    console.log("Customer Email:", exchange.customerEmail);

/*
========================================
CUSTOMER EMAIL
========================================
*/
if (!exchange.customerEmail) {
  console.log("❌ customerEmail missing");
}

console.log("📧 CUSTOMER EXCHANGE EMAIL START:", exchange.customerEmail);

await sendEmail({
  to: exchange.customerEmail,
  subject: `Exchange Request Received - Order #${exchange.orderNumber}`,
  html: `
    <h2>Hi,</h2>

    <p>We've received your exchange request.</p>

    <p><strong>Exchange ID:</strong> ${exchange.exchangeId}</p>
    <p><strong>Order:</strong> #${exchange.orderNumber}</p>
    <p><strong>Product:</strong> ${exchange.productTitle}</p>
    <p><strong>Requested Size:</strong> ${exchange.newSize}</p>

    <p>Our team will review your request shortly.</p>

    <br>

    <p>Thanks,</p>
    <strong>Crunk Thread</strong>
  `,
});

console.log("📧 CUSTOMER EXCHANGE EMAIL FINISHED");

/*
========================================
ADMIN EMAIL
========================================
*/

console.log("📧 ADMIN EXCHANGE EMAIL START:", process.env.ADMIN_EMAIL);

await sendEmail({
  to: process.env.ADMIN_EMAIL,
  subject: `🚨 New Exchange Request - ${exchange.exchangeId}`,
  html: `
    <h2>New Exchange Request</h2>

    <p><strong>Exchange ID:</strong> ${exchange.exchangeId}</p>
    <p><strong>Order:</strong> #${exchange.orderNumber}</p>
    <p><strong>Customer:</strong> ${exchange.customerEmail}</p>
    <p><strong>Product:</strong> ${exchange.productTitle}</p>
    <p><strong>Current Size:</strong> ${exchange.currentSize}</p>
    <p><strong>Requested Size:</strong> ${exchange.newSize}</p>
    <p><strong>Reason:</strong> ${exchange.reason}</p>
  `,
});

console.log("📧 ADMIN EXCHANGE EMAIL FINISHED");

res.json({
  success: true,
  exchangeId: exchange.exchangeId,
  message: "Exchange request created successfully.",
});
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

/*
========================================
GET ALL EXCHANGES
========================================
*/

router.get("/all", auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("exchange_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ SUPABASE GET ALL ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load exchange requests.",
      });
    }

    const exchanges = (data || []).map((row) => ({
      ...(row.request_data || {}),

      exchangeId: row.exchange_id,
      createdAt: row.created_at,

      status: row.status,

      orderId:
        row.request_data?.orderId ??
        row.request_data?.orderID ??
        null,

      orderNumber: row.order_number,

      customerEmail: row.customer_email,

      productId: row.product_id
        ? Number(row.product_id)
        : row.request_data?.productId ?? null,

      productTitle:
        row.product_title ??
        row.request_data?.productTitle ??
        "",

      lineItemId: row.line_item_id
        ? Number(row.line_item_id)
        : row.request_data?.lineItemId ?? null,

      variantId: row.variant_id
        ? Number(row.variant_id)
        : row.request_data?.variantId ?? null,

      currentSize:
        row.old_size ??
        row.request_data?.currentSize ??
        "",

      newSize:
        row.new_size ??
        row.request_data?.newSize ??
        "",

      reason:
        row.reason ??
        row.request_data?.reason ??
        "",

      adminNotes:
        row.admin_notes ??
        row.request_data?.adminNotes ??
        "",

      customerNotes:
        row.request_data?.customerNotes ??
        "",

      courierName:
        row.request_data?.courierName ??
        "",

      pickupDate:
        row.request_data?.pickupDate ??
        "",

      pickupTime:
        row.request_data?.pickupTime ??
        "",

      trackingNumber:
        row.tracking_number ??
        row.request_data?.trackingNumber ??
        "",

      trackingUrl:
        row.request_data?.trackingUrl ??
        "",

      timeline:
        row.request_data?.timeline ??
        [],
    }));

    console.log(
      `✅ Loaded ${exchanges.length} exchanges from Supabase`
    );

    res.json(exchanges);
  } catch (err) {
    console.error("❌ GET ALL EXCHANGES ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

/*
========================================
UPDATE STATUS
========================================
*/

router.put("/status/:exchangeId", auth, async (req, res) => {

  console.log("🔥 STATUS UPDATE API HIT");

  try {
    const { data: exchangeRow, error: exchangeFetchError } =
  await supabase
    .from("exchange_requests")
    .select("*")
    .eq("exchange_id", req.params.exchangeId)
    .single();

if (exchangeFetchError || !exchangeRow) {
  console.error(
    "❌ SUPABASE EXCHANGE FETCH ERROR:",
    exchangeFetchError
  );

  return res.status(404).json({
    success: false,
    message: "Exchange not found",
  });
}

const exchange = {
  ...(exchangeRow.request_data || {}),

  exchangeId: exchangeRow.exchange_id,
  createdAt: exchangeRow.created_at,
  status: exchangeRow.status,
  orderNumber: exchangeRow.order_number,
  customerEmail: exchangeRow.customer_email,

  productId:
    exchangeRow.product_id ??
    exchangeRow.request_data?.productId,

  productTitle:
    exchangeRow.product_title ??
    exchangeRow.request_data?.productTitle,

  lineItemId:
    exchangeRow.line_item_id ??
    exchangeRow.request_data?.lineItemId,

  variantId:
    exchangeRow.variant_id ??
    exchangeRow.request_data?.variantId,

  currentSize:
    exchangeRow.old_size ??
    exchangeRow.request_data?.currentSize,

  newSize:
    exchangeRow.new_size ??
    exchangeRow.request_data?.newSize,

  reason:
    exchangeRow.reason ??
    exchangeRow.request_data?.reason,

  adminNotes:
    exchangeRow.admin_notes ??
    exchangeRow.request_data?.adminNotes ??
    "",

  customerNotes:
    exchangeRow.request_data?.customerNotes ??
    "",

  courierName:
    exchangeRow.request_data?.courierName ??
    "",

  pickupDate:
    exchangeRow.request_data?.pickupDate ??
    "",

  pickupTime:
    exchangeRow.request_data?.pickupTime ??
    "",

  trackingNumber:
    exchangeRow.tracking_number ??
    exchangeRow.request_data?.trackingNumber ??
    "",

  trackingUrl:
    exchangeRow.request_data?.trackingUrl ??
    "",

  timeline:
    exchangeRow.request_data?.timeline ??
    [],
};

    exchange.status = req.body.status;

    console.log("Status received:", req.body.status);
    console.log("Status saved:", exchange.status);

    // Admin Notes
if (req.body.adminNotes !== undefined) {
  exchange.adminNotes = req.body.adminNotes;
}

// Customer Notes
if (req.body.customerNotes !== undefined) {
  exchange.customerNotes = req.body.customerNotes;
}
// Courier Name
if (req.body.courierName !== undefined) {
  exchange.courierName = req.body.courierName;
}

// Pickup Date
if (req.body.pickupDate !== undefined) {
  exchange.pickupDate = req.body.pickupDate;
}

// Pickup Time
if (req.body.pickupTime !== undefined) {
  exchange.pickupTime = req.body.pickupTime;
}

// Tracking Number
if (req.body.trackingNumber !== undefined) {
  exchange.trackingNumber = req.body.trackingNumber;
}

// Tracking URL
if (req.body.trackingUrl !== undefined) {
  exchange.trackingUrl = req.body.trackingUrl;
}
if (req.body.trackingNumber !== undefined) {
  exchange.trackingNumber = req.body.trackingNumber;
}

if (req.body.courierName !== undefined) {
  exchange.courierName = req.body.courierName;
}

if (req.body.pickupDate !== undefined) {
  exchange.pickupDate = req.body.pickupDate;
}

    if (!exchange.timeline) {
      exchange.timeline = [];
    }

    exchange.timeline.push({
      status: req.body.status,
      date: new Date().toISOString(),
      by: "Admin",
    });

    const updatedRequestData = {
  ...(exchangeRow.request_data || {}),
  ...exchange,
  updatedAt: new Date().toISOString(),
};

const { error: supabaseUpdateError } = await supabase
  .from("exchange_requests")
  .update({
    status: exchange.status,
    admin_notes: exchange.adminNotes || null,
    tracking_number: exchange.trackingNumber || null,
    request_data: updatedRequestData,
    updated_at: new Date().toISOString(),
  })
  .eq("exchange_id", exchange.exchangeId);

if (supabaseUpdateError) {
  console.error(
    "❌ SUPABASE STATUS UPDATE ERROR:",
    supabaseUpdateError
  );

  return res.status(500).json({
    success: false,
    message: "Unable to save exchange status.",
  });
}

console.log(
  "✅ Exchange status saved to Supabase:",
  exchange.exchangeId,
  exchange.status
);
    
    /*
========================================
APPROVED EMAIL
========================================
*/

if (exchange.status === "Approved") {

  console.log("================================");
  console.log("APPROVED EMAIL TRIGGERED");
  console.log("Status:", exchange.status);
  console.log("Customer Email:", exchange.customerEmail);
  console.log("================================");

  await sendEmail({
    to: exchange.customerEmail,
    subject: "✅ Your Exchange Request Has Been Approved",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">

        <h2>Good News! 🎉</h2>

        <p>Your exchange request has been approved.</p>

        <table style="border-collapse:collapse;width:100%">
          <tr>
            <td><strong>Exchange ID</strong></td>
            <td>${exchange.exchangeId}</td>
          </tr>

          <tr>
            <td><strong>Order</strong></td>
            <td>#${exchange.orderNumber}</td>
          </tr>

          <tr>
            <td><strong>Product</strong></td>
            <td>${exchange.productTitle}</td>
          </tr>

          <tr>
            <td><strong>Requested Size</strong></td>
            <td>${exchange.newSize}</td>
          </tr>
        </table>

        ${
          exchange.customerNotes
            ? `
            <p style="margin-top:20px">
              <strong>Message from our team:</strong><br>
              ${exchange.customerNotes}
            </p>
            `
            : ""
        }

        <p style="margin-top:20px">
          We'll share your pickup schedule shortly.
        </p>

        <br>

        <strong>Crunk Thread</strong>

      </div>
    `,
   });

  console.log("✅ Approved email sent");
}
/*
========================================
PICKUP SCHEDULED EMAIL
========================================
*/

if (exchange.status === "Pickup Scheduled") {

  console.log("================================");
  console.log("PICKUP SCHEDULED EMAIL TRIGGERED");
  console.log("Customer:", exchange.customerEmail);
  console.log("================================");

  await sendEmail({
    to: exchange.customerEmail,
    subject: "📦 Your Exchange Pickup Has Been Scheduled",
    html: `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">

        <div style="background:#000;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#fff;">CRUNK THREAD</h1>
          <p style="margin:8px 0 0;color:#bbb;">
            Premium Streetwear
          </p>
        </div>

        <div style="padding:30px;">

          <h2 style="margin-top:0;">📦 Pickup Scheduled</h2>

          <p>
            Great news! Your exchange request has been approved and your pickup has been scheduled.
          </p>

          <h3>Exchange Details</h3>

          <table style="width:100%;border-collapse:collapse;">

            <tr>
              <td style="padding:10px 0;"><strong>Exchange ID</strong></td>
              <td>${exchange.exchangeId}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Order</strong></td>
              <td>#${exchange.orderNumber}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Product</strong></td>
              <td>${exchange.productTitle}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Requested Size</strong></td>
              <td>${exchange.newSize}</td>
            </tr>

          </table>

          <hr style="margin:25px 0;">

          <h3>Pickup Details</h3>

          <table style="width:100%;border-collapse:collapse;">

            <tr>
              <td style="padding:10px 0;"><strong>Courier</strong></td>
              <td>${exchange.courierName}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Pickup Date</strong></td>
              <td>${exchange.pickupDate}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Pickup Time</strong></td>
              <td>${exchange.pickupTime}</td>
            </tr>

          </table>

          ${
            exchange.customerNotes
              ? `
              <div style="margin-top:25px;padding:16px;background:#f5f5f5;border-radius:8px;">
                <strong>Message from our team</strong>
                <p style="margin-top:10px;">
                  ${exchange.customerNotes}
                </p>
              </div>
              `
              : ""
          }

          <div style="margin-top:30px;padding:18px;background:#fafafa;border-left:4px solid #000;">

            <strong>Please keep your package ready.</strong>

            <ul style="margin-top:12px;padding-left:18px;">
              <li>Product should be unused.</li>
              <li>Original tags must be attached.</li>
              <li>Our courier partner may contact you before pickup.</li>
            </ul>

          </div>

        </div>

        <div style="background:#f7f7f7;padding:20px;text-align:center;font-size:13px;color:#666;">
          Thank you for choosing <strong>Crunk Thread</strong>.
        </div>

      </div>
    `,
  });

  console.log("✅ Pickup Scheduled email sent");
}

/*
========================================
REPLACEMENT SHIPPED EMAIL
========================================
*/

if (exchange.status === "Replacement Shipped") {

  console.log("================================");
  console.log("REPLACEMENT SHIPPED EMAIL");
  console.log("Customer:", exchange.customerEmail);
  console.log("================================");

  await sendEmail({
    to: exchange.customerEmail,
    subject: "🚚 Your Replacement Has Been Shipped",
    html: `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;background:#fff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">

        <div style="background:#000;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#fff;">CRUNK THREAD</h1>
          <p style="margin-top:8px;color:#bbb;">Premium Streetwear</p>
        </div>

        <div style="padding:30px;">

          <h2>🚚 Your Replacement is on the Way!</h2>

          <p>
            Great news! Your replacement has been shipped and is on its way to you.
          </p>

          <table style="width:100%;border-collapse:collapse;margin-top:20px;">

            <tr>
              <td style="padding:10px 0;"><strong>Exchange ID</strong></td>
              <td>${exchange.exchangeId}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Order</strong></td>
              <td>#${exchange.orderNumber}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Product</strong></td>
              <td>${exchange.productTitle}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Size</strong></td>
              <td>${exchange.newSize}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Courier</strong></td>
              <td>${exchange.courierName}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Tracking Number</strong></td>
              <td>${exchange.trackingNumber}</td>
            </tr>

          </table>

          ${
            exchange.trackingUrl
              ? `
              <div style="text-align:center;margin:35px 0;">
                <a
                  href="${exchange.trackingUrl}"
                  style="
                    background:#000;
                    color:#fff;
                    text-decoration:none;
                    padding:14px 28px;
                    border-radius:8px;
                    display:inline-block;
                    font-weight:bold;
                  "
                >
                  Track Your Package
                </a>
              </div>
              `
              : ""
          }

          <p>
            We'll notify you once your replacement has been delivered.
          </p>

        </div>

        <div style="background:#f7f7f7;padding:20px;text-align:center;font-size:13px;color:#666;">
          Thank you for shopping with <strong>Crunk Thread</strong>.
        </div>

      </div>
    `,
  });

  console.log("✅ Replacement Shipped email sent");
}

/*
========================================
DELIVERED EMAIL
========================================
*/

if (exchange.status === "Delivered") {

  console.log("================================");
  console.log("DELIVERED EMAIL TRIGGERED");
  console.log("Customer:", exchange.customerEmail);
  console.log("================================");

  await sendEmail({
    to: exchange.customerEmail,
    subject: "🎉 Your Exchange Has Been Completed",
    html: `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">

        <div style="background:#000;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#fff;">CRUNK THREAD</h1>
          <p style="margin:8px 0 0;color:#bbb;">
            Premium Streetwear
          </p>
        </div>

        <div style="padding:30px;">

          <div style="text-align:center;">
            <div style="font-size:60px;">🎉</div>

            <h2 style="margin-bottom:10px;">
              Exchange Completed Successfully
            </h2>

            <p style="color:#555;font-size:16px;">
              Your replacement has been delivered successfully.
              We hope you love your new size and enjoy wearing it!
            </p>
          </div>

          <hr style="margin:30px 0;">

          <table style="width:100%;border-collapse:collapse;">

            <tr>
              <td style="padding:10px 0;"><strong>Exchange ID</strong></td>
              <td>${exchange.exchangeId}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Order</strong></td>
              <td>#${exchange.orderNumber}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Product</strong></td>
              <td>${exchange.productTitle}</td>
            </tr>

            <tr>
              <td style="padding:10px 0;"><strong>Delivered Size</strong></td>
              <td>${exchange.newSize}</td>
            </tr>

          </table>

          <div style="margin-top:30px;padding:20px;background:#f8f8f8;border-radius:10px;">

            <strong>Thank you for choosing Crunk Thread ❤️</strong>

            <p style="margin-top:10px;color:#555;">
              We truly appreciate your support.
              If you have any questions or need assistance,
              simply reply to this email and our team will be happy to help.
            </p>

          </div>

          <div style="margin-top:30px;text-align:center;">

            <a
              href="https://crunkthread.com"
              style="
                display:inline-block;
                background:#000;
                color:#fff;
                text-decoration:none;
                padding:14px 30px;
                border-radius:8px;
                font-weight:bold;
              "
            >
              Shop Again
            </a>

          </div>

        </div>

        <div style="background:#f7f7f7;padding:20px;text-align:center;font-size:13px;color:#666;">
          © ${new Date().getFullYear()} <strong>Crunk Thread</strong><br>
          Premium Indian Streetwear
        </div>

      </div>
    `,
  });

  console.log("✅ Delivered email sent");
}

    res.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;
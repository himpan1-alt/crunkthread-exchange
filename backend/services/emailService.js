const axios = require("axios");

async function sendEmail({ to, subject, html }) {
  try {
    console.log("📧 BREVO SEND START");
    console.log("To:", to);
    console.log("From:", process.env.BREVO_FROM_EMAIL);
    console.log(
      "API Key:",
      process.env.BREVO_API_KEY ? "LOADED" : "MISSING"
    );

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.BREVO_FROM_NAME,
          email: process.env.BREVO_FROM_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        timeout: 15000,
      }
    );

    console.log("✅ BREVO ACCEPTED");
    console.log("Message ID:", response.data?.messageId);

    return {
      success: true,
      messageId: response.data?.messageId || null,
    };
  } catch (err) {
    console.error("❌ BREVO ERROR");
    console.error("Status:", err.response?.status || "NO STATUS");
    console.error(
      "Response:",
      err.response?.data || err.message
    );

    return {
      success: false,
      error: err.response?.data || err.message,
    };
  }
}

module.exports = {
  sendEmail,
};
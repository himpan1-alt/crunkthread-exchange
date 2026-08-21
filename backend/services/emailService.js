const axios = require("axios");

async function sendEmail({ to, subject, html }) {
  try {
    console.log("📧 Sending Brevo email...");
    console.log("To:", to);
    console.log("From:", process.env.BREVO_FROM_EMAIL);
    console.log(
      "Brevo API Key:",
      process.env.BREVO_API_KEY ? "LOADED" : "MISSING"
    );

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.BREVO_FROM_NAME,
          email: process.env.BREVO_FROM_EMAIL,
        },

        to: [
          {
            email: to,
          },
        ],

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

    console.log("✅ Brevo Email Sent Successfully");
    console.log("Message ID:", response.data?.messageId);

    return {
      success: true,
      messageId: response.data?.messageId,
    };

  } catch (err) {
    console.error("❌ BREVO EMAIL ERROR");

    console.error(
      "Status:",
      err.response?.status || "NO STATUS"
    );

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
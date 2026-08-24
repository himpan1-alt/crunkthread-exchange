const axios = require("axios");

async function sendEmail({ to, subject, html }) {
  try {
    await axios.post(
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
      }
    );

    console.log("✅ Email Sent:", to);
  } catch (err) {
    console.error(
      "❌ Email Error:",
      err.response?.data || err.message
    );
  }
}

module.exports = {
  sendEmail,
};
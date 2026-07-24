const axios = require("axios");

async function getAccessToken() {
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

  return response.data.access_token;
}

async function shopifyGet(endpoint) {
  const token = await getAccessToken();

  const response = await axios.get(
    `https://${process.env.SHOPIFY_STORE}/admin/api/2025-10/${endpoint}`,
    {
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

module.exports = {
  getAccessToken,
  shopifyGet,
};
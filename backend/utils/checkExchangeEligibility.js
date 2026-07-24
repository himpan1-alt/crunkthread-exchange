function checkExchangeEligibility(order) {
  /*
  ========================================
  ORDER EXISTS
  ========================================
  */

  if (!order) {
    return {
      eligible: false,
      message: "Order not found.",
    };
  }

  /*
  ========================================
  DELIVERY STATUS
  ========================================
  */

  if (order.fulfillmentStatus !== "fulfilled") {
    return {
      eligible: false,
      message: "Order has not been delivered yet.",
    };
  }

  /*
  ========================================
  CANCELLED
  ========================================
  */

  if (order.cancelled) {
    return {
      eligible: false,
      message: "Cancelled orders are not eligible for exchange.",
    };
  }

  /*
  ========================================
  REFUNDED
  ========================================
  */

  if (order.refunded) {
    return {
      eligible: false,
      message: "Refunded orders are not eligible for exchange.",
    };
  }

  /*
  ========================================
  EXCHANGE WINDOW
  ========================================
  */

  const deliveredDate = new Date(order.deliveredAt);
  const today = new Date();

  const diffDays = Math.floor(
    (today - deliveredDate) / (1000 * 60 * 60 * 24)
  );

  if (diffDays > 7) {
    return {
      eligible: false,
      message: "Exchange window has expired.",
    };
  }

  /*
  ========================================
  ELIGIBLE
  ========================================
  */

  return {
    eligible: true,
  };
}

module.exports = checkExchangeEligibility;
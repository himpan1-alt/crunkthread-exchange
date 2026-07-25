"use client";

import { load } from "@cashfreepayments/cashfree-js";
import { useState } from "react";
import VerifyForm from "@/components/VerifyForm";
import OrderItems from "@/components/OrderItems";
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type Order = {
  id: number;
  name: string;
};

type OrderItem = {
  lineItemId: number;
  productId: number;
  variantId: number;
  title: string;
  variantTitle: string;
  quantity: number;
  image: string | null;
};

export default function ExchangePage() {
  
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);

  const [selectedSize, setSelectedSize] = useState("");

  const [stockStatus, setStockStatus] = useState<{
    available: boolean;
    stock: number;
  } | null>(null);

  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [step, setStep] = useState(1);

  const [exchangeSuccess, setExchangeSuccess] = useState(false);
  const [exchangeId, setExchangeId] = useState("");

  async function verifyOrder() {
    setLoading(true);

    setMessage("");
    setItems([]);
    setSelectedItem(null);
    setSelectedSize("");
    setStockStatus(null);
    setReason("");
    setOtherReason("");

    try {
      const response = await fetch(
  `${API_URL}/api/orders/verify-order`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderNumber,
      email,
    }),
  }
);

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || "Order verification failed.");
        return;
      }

      setOrder(data.order);
      setMessage("✅ Order verified successfully.");

      const itemsResponse = await fetch(
        `${API_URL}/api/orders/${data.order.id}/items`
      );

      const itemsData = await itemsResponse.json();

      if (!itemsData.success) {
        setMessage(itemsData.message || "Unable to load products.");
        return;
      }

      setItems(itemsData.items);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================
  // Inventory Check
  // ==========================

  async function checkInventory(productId: number, size: string) {
    try {
      const response = await fetch(
        `${API_URL}/api/inventory/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            size,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setStockStatus({
          available: data.available,
          stock: data.stock,
        });
      } else {
        setStockStatus(null);
      }
    } catch (err) {
      console.error(err);
      setStockStatus(null);
    }
  }

  function handleContinue() {
  setStep(2);
}

async function startPayment() {
  if (!selectedItem) return;

  try {
    const response = await fetch(
      `${API_URL}/api/payment/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber,
          customerEmail: email,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Unable to start payment.");
      return;
    }

    const cashfree = await load({
      mode: "production",
    });

    if (!cashfree) {
      alert("Unable to load Cashfree.");
      return;
    }

    await cashfree.checkout({
      paymentSessionId: data.paymentSessionId,
      redirectTarget: "_modal",
    });

  } catch (err) {
    console.error(err);
    alert("Unable to start payment.");
  }
}

async function submitExchange() {
  if (!selectedItem) return;

  try {
    const response = await fetch(
      `${API_URL}/api/exchange/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  orderId: order?.id,
  orderNumber,

  customerEmail: email,

  lineItemId: selectedItem.lineItemId,

  productId: selectedItem.productId,

  variantId: selectedItem.variantId,

  productTitle: selectedItem.title,

  productImage: selectedItem.image,

  currentSize: selectedItem.variantTitle,

  newSize: selectedSize,

  reason: reason === "Other" ? otherReason : reason,
}),
      }
    );

    const data = await response.json();

if (!response.ok) {
  alert(data.message || "Unable to create exchange request.");
  return;
}

setExchangeId(data.exchangeId);
setExchangeSuccess(true);
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
}
  function handleSelectItem(item: OrderItem) {
    setSelectedItem(item);

    setSelectedSize("");
    setStockStatus(null);
    setReason("");
    setOtherReason("");

    console.log("Selected Item:", item);
  }

  if (exchangeSuccess) {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-10 text-center">

        <div className="text-6xl mb-6">✅</div>

        <h1 className="text-3xl font-bold mb-4">
          Exchange Request Submitted
        </h1>

        <p className="text-gray-600 mb-8">
          Your exchange request has been received successfully.
        </p>

        <div className="bg-gray-100 rounded-xl p-6 mb-8">
          <p className="text-sm text-gray-500">Exchange ID</p>
          <h2 className="text-3xl font-bold mt-2">{exchangeId}</h2>
        </div>

        <p className="text-gray-600">
          We'll review your request within 24 hours.
        </p>

      </div>
    </main>
  );
}

  return (
    
    <main className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center">
          CRUNK THREAD
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Exchange Portal
        </p>

        <VerifyForm
          orderNumber={orderNumber}
          email={email}
          loading={loading}
          onOrderChange={setOrderNumber}
          onEmailChange={setEmail}
          onVerify={verifyOrder}
        />

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
  <h3 className="text-lg font-semibold mb-4">
    Important Information
  </h3>

  <ul className="space-y-3 text-sm text-gray-700">
    <li className="flex items-start gap-3">
      <span>⏳</span>
      <span>
        Exchange requests must be submitted within <strong>7 days</strong> of
        delivery.
      </span>
    </li>

    <li className="flex items-start gap-3">
      <span>✔</span>
      <span>Size exchange only.</span>
    </li>

    <li className="flex items-start gap-3">
      <span>✔</span>
      <span>
        Product must be unused, unwashed, and in its original condition with
        all tags attached.
      </span>
    </li>

    <li className="flex items-start gap-3">
      <span>₹</span>
      <span>
        <strong>Exchanges are chargeable at Rs.199/-</strong> (Reverse pickup
        and reshipping charge).
      </span>
    </li>

    <li className="flex items-start gap-3">
      <span>❌</span>
      <span>Customized products are not eligible for exchange.</span>
    </li>
  </ul>
</div>

        {message && (
          <div className="mt-6 text-center font-medium">
            {message}
          </div>
        )}

        {order && (
          <div className="mt-3 text-center text-sm text-gray-500">
            Order: {order.name}
          </div>
        )}

        {step === 1 && items.length > 0 && (
  <OrderItems
    items={items}
    onSelect={handleSelectItem}
    selectedItem={selectedItem}
    selectedSize={selectedSize}
    setSelectedSize={setSelectedSize}
    stockStatus={stockStatus}
    checkInventory={checkInventory}
    reason={reason}
    setReason={setReason}
    otherReason={otherReason}
    setOtherReason={setOtherReason}
    onContinue={handleContinue}
  />
)}

{step === 2 && (
  <div className="mt-8 rounded-2xl border border-gray-200 p-6">

    <h2 className="text-2xl font-bold mb-6">
      Review Exchange
    </h2>

    <div className="flex flex-col md:flex-row gap-6">

      <div className="w-40">
        {selectedItem?.image && (
          <img
            src={selectedItem.image}
            alt={selectedItem.title}
            className="w-40 h-40 object-contain bg-gray-100 rounded-xl p-2"
          />
        )}
      </div>

      <div className="flex-1 space-y-3">

        <h3 className="text-xl font-semibold">
          {selectedItem?.title}
        </h3>

        <div className="grid grid-cols-2 gap-y-3">

          <p>
            <span className="font-semibold">
              Current Size:
            </span>{" "}
            {selectedItem?.variantTitle}
          </p>

          <p>
            <span className="font-semibold">
              New Size:
            </span>{" "}
            {selectedSize}
          </p>

          <p className="col-span-2">
            <span className="font-semibold">
              Reason:
            </span>{" "}
            {reason === "Other" ? otherReason : reason}
          </p>

        </div>

      </div>

    </div>

    <div className="mt-8 flex gap-4">

      <button
        onClick={() => setStep(1)}
        className="flex-1 border rounded-xl py-3 font-semibold"
      >
        Back
      </button>

      <button
  onClick={startPayment}
  className="flex-1 bg-black text-white rounded-xl py-3 font-semibold"
>
  Pay ₹199 & Submit Exchange
</button>

    </div>

  </div>
)}

      </div>
    </main>
  );
}
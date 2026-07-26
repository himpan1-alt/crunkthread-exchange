"use client";

import { load } from "@cashfreepayments/cashfree-js";
import { useState, useRef } from "react";
import VerifyForm from "@/components/VerifyForm";
import OrderItems from "@/components/OrderItems";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Clock3,
  Ruler,
  Tag,
  Wallet,
  CircleX,
} from "lucide-react";
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

  const verifyResultRef = useRef<HTMLDivElement>(null);

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
      setTimeout(() => {
  verifyResultRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}, 150);

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
    
    <main className="min-h-screen bg-[#f5f5f2] py-12 px-4">

  <div className="mx-auto max-w-3xl rounded-[32px] border border-neutral-200 bg-white p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

        <div className="text-center mb-10">

  <div className="flex justify-center mb-6">
    <Image
      src="/logo.png"
      alt="Crunk Thread"
      width={230}
      height={76}
      priority
      className="h-auto w-auto"
    />
  </div>

  <div className="mx-auto mt-2 mb-8 h-px w-20 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

  <h2 className="mt-2 text-3xl font-semibold tracking-[0.08em] text-neutral-900">
    Official Exchange Portal
  </h2>

  <p className="mt-5 max-w-lg mx-auto text-[17px] leading-7 text-neutral-500">
  Verify your order and submit a size exchange in just a few minutes.
  </p>

</div>

        <VerifyForm
          orderNumber={orderNumber}
          email={email}
          loading={loading}
          onOrderChange={setOrderNumber}
          onEmailChange={setEmail}
          onVerify={verifyOrder}
        />

       <div ref={verifyResultRef}>
  {message && (
  <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">

    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white font-bold">
        ✓
      </div>

      <div>

        <h3 className="text-lg font-semibold text-green-800">
          Order Verified Successfully
        </h3>

        <p className="text-sm text-green-700 mt-1">
          Please select the product you want to exchange below.
        </p>

      </div>

    </div>

  </div>
)}

  {order && (
  <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">

    <span className="text-sm text-gray-500">
      Verified Order
    </span>

    <p className="mt-1 text-lg font-semibold text-black">
      {order.name}
    </p>

  </div>
)}
</div>

        
  {step === 1 && items.length > 0 && (
  <div id="products-section">
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
  </div>
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
  Pay ₹149 & Submit Exchange
</button>

    </div>

  </div>
)}

<div className="mt-12 overflow-hidden rounded-[32px] border border-neutral-200 bg-white">

  <div className="px-10 pt-12 pb-10 text-center">

  <span className="text-xs uppercase tracking-[0.45em] text-neutral-400">
    POLICY
  </span>

  <h2 className="mt-4 text-5xl font-semibold tracking-tight text-black">
    Exchange Policy
  </h2>

  <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-8 text-neutral-500">
    Please review these guidelines before submitting your exchange request.
  </p>

</div>

  <div className="divide-y divide-neutral-100">

    <div className="px-10 py-8">
      <h3 className="text-lg font-semibold text-black">
        7 Days Exchange Window.
      </h3>

      <p className="mt-3 text-[15px] leading-7 text-neutral-500">
        Exchange requests must be submitted within <strong>7 days</strong> of delivery.
      </p>
    </div>

    <div className="px-10 py-8">
      <h3 className="text-lg font-semibold text-black">
        Size Exchange Only
      </h3>

      <p className="mt-3 text-[15px] leading-7 text-neutral-500">
        Only size exchanges are allowed. Product design or colour cannot be changed.
      </p>
    </div>

    <div className="px-10 py-8">
      <h3 className="text-lg font-semibold text-black">
        Original Condition
      </h3>

      <p className="mt-3 text-[15px] leading-7 text-neutral-500">
        Products must be unused, unwashed and returned with all original tags.
      </p>
    </div>

    <div className="px-10 py-8">
      <h3 className="text-lg font-semibold text-black">
        Exchange Fee
      </h3>

      <p className="mt-3 text-[15px] leading-7 text-neutral-500">
        ₹149 includes reverse pickup and reshipping.
      </p>
    </div>

    <div className="bg-red-50/60 px-10 py-8">

      <h3 className="text-lg font-semibold text-red-700">
        Not Eligible
      </h3>

      <p className="mt-3 text-[15px] leading-7 text-red-600">
        Customized products are not eligible for exchange.
      </p>

    </div>
  </div>

</div>

      </div>
      <div className="mt-12 border-t border-neutral-200 pt-8 text-center">

  <p className="text-sm text-neutral-500">
    By continuing, you agree to our policies.
  </p>

  <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">

    <a
      href="https://crunkthread.com/policies/refund-policy"
      target="_blank"
      rel="noopener noreferrer"
      className="text-black hover:underline"
    >
      Refund & Exchange Policy
    </a>

    <span className="text-neutral-300">•</span>

    <a
      href="https://crunkthread.com/policies/privacy-policy"
      target="_blank"
      rel="noopener noreferrer"
      className="text-black hover:underline"
    >
      Privacy Policy
    </a>

    <span className="text-neutral-300">•</span>

    <a
      href="https://crunkthread.com/policies/terms-of-service"
      target="_blank"
      rel="noopener noreferrer"
      className="text-black hover:underline"
    >
      Terms & Conditions
    </a>

    <span className="text-neutral-300">•</span>

    <a
      href="https://crunkthread.com/policies/shipping-policy"
      target="_blank"
      rel="noopener noreferrer"
      className="text-black hover:underline"
    >
      Shipping Policy
    </a>

  </div>

</div>
    </main>
  );
}
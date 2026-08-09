"use client";

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
  RefreshCw,
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
  const [errorMessage, setErrorMessage] = useState("");

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

  if (!orderNumber.trim() || !email.trim()) {
    setMessage("Please enter your Order Number and Email Address.");
    return;
  }

  setLoading(true);

  setMessage("");
  setErrorMessage("");
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
  console.log("VERIFY RESPONSE:", data);

      if (!data.success) {
        setErrorMessage(data.message || "Order verification failed.");
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
    const response = await fetch(`${API_URL}/api/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderNumber,
        customerEmail: email,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Unable to create payment.");
      return;
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,

      name: "Crunk Thread",
      description: "Exchange Fee",

      prefill: {
        email,
      },

      theme: {
        color: "#000000",
      },

      handler: async function (response: any) {
  try {
    const verifyResponse = await fetch(
      `${API_URL}/api/payment/verify-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      alert("Payment verification failed.");
      return;
    }

    await submitExchange();

  } catch (err) {
    console.error(err);
    alert("Unable to verify payment.");
  }
},

      modal: {
        ondismiss: function () {
          console.log("Payment cancelled");
        },
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();

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

  <div className="mx-auto max-w-3xl rounded-2xl md:rounded-[32px] border border-neutral-200 bg-white p-5 sm:p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

        <div className="text-center mb-10">

  <div className="flex justify-center mb-6">
    <Image
  src="/logo.png"
  alt="Crunk Thread"
  width={230}
  height={76}
  priority
  className="h-auto w-[170px] sm:w-[190px] md:w-[230px]"
/>
  </div>

  <div className="mx-auto mt-2 mb-8 h-px w-20 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

  <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[0.04em] md:tracking-[0.08em] text-neutral-900">
  EXCHANGE PORTAL
  </h2>

  <p className="mt-4 max-w-lg mx-auto text-[15px] sm:text-[16px] md:text-[17px] leading-7 text-neutral-500">
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
        {errorMessage && (
  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
    <p className="text-red-700">{errorMessage}</p>
  </div>
)}
  {order && (
  <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 sm:p-5">

    <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">

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
  <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center">

    <span className="text-sm text-gray-500">
      Verified Order
    </span>

    <p className="mt-1 text-base sm:text-lg font-semibold text-black break-words">
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

    <div className="mt-8 flex flex-col sm:flex-row gap-4">

  <button
    onClick={() => setStep(1)}
    className="w-full sm:flex-1 border border-black rounded-xl py-4 text-lg font-semibold"
  >
    Back
  </button>

  <button
    onClick={startPayment}
    className="w-full sm:flex-1 bg-black text-white rounded-xl py-4 text-lg font-semibold whitespace-nowrap"
  >
    Pay <span className="font-sans">Rs.</span>149 &amp; Submit Exchange
  </button>

</div>

  </div>
)}

{/* =========================
    EXCHANGE POLICY
========================= */}

<div className="mt-12 overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]">

  {/* Header */}
  <div className="px-5 sm:px-8 md:px-10 pt-12 md:pt-16 pb-10 text-center">

    <span className="text-xs uppercase tracking-[0.5em] text-neutral-400">
      POLICY
    </span>

    <h2 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-black">
      Exchange Policy
    </h2>

    <p className="mx-auto mt-6 max-w-2xl text-[15px] sm:text-[16px] leading-8 text-neutral-500">
      Please review these guidelines carefully before submitting your
      exchange request.
    </p>

    <div className="mx-auto mt-9 h-px w-24 bg-neutral-300" />

  </div>


  {/* Accordions */}
  <div className="px-4 sm:px-6 md:px-10 pb-10 space-y-4">


    {/* 1. 7 DAYS */}
    <details className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden">

      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 sm:px-7 py-6">

        <div className="flex items-center gap-5">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <Clock3 className="h-6 w-6 text-black" />
          </div>

          <span className="text-lg sm:text-xl font-semibold text-black">
            7 Days Exchange Window
          </span>

        </div>

        <span className="text-2xl text-black transition-transform duration-200 group-open:rotate-180">
          ↓
        </span>

      </summary>

      <div className="border-t border-neutral-100 px-5 sm:px-7 pb-7 pt-5">

        <p className="text-[15px] leading-7 text-neutral-600">
          We accept <strong className="text-black">
            size exchange requests within 7 days
          </strong> from the date your order is delivered.
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-neutral-600">
          <li>We do not offer returns.</li>
          <li>
            Replacement/exchange is available only for size-related issues.
          </li>
          <li>
            Customized products are not eligible for return or exchange.
          </li>
          <li>
            Exchange requests are subject to product availability.
          </li>
        </ul>

      </div>

    </details>


    {/* 2. SIZE EXCHANGE */}
    <details className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden">

      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 sm:px-7 py-6">

        <div className="flex items-center gap-5">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <Ruler className="h-6 w-6 text-black" />
          </div>

          <span className="text-lg sm:text-xl font-semibold text-black">
            Size Exchange Only
          </span>

        </div>

        <span className="text-2xl text-black transition-transform duration-200 group-open:rotate-180">
          ↓
        </span>

      </summary>

      <div className="border-t border-neutral-100 px-5 sm:px-7 pb-7 pt-5">

        <p className="text-[15px] leading-7 text-neutral-600">
          We strongly recommend checking the size chart carefully before
          placing your order.
        </p>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          We can accept exchange requests for a maximum of
          <strong className="text-black"> two products per order.</strong>
        </p>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          If you are unsure about your size, please contact us before placing
          your order.
        </p>

      </div>

    </details>


    {/* 3. ORIGINAL CONDITION */}
    <details className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden">

      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 sm:px-7 py-6">

        <div className="flex items-center gap-5">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <Tag className="h-6 w-6 text-black" />
          </div>

          <span className="text-lg sm:text-xl font-semibold text-black">
            Original Condition
          </span>

        </div>

        <span className="text-2xl text-black transition-transform duration-200 group-open:rotate-180">
          ↓
        </span>

      </summary>

      <div className="border-t border-neutral-100 px-5 sm:px-7 pb-7 pt-5">

        <p className="text-[15px] leading-7 text-neutral-600">
          To be eligible for an exchange, the product must be:
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-neutral-600">
          <li>Unused</li>
          <li>Unwashed</li>
          <li>In its original condition</li>
          <li>With all original tags attached</li>
          <li>Properly packed with the original packaging</li>
        </ul>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          Products showing signs of use, washing, damage or alteration may
          not be accepted.
        </p>

      </div>

    </details>


    {/* 4. WRONG / DAMAGED */}
    <details className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden">

      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 sm:px-7 py-6">

        <div className="flex items-center gap-5">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <CircleX className="h-6 w-6 text-black" />
          </div>

          <span className="text-lg sm:text-xl font-semibold text-black">
            Wrong, Damaged or Misprinted Items
          </span>

        </div>

        <span className="text-2xl text-black transition-transform duration-200 group-open:rotate-180">
          ↓
        </span>

      </summary>

      <div className="border-t border-neutral-100 px-5 sm:px-7 pb-7 pt-5">

        <p className="text-[15px] leading-7 text-neutral-600">
          If you receive a wrong, defective, damaged or misprinted product,
          you must record a
          <strong className="text-black">
            {" "}continuous unpacking/unboxing video
          </strong>
          while opening the package.
        </p>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          The video should clearly show the package and the product received.
        </p>

        <p className="mt-4 text-[15px] leading-7 text-red-600">
          <strong>
            Without a valid unpacking video, we will not be able to accept or
            process a replacement request.
          </strong>
        </p>

      </div>

    </details>


    {/* 5. EXCHANGE PROCESS */}
    <details className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden">

      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 sm:px-7 py-6">

        <div className="flex items-center gap-5">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <RefreshCw className="h-6 w-6 text-black" />
          </div>

          <span className="text-lg sm:text-xl font-semibold text-black">
            Exchange Process & Fee
          </span>

        </div>

        <span className="text-2xl text-black transition-transform duration-200 group-open:rotate-180">
          ↓
        </span>

      </summary>

      <div className="border-t border-neutral-100 px-5 sm:px-7 pb-7 pt-5">

        <p className="text-[15px] leading-7 text-neutral-600">
          Customers can submit their exchange request directly through our
          <strong className="text-black"> Self Exchange Portal.</strong>
        </p>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          Once your exchange request is approved,
          <strong className="text-black">
            {" "}we will arrange the reverse pickup from your address.
          </strong>
        </p>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          After we receive and inspect the product, your replacement will be
          processed and shipped.
        </p>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          New tracking details will be shared with you once the replacement
          is dispatched.
        </p>

        <div className="mt-6 rounded-xl bg-neutral-50 border border-neutral-200 p-5">

          <p className="font-semibold text-black">
            Please Note
          </p>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-7 text-neutral-600">
            <li>
              An <strong className="text-black">exchange fee is applicable</strong>
              {" "}Exchange Fee
Rs.149 includes reverse pickup and reshipping.
            </li>
            <li>
              The product must be unused, unwashed and have original tags
              and packaging intact.
            </li>
            <li>
              Exchange requests are subject to the terms of this policy.
            </li>
          </ul>

        </div>

      </div>

    </details>


    {/* 6. REFUND */}
    <details className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden">

      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 sm:px-7 py-6">

        <div className="flex items-center gap-5">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <Wallet className="h-6 w-6 text-black" />
          </div>

          <span className="text-lg sm:text-xl font-semibold text-black">
            Refund Policy
          </span>

        </div>

        <span className="text-2xl text-black transition-transform duration-200 group-open:rotate-180">
          ↓
        </span>

      </summary>

      <div className="border-t border-neutral-100 px-5 sm:px-7 pb-7 pt-5">

        <p className="text-[15px] leading-7 text-neutral-600">
          <strong className="text-black">
            We do not offer refunds.
          </strong>
        </p>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          If you experience an issue with your order, we will work to resolve
          it through a replacement wherever the issue is covered under this
          policy.
        </p>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          Refund requests will not be accepted for:
        </p>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-7 text-neutral-600">
          <li>Size issues</li>
          <li>Change of mind</li>
          <li>Incorrect size selection</li>
          <li>Product preferences</li>
          <li>Orders that have already been shipped</li>
        </ul>

      </div>

    </details>


    {/* 7. CUSTOMER RESPONSIBILITY */}
    <details className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden">

      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 sm:px-7 py-6">

        <div className="flex items-center gap-5">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <Clock3 className="h-6 w-6 text-black" />
          </div>

          <span className="text-lg sm:text-xl font-semibold text-black">
            Customer Responsibility & RTO
          </span>

        </div>

        <span className="text-2xl text-black transition-transform duration-200 group-open:rotate-180">
          ↓
        </span>

      </summary>

      <div className="border-t border-neutral-100 px-5 sm:px-7 pb-7 pt-5">

        <p className="text-[15px] leading-7 text-neutral-600">
          Customers are responsible for providing accurate delivery address,
          phone number, billing details and shipping details.
        </p>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          Customers must also ensure that someone is available to receive the
          order.
        </p>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          Failed delivery attempts caused by an incorrect address, incorrect
          contact information, customer unavailability or refusal to accept
          the shipment may result in the package being returned to origin
          <strong className="text-black"> (RTO).</strong>
        </p>

        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          Any dispute relating to non-delivery, delivery attempts, order
          refusal, cancellation after shipment or RTO will be reviewed on the
          basis of the
          <strong className="text-black">
            {" "}official courier tracking information.
          </strong>
        </p>

      </div>

    </details>


    {/* 8. CUSTOMIZED */}
    <details className="group rounded-2xl border border-red-200 bg-red-50/40 overflow-hidden">

      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 sm:px-7 py-6">

        <div className="flex items-center gap-5">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white">
            <CircleX className="h-6 w-6 text-red-600" />
          </div>

          <span className="text-lg sm:text-xl font-semibold text-red-700">
            Customized Products
          </span>

        </div>

        <span className="text-2xl text-red-700 transition-transform duration-200 group-open:rotate-180">
          ↓
        </span>

      </summary>

      <div className="border-t border-red-200 px-5 sm:px-7 pb-7 pt-5">

        <p className="text-[15px] leading-7 text-red-700">
          <strong>
            Customized products are not eligible for return, refund or exchange.
          </strong>
        </p>

        <p className="mt-4 text-[15px] leading-7 text-red-700">
          This includes products that have been specifically customized or
          personalized according to the customer's requirements.
        </p>

      </div>

    </details>

  </div>


  {/* Exchange Now */}
  <div className="px-5 sm:px-8 md:px-10 pb-12 text-center">

    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      className="inline-flex items-center justify-center rounded-xl bg-black px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
    >
      Exchange Now
    </button>

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
"use client";

import { useState, useEffect } from "react";

export default function ExchangeDetailsDrawer({
  exchange,
  open,
  onClose,
  updateStatus,
}) {
  const [adminNotes, setAdminNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [showPickupModal, setShowPickupModal] = useState(false);

const [courierName, setCourierName] = useState("Delhivery");
const [pickupDate, setPickupDate] = useState("");
const [pickupTime, setPickupTime] = useState("");

const [trackingNumber, setTrackingNumber] = useState("");
const [trackingUrl, setTrackingUrl] = useState("");

const [showShipmentModal, setShowShipmentModal] = useState(false);

  useEffect(() => {
  if (exchange) {
  setAdminNotes(exchange.adminNotes || "");
  setCustomerNotes(exchange.customerNotes || "");

  setCourierName(exchange.courierName || "Delhivery");
  setPickupDate(exchange.pickupDate || "");
  setPickupTime(exchange.pickupTime || "");

  setTrackingNumber(exchange.trackingNumber || "");
  setTrackingUrl(exchange.trackingUrl || "");
}
}, [exchange]);

const STATUS_FLOW = [
  "Pending",
  "Approved",
  "Pickup Scheduled",
  "Picked Up",
  "Received",
  "Replacement Packed",
  "Replacement Shipped",
  "Delivered",
];

const currentStep = STATUS_FLOW.indexOf(exchange?.status);

const getTimelineDate = (status) => {
  const item = exchange?.timeline?.find(
    (t) => t.status === status
  );

  return item ? item.date : null;
};

  if (!open || !exchange) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-screen w-[460px] overflow-y-auto bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold">
            Exchange Details
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-6">

          <img
            src={
              exchange.productImage ||
              "https://placehold.co/500x500?text=No+Image"
            }
            className="w-full rounded-xl border"
            alt=""
          />

          <div>
  <h3 className="text-xl font-bold">
    {exchange.productTitle || "Old Exchange"}
  </h3>

  <p className="mt-2 text-gray-500">
    Order #{exchange.orderNumber || exchange.orderId}
  </p>

  <p className="mt-1 text-sm text-gray-500">
    Exchange ID : {exchange.exchangeId}
  </p>

  <p className="text-sm text-gray-500">
    Created :
    {exchange.createdAt
      ? " " +
        new Date(exchange.createdAt).toLocaleString()
      : " -"}
  </p>
</div>

          <div className="grid grid-cols-2 gap-4">

  <div className="rounded-xl border bg-gray-50 p-4">
    <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
      Customer
    </p>

    <p className="break-all font-semibold">
      {exchange.customerEmail || "-"}
    </p>
  </div>

  <div className="rounded-xl border bg-gray-50 p-4">
    <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
      Status
    </p>

    <div
      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold text-white
        ${
          exchange.status === "Pending"
            ? "bg-yellow-500"
            : exchange.status === "Approved"
            ? "bg-blue-600"
            : exchange.status === "Rejected"
            ? "bg-red-600"
            : exchange.status === "Completed"
            ? "bg-green-600"
            : "bg-gray-600"
        }`}
    >
      {exchange.status}
    </div>
  </div>

  <div className="rounded-xl border bg-gray-50 p-4">
    <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
      Current Size
    </p>

    <p className="text-lg font-bold">
      {exchange.currentSize}
    </p>
  </div>

  <div className="rounded-xl border bg-gray-50 p-4">
    <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
      Requested Size
    </p>

    <p className="text-lg font-bold text-blue-600">
      {exchange.newSize}
    </p>
  </div>

</div>

          <div>
            <p className="text-sm text-gray-500">
              Reason
            </p>

            <div className="mt-2 rounded-lg bg-gray-100 p-4">
              {exchange.reason}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Admin Notes
            </label>

            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border p-3"
              placeholder="Internal notes..."
            />
          </div>

          <div>
  <label className="mb-2 block text-sm font-medium">
    Customer Notes
  </label>

  <textarea
    value={customerNotes}
    onChange={(e) => setCustomerNotes(e.target.value)}
    rows={3}
    className="w-full rounded-lg border p-3"
    placeholder="Visible to customer..."
  />
</div>

{exchange.courierName && (
  <div className="rounded-xl border bg-blue-50 p-4">
    <h3 className="mb-3 text-lg font-bold">
      Courier Details
    </h3>

    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Courier</span>
        <span className="font-semibold">
          {exchange.courierName}
        </span>
      </div>

      {exchange.pickupDate && (
        <div className="flex justify-between">
          <span>Pickup Date</span>
          <span className="font-semibold">
            {exchange.pickupDate}
          </span>
        </div>
      )}

      {exchange.pickupTime && (
        <div className="flex justify-between">
          <span>Pickup Time</span>
          <span className="font-semibold">
            {exchange.pickupTime}
          </span>
        </div>
      )}
    </div>
  </div>
)}

{exchange.trackingNumber && (
  <div className="flex justify-between">
    <span>Tracking Number</span>
    <span className="font-semibold">
      {exchange.trackingNumber}
    </span>
  </div>
)}

{exchange.trackingUrl && (
  <div className="pt-2">
    <a
      href={exchange.trackingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      Track Package →
    </a>
  </div>
)}

<div className="rounded-xl border p-5">
  <h3 className="mb-4 text-lg font-bold">
    Exchange Timeline
  </h3>

  <div className="space-y-3">
    {STATUS_FLOW.map((status) => (
      <div
        key={status}
        className="flex items-center gap-3"
      >
        <div
          className={`h-3 w-3 rounded-full ${
            STATUS_FLOW.indexOf(status) <= currentStep
              ? "bg-green-600"
              : "bg-gray-300"
          }`}
        />

        <div className="flex flex-col">
  <span
    className={
      STATUS_FLOW.indexOf(status) <= currentStep
        ? "font-medium"
        : "text-gray-400"
    }
  >
    {status}
  </span>

  {getTimelineDate(status) && (
    <span className="text-xs text-gray-500">
      {new Date(
        getTimelineDate(status)
      ).toLocaleString()}
    </span>
  )}
</div>
      </div>
    ))}
  </div>
</div>

<div className="space-y-3">

  {exchange.status === "Pending" && (
    <div className="flex gap-3">
      <button
        onClick={async () => {
  await updateStatus(
    exchange.exchangeId,
    "Approved",
    adminNotes,
    customerNotes,
    {
      courierName,
      pickupDate,
      pickupTime,
    }
  );

  console.log({
    courierName,
    pickupDate,
    pickupTime,
  });

  setShowPickupModal(false);
  onClose();
      
}}
        className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
      >
        Approve
      </button>

      <button
        onClick={() => {
          updateStatus(
            exchange.exchangeId,
            "Rejected",
            adminNotes,
            customerNotes
          );
          onClose();
        }}
        className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
      >
        Reject
      </button>
    </div>
  )}

  {exchange.status === "Approved" && (
  <button
    onClick={() => setShowPickupModal(true)}
    className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
  >
    Schedule Pickup
  </button>
)}

  {exchange.status === "Pickup Scheduled" && (
    <button
      onClick={() => {
        updateStatus(
          exchange.exchangeId,
          "Picked Up",
          adminNotes,
          customerNotes
        );
        onClose();
      }}
      className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
    >
      Mark Picked Up
    </button>
  )}

  {exchange.status === "Picked Up" && (
    <button
      onClick={() => {
        updateStatus(
          exchange.exchangeId,
          "Received",
          adminNotes,
          customerNotes
        );
        onClose();
      }}
      className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700"
    >
      Mark Received
    </button>
  )}

  {exchange.status === "Received" && (
    <button
      onClick={() => {
        updateStatus(
          exchange.exchangeId,
          "Replacement Packed",
          adminNotes,
          customerNotes
        );
        onClose();
      }}
      className="w-full rounded-xl bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700"
    >
      Pack Replacement
    </button>
  )}

  {exchange.status === "Replacement Packed" && (
  <button
    onClick={() => setShowShipmentModal(true)}
    className="w-full rounded-xl bg-cyan-600 py-3 font-semibold text-white hover:bg-cyan-700"
  >
    Ship Replacement
  </button>
)}

  {exchange.status === "Replacement Shipped" && (
    <button
      onClick={() => {
        updateStatus(
          exchange.exchangeId,
          "Delivered",
          adminNotes,
          customerNotes
        );
        onClose();
      }}
      className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
    >
      Mark Delivered
    </button>
  )}

  {exchange.status === "Delivered" && (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
      <p className="font-semibold text-green-700">
        ✅ Exchange Completed
      </p>
    </div>
  )}

  {exchange.status === "Rejected" && (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
      <p className="font-semibold text-red-700">
        ❌ Exchange Rejected
      </p>
    </div>
  )}

</div>

          

        </div>

      </div>
      {showPickupModal && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">

    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

      <h3 className="mb-6 text-2xl font-bold">
        Schedule Pickup
      </h3>

      <div className="space-y-4">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Courier Partner
          </label>

          <select
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option>Delhivery</option>
            <option>Blue Dart</option>
            <option>Xpressbees</option>
            <option>DTDC</option>
            <option>Ekart</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Pickup Date
          </label>

          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Pickup Time
          </label>

          <input
            type="time"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

      </div>

      <div className="mt-6 flex gap-3">

        <button
          onClick={() => setShowPickupModal(false)}
          className="flex-1 rounded-xl border py-3"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            updateStatus(
              exchange.exchangeId,
              "Pickup Scheduled",
              adminNotes,
              customerNotes,
              {
                courierName,
                pickupDate,
                pickupTime,
              }
            );

            setShowPickupModal(false);
            onClose();
          }}
          className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white"
        >
          Schedule Pickup
        </button>

      </div>

    </div>

  </div>
)}
{showShipmentModal && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">

    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

      <h3 className="mb-6 text-2xl font-bold">
        Ship Replacement
      </h3>

      <div className="space-y-4">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Courier Partner
          </label>

          <select
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option>Delhivery</option>
            <option>Blue Dart</option>
            <option>Xpressbees</option>
            <option>DTDC</option>
            <option>Ekart</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Tracking Number
          </label>

          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Tracking URL
          </label>

          <input
            type="text"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

      </div>

      <div className="mt-6 flex gap-3">

        <button
          onClick={() => setShowShipmentModal(false)}
          className="flex-1 rounded-xl border py-3"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await updateStatus(
              exchange.exchangeId,
              "Replacement Shipped",
              adminNotes,
              customerNotes,
              {
                courierName,
                trackingNumber,
                trackingUrl,
              }
            );

            setShowShipmentModal(false);
            onClose();
          }}
          className="flex-1 rounded-xl bg-cyan-600 py-3 font-semibold text-white"
        >
          Ship Now
        </button>

      </div>

    </div>

  </div>
)}
    </>
  );
}
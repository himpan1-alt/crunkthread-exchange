"use client";

import { useEffect, useState } from "react";

import StatsCards from "./components/StatsCards";
import SearchBar from "./components/SearchBar";
import ExchangeTable from "./components/ExchangeTable";
import ExchangeDetailsDrawer from "./components/ExchangeDetailsDrawer";

export default function AdminPage() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedExchange, setSelectedExchange] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/exchange/all")
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch(console.error);
  }, []);

  const updateStatus = async (
  exchangeId,
  status,
  adminNotes = "",
  customerNotes = "",
  extraData = {}
) => {
    try {

      console.log({
  status,
  adminNotes,
  customerNotes,
  extraData,
});

      const res = await fetch(
        `http://localhost:5000/api/exchange/status/${exchangeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  status,
  adminNotes,
  customerNotes,
  ...extraData,
}),
        }
      );

      const data = await res.json();

      if (data.success) {
        setRequests((prev) =>
          prev.map((item) =>
            item.exchangeId === exchangeId
              ? {
                 ...item,
                 status,
                 adminNotes,
                 customerNotes,
                 ...extraData,
                }
              : item
          )
        );

        if (
          selectedExchange &&
          selectedExchange.exchangeId === exchangeId
        ) {
          setSelectedExchange((prev) => ({
            ...prev,
            status,
            adminNotes,
            customerNotes,
            ...extraData,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = requests.filter((item) => {
    const q = search.toLowerCase();

    return (
      item.exchangeId.toLowerCase().includes(q) ||
      String(item.orderId).includes(q) ||
      String(item.orderNumber || "").toLowerCase().includes(q) ||
      String(item.customerEmail || "").toLowerCase().includes(q) ||
      String(item.productTitle || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-8 text-4xl font-bold">
        Exchange Dashboard
      </h1>

      <StatsCards
        total={requests.length}
        pending={
          requests.filter((i) => i.status === "Pending").length
        }
        approved={
          requests.filter((i) => i.status === "Approved").length
        }
        rejected={
          requests.filter((i) => i.status === "Rejected").length
        }
      />

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <ExchangeTable
        requests={filteredRequests}
        setSelectedExchange={setSelectedExchange}
        setDrawerOpen={setDrawerOpen}
      />

      <ExchangeDetailsDrawer
        exchange={selectedExchange}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        updateStatus={updateStatus}
      />
    </div>
  );
}
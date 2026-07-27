"use client";

import StatsCards from "./components/StatsCards";
import SearchBar from "./components/SearchBar";
import ExchangeTable from "./components/ExchangeTable";
import ExchangeDetailsDrawer from "./components/ExchangeDetailsDrawer";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

const [selectedExchange, setSelectedExchange] = useState(null);
const [drawerOpen, setDrawerOpen] = useState(false);

const [loggedIn, setLoggedIn] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [loginError, setLoginError] = useState("");

useEffect(() => {
  const token = localStorage.getItem("admin-token");

  if (!token) {
  setCheckingAuth(false);
  return;
}

  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
  setLoggedIn(true);
  setCheckingAuth(false);
})
    .catch(() => {
  localStorage.removeItem("admin-auth");
  localStorage.removeItem("admin-token");
  setLoggedIn(false);
  setCheckingAuth(false);
});
}, []);

  const handleLogin = async (e) => {
  e.preventDefault();

  setLoading(true);
  setLoginError("");

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      setLoginError(data.message || "Login failed");
      setLoading(false);
      return;
    }

    localStorage.setItem("admin-auth", "true");
    localStorage.setItem("admin-token", data.token);

    setLoggedIn(true);
  } catch (err) {
    console.error(err);
    setLoginError("Unable to connect to server.");
  }

  setLoading(false);
};
  

useEffect(() => {
  if (!loggedIn) return;

  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exchange/all`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
    },
  })
    .then((res) => res.json())
    .then((data) => setRequests(data))
    .catch(console.error);
}, [loggedIn]);

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
  `${process.env.NEXT_PUBLIC_API_URL}/api/exchange/status/${exchangeId}`,
        {
          method: "PUT",
          headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
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

  const filteredRequests = requests
  .filter((item) => {
    const q = search.toLowerCase();

    

    return (
      item.exchangeId.toLowerCase().includes(q) ||
      String(item.orderId).includes(q) ||
      String(item.orderNumber || "").toLowerCase().includes(q) ||
      String(item.customerEmail || "").toLowerCase().includes(q) ||
      String(item.productTitle || "").toLowerCase().includes(q)
    );
  })
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

if (checkingAuth) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>

        <h1 className="text-3xl font-bold tracking-widest text-white">
          CRUNK THREAD
        </h1>

        <p className="mt-3 text-sm text-gray-400">
          Verifying Admin Session...
        </p>
      </div>
    </div>
  );
}

if (!loggedIn) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="mb-6 text-center text-3xl font-bold">
          Admin Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          className="mb-4 w-full rounded-lg border p-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded-lg border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {loginError && (
          <p className="mb-4 text-sm text-red-600">
            {loginError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black py-3 font-semibold text-white"
        >
          {loading ? "Signing In..." : "Login"}
        </button>
      </form>
    </div>
  );
}

  return (
    <>
   <div className="mb-8 flex items-center justify-between">
  <h1 className="text-4xl font-bold">
    Exchange Dashboard
  </h1>

  <button
    onClick={() => {
      localStorage.removeItem("admin-auth");
      localStorage.removeItem("admin-token");
      window.location.reload();
    }}
    className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
  >
    Logout
  </button>
</div> 

      <StatsCards
  total={requests.length}
  pending={requests.filter((i) => i.status === "Pending").length}
  approved={requests.filter((i) => i.status === "Approved").length}
  inProgress={
    requests.filter((i) =>
      [
        "Pickup Scheduled",
        "Picked Up",
        "Received",
        "Replacement Packed",
        "Replacement Shipped",
      ].includes(i.status)
    ).length
  }
  delivered={requests.filter((i) => i.status === "Delivered").length}
  rejected={requests.filter((i) => i.status === "Rejected").length}
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

    </>
  );
}
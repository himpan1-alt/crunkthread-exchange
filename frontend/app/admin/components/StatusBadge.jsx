export default function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-100 text-amber-800",
    Approved: "bg-blue-100 text-blue-800",
    Rejected: "bg-red-100 text-red-800",

    "Pickup Scheduled": "bg-purple-100 text-purple-800",
    "Picked Up": "bg-indigo-100 text-indigo-800",
    Received: "bg-orange-100 text-orange-800",
    "Replacement Packed": "bg-slate-200 text-slate-800",
    "Replacement Shipped": "bg-cyan-100 text-cyan-800",
    Delivered: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
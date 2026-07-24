export default function ActionButtons({
  item,
  updateStatus,
}) {
  if (item.status !== "Pending") {
    return (
      <span className="text-sm text-gray-500">
        No Actions
      </span>
    );
  }

  return (
    <div className="flex gap-2">

      <button
        onClick={() =>
          updateStatus(item.exchangeId, "Approved")
        }
        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
      >
        Approve
      </button>

      <button
        onClick={() =>
          updateStatus(item.exchangeId, "Rejected")
        }
        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Reject
      </button>

    </div>
  );
}
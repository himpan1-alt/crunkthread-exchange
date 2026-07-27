export default function StatsCards({
  total,
  pending,
  approved,
  rejected,
  inProgress = 0,
  delivered = 0,
}) {
  const cards = [
    {
      title: "Total Exchanges",
      value: total,
      bg: "bg-white",
      text: "text-gray-800",
    },
    {
      title: "Pending",
      value: pending,
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      title: "Approved",
      value: approved,
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      title: "In Progress",
      value: inProgress,
      bg: "bg-cyan-50",
      text: "text-cyan-700",
    },
    {
      title: "Delivered",
      value: delivered,
      bg: "bg-green-50",
      text: "text-green-700",
    },
    {
      title: "Rejected",
      value: rejected,
      bg: "bg-red-50",
      text: "text-red-700",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${card.bg}`}
        >
          <p className={`text-sm font-medium ${card.text}`}>
            {card.title}
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}
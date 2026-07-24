export default function StatsCards({
  total,
  pending,
  approved,
  rejected,
}) {
  const cards = [
    {
      title: "Total Exchanges",
      value: total,
      bg: "bg-white",
      text: "text-gray-700",
    },
    {
      title: "Pending",
      value: pending,
      bg: "bg-yellow-50",
      text: "text-yellow-700",
    },
    {
      title: "Approved",
      value: approved,
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`rounded-xl border shadow-sm p-5 ${card.bg}`}
        >
          <p className={`text-sm ${card.text}`}>
            {card.title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}
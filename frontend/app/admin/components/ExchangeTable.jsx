import StatusBadge from "./StatusBadge";

export default function ExchangeTable({
  requests,
  setSelectedExchange,
  setDrawerOpen,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>
            <th className="border p-4 text-left">Product</th>
            <th className="border p-4 text-left">Customer</th>
            <th className="border p-4 text-left">Exchange</th>
            <th className="border p-4 text-left">Status</th>
            <th className="border p-4 text-left">Actions</th>
          </tr>

        </thead>

        <tbody>

          {requests.length === 0 ? (

            <tr>
              <td
                colSpan={5}
                className="py-10 text-center text-gray-500"
              >
                No exchange requests found.
              </td>
            </tr>

          ) : (

            requests.map((item) => (

              <tr
                key={item.exchangeId}
                className="border-t hover:bg-gray-50 transition"
              >

                {/* Product */}

                <td className="p-4">

                  <div className="flex items-center gap-4">

                    <img
                      src={
                        item.productImage ||
                        "https://placehold.co/80x80?text=No+Image"
                      }
                      alt={item.productTitle || "Product"}
                      className="w-16 h-16 rounded-lg border object-cover bg-gray-100"
                    />

                    <div>

                      <p className="font-semibold text-sm">
                        {item.productTitle || "Old Exchange Record"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Exchange ID: {item.exchangeId}
                      </p>

                    </div>

                  </div>

                </td>

                {/* Customer */}

                <td className="p-4">

                  <p className="font-medium">
                    {item.customerEmail || "-"}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Order #{item.orderNumber || item.orderId}
                  </p>

                </td>

                {/* Exchange */}

                <td className="p-4">

                  <div className="font-semibold">
                    {item.currentSize}
                    <span className="mx-2 text-gray-400">→</span>
                    {item.newSize}
                  </div>

                  <div className="text-sm text-gray-500 mt-1">
                    {item.reason}
                  </div>

                </td>

                {/* Status */}

                <td className="p-4">
                  <StatusBadge status={item.status} />
                </td>

                {/* Actions */}

                <td className="p-4">

                  <button
                    onClick={() => {
                      setSelectedExchange(item);
                      setDrawerOpen(true);
                    }}
                    className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 transition"
                  >
                    View
                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}
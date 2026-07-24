"use client";

import SizeSelector from "./SizeSelector";
import ExchangeReason from "./ExchangeReason";
import ContinueButton from "./ContinueButton";

type Item = {
  lineItemId: number;
  productId: number;
  variantId: number;
  title: string;
  variantTitle: string;
  quantity: number;
  image: string | null;
};

type Props = {
  items: Item[];
  onSelect: (item: Item) => void;

  selectedItem: Item | null;

  selectedSize: string;
  setSelectedSize: (size: string) => void;

  stockStatus: {
    available: boolean;
    stock: number;
  } | null;

  checkInventory: (productId: number, size: string) => void;

  reason: string;
  setReason: (value: string) => void;

  otherReason: string;
  setOtherReason: (value: string) => void;

  onContinue: () => void;
};

export default function OrderItems({
  items,
  onSelect,

  selectedItem,

  selectedSize,
  setSelectedSize,

  stockStatus,
  checkInventory,

  reason,
  setReason,

  otherReason,
  setOtherReason,

  onContinue,
}: Props) {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">
        Select Product to Exchange
      </h2>

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.lineItemId}
            className="border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row gap-6">

              {/* Product Image */}
              <div className="w-full md:w-44 flex justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-40 h-40 object-contain bg-gray-100 rounded-xl p-2"
                  />
                ) : (
                  <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 flex flex-col justify-between">

                <div>
                  <h3 className="text-xl font-semibold leading-7">
                    {item.title}
                  </h3>

                  <div className="mt-5 grid grid-cols-2 gap-y-3 text-gray-700">

                    <div>
                      <p className="text-sm text-gray-500">
                        Current Size
                      </p>

                      <p className="font-medium">
                        {item.variantTitle}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Quantity
                      </p>

                      <p className="font-medium">
                        {item.quantity}
                      </p>
                    </div>

                  </div>
                </div>

                <button
                  onClick={() => onSelect(item)}
                  className="mt-6 w-full md:w-64 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
                >
                  Exchange This Product
                </button>

                {selectedItem?.lineItemId === item.lineItemId && (
  <div className="mt-8 border-t pt-6">

    <SizeSelector
      currentSize={item.variantTitle}
      selectedSize={selectedSize}
      productId={item.productId}
      setSelectedSize={setSelectedSize}
      checkInventory={checkInventory}
    />

    {stockStatus && (
      <div className="mt-5">
        {stockStatus.available ? (
          <div className="rounded-lg border border-green-300 bg-green-50 p-4">
            <p className="font-semibold text-green-700">
              ✅ In Stock
            </p>

            <p className="text-sm text-green-600">
              {stockStatus.stock} pieces available
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="font-semibold text-red-700">
              ❌ Out of Stock
            </p>
          </div>
        )}
      </div>
    )}

    {stockStatus?.available && (
      <ExchangeReason
        reason={reason}
        setReason={setReason}
        otherReason={otherReason}
        setOtherReason={setOtherReason}
      />
    )}

    {stockStatus?.available && (
      <ContinueButton
        selectedSize={selectedSize}
        stockAvailable={stockStatus.available}
        reason={reason}
        otherReason={otherReason}
        onContinue={onContinue}
      />
    )}

  </div>
)}

              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
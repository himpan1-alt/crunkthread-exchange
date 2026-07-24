"use client";

type Props = {
  currentSize: string;
  selectedSize: string;
  productId: number;

  setSelectedSize: (size: string) => void;
  checkInventory: (productId: number, size: string) => void;
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function SizeSelector({
  currentSize,
  selectedSize,
  productId,
  setSelectedSize,
  checkInventory,
}: Props) {
  const current = currentSize
    .split("/")[0]
    .trim()
    .toUpperCase();

  return (
    <div className="mt-6">

      <h4 className="text-lg font-semibold mb-4">
        Select New Size
      </h4>

      <div className="flex flex-wrap gap-3">

        {SIZES.map((size) => {

          const isCurrent = size === current;

          return (
            <button
              key={size}
              disabled={isCurrent}
              onClick={() => {
                setSelectedSize(size);
                checkInventory(productId, size);
              }}
              className={`w-14 h-12 rounded-lg border font-semibold transition

              ${
                isCurrent
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : selectedSize === size
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }
              
              `}
            >
              {size}
            </button>
          );
        })}

      </div>

    </div>
  );
}
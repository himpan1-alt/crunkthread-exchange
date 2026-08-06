"use client";

import { Ruler, PackageCheck } from "lucide-react";

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
  const current = currentSize?.split("/")[0].trim().toUpperCase();

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#E6F8F6] border border-[#B7EAE4] grid place-items-center">
          <Ruler className="w-5 h-5 text-[#0AB3A6]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Select New Size</h3>
          <p className="text-sm text-neutral-500">
            Choose the size you want to exchange for
          </p>
        </div>
      </div>

      {/* Size grid */}
      <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-3">
        {SIZES.map((size) => {
          const isCurrent = size === current;
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              type="button"
              disabled={isCurrent}
              onClick={() => {
                setSelectedSize(size);
                checkInventory(productId, size);
              }}
              className={`
                h-14 rounded-xl border text-base font-semibold
                transition-all duration-200
                ${
                  isCurrent
                    ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                    : isSelected
                    ? "border-[#0AB3A6] bg-black text-white shadow-[0_8px_20px_-8px_rgba(10,179,166,0.55)] scale-[1.02]"
                    : "border-neutral-200 bg-white text-neutral-900 hover:border-[#0AB3A6] hover:-translate-y-0.5"
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

/* --------------------------------------------------------------
 * Optional: reusable stock banner (use next to <SizeSelector />)
 * -------------------------------------------------------------- */
export function StockBanner({
  available,
  stock,
  size,
}: {
  available: boolean;
  stock: number;
  size: string;
}) {
  return (
    <div
      className={`mt-5 rounded-2xl border px-5 py-4 flex items-center justify-between gap-4 ${
        available
          ? "bg-[#E6F8F6] border-[#B7EAE4]"
          : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full grid place-items-center ${
            available ? "bg-[#0AB3A6]" : "bg-red-500"
          }`}
        >
          {available ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>
        <div>
          <p className={`font-semibold ${available ? "text-[#0AB3A6]" : "text-red-600"}`}>
            {available ? "In Stock" : "Out of Stock"}
          </p>
          <p className="text-sm text-neutral-600">
            {available
              ? `${stock} pieces available in size ${size}`
              : `Size ${size} is currently unavailable`}
          </p>
        </div>
      </div>
      <PackageCheck className={`w-7 h-7 ${available ? "text-[#0AB3A6]" : "text-red-400"}`} />
    </div>
  );
}
"use client";

import { ArrowLeftRight, ClipboardList, Calendar, Mail } from "lucide-react";
import SizeSelector, { StockBanner } from "./SizeSelector";
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
  orderNumber?: string;
  orderDate?: string;
  email?: string;
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

  currentStep?: number; // 1..4
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
  currentStep = 1,
}: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
    Exchange Request
  </h1>

  <p className="mt-2 text-base text-neutral-500">
    Select the item and choose a new size for your exchange.
  </p>
</div>

      {/* Product list */}
      <div className="mt-8 space-y-6">
        {items.map((item) => {
          const isSelected = selectedItem?.lineItemId === item.lineItemId;

          return (
            <div
              key={item.lineItemId}
              className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Image */}
                <div className="md:col-span-3">
                  <div className="aspect-square rounded-xl bg-neutral-100 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-neutral-400 text-sm">
                        No Image
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle */}
                <div className="md:col-span-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
                    {item.title}
                  </h2>

                  <div className="mt-5 flex items-start gap-8">
                    <div>
                      <p className="text-sm text-neutral-500">Current Size</p>
                      <div className="mt-1.5 min-w-14 h-11 px-3 rounded-lg bg-neutral-100 grid place-items-center text-neutral-900 font-semibold">
                        {item.variantTitle}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Quantity</p>
                      <div className="mt-1.5 w-14 h-11 rounded-lg bg-neutral-100 grid place-items-center text-neutral-900 font-semibold">
                        {item.quantity}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="mt-5 inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-black text-white font-semibold hover:bg-neutral-900 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-[#0AB3A6]" />
                    Exchange This Product
                  </button>
                </div>

                {/* Right meta */}
                <div className="md:col-span-3 space-y-4">
                  {item.orderNumber && (
                    <InfoRow
                      icon={<ClipboardList className="w-4 h-4 text-neutral-500" />}
                      label="Order Number"
                      value={`#${item.orderNumber}`}
                    />
                  )}
                  {item.orderDate && (
                    <InfoRow
                      icon={<Calendar className="w-4 h-4 text-neutral-500" />}
                      label="Order Date"
                      value={item.orderDate}
                    />
                  )}
                  {item.email && (
                    <InfoRow
                      icon={<Mail className="w-4 h-4 text-neutral-500" />}
                      label="Email"
                      value={item.email}
                    />
                  )}
                </div>
              </div>

              {/* Expanded selection area */}
              {isSelected && (
                <div className="mt-8 pt-8 border-t border-neutral-200 space-y-6">
                  <SizeSelector
                    currentSize={item.variantTitle}
                    selectedSize={selectedSize}
                    productId={item.productId}
                    setSelectedSize={setSelectedSize}
                    checkInventory={checkInventory}
                  />

                  {stockStatus && selectedSize && (
                    <StockBanner
                      available={stockStatus.available}
                      stock={stockStatus.stock}
                      size={selectedSize}
                    />
                  )}

                  {stockStatus?.available && (
                    <>
                      <div className="h-px bg-neutral-200" />
                      <ExchangeReason
                        reason={reason}
                        setReason={setReason}
                        otherReason={otherReason}
                        setOtherReason={setOtherReason}
                      />
                      <ContinueButton
                        selectedSize={selectedSize}
                        stockAvailable={stockStatus.available}
                        reason={reason}
                        otherReason={otherReason}
                        onContinue={onContinue}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-neutral-100 grid place-items-center">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-sm font-semibold text-neutral-900 truncate">{value}</p>
      </div>
    </div>
  );
}
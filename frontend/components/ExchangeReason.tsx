"use client";

import { Tag, ArrowDown, ArrowUpRight, Pencil } from "lucide-react";

type Props = {
  reason: string;
  setReason: (value: string) => void;

  otherReason: string;
  setOtherReason: (value: string) => void;
};

const REASONS = [
  { id: "Size Too Small", label: "Size Too Small", Icon: ArrowDown },
  { id: "Size Too Large", label: "Size Too Large", Icon: ArrowUpRight },
  { id: "Other", label: "Other", Icon: Pencil },
];

export default function ExchangeReason({
  reason,
  setReason,
  otherReason,
  setOtherReason,
}: Props) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#E6F8F6] border border-[#B7EAE4] grid place-items-center">
          <Tag className="w-5 h-5 text-[#0AB3A6]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Reason for Exchange</h3>
          <p className="text-sm text-neutral-500">
            Help us understand the reason for your exchange
          </p>
        </div>
      </div>

      {/* Reason chips */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {REASONS.map(({ id, label, Icon }) => {
          const selected = reason === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setReason(id)}
              className={`
                h-16 rounded-xl border px-4 flex items-center gap-3 text-left font-semibold
                transition-all duration-200
                ${
                  selected
                    ? "bg-black text-white border-[#0AB3A6] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4)]"
                    : "bg-white text-neutral-900 border-neutral-200 hover:border-[#0AB3A6] hover:-translate-y-0.5"
                }
              `}
            >
              <span
                className={`w-9 h-9 rounded-lg grid place-items-center ${
                  selected ? "bg-white/10 text-white" : "bg-[#E6F8F6] text-[#0AB3A6]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-[15px]">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Textarea */}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white focus-within:border-[#0AB3A6] focus-within:ring-4 focus-within:ring-[#0AB3A6]/10 transition-all">
        <textarea
          value={otherReason}
          onChange={(e) => setOtherReason(e.target.value.slice(0, 200))}
          placeholder="Please specify the reason"
          className="w-full min-h-[92px] resize-none rounded-2xl bg-transparent px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
        />
        <div className="flex justify-end px-4 pb-2 text-xs text-neutral-400">
          {otherReason.length}/200
        </div>
      </div>
    </div>
  );
}
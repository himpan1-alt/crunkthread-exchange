"use client";

import { ArrowRight, Lock } from "lucide-react";

type Props = {
  selectedSize: string;
  stockAvailable: boolean;
  reason: string;
  otherReason: string;
  onContinue: () => void;
};

export default function ContinueButton({
  selectedSize,
  stockAvailable,
  reason,
  otherReason,
  onContinue,
}: Props) {
  const disabled =
    !selectedSize ||
    !stockAvailable ||
    !reason ||
    (reason === "Other" && otherReason.trim() === "");

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={onContinue}
        disabled={disabled}
        className={`
          w-full h-14 rounded-2xl font-semibold text-white
          flex items-center justify-center gap-2
          transition-all duration-200
          ${
            disabled
              ? "bg-neutral-300 cursor-not-allowed"
              : "bg-black hover:bg-neutral-900 hover:-translate-y-0.5 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)]"
          }
        `}
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </button>

      {disabled && (
        <p className="mt-3 text-center text-sm text-neutral-500 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          Please select a new size and reason to continue
        </p>
      )}
    </div>
  );
}
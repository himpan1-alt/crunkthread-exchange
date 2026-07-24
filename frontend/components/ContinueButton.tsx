"use client";

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
    <div className="mt-8">
      <button
        disabled={disabled}
        onClick={onContinue}
        className={`w-full py-4 rounded-xl text-lg font-semibold transition ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        Continue →
      </button>
    </div>
  );
}
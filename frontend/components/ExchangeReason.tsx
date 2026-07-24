"use client";

type Props = {
  reason: string;
  setReason: (value: string) => void;

  otherReason: string;
  setOtherReason: (value: string) => void;
};

export default function ExchangeReason({
  reason,
  setReason,
  otherReason,
  setOtherReason,
}: Props) {
  return (
    <div className="mt-6">

      <h4 className="text-lg font-semibold mb-4">
        Reason for Exchange
      </h4>

      <div className="space-y-3">

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="reason"
            value="Size Too Small"
            checked={reason === "Size Too Small"}
            onChange={(e) => setReason(e.target.value)}
          />

          <span>Size Too Small</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="reason"
            value="Size Too Large"
            checked={reason === "Size Too Large"}
            onChange={(e) => setReason(e.target.value)}
          />

          <span>Size Too Large</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="reason"
            value="Other"
            checked={reason === "Other"}
            onChange={(e) => setReason(e.target.value)}
          />

          <span>Other</span>
        </label>

        {reason === "Other" && (
          <textarea
            className="w-full mt-3 border rounded-xl p-3"
            rows={4}
            placeholder="Please describe your reason..."
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
          />
        )}

      </div>

    </div>
  );
}
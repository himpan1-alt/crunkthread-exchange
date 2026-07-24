"use client";

type Props = {
  orderNumber: string;
  email: string;
  loading: boolean;
  onOrderChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onVerify: () => void;
};

export default function VerifyForm({
  orderNumber,
  email,
  loading,
  onOrderChange,
  onEmailChange,
  onVerify,
}: Props) {
  return (
    <>
      <div className="mt-8">
        <label className="font-medium">Order Number</label>

        <input
          type="text"
          value={orderNumber}
          placeholder="#108068"
          onChange={(e) => onOrderChange(e.target.value)}
          className="w-full border rounded-lg p-3 mt-2"
        />
      </div>

      <div className="mt-5">
        <label className="font-medium">Email Address</label>

        <input
          type="email"
          value={email}
          placeholder="you@example.com"
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full border rounded-lg p-3 mt-2"
        />
      </div>

      <button
        onClick={onVerify}
        disabled={loading}
        className="w-full mt-8 bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify Order"}
      </button>
    </>
  );
}
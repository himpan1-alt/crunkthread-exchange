"use client";
import { motion } from "framer-motion";

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
  <div className="mt-10 space-y-6">

    <div>
      <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-700">
        Order Number
      </label>

      <input
        type="text"
        value={orderNumber}
        placeholder="e.g. 108103"
        onChange={(e) => onOrderChange(e.target.value)}
        className="w-full h-14 rounded-2xl border border-neutral-300 bg-white px-5 text-[15px] text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-black focus:ring-4 focus:ring-black/5"
      />
    </div>

    <div>
      <label className="block mb-2 text-sm font-semibold uppercase tracking-wider text-neutral-700">
        Email Address
      </label>

      <input
        type="email"
        value={email}
        placeholder="you@example.com"
        onChange={(e) => onEmailChange(e.target.value)}
        className="w-full h-14 rounded-2xl border border-neutral-300 bg-white px-5 text-[15px] outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-black focus:ring-2 focus:ring-black/5"
      />
    </div>

    <motion.button
      onClick={onVerify}
      
      whileHover={{ scale: 1.015 }}
whileTap={{ scale: 0.985 }}

      className="group mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-black text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-900 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              opacity=".25"
            />
            <path
              d="M22 12a10 10 0 00-10-10"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>

          VERIFYING...
        </span>
      ) : (
        "VERIFY ORDER"
      )}
    </motion.button>
      </div>
  );
}
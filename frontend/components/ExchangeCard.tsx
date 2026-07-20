export default function ExchangeCard() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-wider text-white">
          CRUNK THREAD
        </h1>

        <p className="mt-2 text-zinc-300">
          Self-Service Exchange Portal
        </p>
      </div>

      <div className="space-y-5">

        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            Order Number
          </label>

          <input
            type="text"
            placeholder="CT12345"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            Mobile Number
          </label>

          <input
            type="tel"
            placeholder="9876543210"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
          />
        </div>

        <button className="mt-4 w-full rounded-xl bg-red-600 py-3 font-semibold transition hover:bg-red-700">
          Verify Order
        </button>

      </div>

      <p className="mt-8 text-center text-xs text-zinc-500">
        Exchange only • No Returns • No Refunds
      </p>
    </div>
  );
}
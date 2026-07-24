export default function SearchBar({
  search,
  setSearch,
}) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search by Exchange ID or Order ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
}
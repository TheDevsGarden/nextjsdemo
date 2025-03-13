"use client";

export default function RefreshButton() {
  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/shopifyGetOrderData");
      const data = await response.json();
      console.log("Data received:", data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-5 border border-gray-400 rounded shadow"
    >
      Refresh Order Data
    </button>
  );
}

"use client";

export default function RefreshButton() {
  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/syncOrderData", {
        method: "POST",
      });
      const data = await response.json();
      console.log("Data Synced:", data);
    } catch (error) {
      console.error("Error syncing data:", error);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-5 border border-gray-400 rounded shadow"
    >
      Sync Order Data
    </button>
  );
}

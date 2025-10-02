"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import RevenueChart from "./components/line-chart-multiple/RevenueChart";
import OrderCountChart from "./components/line-chart-multiple/OrderCountChart";
import TopSalesCards from "./components/line-chart-multiple/TopSalesCards";
import TimeRangeSelector, {
  TimeRange,
} from "./components/line-chart-multiple/TimeRangeSelector";
import { createKeepAliveService } from "@/app/services/keepAlive";

export default function Page() {
  const [timeRange, setTimeRange] = useState<TimeRange>("hourly");
  const [hasDataError, setHasDataError] = useState(false);

  // Initialize keep-alive service
  useEffect(() => {
    const keepAlive = createKeepAliveService();
    keepAlive.start();

    // Cleanup on unmount
    return () => {
      keepAlive.stop();
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      {/* Header with Time Range Selector */}
      <div className="flex justify-between items-center mt-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <TimeRangeSelector selectedRange={timeRange} onChange={setTimeRange} />
      </div>

      {/* KPI Cards */}
      <div>
        <TopSalesCards timeRange={timeRange} />
      </div>

      {/* Warning Alert */}
      {hasDataError && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data Loading Issue</AlertTitle>
          <AlertDescription>
            If charts show "Failed to load order data", the Shopify backend needs reactivation. Please email me to reset it.
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-80">
        <RevenueChart
          timeRange={timeRange}
          onErrorChange={setHasDataError}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-80">
        <OrderCountChart timeRange={timeRange} />
      </div>
    </div>
  );
}

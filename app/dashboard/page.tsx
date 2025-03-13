"use client";

import { useState } from "react";
import RevenueChart from "./components/line-chart-multiple/RevenueChart";
import OrderCountChart from "./components/line-chart-multiple/OrderCountChart";
import TopSalesCards from "./components/line-chart-multiple/TopSalesCards";
import TimeRangeSelector, {
  TimeRange,
} from "./components/line-chart-multiple/TimeRangeSelector";

export default function Page() {
  const [timeRange, setTimeRange] = useState<TimeRange>("hourly");

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

      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-80">
        <RevenueChart timeRange={timeRange} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-80">
        <OrderCountChart timeRange={timeRange} />
      </div>
    </div>
  );
}

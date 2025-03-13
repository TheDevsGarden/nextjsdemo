"use client";

import React, { useState, useEffect } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChartContainer,
} from "@/components/ui/chart";
import { TimeRange } from "./TimeRangeSelector";

interface Order {
  created_at: string;
  total_price: number;
  total_received?: number;
}

interface RevenueData {
  timeKey: string;
  revenue: number;
  receivedRevenue: number;
  orderCount: number;
  avgOrderValue: number;
}

interface RevenueChartProps {
  timeRange: TimeRange;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ timeRange }) => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTimeFormat = (date: Date, range: TimeRange) => {
      switch (range) {
        case 'hourly':
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        case 'daily':
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        case 'weekly':
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          return `${startOfWeek.getFullYear()}-W${Math.ceil((startOfWeek.getDate() + 1 + new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), 0).getDate()) / 7)}`;
        case 'yearly':
          return `${date.getFullYear()}`;
        case 'monthly':
        default:
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
    };

    interface GroupedData {
      timeKey: string;
      revenue: number;
      receivedRevenue: number;
      orderCount: number;
    }
    
    const processOrdersForRevenueChart = (orders: Order[], range: TimeRange): RevenueData[] => {
      const groupedData: Record<string, GroupedData> = {};
      
      orders.forEach(order => {
        if (!order.created_at || !order.total_price) return;
        
        const date = new Date(order.created_at);
        const timeKey = getTimeFormat(date, range);
        
        if (!groupedData[timeKey]) {
          groupedData[timeKey] = {
            timeKey,
            revenue: 0,
            receivedRevenue: 0,
            orderCount: 0
          };
        }
        
        groupedData[timeKey].revenue += Number(order.total_price);
        groupedData[timeKey].receivedRevenue += Number(order.total_received || 0);
        groupedData[timeKey].orderCount += 1;
      });
      
      return Object.values(groupedData)
        .sort((a, b) => a.timeKey.localeCompare(b.timeKey))
        .map(data => ({
          ...data,
          revenue: Number(data.revenue.toFixed(2)),
          receivedRevenue: Number(data.receivedRevenue.toFixed(2)),
          avgOrderValue: Number((data.revenue / data.orderCount).toFixed(2))
        }));
    };

    const generateSampleData = (range: TimeRange): RevenueData[] => {
      const now = new Date();
      const data: RevenueData[] = [];
      
      let count;
      let timeIncrement;
      
      switch (range) {
        case 'hourly':
          count = 24;
          timeIncrement = (i: number) => {
            const date = new Date(now);
            date.setHours(date.getHours() - i);
            return date;
          };
          break;
        case 'daily':
          count = 30;
          timeIncrement = (i: number) => {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            return date;
          };
          break;
        case 'weekly':
          count = 12;
          timeIncrement = (i: number) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7));
            return date;
          };
          break;
        case 'yearly':
          count = 5;
          timeIncrement = (i: number) => {
            const date = new Date(now);
            date.setFullYear(date.getFullYear() - i);
            return date;
          };
          break;
        case 'monthly':
        default:
          count = 12;
          timeIncrement = (i: number) => {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            return date;
          };
      }
      
      for (let i = count - 1; i >= 0; i--) {
        const date = timeIncrement(i);
        const timeKey = getTimeFormat(date, range);
        
        const baseRevenue = 5000 + Math.random() * 3000;
        const seasonalFactor = 1 + Math.sin((date.getMonth() + 1) / 12 * Math.PI) * 0.3;
        const growth = 1 + (i / 24);
        
        const revenue = baseRevenue * seasonalFactor * growth / (range === 'hourly' ? 24 : range === 'daily' ? 30 : range === 'weekly' ? 4 : range === 'yearly' ? 1/12 : 1);
        const receivedRevenue = revenue * (0.9 + Math.random() * 0.1);
        const orderCount = Math.max(1, Math.round(revenue / 100));
        
        data.push({
          timeKey,
          revenue: Number(revenue.toFixed(2)),
          receivedRevenue: Number(receivedRevenue.toFixed(2)),
          orderCount,
          avgOrderValue: Number((revenue / orderCount).toFixed(2))
        });
      }
      
      return data;
    };

    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/dbGetOrderData?limit=1000");
        const data = await response.json();
        
        if (!data || !data.orders || !Array.isArray(data.orders)) {
          throw new Error('Invalid data format');
        }

        const processedData = processOrdersForRevenueChart(data.orders, timeRange);
        setRevenueData(processedData);
      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Failed to load order data');
        
        setRevenueData(generateSampleData(timeRange));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [timeRange]);

  // Format time key for display based on time range
  const formatTimeLabel = (timeKey: string) => {
    if (!timeKey) return '';
    
    switch (timeRange) {
      case 'hourly':
        // Format: YYYY-MM-DD HH:00
        const [, timePart] = timeKey.split(' ');
        return timePart;
      case 'daily':
        // Format: YYYY-MM-DD
        const date = new Date(timeKey);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        // Format: YYYY-WW
        const [, week] = timeKey.split('-W');
        return `Week ${week}`;
      case 'yearly':
        // Format: YYYY
        return timeKey;
      case 'monthly':
      default:
        // Format: YYYY-MM
        const [yearPart, monthPart] = timeKey.split('-');
        const monthDate = new Date(parseInt(yearPart), parseInt(monthPart) - 1, 1);
        return monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  const chartConfig = {
    revenue: {
      label: "Total Revenue",
      color: "#2563eb"
    },
    receivedRevenue: {
      label: "Received Revenue",
      color: "#60a5fa"
    },
    avgOrderValue: {
      label: "Avg Order Value",
      color: "#10b981"
    }
  };

  return (
    <div className="w-full h-full p-4">
      <h3 className="text-lg font-semibold mb-2">Revenue Trends ({timeRange})</h3>
      <div className="h-[calc(100%-2rem)]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="timeKey" 
                tickFormatter={formatTimeLabel}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={(value) => formatCurrency(value)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => formatCurrency(value)}
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value: string | number, name) => [
                  formatCurrency(Number(value)),
                  name === 'revenue' ? 'Total Revenue' : 
                  name === 'receivedRevenue' ? 'Received Revenue' : 
                  'Avg Order Value'
                ]}
                labelFormatter={formatTimeLabel}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-revenue)" 
                strokeWidth={2} 
                dot={false}
                yAxisId="left"
              />
              <Line 
                type="monotone" 
                dataKey="receivedRevenue" 
                stroke="var(--color-receivedRevenue)" 
                strokeWidth={2} 
                dot={false}
                yAxisId="left"
              />
              <Line 
                type="monotone" 
                dataKey="avgOrderValue" 
                stroke="var(--color-avgOrderValue)" 
                strokeWidth={2}
                dot={false}
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default RevenueChart;

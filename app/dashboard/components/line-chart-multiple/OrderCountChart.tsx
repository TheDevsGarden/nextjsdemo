"use client";

import React, { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  ChartContainer,
  ChartConfig
} from "@/components/ui/chart";
import { TimeRange } from "./TimeRangeSelector";

interface Order {
  created_at: string;
  fully_paid: boolean;
}

interface OrderData {
  timeKey: string;
  orderCount: number;
  paidOrders: number;
  unpaidOrders: number;
}

interface OrderCountChartProps {
  timeRange: TimeRange;
}

const OrderCountChart: React.FC<OrderCountChartProps> = ({ timeRange }) => {
  const [chartData, setChartData] = useState<OrderData[]>([]);
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

    const processOrderData = (orders: Order[], range: TimeRange): OrderData[] => {
      const groupedData: Record<string, OrderData> = {};
      
      orders.forEach(order => {
        if (!order.created_at) return;
        
        const date = new Date(order.created_at);
        const timeKey = getTimeFormat(date, range);
        
        if (!groupedData[timeKey]) {
          groupedData[timeKey] = {
            timeKey,
            orderCount: 0,
            paidOrders: 0,
            unpaidOrders: 0,
          };
        }
        
        groupedData[timeKey].orderCount += 1;
        
        if (order.fully_paid) {
          groupedData[timeKey].paidOrders += 1;
        } else {
          groupedData[timeKey].unpaidOrders += 1;
        }
      });
      
      return Object.values(groupedData)
        .sort((a, b) => a.timeKey.localeCompare(b.timeKey));
    };

    const generateSampleData = (range: TimeRange): OrderData[] => {
      const now = new Date();
      const data: OrderData[] = [];
      
      let count;
      let timeIncrement;
      
      switch (range) {
        case 'hourly':
          count = 24;
          timeIncrement = (i: number): Date => {
            const date = new Date(now);
            date.setHours(date.getHours() - i);
            return date;
          };
          break;
        case 'daily':
          count = 30;
          timeIncrement = (i: number): Date => {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            return date;
          };
          break;
        case 'weekly':
          count = 12;
          timeIncrement = (i: number): Date => {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7));
            return date;
          };
          break;
        case 'yearly':
          count = 5;
          timeIncrement = (i: number): Date => {
            const date = new Date(now);
            date.setFullYear(date.getFullYear() - i);
            return date;
          };
          break;
        case 'monthly':
        default:
          count = 12;
          timeIncrement = (i: number): Date => {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            return date;
          };
      }
      
      for (let i = count - 1; i >= 0; i--) {
        const date = timeIncrement(i);
        const timeKey = getTimeFormat(date, range);
        
        const scaleFactor = range === 'hourly' ? 0.1 : 
                            range === 'daily' ? 0.5 : 
                            range === 'weekly' ? 2 : 
                            range === 'yearly' ? 24 : 1;
        
        const orderCount = Math.round((40 + Math.random() * 30) * scaleFactor);
        const paidOrders = Math.round(orderCount * (0.7 + Math.random() * 0.2));
        const unpaidOrders = orderCount - paidOrders;
        
        data.push({
          timeKey,
          orderCount,
          paidOrders,
          unpaidOrders
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

        console.log('Order API Response:', data);
        const processedData = processOrderData(data.orders, timeRange);
        console.log('Processed Order Data:', processedData);
        setChartData(processedData);
      } catch (err) {
        console.error('Error fetching order data:', err);
        setError('Failed to load order data');
        
        setChartData(generateSampleData(timeRange));
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [timeRange]);

  const formatTimeLabel = (timeKey: string) => {
    if (!timeKey) return '';
    
    switch (timeRange) {
      case 'hourly':
        const [, timePart] = timeKey.split(' ');
        return timePart;
      case 'daily':
        const date = new Date(timeKey);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        const [, week] = timeKey.split('-W');
        return `Week ${week}`;
      case 'yearly':
        return timeKey;
      case 'monthly':
      default:
        const [yearPart, monthPart] = timeKey.split('-');
        const monthDate = new Date(parseInt(yearPart), parseInt(monthPart) - 1, 1);
        return monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
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
    paidOrders: {
      label: "Paid Orders",
      color: "#10b981" // green
    },
    unpaidOrders: {
      label: "Unpaid Orders",
      color: "#f97316" // orange
    }
  } satisfies ChartConfig;

  return (
    <div className="w-full h-full p-4">
      <h3 className="text-lg font-semibold mb-2">Order Volume ({timeRange})</h3>
      <div className="h-[calc(100%-2rem)]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="timeKey"
                tickFormatter={formatTimeLabel}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value, name) => [
                  value,
                  name === 'paidOrders' ? 'Paid Orders' : 'Unpaid Orders'
                ]}
                labelFormatter={formatTimeLabel}
              />
              <Legend />
              <Bar 
                dataKey="paidOrders" 
                fill="var(--color-paidOrders)" 
                stackId="a"
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="unpaidOrders" 
                fill="var(--color-unpaidOrders)" 
                stackId="a"
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default OrderCountChart;
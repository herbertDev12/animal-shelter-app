"use server"

import { Query } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite';
import { FilterType, RevenueChartData } from './types';

export async function getRevenueChartData(filterType: FilterType, period: string) {
  const { databases } = createAdminClient();
  const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
  const COLLECTION_ID = process.env.APPWRITE_PAYMENT_COLLECTION_ID!;
  const PROFIT_RATE = Number.parseFloat(process.env.PROFIT_RATE || "0.3");

  let startDate: Date;
  let endDate: Date;
  let initialData: RevenueChartData[] = [];


  if (filterType === "year") {
    startDate = new Date(`${period}-01-01T00:00:00.000Z`);
    endDate = new Date(`${period}-12-31T23:59:59.999Z`);
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    initialData = months.map(m => ({ label: m, profit: 0 }));
  } else if (filterType === "month") {
    const [yearStr, monthStr] = period.split("-");
    const year = Number.parseInt(yearStr);
    const monthIndex = Number.parseInt(monthStr) - 1;
    
    startDate = new Date(Date.UTC(year, monthIndex, 1));
    endDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
    
    const lastDay = endDate.getUTCDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mName = monthNames[monthIndex];
    
    initialData = [
      { label: `${mName} 1 - ${mName} 7`, profit: 0 },
      { label: `${mName} 8 - ${mName} 14`, profit: 0 },
      { label: `${mName} 15 - ${mName} 21`, profit: 0 },
      { label: `${mName} 22 - ${mName} 28`, profit: 0 },
    ];
    if (lastDay > 28) {
      initialData.push({ label: `${mName} 29 - ${mName} ${lastDay}`, profit: 0 });
    }
  } else if (filterType === "week") {
    const match = period.match(/(\d{4})-W(\d+)/);
    if (!match) throw new Error("Invalid week format");
    const year = Number.parseInt(match[1]);
    const week = Number.parseInt(match[2]);

    const d = new Date(Date.UTC(year, 0, 1));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    startDate = new Date(yearStart.getTime() + (week - 1) * 7 * 86400000);
    startDate.setUTCDate(startDate.getUTCDate() - (startDate.getUTCDay() || 7) + 1);
    startDate.setUTCHours(0, 0, 0, 0);
    
    endDate = new Date(startDate.getTime() + 6 * 86400000);
    endDate.setUTCHours(23, 59, 59, 999);
    
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    initialData = days.map(d => ({ label: d, profit: 0 }));
  } else {
    throw new Error("Invalid filter type");
  }

  try {
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('status', 'completed'),
          Query.greaterThanEqual('$createdAt', startDate.toISOString()),
          Query.lessThanEqual('$createdAt', endDate.toISOString()),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      const payments = response.documents;

      for (const payment of payments) {
        const paymentDate = new Date(payment.$createdAt);
        const profit = payment.amount * PROFIT_RATE;

        if (filterType === "year") {
          const mIndex = paymentDate.getUTCMonth();
          initialData[mIndex].profit += profit;
        } else if (filterType === "month") {
          const date = paymentDate.getUTCDate();
          if (date <= 7) initialData[0].profit += profit;
          else if (date <= 14) initialData[1].profit += profit;
          else if (date <= 21) initialData[2].profit += profit;
          else if (date <= 28) initialData[3].profit += profit;
          else initialData[4].profit += profit;
        } else if (filterType === "week") {
          
          const dayIndex = (paymentDate.getUTCDay() + 6) % 7;
          initialData[dayIndex].profit += profit;
        }
      }

      if (payments.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    return initialData;
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    throw error;
  }
}

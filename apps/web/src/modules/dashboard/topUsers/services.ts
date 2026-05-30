"use server"

import { Query } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite';
import { TopUser } from "./types";

export async function getTopUsers(limitCount: number): Promise<TopUser[]> {
  const { databases, users } = createAdminClient();
  const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
  const COLLECTION_ID = process.env.APPWRITE_PAYMENT_COLLECTION_ID!;

  const userRevenueMap = new Map<string, number>();

  let offset = 0;
  const fetchLimit = 500;
  let hasMore = true;

  while (hasMore) {
    const timeoutPromise = new Promise<any>((_, reject) => {
      setTimeout(() => reject(new Error("Appwrite request timed out after 55 seconds due to slow connection")), 55000);
    });

    try {
      const response = await Promise.race([
        databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.equal('status', 'completed'),
            Query.limit(fetchLimit),
            Query.offset(offset),
            Query.select(['userId', 'amount']) 
          ]
        ),
        timeoutPromise
      ]);

      const payments = response.documents;

      for (const payment of payments) {
        const userId = payment.userId;
        const amount = payment.amount || 0;
        
        if (userId) {
          const currentTotal = userRevenueMap.get(userId) || 0;
          userRevenueMap.set(userId, currentTotal + amount);
        }
      }

      if (payments.length < fetchLimit) {
        hasMore = false;
      } else {
        offset += fetchLimit;
      }
    } catch (error) {
      console.error("Timeout or fetch error during pagination:", error);
      break;
    }
  }

  
  const rankedUsers = Array.from(userRevenueMap.entries())
    .map(([id, totalRevenue]) => ({ id, totalRevenue }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limitCount);

  const topUsersWithDetails = await Promise.all(
    rankedUsers.map(async (user, index) => {
      let appwriteUser = null;
      let fetchAttempt = 1;
      const maxAttempts = 10;

      while (fetchAttempt <= maxAttempts) {
        try {
          appwriteUser = await users.get(user.id);
          break; 
        } catch (error: any) {
          
          if (error?.code === 404) {
            break;
          }

          if (fetchAttempt < maxAttempts) {
            console.log(`Failed to fetch user ${user.id} (Error ${error?.code}). Retrying in 1 second...`);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            fetchAttempt++;
          } else {
            console.error(`All attempts failed for user ${user.id}:`, error);
            break;
          }
        }
      }
        
      return {
        id: user.id,
        totalRevenue: user.totalRevenue,
        name: appwriteUser?.name || 'Unknown User',
        email: appwriteUser?.email || 'No Email',
        rank: index + 1,
      };
    })
  );

  return topUsersWithDetails;
}


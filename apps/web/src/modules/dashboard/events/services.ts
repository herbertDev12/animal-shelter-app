"use server";

import { db } from "@/db";
import { events } from "@/db/schema";
import { DashboardEvent } from "./types";
import { asc, eq } from "drizzle-orm";
import { EventFormValues } from "./schema";
import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";

export async function getEvents(): Promise<DashboardEvent[]> {
  try {
    const data = await db.select().from(events).orderBy(asc(events.date));

    return data.map((event) => ({
      id: event.id.toString(),
      name: event.name || "",
      date: event.date ? new Date(event.date) : new Date(),
    }));
  } catch (error) {
    console.error("Failed to fetch events:", error);
    throw new Error("Failed to fetch events");
  }
}

export async function createEvent(data: EventFormValues): Promise<DashboardEvent> {
  try {
    const [newEvent] = await db
      .insert(events)
      .values({
        name: data.name,

        date: data.date.toISOString().split("T")[0],
      })
      .returning();

    return {
      id: newEvent.id.toString(),
      name: newEvent.name || "",
      date: newEvent.date ? new Date(newEvent.date) : new Date(),
    };
  } catch (error) {
    console.error("Failed to create event:", error);
    throw new Error("Failed to create event");
  }
}

export async function updateEvent(id: string, data: EventFormValues): Promise<DashboardEvent> {
  try {
    const [updatedEvent] = await db
      .update(events)
      .set({
        name: data.name,
        date: data.date.toISOString().split("T")[0],
      })
      .where(eq(events.id, Number(id)))
      .returning();

    return {
      id: updatedEvent.id.toString(),
      name: updatedEvent.name || "",
      date: updatedEvent.date ? new Date(updatedEvent.date) : new Date(),
    };
  } catch (error) {
    console.error("Failed to update event:", error);
    throw new Error("Failed to update event");
  }
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    await db.delete(events).where(eq(events.id, Number(id)));
  } catch (error) {
    console.error("Failed to delete event:", error);
    throw new Error("Failed to delete event");
  }
}

export async function getProfitImpactData({ eventDate }: { eventDate: Date | string }) {
  const { databases } = createAdminClient();
  const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
  const COLLECTION_ID = process.env.APPWRITE_PAYMENT_COLLECTION_ID!;
  const PROFIT_RATE = Number.parseFloat(process.env.PROFIT_RATE || "0.3");

  const startDate = new Date(eventDate);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(startDate.getTime() + 60 * 86400000);
  endDate.setUTCHours(23, 59, 59, 999);

  const initialData = Array.from({ length: 61 }, (_, i) => {
    const currentDate = new Date(startDate.getTime() + i * 86400000);
    const mm = String(currentDate.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(currentDate.getUTCDate()).padStart(2, "0");
    const yyyy = currentDate.getUTCFullYear();

    return {
      label: `${mm}/${dd}/${yyyy}`,
      profit: 0,
      date: currentDate.getTime(),
    };
  });

  try {
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.equal("status", "completed"),
        Query.greaterThanEqual("$createdAt", startDate.toISOString()),
        Query.lessThanEqual("$createdAt", endDate.toISOString()),
        Query.limit(limit),
        Query.offset(offset),
      ]);

      const payments = response.documents;

      for (const payment of payments) {
        const paymentDate = new Date(payment.$createdAt);
        const profit = payment.amount * PROFIT_RATE;

        const diffTime = paymentDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 60) {
          initialData[diffDays].profit += profit;
        }
      }

      if (payments.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    const nowTime = Date.now();
    let cumulativeProfit = 0;

    return initialData
      .filter((day) => day.date <= nowTime)
      .map((day) => {
        cumulativeProfit += day.profit;
        return {
          label: day.label,
          profit: cumulativeProfit,
        };
      });
  } catch (error) {
    console.error("Error fetching profit impact data:", error);
    throw new Error("Failed to fetch profit impact data");
  }
}

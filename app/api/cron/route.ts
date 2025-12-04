import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Room } from "@/lib/models/Room";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    await connectToDatabase();

    // 1. Cleanup old rooms (> 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const roomsDeleted = await Room.deleteMany({
      createdAt: { $lt: twentyFourHoursAgo },
    });
    results.roomsDeleted = roomsDeleted.deletedCount;

    // Add more cron tasks here...

    console.log(`[Cron] Completed:`, results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}

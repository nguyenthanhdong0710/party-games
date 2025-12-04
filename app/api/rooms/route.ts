import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Room, GameType } from "@/lib/models/Room";
import { nanoid } from "nanoid";

// GET /api/rooms?gameType=imposters - Get all rooms for a game type
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const gameType = request.nextUrl.searchParams.get("gameType") as GameType;
    if (!gameType) {
      return NextResponse.json(
        { error: "gameType is required" },
        { status: 400 }
      );
    }

    const rooms = await Room.find({
      gameType,
      status: { $in: ["waiting", "playing"] },
    })
      .select("roomId hostName players settings status createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { gameType, hostId, hostName } = body;

    if (!gameType || !hostId || !hostName) {
      return NextResponse.json(
        { error: "gameType, hostId, and hostName are required" },
        { status: 400 }
      );
    }

    const roomId = nanoid(6).toUpperCase();

    const room = await Room.create({
      roomId,
      gameType,
      hostId,
      hostName,
      players: [
        {
          playerId: hostId,
          displayName: hostName,
          joinedAt: new Date(),
        },
      ],
      settings: {
        imposterCount: 1,
        language: "",
        category: "",
      },
      status: "waiting",
    });

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

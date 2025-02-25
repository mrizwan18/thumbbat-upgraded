import User from "@/server/models/User";
import { NextResponse } from "next/server";
import { withDb } from "@/src/utils/withDb";

export const GET = withDb(async () => {
  try {
    if (!User?.db?.readyState) {
      console.error("Database connection not established");
      return NextResponse.json(
        { error: "Database connection not established" },
        { status: 503 } // Changed to 503 Service Unavailable
      );
    }

    const leaderboard = await User.aggregate([
      { 
        $match: { highScore: { $gt: 0 } } 
      },
      { 
        $project: { 
          username: 1, 
          highScore: 1, 
          winPercentage: { $round: ["$winPercentage", 0] } // Round winPercentage
        }
      },
      { 
        $sort: { winPercentage: -1, highScore: -1 } 
      },
      { 
        $limit: 50 
      }
    ]);
    // Modified empty results check
    if (!leaderboard || leaderboard.length === 0) {
      return NextResponse.json(
        { data: [], message: "No leaderboard data available" },
        { status: 200 } // Changed to return empty array instead of 404
      );
    }

    // Set CORS headers
    const response = NextResponse.json({ data: leaderboard, success: true });

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  } catch (err) {
    // More detailed error logging
    console.error("Error fetching leaderboard:", {
      message: (err as Error).message,
      stack: (err as Error).stack,
    });

    return NextResponse.json(
      {
        error: "Something went wrong while fetching the leaderboard.",
        details:
          process.env.NODE_ENV === "development"
            ? (err as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
});

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, {
    status: 200,
  });

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return response;
}

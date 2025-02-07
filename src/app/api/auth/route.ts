import User from "@/server/models/User";
import { NextResponse } from "next/server";

// Add CORS headers helper function
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // In production, replace with your specific domain
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const user = await User.findOne({ confirmationToken: token });
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    user.isConfirmed = true;
    user.confirmationToken = undefined;
    await user.save();

    return NextResponse.json({ message: "Account confirmed successfully!" });
  } catch (error) {
    console.error("Error confirming account:", error);
    return NextResponse.json(
      { error: "Error confirming account" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await request.json();

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

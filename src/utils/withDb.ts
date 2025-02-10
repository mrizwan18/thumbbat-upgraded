import { NextResponse } from "next/server";
import dbConnect from "@/server/config/db";

type RouteHandler = (
  request: Request,
  ...params: unknown[]
) => Promise<NextResponse>;

export function withDb(handler: RouteHandler) {
  return async (request: Request, ...args: unknown[]) => {
    try {
      await dbConnect();
      return await handler(request, ...args);
    } catch (error) {
      console.error("Database connection error:", error);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }
  };
}

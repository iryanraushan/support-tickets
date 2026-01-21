export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const users = await User.find({}, "name email").sort({ name: 1 });
    
    return Response.json(users);
  } catch (error) {
    console.error("GET_USERS_ERROR:", error);
    return Response.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
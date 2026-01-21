export const runtime = "nodejs";

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { User } from "@/models/User";
import { LoginSchema } from "@/features/auth/schemas/auth.schema";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return Response.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

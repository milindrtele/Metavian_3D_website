import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}

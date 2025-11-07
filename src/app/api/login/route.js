import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import * as cookie from "cookie";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // ✅ Missing field checks
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    // ✅ Email not found
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email is not registered" },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    // ✅ Wrong password
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Password doesn’t match" },
        { status: 401 }
      );
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        success: true,
        user: { name: user.name, email: user.email },
      },
      { status: 200 }
    );

    // ✅ Set secure cookie
    response.headers.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}

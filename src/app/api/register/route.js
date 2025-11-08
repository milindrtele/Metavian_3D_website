// /api/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body) {
      return NextResponse.json(
        { error: "No input data provided" },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = body;

    // ✅ Required fields validation
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // ✅ Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = NextResponse.json(
      {
        message: "Registered & logged in",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
      { status: 201 }
    );

    // ✅ Save token in cookies
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

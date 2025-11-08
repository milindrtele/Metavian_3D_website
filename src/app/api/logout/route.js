import { NextResponse } from "next/server";
import * as cookie from "cookie";

export async function GET() {
  const response = NextResponse.json({ msg: "Logged out" });

  response.headers.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    })
  );

  return response;
}

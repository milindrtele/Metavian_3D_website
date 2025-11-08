// /app/api/download-brochure/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken"; // ensure same secret used in login

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const product = url.searchParams.get("product");
    console.log("Requested product:", product);

    if (!product) {
      return new Response("Missing product", { status: 400 });
    }
    // ✅ Check login from cookie
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("Token found:", token);

    // ✅ Validate token
    jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Map product to specific file
    const fileMap = {
      "Car Configurator": "3D-Car-Config-Features.pdf",
      "Virtual Mart": "Roof-Configurator.pdf",
      "Fashion IX": "Virtual-Fashion-Store.pdf",
      Edulab: "Roof-Configurator.pdf",
      "Virtual Production": "Roof-Configurator.pdf",
      "Meta Realty": "Metarealty_Brochure.pdf",
    };

    const brochureFile = fileMap[product];
    if (!brochureFile) {
      return NextResponse.json({ error: "Invalid product" }, { status: 404 });
    }

    // ✅ Read brochure file from server filesystem
    const filePath = path.join(
      process.cwd(),
      "src",
      "pdf",
      "Product Brochures",
      brochureFile
    );
    const fileBuffer = fs.readFileSync(filePath);

    // ✅ Send as downloadable file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${brochureFile}"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

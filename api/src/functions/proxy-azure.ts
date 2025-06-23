import { NextRequest, NextResponse } from "next/server";

const AZURE_URL =
  "https://yixuan-4039-testllmdatage-kbdzj.canadaeast.inference.ml.azure.com/score";
const API_KEY = process.env.AZURE_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const azureRes = await fetch(AZURE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await azureRes.json();

    const response = NextResponse.json(data);
    response.headers.set("Access-Control-Allow-Origin", "*"); 
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  } catch (err) {
    console.error("Azure proxy error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090/api/v1";

export async function GET(req: Request) {
    const token = await getToken({
        req: req as any,
        secret: process.env.AUTH_SECRET,
    });

    const accessToken = token?.accessToken;

    console.log("ACCESS TOKEN FROM NEXTAUTH:", accessToken);

    if (!accessToken) {
        return NextResponse.json(
            { error: "Unauthorized - no token" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(req.url);

    const query = searchParams.get("query") || "";
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "10";

    const res = await fetch(
        `${BASE}/groups?query=${query}&page=${page}&size=${size}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );



    const data = await res.json();
    console.log("Data from Spring Boot inside API Route:", data); // بصي على الـ Terminal بتاع الـ VS Code مش المتصفح
    return NextResponse.json(data);
}
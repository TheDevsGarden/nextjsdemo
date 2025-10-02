import { NextResponse } from "next/server";
import supabase from "../../utils/supabase-server";

export async function GET(request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  try {
    if (id) {
      const { data, error } = await supabase
        .from("Orders")
        .select("*")
        .eq("shopify_id", id)
        .single();

      if (error) throw error;

      return NextResponse.json({ order: data });
    } else {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from("Orders")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const result = NextResponse.json({
        orders: data || [],
        totalCount: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      });

      return result;
    }
  } catch (error) {
    console.error("Database Error:", error);

    // Return a proper JSON error response instead of HTML
    const errorResponse = {
      error: "Failed to fetch order data",
      message: error.message || "Database connection timeout",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };

    return NextResponse.json(errorResponse, {
      status: error.code === 'PGRST116' ? 504 : 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}

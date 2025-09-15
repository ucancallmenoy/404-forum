import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : null; 

  const supabase = createClient();

  if (limit === null) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } else {
    const offset = (page - 1) * limit;
    const query = supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const countQuery = supabase
      .from("categories")
      .select("*", { count: "exact", head: true });
    const { count } = await countQuery;

    return NextResponse.json({
      categories: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createClient();
  const { error } = await supabase.from("categories").insert([body]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
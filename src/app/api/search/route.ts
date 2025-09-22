import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const type = searchParams.get("type"); // "topics", "users", or "categories"
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  if (!query || !type) {
    return NextResponse.json({ error: "Query and type are required" }, { status: 400 });
  }

  const supabase = await createClient();

  let data, error, count;

  if (type === "topics") {
    ({ data, error, count } = await supabase
      .from("topics")
      .select("*", { count: "exact" })
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1));
  } else if (type === "users") {
    ({ data, error, count } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, profile_picture, bio, created_at", { count: "exact" })
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1));
  } else if (type === "categories") {
    ({ data, error, count } = await supabase
      .from("categories")
      .select("*", { count: "exact" })
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1));
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    results: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    },
  });
}
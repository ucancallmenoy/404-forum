import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  if (!query || !type) {
    return NextResponse.json({ error: "Query and type are required" }, { status: 400 });
  }

  const supabase = await createClient();

  const words = query.split(/\s+/).filter(Boolean);

  let data, error, count;

  if (type === "topics") {
    let orCondition = "";
    words.forEach(word => {
      orCondition += `title.ilike.%${word}%,content.ilike.%${word}%,`;
    });
    orCondition = orCondition.slice(0, -1); 

    ({ data, error, count } = await supabase
      .from("topics")
      .select("*", { count: "exact" })
      .or(orCondition)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1));
  } else if (type === "users") {
    let orCondition = "";
    words.forEach(word => {
      orCondition += `first_name.ilike.%${word}%,last_name.ilike.%${word}%,email.ilike.%${word}%,`;
    });
    orCondition = orCondition.slice(0, -1); 

    ({ data, error, count } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, profile_picture, bio, created_at", { count: "exact" })
      .or(orCondition)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1));
  } else if (type === "categories") {
    let orCondition = "";
    words.forEach(word => {
      orCondition += `name.ilike.%${word}%,description.ilike.%${word}%,`;
    });
    orCondition = orCondition.slice(0, -1); 

    ({ data, error, count } = await supabase
      .from("categories")
      .select("*", { count: "exact" })
      .or(orCondition)
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
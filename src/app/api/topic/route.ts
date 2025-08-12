import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const authorId = searchParams.get("authorId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");
  const offset = (page - 1) * limit;
  
  const supabase = createClient();
  let query = supabase
    .from("topics")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (categoryId) query = query.eq("category_id", categoryId);
  if (authorId) query = query.eq("author_id", authorId);
  
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Get total count for pagination info
  let countQuery = supabase
    .from("topics")
    .select("*", { count: "exact", head: true });
    
  if (categoryId) countQuery = countQuery.eq("category_id", categoryId);
  if (authorId) countQuery = countQuery.eq("author_id", authorId);
  
  const { count } = await countQuery;
  
  return NextResponse.json({
    topics: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    }
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createClient();
  const { error } = await supabase.from("topics").insert([body]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const { action, topicId, userId } = await request.json();
  
  if (action !== "toggle_like" || !topicId || !userId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createClient();

  try {
    const { data: existingLike } = await supabase
      .from("topic_likes")
      .select("id")
      .eq("topic_id", topicId)
      .eq("user_id", userId)
      .single();

    if (existingLike) {
      await supabase
        .from("topic_likes")
        .delete()
        .eq("topic_id", topicId)
        .eq("user_id", userId);

      const { data: topic } = await supabase
        .from("topics")
        .select("likes")
        .eq("id", topicId)
        .single();

      const newCount = Math.max(0, (topic?.likes || 0) - 1);
      
      await supabase
        .from("topics")
        .update({ likes: newCount })
        .eq("id", topicId);

      return NextResponse.json({ liked: false, likesCount: newCount });
    } else {
      await supabase
        .from("topic_likes")
        .insert({ topic_id: topicId, user_id: userId });

      const { data: topic } = await supabase
        .from("topics")
        .select("likes")
        .eq("id", topicId)
        .single();

      const newCount = (topic?.likes || 0) + 1;
      
      await supabase
        .from("topics")
        .update({ likes: newCount })
        .eq("id", topicId);

      return NextResponse.json({ liked: true, likesCount: newCount });
    }
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { topicId } = await request.json();
  const supabase = createClient();
  const { error } = await supabase.from("topics").delete().eq("id", topicId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
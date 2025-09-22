import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_topics")
    .select(`
      id,
      topics (
        id,
        title,
        content,
        author_id,
        category_id,
        is_hot,
        is_question,
        likes,
        created_at,
        updated_at
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const topics = data?.map(item => item.topics).filter(Boolean) ?? [];
  return NextResponse.json(topics);
}

export async function PATCH(request: Request) {
  const { action, topicId, userId } = await request.json();

  if (action !== "toggle_save" || !topicId || !userId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();  

  try {
    const { data: existingSave } = await supabase
      .from("saved_topics")
      .select("id")
      .eq("topic_id", topicId)
      .eq("user_id", userId)
      .single();

    if (existingSave) {
      await supabase
        .from("saved_topics")
        .delete()
        .eq("topic_id", topicId)
        .eq("user_id", userId);
      return NextResponse.json({ saved: false });
    } else {
      await supabase
        .from("saved_topics")
        .insert({ topic_id: topicId, user_id: userId });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("Save toggle error:", error);
    return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 });
  }
}
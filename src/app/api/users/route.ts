import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const ids = searchParams.get("ids");
  
  const supabase = createClient();
  
  if (ids) {
    // Batch request
    const idArray = ids.split(',').filter(Boolean);
    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, profile_picture, bio, created_at")
      .in("id", idArray);
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || []);
  }
  
  if (id) {
    // Single request (existing logic)
    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, profile_picture, bio, created_at")
      .eq("id", id)
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }
  
  return NextResponse.json({ error: "Missing id or ids parameter" }, { status: 400 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createClient();
  const { data, error } = await supabase.from("users").insert([body]).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
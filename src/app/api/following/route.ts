import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const isFollowers = searchParams.get("followers") === "true";

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    if (!isFollowers) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
    }

    let query;
    if (isFollowers) {
      query = supabase
        .from("follows")
        .select("follower_id")
        .eq("followed_id", userId);
    } else {
      query = supabase
        .from("follows")
        .select("followed_id")
        .eq("follower_id", userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }

    if (isFollowers) {
      return NextResponse.json({ count: data?.length || 0 });
    } else {
      if (data && data.length > 0) {
        const followedIds = (data as { followed_id: string }[]).map((f) => f.followed_id);
        const { data: profiles, error: profileError } = await supabase
          .from("users")
          .select("id, email, first_name, last_name, profile_picture, bio, created_at")
          .in("id", followedIds);

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
        }

        return NextResponse.json(profiles || []);
      }
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { followedUserId } = body || {};

  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const followerId = user.id;

    if (!followerId || !followedUserId) {
      return NextResponse.json({ error: "Missing followerId or followedUserId" }, { status: 400 });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("followed_id", followedUserId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already following" }, { status: 400 });
    }

    const { error } = await supabase
      .from("follows")
      .insert([{ follower_id: followerId, followed_id: followedUserId }]);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { followedUserId } = body || {};

  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const followerId = user.id;

    if (!followerId || !followedUserId) {
      return NextResponse.json({ error: "Missing followerId or followedUserId" }, { status: 400 });
    }

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("followed_id", followedUserId);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const { firstName, lastName, email, password } = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { firstName, lastName },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user) {
    await supabase.from("users").insert([
      {
        id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
      },
    ]);
  }

  return NextResponse.json({ user: data.user });
}
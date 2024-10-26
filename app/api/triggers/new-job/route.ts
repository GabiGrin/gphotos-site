import { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type InsertPayload<T> = {
  type: "INSERT";
  table: string;
  schema: string;
  record: T;
  old_record: null;
};

export async function POST(req: NextRequest) {
  //   if (req.headers.get("x-bob") !== "yolo") {
  //     return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  //   }

  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }

  if (!data.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const payload = body as InsertPayload<
    Database["public"]["Tables"]["jobs"]["Row"]
  >;

  console.log("got payload", payload);

  return NextResponse.json({
    message: "Hello from the API!",
    userId: data.user.id,
  });
}

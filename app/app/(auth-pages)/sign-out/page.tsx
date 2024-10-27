import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function SignOut() {
  const supabase = await createClient();

  // Sign out the user
  await supabase.auth.signOut();

  // Redirect to the sign-in page
  redirect("/sign-in");
}

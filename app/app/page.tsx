import { createServerApi } from "@/utils/dal/server-api";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AppPage() {
  const supabase = await createClient();

  const user = await supabase.auth.getUser();

  const api = createServerApi(supabase);

  if (!user.data.user) {
    return redirect("/sign-in");
  }

  const site = await api.getSiteByUserId(user.data.user.id).catch(() => null);

  if (!site) {
    return redirect("/create");
  }

  return redirect(`/edit`);
}

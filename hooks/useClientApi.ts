import { createClient } from "@/utils/supabase/client";
import { createClientApi } from "@/utils/dal/client-api";
import { useMemo } from "react";

export function useClientApi() {
  const clientApi = useMemo(() => {
    const supabase = createClient();
    return createClientApi(supabase);
  }, []);

  return clientApi;
}

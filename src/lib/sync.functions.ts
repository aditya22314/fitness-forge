import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Payloads travel as JSON strings so the RPC boundary stays strictly serializable. */
export const loadCloudData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_data")
      .select("data, client_updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      json: JSON.stringify(data.data ?? {}),
      clientUpdatedAt: new Date(data.client_updated_at).getTime(),
    };
  });

export const saveCloudData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { json: string; clientUpdatedAt: number }) => {
    if (!input || typeof input.json !== "string") throw new Error("Invalid payload");
    return {
      json: input.json,
      clientUpdatedAt: Number.isFinite(input.clientUpdatedAt) ? input.clientUpdatedAt : Date.now(),
    };
  })
  .handler(async ({ data, context }) => {
    const parsed = JSON.parse(data.json);
    const { error } = await context.supabase.from("user_data").upsert(
      {
        user_id: context.userId,
        data: parsed,
        client_updated_at: new Date(data.clientUpdatedAt).toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true, savedAt: data.clientUpdatedAt };
  });

export const wipeCloudData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.from("user_data").delete().eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

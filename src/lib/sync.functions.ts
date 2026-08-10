import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
      data: data.data as Record<string, unknown>,
      clientUpdatedAt: new Date(data.client_updated_at as string).getTime(),
    };
  });

export const saveCloudData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { data: Record<string, unknown>; clientUpdatedAt: number }) => {
    if (!input || typeof input !== "object" || typeof input.data !== "object" || input.data === null) {
      throw new Error("Invalid payload");
    }
    return {
      data: input.data,
      clientUpdatedAt: Number.isFinite(input.clientUpdatedAt) ? input.clientUpdatedAt : Date.now(),
    };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("user_data").upsert(
      {
        user_id: context.userId,
        data: data.data,
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

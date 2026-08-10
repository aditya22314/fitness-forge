import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useStore } from "./store";
import { useAuth } from "./useAuth";
import { loadCloudData, saveCloudData } from "./sync.functions";

const tsKey = (uid: string) => `gym-tracker-updated-at:${uid}`;

/** Keys of the store that represent user data (actions and live session excluded). */
const DATA_KEYS = [
  "plans",
  "history",
  "measurements",
  "nutrition",
  "supplements",
  "creatineDates",
  "goals",
  "settings",
  "todaysPlanId",
] as const;

type Snapshot = Record<string, unknown>;

function snapshot(): Snapshot {
  const s = useStore.getState() as unknown as Record<string, unknown>;
  const out: Snapshot = {};
  for (const k of DATA_KEYS) out[k] = s[k];
  return out;
}

function localTs(uid: string): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(tsKey(uid));
  return v ? Number(v) || 0 : 0;
}

function setLocalTs(uid: string, ts: number) {
  if (typeof window !== "undefined") window.localStorage.setItem(tsKey(uid), String(ts));
}

export type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "error";

/** Local-first cloud sync: pulls newest data on sign-in, then pushes debounced updates. */
export function useCloudSync() {
  const { user, loading } = useAuth();
  const load = useServerFn(loadCloudData);
  const save = useServerFn(saveCloudData);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const readyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushed = useRef<string>("");

  // 1) Pull on sign-in, resolving conflicts by newest timestamp.
  useEffect(() => {
    if (loading || !user) {
      readyRef.current = false;
      return;
    }
    let cancelled = false;
    setStatus("syncing");
    (async () => {
      try {
        const cloud = await load();
        if (cancelled) return;
        const mine = localTs(user.id);
        if (cloud && cloud.clientUpdatedAt > mine) {
          useStore.getState().importData(JSON.parse(cloud.json));
          setLocalTs(user.id, cloud.clientUpdatedAt);
        } else {
          const ts = mine || Date.now();
          const serialized = JSON.stringify(snapshot());
          await save({ data: { json: serialized, clientUpdatedAt: ts } });
          lastPushed.current = serialized;
          setLocalTs(user.id, ts);
        }
        if (!cancelled) {
          readyRef.current = true;
          setStatus("synced");
        }
      } catch (e) {
        console.error("cloud sync pull failed", e);
        if (!cancelled) {
          readyRef.current = true; // still allow pushes later
          setStatus("offline");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  // 2) Push debounced changes.
  useEffect(() => {
    if (!user) return;
    const push = () => {
      if (!readyRef.current) return;
      const serialized = JSON.stringify(snapshot());
      if (serialized === lastPushed.current) return;
      const ts = Date.now();
      setStatus("syncing");
      save({ data: { json: serialized, clientUpdatedAt: ts } })
        .then(() => {
          lastPushed.current = serialized;
          setLocalTs(uid, ts);
          setStatus("synced");
        })
        .catch((e) => {
          console.error("cloud sync push failed", e);
          setStatus("offline");
        });
    };
    const uid = user.id;
    const unsub = useStore.subscribe(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(push, 1200);
    });
    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { status };
}

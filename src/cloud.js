import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "./config";
import { getAuthHeaders } from "./api";

const POLL_MS = 10000;
const SAVE_DELAY_MS = 600;

async function request(path, options = {}) {
  const headers = await getAuthHeaders(options.body ? { "Content-Type": "application/json" } : {});
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

const emailKey = (account) => (account?.email ? String(account.email).toLowerCase() : "");

/**
 * Listahan na may sariling id (bookings, notifications, reviews, activity_logs).
 * Gamitin tulad ng useState: const [items, setItems] = useCloudItems("bookings", account);
 * Ang bawat pagbabago ay ipinapadala sa server bilang diff, at nire-refresh tuwing ~10 segundo.
 */
export function useCloudItems(name, account) {
  const who = emailKey(account);
  const [items, setRaw] = useState([]);
  const snap = useRef(new Map());
  const latest = useRef([]);
  const dirty = useRef(false);
  const version = useRef(0);
  const busy = useRef(false);
  const generation = useRef(0);

  const setItems = useCallback((updater) => {
    setRaw((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      latest.current = next;
      return next;
    });
    dirty.current = true;
    version.current += 1;
  }, []);

  const flush = useCallback(async (gen) => {
    if (busy.current) return;
    busy.current = true;

    try {
      while (dirty.current && gen === generation.current) {
        const startVersion = version.current;
        const list = Array.isArray(latest.current) ? latest.current : [];
        const upserts = [];
        const deletes = [];
        const seen = new Set();

        for (const item of list) {
          if (!item || item.id === undefined || item.id === null) continue;
          const id = String(item.id);
          seen.add(id);
          if (snap.current.get(id) !== JSON.stringify(item)) upserts.push(item);
        }

        for (const id of snap.current.keys()) {
          if (!seen.has(id)) deletes.push(id);
        }

        if (upserts.length || deletes.length) {
          try {
            const result = await request(`/api/items/${name}/sync`, {
              method: "POST",
              body: JSON.stringify({ upserts, deletes })
            });
            if (result.rejected?.length) console.warn(`[cloud] ${name} rejected:`, result.rejected);
          } catch (error) {
            // 4xx (maliban sa 401): huwag nang ulitin, susunod na pull ang masusunod
            if (error.status && error.status >= 400 && error.status < 500 && error.status !== 401) {
              dirty.current = false;
            }
            throw error;
          }

          if (gen !== generation.current) return;

          for (const item of upserts) snap.current.set(String(item.id), JSON.stringify(item));
          for (const id of deletes) snap.current.delete(id);
        }

        if (version.current === startVersion) dirty.current = false;
      }
    } finally {
      busy.current = false;
    }
  }, [name]);

  const pull = useCallback(async (gen) => {
    if (dirty.current || busy.current) return;

    const list = await request(`/api/items/${name}`);

    if (gen !== generation.current || dirty.current || busy.current) return;

    snap.current = new Map(list.map((item) => [String(item.id), JSON.stringify(item)]));
    latest.current = list;
    setRaw((previous) => (JSON.stringify(previous) === JSON.stringify(list) ? previous : list));
  }, [name]);

  useEffect(() => {
    generation.current += 1;
    const gen = generation.current;

    snap.current = new Map();
    latest.current = [];
    dirty.current = false;
    busy.current = false;
    setRaw([]);

    if (!who) return undefined;

    const tick = async () => {
      if (document.hidden) return;
      try {
        if (dirty.current) await flush(gen);
        else await pull(gen);
      } catch (error) {
        console.warn(`[cloud] ${name} sync failed:`, error.message);
      }
    };

    tick();
    const timer = window.setInterval(tick, POLL_MS);
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      generation.current += 1;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [who, name, flush, pull]);

  useEffect(() => {
    if (!who || !dirty.current) return;
    flush(generation.current).catch((error) => console.warn(`[cloud] ${name} save failed:`, error.message));
  }, [items, who, name, flush]);

  return [items, setItems];
}

/**
 * Isang dokumento (array o object) na naka-save sa cloud.
 * scope: "user" (sarili lang), "admin" (admin lang), "global" (lahat nakakabasa, admin lang ang nagsusulat)
 * Gamitin tulad ng useState: const [cart, setCart] = useCloudDoc("user", "cart", [], account);
 */
export function useCloudDoc(scope, name, fallback, account) {
  const who = emailKey(account);
  const allowed = Boolean(who) && (scope !== "admin" || account?.role === "admin");
  const [value, setRaw] = useState(fallback);
  const latest = useRef(fallback);
  const dirty = useRef(false);
  const version = useRef(0);
  const saving = useRef(false);
  const loaded = useRef(false);
  const generation = useRef(0);
  const timer = useRef(null);

  const save = useCallback(async () => {
    if (saving.current || !dirty.current || !loaded.current) return;
    saving.current = true;
    const gen = generation.current;

    try {
      while (dirty.current && gen === generation.current) {
        const startVersion = version.current;
        await request(`/api/docs/${scope}/${name}`, {
          method: "PUT",
          body: JSON.stringify({ data: latest.current })
        });
        if (version.current === startVersion) dirty.current = false;
      }
    } catch (error) {
      console.warn(`[cloud] ${scope}/${name} save failed:`, error.message);
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 401) dirty.current = false;
    } finally {
      saving.current = false;
    }
  }, [scope, name]);

  const setValue = useCallback((updater) => {
    setRaw((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      latest.current = next;
      return next;
    });
    dirty.current = true;
    version.current += 1;
  }, []);

  useEffect(() => {
    generation.current += 1;
    const gen = generation.current;

    loaded.current = false;
    dirty.current = false;
    saving.current = false;
    latest.current = fallback;
    setRaw(fallback);

    if (!allowed) return undefined;

    const pull = async () => {
      if (document.hidden) return;
      try {
        if (loaded.current && (dirty.current || saving.current)) {
          await save();
          return;
        }

        const result = await request(`/api/docs/${scope}/${name}`);
        if (gen !== generation.current) return;
        if (loaded.current && (dirty.current || saving.current)) return;

        loaded.current = true;
        dirty.current = false;

        if (result.data !== null && result.data !== undefined) {
          latest.current = result.data;
          setRaw((previous) => (JSON.stringify(previous) === JSON.stringify(result.data) ? previous : result.data));
        }
      } catch (error) {
        console.warn(`[cloud] ${scope}/${name} sync failed:`, error.message);
      }
    };

    pull();
    const interval = window.setInterval(pull, POLL_MS);
    const onVisible = () => { if (!document.hidden) pull(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      generation.current += 1;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [who, allowed, scope, name, save]);

  useEffect(() => {
    if (!allowed || !dirty.current) return undefined;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(save, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer.current);
  }, [value, allowed, save]);

  // Kapag umalis sa page habang may hindi pa na-save, i-save agad.
  useEffect(() => () => {
    if (dirty.current && loaded.current) save();
  }, [save]);

  return [value, setValue];
}

/** Baguhin ang isang user document kahit wala sa page nito (hal. alisin sa cart pagkatapos mag-book). */
export async function updateUserDoc(name, updater, fallback = []) {
  const result = await request(`/api/docs/user/${name}`);
  const current = result.data ?? fallback;
  await request(`/api/docs/user/${name}`, {
    method: "PUT",
    body: JSON.stringify({ data: updater(current) })
  });
}

/** Mga upuang kinuha na ng lahat ng pasahero, para sa seat selection. */
export function useTakenSeats(account, active) {
  const who = emailKey(account);
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    if (!who || !active) return undefined;
    let cancelled = false;

    const load = async () => {
      if (document.hidden) return;
      try {
        const list = await request("/api/taken-seats");
        if (!cancelled) setSeats(list);
      } catch (error) {
        console.warn("[cloud] taken seats failed:", error.message);
      }
    };

    load();
    const interval = window.setInterval(load, POLL_MS);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [who, active]);

  return seats;
}

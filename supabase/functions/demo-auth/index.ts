import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as encodeHex } from "https://deno.land/std@0.208.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── Helpers ───────────────────────────────── */

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new TextDecoder().decode(encodeHex(new Uint8Array(hash)));
}

function supabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/* ── Routes ────────────────────────────────── */

async function handleLogin(body: { login: string; password: string }) {
  const sb = supabaseAdmin();
  const hash = await hashPassword(body.password);

  const { data, error } = await sb
    .from("demo_accounts")
    .select("id, login, demo_environment, enabled")
    .eq("login", body.login.toLowerCase().trim())
    .eq("password_hash", hash)
    .single();

  if (error || !data) return json({ error: "Invalid credentials" }, 401);
  if (!data.enabled) return json({ error: "Demo account disabled" }, 403);

  // Update last_used_at
  await sb
    .from("demo_accounts")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return json({
    ok: true,
    account: {
      id: data.id,
      login: data.login,
      environment: data.demo_environment,
    },
  });
}

async function handleResetPassword(body: { account_id: string; new_password: string }) {
  if (!body.new_password || body.new_password.length < 8) {
    return json({ error: "Password must be at least 8 characters" }, 400);
  }

  const sb = supabaseAdmin();
  const hash = await hashPassword(body.new_password);

  const { error } = await sb
    .from("demo_accounts")
    .update({ password_hash: hash })
    .eq("id", body.account_id);

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}

async function handleToggle(body: { account_id: string; enabled: boolean }) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("demo_accounts")
    .update({ enabled: body.enabled })
    .eq("id", body.account_id);

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
}

async function handleList() {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("demo_accounts")
    .select("id, login, demo_environment, enabled, created_at, last_used_at")
    .order("created_at", { ascending: true });

  if (error) return json({ error: error.message }, 500);
  return json({ accounts: data });
}

async function handleSeed() {
  const sb = supabaseAdmin();

  // Only seed if no accounts exist
  const { data: existing } = await sb
    .from("demo_accounts")
    .select("id")
    .limit(1);

  if (existing && existing.length > 0) {
    return json({ ok: true, message: "Already seeded" });
  }

  const hash = await hashPassword("HorizonDemo2026!");
  const { error } = await sb.from("demo_accounts").insert({
    login: "demo@igniteup.io",
    password_hash: hash,
    demo_environment: "Horizon Group",
    enabled: true,
  });

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, message: "Demo account seeded" });
}

/* ── Main handler ──────────────────────────── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "POST") {
      const body = await req.json();

      switch (action) {
        case "login":
          return await handleLogin(body);
        case "reset-password":
          return await handleResetPassword(body);
        case "toggle":
          return await handleToggle(body);
        case "seed":
          return await handleSeed();
        default:
          return json({ error: "Unknown action" }, 400);
      }
    }

    if (req.method === "GET" && action === "list") {
      return await handleList();
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
});

import { createClient } from "@supabase/supabase-js";

// Frontend Supabase client. Reads connection details from .env (Vite injects any
// var prefixed with VITE_). The anon key is safe to ship to the browser — row-level
// security on the tables is what actually protects the data. Secret keys
// (service role, Anthropic) live only in edge functions, never here.
//
// NOTE: once the database exists we'll generate `./types.ts` with the Supabase CLI
// and pass it as createClient<Database> for full type-safety. Until then the client
// is untyped — that's fine for wiring things up.

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True once .env has real Supabase values — used to fall back to sample data. */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // Non-fatal: the app still runs on the hardcoded sample page so you can keep
  // working before Supabase is connected.
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — " +
      "running on sample data. Add them to .env to connect your project."
  );
}

export const supabase = createClient(
  url ?? "http://localhost:54321",
  anonKey ?? "public-anon-key-placeholder"
);

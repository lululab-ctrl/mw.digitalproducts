// ============================================================================
// Site configuration — the ONLY file you edit when moving between projects.
// The anon key is designed to be public: row level security decides what it
// can read. Never put the service_role key, webhook secrets or Make.com URLs
// in any file under /assets — those live in Supabase secrets.
// ============================================================================
// The site's own address, worked out from where this file is served
// (e.g. https://mwphoto.github.io/mwp-presets or https://presets.matanwildphotography.com),
// so nothing needs editing when the site moves to its own domain.
const SITE_ROOT = new URL("../../", import.meta.url).href.replace(/\/$/, "");

export const CONFIG = {
  // Supabase → Project Settings → API
  SUPABASE_URL: "https://tkkpxsyioetzexgbmbqy.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRra3B4c3lpb2V0emV4Z2JtYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MTQ1OTYsImV4cCI6MjEwNzE5MDU5Nn0.XvFn_zaT1GasxcFXlOx02rY69WDYTDRkxLaDq2USohQ",

  // Public address of this site, no trailing slash (used for sign-in link redirects)
  SITE_URL: SITE_ROOT,

  // Where customers can reach a person
  SUPPORT_EMAIL: "contact@matanwildphotography.com",

  // Display locale for prices and dates
  LOCALE: "en-US",

  // Supabase image resizing (Pro plan only). Leave false on the Free plan,
  // set to true after upgrading so phones get smaller images.
  IMAGE_TRANSFORMS: false,

  // Lemon Squeezy overlay checkout script (loaded only on pages with a Buy button)
  CHECKOUT_SCRIPT: "https://app.lemonsqueezy.com/js/lemon.js",
};

export const IS_CONFIGURED =
  !CONFIG.SUPABASE_URL.includes("YOUR-PROJECT-REF") &&
  !CONFIG.SUPABASE_ANON_KEY.includes("YOUR-ANON");

export const FUNCTIONS_URL = `${CONFIG.SUPABASE_URL}/functions/v1`;

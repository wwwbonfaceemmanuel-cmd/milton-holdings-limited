/* =========================================================
   MILTON HOLDINGS LIMITED
   SUPABASE CONNECTION
   Browser-safe anon/publishable key only
========================================================= */

const MHL_SUPABASE_URL = 'https://lgftgochlcbakovdhmhb.supabase.co';

const MHL_SUPABASE_KEY = 'PASTE_YOUR_EXISTING_ANON_KEY_HERE';

const sb = window.supabase.createClient(
    MHL_SUPABASE_URL,
    MHL_SUPABASE_KEY
);

let MHL_REMOTE = true;

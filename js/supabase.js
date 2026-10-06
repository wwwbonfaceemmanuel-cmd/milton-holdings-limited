/* =========================================================
   MILTON HOLDINGS LIMITED
   SUPABASE CONNECTION
   Browser-safe anon/publishable key only
========================================================= */

const MHL_SUPABASE_URL = 'https://lgftgochlcbakovdhmhb.supabase.co';

const MHL_SUPABASE_KEY = 'PASTE_THE_SAME_ANON_KEY_FROM_YOUR_WORKING_INDEX_HTML';

const sb = window.supabase.createClient(
    MHL_SUPABASE_URL,
    MHL_SUPABASE_KEY
);

let MHL_REMOTE = true;

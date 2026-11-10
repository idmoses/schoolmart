/* ===========================================================
   SCHOOLMART SETTINGS  (items and orders now live in Supabase)
   =========================================================== */

/* 1. SUPABASE - paste the two values from Supabase > Project Settings > API.
      Use the anon / public key. NEVER paste the service_role key here. */
const SUPABASE_URL = 'https://xfnkavbwxmdckpzonajr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-Sxwd_N3Xdc2eIVjMa5pCw__Lz_DLiJ';

/* 2. Categories shown in the shop and in the admin form */
const CATEGORIES = {
    Books: '📚',
    Shoes: '👟',
    Clothes: '👕',
    Bags: '🎒',
    Stationery: '✏️'
    // To add a category, e.g.:  Accessories: '🧢',
};

/* 3. BANK TRANSFER DETAILS shown to students who choose Bank transfer */
const BANK = { bank: 'Paystack-titan', accountName: 'Stephanie Fabian', accountNumber: '9609256637' };

/* 4. PAYSTACK public key (pk_test_... or pk_live_...). Leave '' to switch card/Paystack off.
      NEVER paste your secret key (sk_...) here. */
const PAYSTACK_PUBLIC_KEY = '';
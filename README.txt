SCHOOLMART SETUP
1. Open index.html in a browser (or upload the folder to your hosting).
2. js/products.js  -> products, categories, ADMIN login, BANK details, PAYSTACK_PUBLIC_KEY.
3. images/         -> your product photos (names must match js/products.js).
4. Admin login: see ADMIN in js/products.js (change the password!).
Payments: Pay on delivery and Bank transfer work immediately. Card and Paystack switch on when you paste your Paystack public key.
Bank-transfer orders show as 'Awaiting payment confirmation' until you set them to Processing in the Admin panel.


SCHOOLMART - SETUP (shared items and orders across all devices)

1. Create a free project at supabase.com.
2. Supabase > SQL Editor > New query: paste everything from schema.sql and click Run.
3. Supabase > Project Settings > API: copy the Project URL and the anon public key into js/config.js
   (SUPABASE_URL and SUPABASE_ANON_KEY). Never use the service_role key.
4. Supabase > Authentication > Providers > Email: turn OFF "Confirm email" if you want students to log in right after
   registering (leave it on if you want them to verify their email first).
5. Open your site, register with the OWNER email, then run in the SQL Editor:
      update profiles set role = 'admin' where email = 'YOUR-EMAIL@example.com';
   Log out and log in again: you now see the Admin panel.
6. Put your product photos in images/ (names as in schema.sql) or upload photos from the Admin panel.
7. Push the folder to GitHub / redeploy on Vercel.

Also edit js/config.js: BANK details and PAYSTACK_PUBLIC_KEY.
Bank-transfer and Paystack orders show as 'Awaiting payment confirmation'. Check your bank app / Paystack dashboard,
then set the order to Processing in the Admin panel.
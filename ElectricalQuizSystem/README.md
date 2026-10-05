# Electrical & Electronics Engineering Quiz System

## Features
- Student registration and email/password login
- Beginner, Intermediate and Advanced quiz levels
- 30-second question timer
- Automatic marking
- Score saving
- Leaderboard
- Teacher/admin dashboard
- Supabase database and Row Level Security

## Setup
1. Create a free Supabase project.
2. Open SQL Editor and run `supabase.sql`.
3. Register a normal student account from `register.html`.
4. To make a teacher/admin, run an UPDATE statement from the bottom of `supabase.sql` after registration.
5. Edit `js/supabase.js` and replace the two placeholders with your Supabase Project URL and Publishable/Anon key.
6. Run the site using VS Code Live Server or upload it to a static host.
7. Test student registration, login, quiz and leaderboard.
8. Test teacher/admin login.

## Security
Never place a Supabase service_role/secret key in browser code. Use only the public publishable/anon key in `js/supabase.js`. The database uses Row Level Security policies.

## Important limitation of this starter
The browser calculates the displayed quiz score before inserting the result. For a high-stakes exam system, move grading to a server-side Edge Function/RPC so students cannot tamper with scores. That can be added in the next upgrade.

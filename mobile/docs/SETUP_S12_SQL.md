# S12 SQL Setup Instructions

## Execute the following in Supabase SQL Editor

1. **Open Supabase Dashboard**: https://app.supabase.com/projects/agebsmjsjrmazbozphnh
2. **Go to SQL Editor** (left sidebar)
3. **Click "New Query"**
4. **Copy the entire content** of `mobile/supabase/migrations/04_s12_engine_tables.sql`
5. **Paste into the SQL Editor**
6. **Click "Run"**

## What gets created:

### Tables:
- `xp_log` — tracks all XP-earning actions
- `badges` — unlocked achievements
- `user_tokens` — in-app currency balance
- `purchases` — transaction history

### Features:
- RLS (Row Level Security) enabled on all tables
- Users see only their own data
- Indexes for performance optimization
- Automatic timestamps

## Verify:

After running, check in Supabase:
- **Table Editor** → Should see all 4 new tables listed
- **Policies** → Each table should have 1 RLS policy

## Done!

Once SQL is executed, the backend is ready. The components and hooks are already implemented to use these tables.

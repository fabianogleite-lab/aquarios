# 🎯 SESSION 3 SETUP — Nutrição + Comunidades + Wonder Night
**Status:** Ready to Start  
**Target:** Deliver Today  
**Estimated Time:** 4-5 hours total

---

## 📋 ESCOPO EXATO

### **Módulo 1: Nutrição** (Priority 1 - Easiest) ⏱️ ~90 min
**What:** Calorie tracker + macro counter + daily dashboard

**Tables Needed:**
```sql
-- Create in Supabase
CREATE TABLE meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users,
  name text NOT NULL,
  calories integer NOT NULL,
  protein decimal,
  carbs decimal,
  fat decimal,
  meal_type text CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner')),
  notes text,
  created_at timestamp DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE nutrition_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users,
  daily_calories integer DEFAULT 2000,
  daily_protein decimal DEFAULT 150,
  daily_carbs decimal DEFAULT 250,
  daily_fat decimal DEFAULT 65,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

**UI Components:**
1. `app/(app)/nutricao.tsx` — Main screen
   - Daily progress rings (calorias, proteína, carbos, gorduras)
   - Today's meals list (breakfast, lunch, snack, dinner sections)
   - Quick add FAB button
   - Weekly chart (7 days de intake)

2. `app/(app)/nutricao-novo.tsx` — Add meal screen
   - Input: meal name
   - Input: calorias (number)
   - Inputs: macros (P/C/F) — optional, auto-calc if just calories
   - Dropdown: meal type (breakfast/lunch/snack/dinner)
   - Input: notes (optional)
   - Save button → Supabase → back to list

3. `app/(app)/nutricao-metas.tsx` — Goals/Settings
   - Inputs: daily_calories, daily_protein, daily_carbs, daily_fat
   - Save → updates nutrition_goals table
   - Load on app start to show rings

**Logic:**
- Load meals from today (created_at >= today 00:00)
- Sum calories + macros
- Compare against goals
- Show % completed in rings
- Each meal clickable → edit/delete

---

### **Módulo 2: Comunidades** (Priority 2 - Medium) ⏱️ ~120 min
**What:** Follow users + share diário entries + timeline with likes

**Tables Needed:**
```sql
-- Create in Supabase
CREATE TABLE user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users,
  following_id uuid NOT NULL REFERENCES auth.users,
  created_at timestamp DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users,
  diario_id uuid REFERENCES diario_entries,
  content text,
  is_public boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (diario_id) REFERENCES diario_entries(id) ON DELETE CASCADE
);

CREATE TABLE likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users,
  share_id uuid NOT NULL REFERENCES shares,
  created_at timestamp DEFAULT now(),
  UNIQUE(user_id, share_id),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (share_id) REFERENCES shares(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users,
  from_user_id uuid REFERENCES auth.users,
  type text CHECK (type IN ('follow', 'like', 'comment')),
  share_id uuid REFERENCES shares,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (from_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

**UI Components:**
1. `app/(app)/comunidades.tsx` — Main tab
   - FlatList: Users to follow (discover feed)
   - Each user card: profile pic, name, "Follow" button
   - Load from users table, exclude current user
   - Search by name at top

2. `app/(app)/comunidades-timeline.tsx` — Timeline
   - FlatList: shares from following users
   - Each share: user info, posted date, content preview, mood emoji
   - Like button (count of likes)
   - Share action (open, delete if owner)
   - Infinite scroll / pagination

3. `app/(app)/comunidades-notificacoes.tsx` — Notification bell
   - FlatList: notifications (most recent first)
   - Types: "João te segue", "Maria gostou do seu post"
   - Mark as read on tap
   - Navigate to user/post on tap
   - Clear notification option

4. **Share Diário Feature** (in diario.tsx)
   - Add "Share" button on each diary entry
   - Opens modal: "Compartilhar esta reflexão?"
   - Save to `shares` table with user_id + diario_id
   - Show toast: "Compartilhado com sucesso!"

**Logic:**
- Load following list on mount
- Load shares from followings (with user details, like count)
- Handle like/unlike
- Show notification badge on comunidades tab (unread count)

---

### **Módulo 3: Wonder Night** (Priority 3 - Integration) ⏱️ ~60 min
**What:** Show purchased Wonder Night events + reminders + join link

**Tables Assumed to Exist:**
```
-- Already in Supabase (from Phase 2)
wonder_night_events
wonder_night_purchases (user_id, event_id, purchase_date)
```

**If tables don't exist, create:**
```sql
CREATE TABLE wonder_night_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamp NOT NULL,
  zoom_link text,
  price_cents integer,
  capacity integer,
  created_at timestamp DEFAULT now()
);

CREATE TABLE wonder_night_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users,
  event_id uuid NOT NULL REFERENCES wonder_night_events,
  purchased_at timestamp DEFAULT now(),
  UNIQUE(user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES wonder_night_events(id) ON DELETE CASCADE
);
```

**UI Components:**
1. `app/(app)/wonder-night.tsx` — Main screen
   - FlatList: User's purchased events (upcoming + past)
   - Filter tabs: "Upcoming" / "Past"
   - Each event card: title, date, time, description, "Join" button
   - Show countdown to event (if < 24h)
   - Past events show "Concluído" badge

2. **Reminder System** (Background)
   - On app launch, check for events in next 24h
   - If found: show notification
   - "Seu Wonder Night começa em X horas!"

3. **Join Action**
   - Tap "Join" → opens Zoom link in browser/app
   - Or show modal with event details + link

**Logic:**
- Query wonder_night_purchases where user_id = current_user
- Join with wonder_night_events table
- Sort by event_date (upcoming first)
- Show countdown timer for events < 24h away

---

## 🔄 EXECUTION SEQUENCE (Today)

### **Block 1: Nutrição** (09:00-10:30)
1. Create tables in Supabase ✅
2. Create `nutricao.tsx` ✅
3. Create `nutricao-novo.tsx` ✅
4. Create `nutricao-metas.tsx` ✅
5. Test add meal → save → list ✅
6. Test progress rings render ✅

### **Block 2: Comunidades** (10:30-12:30)
1. Create tables in Supabase ✅
2. Create `comunidades.tsx` ✅
3. Create `comunidades-timeline.tsx` ✅
4. Create `comunidades-notificacoes.tsx` ✅
5. Add Share button to Diário ✅
6. Test follow/unfollow ✅
7. Test like/share ✅

### **Block 3: Wonder Night** (12:30-13:30)
1. Create tables (if needed) ✅
2. Create `wonder-night.tsx` ✅
3. Add tab icon + route ✅
4. Test show events ✅
5. Test join link ✅

### **Block 4: Integration & Polish** (13:30-14:30)
1. Add tab navigation (5 tabs now) ✅
2. Add notification badges ✅
3. Test all flows on mobile ✅
4. Polish styling ✅

### **Block 5: Documentation & Deploy** (14:30-15:00)
1. Create `SESSION_3_COMPLETE.md` ✅
2. Commit with tag `session-3-complete` ✅
3. Prepare final delivery summary ✅

---

## 🗂️ Files to Create

```
mobile/app/(app)/
├─ nutricao.tsx (NEW)
├─ nutricao-novo.tsx (NEW)
├─ nutricao-metas.tsx (NEW)
├─ comunidades.tsx (NEW)
├─ comunidades-timeline.tsx (NEW)
├─ comunidades-notificacoes.tsx (NEW)
├─ wonder-night.tsx (NEW)
├─ diario.tsx (MODIFY - add Share button)
└─ _layout.tsx (MODIFY - add 5 tabs)

mobile/docs/sessions/
└─ SESSION_3_COMPLETE.md (NEW)
```

---

## 🎨 Design Constants

```typescript
// Colors (from design system)
GOLD = '#b8952a'
DARK_BG = '#090c14'
CARD_BG = '#0d1520'
TEXT_PRIMARY = '#ccd6e8'
TEXT_SECONDARY = '#3a4a5a'
SUCCESS = '#4ade80' // green
WARNING = '#fbbf24' // amber
DANGER = '#f87171'  // red

// Meal Types Icons
breakfast = '🌅'
lunch = '🍽️'
snack = '🍪'
dinner = '🌙'

// Macro Colors (chart)
protein = '#ff6b6b'
carbs = '#4ecdc4'
fat = '#ffd93d'
```

---

## 📊 Tab Navigation (Final)

```
5 Tabs at bottom:
1. Home (dashboards)
2. Nutrição (calorie tracker)
3. Diário (diary + share button)
4. Comunidades (follow + timeline)
5. ProteOS Chat

Wonder Night integrado em Comunidades ou tab separado?
→ Recomendação: Wonder Night como 6º tab (menos cluttered)
```

---

## ✅ Delivery Checklist

- [ ] All tables created in Supabase
- [ ] All 7 screens built + styled
- [ ] All CRUD operations working
- [ ] Navigation between tabs smooth
- [ ] Mobile testing on Expo Go (all flows)
- [ ] No console errors
- [ ] Data persists after app restart
- [ ] SESSION_3_COMPLETE.md written
- [ ] Commit + tag created
- [ ] Final summary ready

---

## 🚨 Known Challenges

1. **Notification timing:** Storing reminder state (when shown last)
   - Solution: Simple flag in localStorage or notification table

2. **N:M relationships (follows, likes):**
   - Solution: Use Supabase RLS policies properly
   - Load followings list on mount, cache locally

3. **Real-time sync (when user likes/follows):**
   - Solution: Simple refetch on screen focus (useFocusEffect)
   - Real-time subscriptions can be added in Session 4

4. **Image avatars for users:**
   - Solution: Generate placeholder avatars (initials or emoji)
   - Real image uploads deferred to Session 4

---

## 🎯 TODAY'S GOAL

**6 hours → COMPLETE Session 3 → Ready to Deploy**

All 3 modules shipped, tested, documented, committed.

---

**Next up:** Start with Nutrição (easiest CRUD pattern, you already know it from Diário)

Ready to begin? 🚀

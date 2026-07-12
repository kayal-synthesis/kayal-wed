-- ═══════════════════════════════════════════════════════════════
-- KAYAL SoulPath Institute — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor
-- Project: app.kayalsoulpath.com student portal
-- ═══════════════════════════════════════════════════════════════

-- ── ENABLE UUID EXTENSION ─────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ═══════════════════════════════════════════════════════════════
-- TABLE: students
-- One row per enrolled student. Created by admin on acceptance.
-- Links to Supabase Auth via id = auth.users.id
-- ═══════════════════════════════════════════════════════════════
create table if not exists students (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text not null,
  email           text not null unique,
  student_id      text not null unique,         -- e.g. KSI-2026-001
  cohort          text,                          -- e.g. 2026-A
  country         text,
  language_pref   text default 'English',
  avatar_url      text,
  phone           text,
  bio             text,
  study_hours_pref text,
  notification_email boolean default true,
  notification_new_module boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-update updated_at on any change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger students_updated_at
  before update on students
  for each row execute function update_updated_at();


-- ═══════════════════════════════════════════════════════════════
-- TABLE: programmes
-- The five KAYAL programmes. Seeded by admin — not user-created.
-- ═══════════════════════════════════════════════════════════════
create table if not exists programmes (
  id              text primary key,             -- e.g. 'numerology', 'astrology'
  name            text not null,                -- e.g. 'Sacred Mathematics'
  icon            text,                         -- emoji icon
  duration_weeks  integer not null,
  price_full      integer not null,             -- in cents: 69700 = $697
  price_install   integer,                      -- per instalment in cents
  install_count   integer default 3,
  sort_order      integer default 0,
  active          boolean default true,
  created_at      timestamptz default now()
);

-- Seed the five programmes
insert into programmes (id, name, icon, duration_weeks, price_full, price_install, sort_order) values
  ('numerology',    'Sacred Mathematics',    '🔢', 12, 69700,  24900, 1),
  ('astrology',     'Celestial Mapping',     '♈', 14, 89700,  30900, 2),
  ('physiognomy',   'Esoteric Face Science', '👁️', 10, 44700,  15900, 3),
  ('palmistry',     'Hand & Palm Science',   '🤚', 10, 44700,  15900, 4),
  ('spirit-science','Spirit Science',        '✨', 12, 99700,  34900, 5)
on conflict (id) do nothing;


-- ═══════════════════════════════════════════════════════════════
-- TABLE: modules
-- One row per module (lesson/topic) within a programme.
-- Admin-managed. Each module belongs to one programme and one week.
-- A module can have multiple classes (videos) — see module_classes.
-- ═══════════════════════════════════════════════════════════════
create table if not exists modules (
  id              uuid primary key default uuid_generate_v4(),
  programme_id    text not null references programmes(id) on delete cascade,
  week_number     integer not null,            -- e.g. 1, 2, 3
  week_label      text,                        -- e.g. 'Week 1', 'Week 3–5'
  sort_order      integer not null default 0, -- within the week
  title           text not null,
  description     text,
  release_day     integer not null default 0, -- days after enrolment_start to unlock
  -- release_override: admin sets this to override the drip schedule for a specific module
  release_override_date timestamptz,
  created_at      timestamptz default now()
);

-- Index for fast programme + week lookups
create index if not exists modules_programme_week on modules(programme_id, week_number, sort_order);


-- ═══════════════════════════════════════════════════════════════
-- TABLE: module_classes
-- Each module can have 1 or more classes (videos).
-- Stores the YouTube unlisted video ID per class.
-- Admin adds the youtube_id here when the video is ready.
-- ═══════════════════════════════════════════════════════════════
create table if not exists module_classes (
  id              uuid primary key default uuid_generate_v4(),
  module_id       uuid not null references modules(id) on delete cascade,
  class_number    integer not null default 1,   -- 1, 2, 3 within a module
  title           text not null,
  youtube_id      text,                          -- unlisted YouTube video ID — null = not yet uploaded
  duration_seconds integer,                      -- for display (e.g. 2880 = 48 min)
  sort_order      integer not null default 0,
  created_at      timestamptz default now()
);

create index if not exists module_classes_module_id on module_classes(module_id, sort_order);


-- ═══════════════════════════════════════════════════════════════
-- TABLE: enrolments
-- One row per student per programme.
-- Created by admin after payment is confirmed.
-- This is the primary access-control table.
-- ═══════════════════════════════════════════════════════════════
create table if not exists enrolments (
  id                  uuid primary key default uuid_generate_v4(),
  student_id          uuid not null references students(id) on delete cascade,
  programme_id        text not null references programmes(id),
  status              text not null default 'active'
                        check (status in ('active','completed','suspended','payment-due')),
  payment_type        text not null default 'full'
                        check (payment_type in ('full','instalment')),
  stripe_payment_id   text,                    -- Stripe payment intent or subscription ID
  enrolment_start_date date not null,          -- the date from which drip schedule is calculated
  expires_at          timestamptz,             -- null = no expiry (lifetime access)
  completed_at        timestamptz,             -- set when all modules watched + assessment passed
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique(student_id, programme_id)             -- one enrolment per student per programme
);

create trigger enrolments_updated_at
  before update on enrolments
  for each row execute function update_updated_at();

create index if not exists enrolments_student_id on enrolments(student_id);
create index if not exists enrolments_programme_id on enrolments(programme_id);


-- ═══════════════════════════════════════════════════════════════
-- TABLE: video_progress
-- Tracks which modules (and classes) each student has watched.
-- One row per student per module class.
-- ═══════════════════════════════════════════════════════════════
create table if not exists video_progress (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references students(id) on delete cascade,
  module_id       uuid not null references modules(id) on delete cascade,
  class_id        uuid not null references module_classes(id) on delete cascade,
  watched         boolean default false,
  watched_at      timestamptz,
  watch_seconds   integer default 0,           -- seconds watched (for partial progress)
  created_at      timestamptz default now(),
  unique(student_id, class_id)
);

create index if not exists video_progress_student_module on video_progress(student_id, module_id);


-- ═══════════════════════════════════════════════════════════════
-- TABLE: study_streaks
-- One row per student. Updated every time a student watches a class.
-- ═══════════════════════════════════════════════════════════════
create table if not exists study_streaks (
  student_id      uuid primary key references students(id) on delete cascade,
  current_streak  integer default 0,
  longest_streak  integer default 0,
  last_study_date date,
  updated_at      timestamptz default now()
);


-- ═══════════════════════════════════════════════════════════════
-- TABLE: student_notes
-- Personal notes per module, per student. Encrypted at rest via
-- Supabase Vault in production — for now, plain text.
-- ═══════════════════════════════════════════════════════════════
create table if not exists student_notes (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references students(id) on delete cascade,
  module_id       uuid not null references modules(id) on delete cascade,
  note_text       text,
  updated_at      timestamptz default now(),
  unique(student_id, module_id)
);


-- ═══════════════════════════════════════════════════════════════
-- TABLE: announcements
-- Faculty can push announcements to all students or to specific
-- programme enrolments. Shown at top of dashboard.
-- ═══════════════════════════════════════════════════════════════
create table if not exists announcements (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  body            text not null,
  target          text default 'all'
                    check (target in ('all','numerology','astrology','physiognomy','palmistry','spirit-science')),
  active          boolean default true,
  created_at      timestamptz default now(),
  expires_at      timestamptz
);

-- Seed one welcome announcement
insert into announcements (title, body, target) values
  ('Welcome to the KAYAL Student Portal',
   'Your first module is available now. One new module releases each week. Use the community channel on Telegram for peer support and Q&A with faculty.',
   'all');


-- ═══════════════════════════════════════════════════════════════
-- TABLE: applications
-- Stores new seeker applications submitted via apply.html.
-- Admin reviews and either accepts or declines.
-- ═══════════════════════════════════════════════════════════════
create table if not exists applications (
  id              uuid primary key default uuid_generate_v4(),
  first_name      text not null,
  last_name       text not null,
  email           text not null,
  country         text,
  phone           text,
  language_pref   text,
  prior_study     text,
  self_level      text,
  prior_detail    text,
  programmes_requested text,
  payment_pref    text,
  start_pref      text,
  why_studying    text,
  intention       text,
  study_hours     text,
  additional      text,
  source          text,
  status          text default 'pending'
                    check (status in ('pending','accepted','declined','waitlist')),
  admin_notes     text,
  created_at      timestamptz default now(),
  reviewed_at     timestamptz,
  reviewed_by     uuid
);


-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- This is the core of the access control system.
-- Students can ONLY see their own data.
-- A numerology student querying astrology modules gets zero rows.
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all student-facing tables
alter table students         enable row level security;
alter table enrolments       enable row level security;
alter table video_progress   enable row level security;
alter table study_streaks    enable row level security;
alter table student_notes    enable row level security;
alter table announcements    enable row level security;
alter table modules          enable row level security;
alter table module_classes   enable row level security;
alter table programmes       enable row level security;
alter table applications     enable row level security;

-- ── students: own row only ────────────────────────────────────
create policy "Students can read their own profile"
  on students for select
  using (auth.uid() = id);

create policy "Students can update their own profile"
  on students for update
  using (auth.uid() = id);

-- ── enrolments: own rows only ─────────────────────────────────
create policy "Students see only their own enrolments"
  on enrolments for select
  using (auth.uid() = student_id);

-- ── programmes: readable by all authenticated users ───────────
create policy "Authenticated users can read programmes"
  on programmes for select
  using (auth.role() = 'authenticated');

-- ── modules: readable ONLY if student is enrolled in that programme
-- This is the critical isolation: a numerology student cannot see
-- astrology modules because they have no enrolment in astrology.
create policy "Students see modules only for enrolled programmes"
  on modules for select
  using (
    exists (
      select 1 from enrolments e
      where e.student_id = auth.uid()
        and e.programme_id = modules.programme_id
        and e.status in ('active', 'completed')
    )
  );

-- ── module_classes: same constraint via modules ───────────────
create policy "Students see classes only for enrolled programmes"
  on module_classes for select
  using (
    exists (
      select 1 from modules m
      join enrolments e on e.programme_id = m.programme_id
      where module_classes.module_id = m.id
        and e.student_id = auth.uid()
        and e.status in ('active', 'completed')
    )
  );

-- ── video_progress: own rows only ────────────────────────────
create policy "Students read their own video progress"
  on video_progress for select
  using (auth.uid() = student_id);

create policy "Students insert their own video progress"
  on video_progress for insert
  with check (auth.uid() = student_id);

create policy "Students update their own video progress"
  on video_progress for update
  using (auth.uid() = student_id);

-- ── study_streaks: own row only ───────────────────────────────
create policy "Students read their own streak"
  on study_streaks for select
  using (auth.uid() = student_id);

create policy "Students update their own streak"
  on study_streaks for update
  using (auth.uid() = student_id);

create policy "Students insert their own streak"
  on study_streaks for insert
  with check (auth.uid() = student_id);

-- ── student_notes: own rows only ─────────────────────────────
create policy "Students read their own notes"
  on student_notes for select
  using (auth.uid() = student_id);

create policy "Students insert their own notes"
  on student_notes for insert
  with check (auth.uid() = student_id);

create policy "Students update their own notes"
  on student_notes for update
  using (auth.uid() = student_id);

-- ── announcements: all enrolled students can read active ones ─
create policy "Enrolled students can read announcements"
  on announcements for select
  using (
    auth.role() = 'authenticated'
    and active = true
    and (expires_at is null or expires_at > now())
  );

-- ── applications: no student read (admin only via service role) ─
-- No SELECT policy = students cannot read applications table.
-- Insert is allowed for unauthenticated (the apply form is public)
create policy "Anyone can submit an application"
  on applications for insert
  with check (true);


-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTION: check_module_access
-- Returns true if a student can view a specific module right now.
-- Takes into account:
--   1. Student must be enrolled in the programme (active)
--   2. Module must have been released based on drip schedule
--      (days since enrolment_start_date >= module.release_day)
--   OR release_override_date is set and is in the past
-- ═══════════════════════════════════════════════════════════════
create or replace function check_module_access(p_student_id uuid, p_module_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_programme_id text;
  v_release_day integer;
  v_override_date timestamptz;
  v_enrolment_start date;
  v_status text;
  v_days_since integer;
begin
  -- Get module details
  select programme_id, release_day, release_override_date
  into v_programme_id, v_release_day, v_override_date
  from modules where id = p_module_id;

  if not found then return false; end if;

  -- Get enrolment
  select enrolment_start_date, status
  into v_enrolment_start, v_status
  from enrolments
  where student_id = p_student_id
    and programme_id = v_programme_id;

  if not found then return false; end if;
  if v_status not in ('active','completed') then return false; end if;

  -- Check override date first
  if v_override_date is not null and v_override_date <= now() then
    return true;
  end if;

  -- Check drip schedule
  v_days_since := (current_date - v_enrolment_start);
  return v_days_since >= v_release_day;
end;
$$;


-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTION: update_streak
-- Called after a student marks a class as watched.
-- Updates study_streaks.current_streak and longest_streak.
-- ═══════════════════════════════════════════════════════════════
create or replace function update_streak(p_student_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_last_date date;
  v_current integer;
  v_longest integer;
begin
  select last_study_date, current_streak, longest_streak
  into v_last_date, v_current, v_longest
  from study_streaks
  where student_id = p_student_id;

  if not found then
    insert into study_streaks(student_id, current_streak, longest_streak, last_study_date)
    values (p_student_id, 1, 1, current_date);
    return;
  end if;

  if v_last_date = current_date then
    -- Already studied today — no change
    return;
  elsif v_last_date = current_date - 1 then
    -- Consecutive day
    v_current := v_current + 1;
  else
    -- Streak broken
    v_current := 1;
  end if;

  v_longest := greatest(v_longest, v_current);

  update study_streaks set
    current_streak = v_current,
    longest_streak = v_longest,
    last_study_date = current_date,
    updated_at = now()
  where student_id = p_student_id;
end;
$$;


-- ═══════════════════════════════════════════════════════════════
-- STRIPE WEBHOOK HANDLER NOTES
-- ═══════════════════════════════════════════════════════════════
-- Wire a Supabase Edge Function (or your server) to receive Stripe
-- webhooks. On each event, take the following action:
--
-- checkout.session.completed:
--   INSERT into enrolments (student_id, programme_id, status='active',
--     payment_type, stripe_payment_id, enrolment_start_date=now())
--
-- invoice.payment_failed (for instalment plans):
--   UPDATE enrolments SET status='payment-due' WHERE stripe_payment_id=...
--
-- invoice.payment_succeeded (instalment recovered):
--   UPDATE enrolments SET status='active' WHERE stripe_payment_id=...
--
-- customer.subscription.deleted (instalment plan cancelled):
--   UPDATE enrolments SET status='suspended', expires_at=now()
--   WHERE stripe_payment_id=...
--
-- The front-end dashboard reads status from enrolments — no code
-- change needed to suspend or reinstate access. Just update the row.
-- ═══════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════
-- ADMIN USAGE EXAMPLES
-- Run these in Supabase SQL Editor when managing students
-- ═══════════════════════════════════════════════════════════════

-- Create a new student account (after Supabase Auth user is created):
-- insert into students (id, full_name, email, student_id, cohort, country)
-- values ('AUTH_USER_UUID_HERE', 'Student Name', 'student@email.com', 'KSI-2026-002', '2026-A', 'Nigeria');

-- Enrol an accepted student in a programme after payment:
-- insert into enrolments (student_id, programme_id, status, payment_type, enrolment_start_date)
-- values ('AUTH_USER_UUID_HERE', 'numerology', 'active', 'full', current_date);

-- Grant a bonus module release early (override the drip schedule):
-- update modules set release_override_date = now()
-- where id = 'MODULE_UUID_HERE';

-- Suspend access when payment lapses:
-- update enrolments set status = 'suspended'
-- where student_id = 'AUTH_USER_UUID_HERE' and programme_id = 'astrology';

-- Mark a programme complete and trigger certificate:
-- update enrolments set status = 'completed', completed_at = now()
-- where student_id = 'AUTH_USER_UUID_HERE' and programme_id = 'numerology';

-- Check all active enrolments for a student:
-- select e.programme_id, e.status, e.enrolment_start_date, e.expires_at
-- from enrolments e
-- where e.student_id = 'AUTH_USER_UUID_HERE';


-- ═══════════════════════════════════════════════════════════════
-- TABLE: videos
-- Public-facing videos shown on the homepage and insights pages.
-- Admin adds a row here when a video is uploaded to YouTube.
-- No code change on the website is ever needed — just add a row.
-- ═══════════════════════════════════════════════════════════════
create table if not exists videos (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text,                        -- short subtitle shown on card
  tag             text,                        -- e.g. 'Introduction', 'Sacred Mathematics'
  youtube_id      text not null,               -- 11-char YouTube video ID from the URL
  thumbnail_url   text,                        -- optional override; falls back to YouTube auto-thumb
  duration_label  text,                        -- display string e.g. '12:48'
  featured        boolean default false,       -- true = shown as the wide featured card
  published       boolean default false,       -- false = draft; true = live on site
  sort_order      integer default 0,           -- lower number = shown first
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger videos_updated_at
  before update on videos
  for each row execute function update_updated_at();

-- Videos are public — anyone can read published ones, no auth needed
alter table videos enable row level security;

create policy "Anyone can read published videos"
  on videos for select
  using (published = true);

-- Only service role (admin) can insert/update/delete
-- (handled automatically — no policy needed for service role)

-- ── SEED THREE STARTER ROWS ──────────────────────────────────
-- Replace youtube_id values with real IDs when videos are uploaded.
-- Set published = true to make them appear on the site.
-- Change featured = true on whichever video should be the wide card.
insert into videos (title, description, tag, youtube_id, duration_label, featured, published, sort_order) values
  (
    'What is Soul Blueprint Science? A complete introduction to the four-dimension system.',
    'The founding methodology of KAYAL SoulPath Institute, explained from first principles.',
    'Introduction',
    'PLACEHOLDER_ID_1',   -- replace with real YouTube ID e.g. 'dQw4w9WgXcQ'
    '12:48',
    true,                 -- this is the featured (wide) card
    false,                -- set to true when video is uploaded
    1
  ),
  (
    'How Sacred Mathematics reads a human life.',
    'A live demonstration using a real birth date.',
    'Sacred Mathematics',
    'PLACEHOLDER_ID_2',
    '8:22',
    false,
    false,
    2
  ),
  (
    'Why every ancient tradition arrives at the same model.',
    'The question that Spirit Science answers directly.',
    'Spirit Science',
    'PLACEHOLDER_ID_3',
    '6:05',
    false,
    false,
    3
  )
on conflict do nothing;

-- ── ADMIN USAGE EXAMPLES ─────────────────────────────────────
-- Publish a video (make it appear on the site):
-- update videos set youtube_id = 'REAL_ID_HERE', published = true
-- where title like '%Soul Blueprint Science%';

-- Add a brand new video:
-- insert into videos (title, description, tag, youtube_id, duration_label, featured, published, sort_order)
-- values ('Your new video title', 'Short subtitle', 'Tag', 'REAL_YOUTUBE_ID', '5:30', false, true, 4);

-- Change which video is featured (wide card):
-- update videos set featured = false where featured = true;
-- update videos set featured = true where id = 'UUID_OF_NEW_FEATURED_VIDEO';

-- Hide a video without deleting it:
-- update videos set published = false where id = 'UUID_HERE';

-- Reorder videos:
-- update videos set sort_order = 1 where id = 'UUID_A';
-- update videos set sort_order = 2 where id = 'UUID_B';

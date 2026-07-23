/*
# Process Landscape Schema

## Overview
Creates the tables needed for the Infi AI Process Landscape module.
This is a single-tenant app (no auth), so all policies grant anon + authenticated access.

## New Tables

### 1. `pl_processes`
Master catalogue of available processes that can be assigned to value chains or departments.
- `id` (uuid, pk)
- `name` (text) — display name of the process
- `kpi` (integer) — KPI percentage 0-100
- `created_at` (timestamptz)

### 2. `pl_groups`
Represents a Value Chain or Department row in the matrix.
- `id` (uuid, pk)
- `name` (text) — e.g. "AWARENESS", "SELECTION"
- `view_type` (text) — 'value_chain' | 'department'
- `created_at` (timestamptz)

### 3. `pl_group_processes`
Junction table linking groups to processes with an explicit sort order.
- `id` (uuid, pk)
- `group_id` (uuid, fk -> pl_groups)
- `process_id` (uuid, fk -> pl_processes)
- `sort_order` (integer)

## Security
RLS enabled on all tables. Single-tenant: anon + authenticated CRUD.
*/

-- Master process catalogue
CREATE TABLE IF NOT EXISTS pl_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kpi integer NOT NULL DEFAULT 0 CHECK (kpi >= 0 AND kpi <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pl_processes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pl_processes" ON pl_processes;
CREATE POLICY "anon_select_pl_processes" ON pl_processes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pl_processes" ON pl_processes;
CREATE POLICY "anon_insert_pl_processes" ON pl_processes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pl_processes" ON pl_processes;
CREATE POLICY "anon_update_pl_processes" ON pl_processes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pl_processes" ON pl_processes;
CREATE POLICY "anon_delete_pl_processes" ON pl_processes FOR DELETE TO anon, authenticated USING (true);

-- Groups (Value Chains / Departments)
CREATE TABLE IF NOT EXISTS pl_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  view_type text NOT NULL DEFAULT 'value_chain' CHECK (view_type IN ('value_chain', 'department')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pl_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pl_groups" ON pl_groups;
CREATE POLICY "anon_select_pl_groups" ON pl_groups FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pl_groups" ON pl_groups;
CREATE POLICY "anon_insert_pl_groups" ON pl_groups FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pl_groups" ON pl_groups;
CREATE POLICY "anon_update_pl_groups" ON pl_groups FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pl_groups" ON pl_groups;
CREATE POLICY "anon_delete_pl_groups" ON pl_groups FOR DELETE TO anon, authenticated USING (true);

-- Group <-> Process junction
CREATE TABLE IF NOT EXISTS pl_group_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES pl_groups(id) ON DELETE CASCADE,
  process_id uuid NOT NULL REFERENCES pl_processes(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE(group_id, process_id)
);

ALTER TABLE pl_group_processes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pl_group_processes" ON pl_group_processes;
CREATE POLICY "anon_select_pl_group_processes" ON pl_group_processes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pl_group_processes" ON pl_group_processes;
CREATE POLICY "anon_insert_pl_group_processes" ON pl_group_processes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pl_group_processes" ON pl_group_processes;
CREATE POLICY "anon_update_pl_group_processes" ON pl_group_processes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pl_group_processes" ON pl_group_processes;
CREATE POLICY "anon_delete_pl_group_processes" ON pl_group_processes FOR DELETE TO anon, authenticated USING (true);

-- Seed default process catalogue
INSERT INTO pl_processes (name, kpi) VALUES
  ('Market Research', 100),
  ('Brand Campaigns', 82),
  ('SEO Operations', 45),
  ('Social Listening', 22),
  ('Content Strategy', 65),
  ('Paid Advertising', 90),
  ('Lead Qualification', 100),
  ('Vendor Evaluation', 76),
  ('Solution Fitment', 58),
  ('Proposal Review', 33),
  ('Contract Drafting', 71),
  ('Order Management', 95),
  ('Invoice Processing', 48),
  ('Payment Operations', 19),
  ('Supplier Onboarding', 67),
  ('Customer Support', 88),
  ('HR Recruitment', 54),
  ('Onboarding Flow', 78),
  ('Performance Review', 42),
  ('Compliance Audit', 100)
ON CONFLICT DO NOTHING;

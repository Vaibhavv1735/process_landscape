import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PlProcess {
  id: string;
  name: string;
  kpi: number;
  created_at: string;
}

export interface PlGroup {
  id: string;
  name: string;
  view_type: 'value_chain' | 'department';
  created_at: string;
}

export interface PlGroupProcess {
  id: string;
  group_id: string;
  process_id: string;
  sort_order: number;
}

export interface GroupWithProcesses extends PlGroup {
  processes: PlProcess[];
}

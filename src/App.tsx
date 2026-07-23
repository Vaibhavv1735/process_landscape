import { useEffect, useState, useCallback } from 'react';
import {
  Home,
  LayoutDashboard,
  GitBranch,
  Network,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Search,
  Layers,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import {
  supabase,
  type PlProcess,
  type GroupWithProcesses,
} from './lib/supabase';

const currentUserRole: 'super_admin' | 'viewer' = 'super_admin';
const canEdit = currentUserRole === 'super_admin';

type ViewType = 'value_chain' | 'department';

function statusForKpi(kpi: number): 'green' | 'amber' | 'red' {
  if (kpi >= 100) return 'green';
  if (kpi >= 30) return 'amber';
  return 'red';
}

function Sidebar({ 
  viewType, 
  setViewType,
  isCollapsed,
  setIsCollapsed
}: { 
  viewType: ViewType; 
  setViewType: (vt: ViewType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
}) {
  const [landscapeOpen, setLandscapeOpen] = useState(true);

  return (
    <aside className={`h-screen flex flex-col bg-[#0b132b] text-white shrink-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Sidebar Header Block */}
      <div className="px-5 py-5 flex items-center gap-2 border-b border-white/5 overflow-hidden h-16 shrink-0">
        {!isCollapsed ? (
          <>
            <span className="text-lg font-bold tracking-tight whitespace-nowrap">Infi AI</span>
            <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              Q3edge
            </span>
          </>
        ) : (
          <span className="text-lg font-bold tracking-tight mx-auto">IA</span>
        )}
      </div>

      {/* Main Navigation Link Stack */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-x-hidden overflow-y-auto">
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="Home">
          <Home className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Home</span>}
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="Dashboard">
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="Modeling">
          <GitBranch className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Modeling</span>}
        </a>

        {/* Collapsible Dropdown Block Wrapper */}
        <div>
          <button
            onClick={() => !isCollapsed && setLandscapeOpen(!landscapeOpen)}
            disabled={isCollapsed}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium bg-white/10 text-white transition-colors ${isCollapsed ? 'justify-center cursor-default' : ''}`}
            title="Process Landscape"
          >
            <div className="flex items-center gap-3">
              <Network className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Process Landscape</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${landscapeOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Child Selection Submenus Layout */}
          {!isCollapsed && landscapeOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => setViewType('value_chain')}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  viewType === 'value_chain'
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Value Chain View
              </button>
              <button
                onClick={() => setViewType('department')}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  viewType === 'department'
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Department View
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar Footer Toggle Node */}
      <div className="px-3 py-4 border-t border-white/5 bg-gradient-to-t from-emerald-950/40 to-transparent shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function StatusPill({
  count,
  label,
  dotClass,
  wrapperClass,
}: {
  count: number;
  label: string;
  dotClass: string;
  wrapperClass?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 shadow-sm border rounded-full px-3 py-1 text-xs ${wrapperClass ?? 'bg-white text-slate-700'}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotClass}`} />
      <span className="font-medium">
        {count} {label}
      </span>
    </div>
  );
}

function AnalyticsStrip({
  groups,
}: {
  groups: GroupWithProcesses[];
}) {
  let onTarget = 0;
  let atRisk = 0;
  let critical = 0;
  let total = 0;
  groups.forEach((g) =>
    g.processes.forEach((p) => {
      total += 1;
      const s = statusForKpi(p.kpi);
      if (s === 'green') onTarget += 1;
      else if (s === 'amber') atRisk += 1;
      else critical += 1;
    }),
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusPill count={onTarget} label="On Target" dotClass="bg-green-600" />
      <StatusPill count={atRisk} label="At Risk" dotClass="bg-amber-500" />
      <StatusPill count={critical} label="Critical" dotClass="bg-red-600" />
      <StatusPill
        count={total}
        label="Processes"
        dotClass="bg-emerald-500"
        wrapperClass="text-emerald-700 bg-emerald-50 border-emerald-200"
      />
    </div>
  );
}

function EmptyState({ viewType, onCreate }: { viewType: ViewType; onCreate: () => void }) {
  const isValueChain = viewType === 'value_chain';
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-200 rounded-xl mt-2 px-6">
      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <Layers className="w-6 h-6 text-blue-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">
        {isValueChain ? 'No value chains yet' : 'No departments yet'}
      </h3>
      <p className="text-sm text-slate-500 mt-2 max-w-lg text-center leading-relaxed">
        {isValueChain 
          ? 'Create your first value chain to visualise how your processes deliver customer value.'
          : 'Create your first department to organise processes by the team that owns them.'}
      </p>
      {canEdit && (
        <button
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isValueChain ? 'Create new value chain' : 'Create new department'}
        </button>
      )}
    </div>
  );
}

function ChevronCard({
  process,
  onContextMenu,
}: {
  process: PlProcess;
  onContextMenu: (e: React.MouseEvent, process: PlProcess) => void;
}) {
  const status = statusForKpi(process.kpi);
  const dotClass =
    status === 'green' ? 'bg-green-600' : status === 'amber' ? 'bg-amber-500' : 'bg-red-600';

  return (
    <div
      onContextMenu={(e) => onContextMenu(e, process)}
      className="relative shrink-0 w-56 h-24 bg-white cursor-pointer transition-all hover:brightness-95 group filter drop-shadow-sm"
      style={{
        clipPath: 'polygon(92% 0%, 100% 50%, 92% 100%, 0% 100%, 8% 50%, 0% 0%)',
      }}
    >
      {/* Outer Border Simulation Layer */}
      <div 
        className="absolute inset-0 bg-slate-200"
        style={{
          clipPath: 'polygon(92% 0%, 100% 50%, 92% 100%, 0% 100%, 8% 50%, 0% 0%)',
        }}
      />
      
      {/* Inner Content Component Area */}
      <div 
        className="absolute inset-[1px] bg-white flex flex-col justify-center pl-8 pr-8"
        style={{
          clipPath: 'polygon(92% 0%, 100% 50%, 92% 100%, 0% 100%, 8% 50%, 0% 0%)',
        }}
      >
        <span
          className={`absolute top-3 right-7 w-2 h-2 rounded-full ${dotClass}`}
          title={`KPI ${process.kpi}%`}
        />
        
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Process
        </p>
        <p className="text-sm font-bold text-slate-700 mt-0.5 truncate group-hover:text-blue-600 transition-colors">
          {process.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          KPI <span className="font-semibold text-slate-500">{process.kpi}%</span>
        </p>
      </div>
    </div>
  );
}

function MatrixRow({
  group,
  onContextMenu,
  onDelete,
}: {
  group: GroupWithProcesses;
  onContextMenu: (e: React.MouseEvent, process: PlProcess) => void;
  onDelete: (group: GroupWithProcesses) => void;
}) {
  return (
    <div className="flex items-stretch gap-0 min-w-max">
      <div className="w-64 shrink-0 bg-[#0b132b] text-white px-5 py-4 rounded-l-lg flex flex-col justify-center relative group">
        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Category
        </p>
        <p className="text-base font-bold mt-0.5">{group.name}</p>
        <p className="text-xs text-slate-400 mt-1">
          {group.processes.length} process{group.processes.length !== 1 ? 'es' : ''}
        </p>
        {canEdit && (
          <button
            onClick={() => onDelete(group)}
            title="Delete this group"
            className="absolute top-3 right-3 p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 duration-150"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 px-4 py-4 overflow-x-auto bg-slate-50/50 border border-l-0 border-slate-200 rounded-r-lg flex-1">
        {group.processes.map((p) => (
          <ChevronCard
            key={p.id}
            process={p}
            onContextMenu={onContextMenu}
          />
        ))}
      </div>
    </div>
  );
}

function ContextMenu({
  x,
  y,
  process,
  onClose,
}: {
  x: number;
  y: number;
  process: PlProcess | null;
  onClose: () => void;
}) {
  if (!process) return null;
  const items = [
    'Open EPC Flow Diagram',
    'View Detailed KPIs',
    'View Associated Risks',
    'View Associated Roles',
  ];
  return (
    <div
      style={{ left: x, top: y }}
      className="fixed bg-white shadow-xl border border-slate-200 rounded-md z-50 text-sm w-48 py-1"
    >
      <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-100 font-medium">
        {process.name}
      </div>
      {items.map((label) => (
        <button
          key={label}
          onClick={onClose}
          className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-6 right-6 z-[60] bg-slate-900 text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      {message}
    </div>
  );
}

function BuilderPanel({
  viewType,
  available,
  onCancel,
  onSave,
}: {
  viewType: ViewType;
  available: PlProcess[];
  onCancel: () => void;
  onSave: (name: string, ordered: PlProcess[]) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<PlProcess[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filter based on input query, then explicitly sort alphabetically A-Z
  const filteredAndSorted = available
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const isSelected = (p: PlProcess) => selected.some((s) => s.id === p.id);

  const toggle = (p: PlProcess) => {
    setSelected((prev) =>
      prev.some((s) => s.id === p.id)
        ? prev.filter((s) => s.id !== p.id)
        : [...prev, p],
    );
  };

  const removeSelected = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  };

  const move = (idx: number, dir: -1 | 1) => {
    setSelected((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const label = viewType === 'value_chain' ? 'Value Chain' : 'Department';

  const handleSave = async () => {
    if (!name.trim() || selected.length === 0) return;
    setSaving(true);
    await onSave(name.trim(), selected);
    setSaving(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 w-full max-w-5xl animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
        <h3 className="text-lg font-semibold text-slate-800">
          Create New {label}
        </h3>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Grid structure for Side-by-Side Builder configuration layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Hand Column: Shrunk Dynamic Select Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {label} Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g. ${viewType === 'value_chain' ? 'AWARENESS' : 'Marketing'}`}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Processes
            </label>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-left flex items-center justify-between hover:border-slate-400 transition-colors bg-white"
            >
              <span className={selected.length ? 'text-slate-700' : 'text-slate-400'}>
                {selected.length
                  ? `${selected.length} selected`
                  : 'Select processes'}
              </span>
              <Search className="w-4 h-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute z-40 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-hidden">
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter processes..."
                    autoFocus
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div className="max-h-44 overflow-y-auto">
                  {filteredAndSorted.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => toggle(p)}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        isSelected(p)
                          ? 'bg-green-100 text-slate-800 font-medium'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-xs text-slate-400">KPI {p.kpi}%</span>
                    </button>
                  ))}
                  {filteredAndSorted.length === 0 && (
                    <p className="px-3 py-4 text-sm text-slate-400 text-center">
                      No matching processes
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Hand Column: Sequenced Processing Panel with inline removals */}
        <div className="flex flex-col h-full min-h-[195px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Sequenced Order {selected.length > 0 && `(${selected.length})`}
          </label>
          
          {selected.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50/50 text-center text-slate-400 text-sm h-[138px]">
              No processes selected yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50/50 flex-1">
              {selected.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-100"
                >
                  <span className="text-xs text-slate-400 font-mono w-6">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-700 truncate">{p.name}</span>
                  
                  <div className="flex items-center gap-0.5 border-l border-slate-100 pl-2">
                    <button
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === selected.length - 1}
                      title="Move Down"
                      className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeSelected(p.id)}
                      title="Remove from list"
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shared Bottom Controls Area */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || selected.length === 0 || saving}
          className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [viewType, setViewType] = useState<ViewType>('value_chain');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [groups, setGroups] = useState<GroupWithProcesses[]>([]);
  const [available, setAvailable] = useState<PlProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ctx, setCtx] = useState<{
    x: number;
    y: number;
    process: PlProcess | null;
  }>({ x: 0, y: 0, process: null });

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [procRes, groupRes, gpRes] = await Promise.all([
      supabase.from('pl_processes').select('*').order('name'),
      supabase.from('pl_groups').select('*').order('created_at'),
      supabase
        .from('pl_group_processes')
        .select('*')
        .order('sort_order'),
    ]);

    if (procRes.data) setAvailable(procRes.data as PlProcess[]);
    if (groupRes.data && gpRes.data) {
      const procsById = new Map(
        (procRes.data ?? []).map((p) => [(p as PlProcess).id, p as PlProcess]),
      );
      const built: GroupWithProcesses[] = (groupRes.data as any[]).map((g) => {
        const linked = (gpRes.data as any[])
          .filter((gp) => gp.group_id === g.id)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((gp) => procsById.get(gp.process_id))
          .filter(Boolean) as PlProcess[];
        return { ...g, processes: linked };
      });
      setGroups(built);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const close = () => setCtx({ x: 0, y: 0, process: null });
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async (name: string, ordered: PlProcess[]) => {
    const { data: groupRow } = await supabase
      .from('pl_groups')
      .insert({ name, view_type: viewType })
      .select()
      .single();

    if (!groupRow) return;

    const rows = ordered.map((p, i) => ({
      group_id: (groupRow as any).id,
      process_id: p.id,
      sort_order: i,
    }));
    await supabase.from('pl_group_processes').insert(rows);

    setShowBuilder(false);
    showToast(
      viewType === 'value_chain' ? 'Value Chain Added' : 'Department Added',
    );
    await loadAll();
  };

  const handleContext = (e: React.MouseEvent, process: PlProcess) => {
    e.preventDefault();
    setCtx({ x: e.pageX, y: e.pageY, process });
  };

  const handleDelete = async (group: GroupWithProcesses) => {
    if (!confirm(`Delete "${group.name}" and its ${group.processes.length} process link(s)?`)) return;
    await supabase.from('pl_groups').delete().eq('id', group.id);
    showToast(
      group.view_type === 'value_chain' ? 'Value Chain Deleted' : 'Department Deleted',
    );
    await loadAll();
  };

  const visibleGroups = groups.filter((g) => g.view_type === viewType);
  const isValueChain = viewType === 'value_chain';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        viewType={viewType} 
        setViewType={setViewType} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <header className="px-8 py-5 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Process Landscape
              </h1>
              <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium">
                Q3edge
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                BA
              </div>
              <span className="text-sm text-slate-600 font-medium hidden sm:block">
                Bpm Advisor
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <AnalyticsStrip groups={visibleGroups} />
          </div>
        </header>

        <div className="flex-1 px-8 py-5 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Loading landscape...
            </div>
          ) : showBuilder ? (
            <BuilderPanel
              viewType={viewType}
              available={available}
              onCancel={() => setShowBuilder(false)}
              onSave={handleSave}
            />
          ) : (
            <div className="space-y-4">
              {/* Dynamic Sub-header Context Region */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1 pr-4">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {isValueChain ? 'Value Chain' : 'Department'}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                    {isValueChain 
                      ? 'Group processes into end-to-end value chains that describe how work flows from input to customer outcome.' 
                      : 'Group processes by the department that owns them to see workload and KPI health per team.'}
                  </p>
                </div>
                {canEdit && !showBuilder && (
                  <button
                    onClick={() => setShowBuilder(true)}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    {isValueChain ? 'Create new value chain' : 'Create new department'}
                  </button>
                )}
              </div>
              
              {visibleGroups.length === 0 ? (
                <EmptyState viewType={viewType} onCreate={() => setShowBuilder(true)} />
              ) : (
                <div className="space-y-4 pt-2">
                  {visibleGroups.map((g) => (
                    <MatrixRow 
                      key={g.id} 
                      group={g} 
                      onContextMenu={handleContext} 
                      onDelete={handleDelete} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {toast && <Toast message={toast} />}
      <ContextMenu
        x={ctx.x}
        y={ctx.y}
        process={ctx.process}
        onClose={() => setCtx({ x: 0, y: 0, process: null })}
      />
    </div>
  );
}
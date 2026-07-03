const statusConfig = {
  open:      { label: 'Open',      bg: 'bg-emerald-100', text: 'text-emerald-700' },
  sold:      { label: 'Sold',      bg: 'bg-gray-100',    text: 'text-gray-500'    },
  Active:    { label: 'Active',    bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Sold:      { label: 'Sold',      bg: 'bg-gray-100',    text: 'text-gray-500'    },
  placed:    { label: 'Placed',    bg: 'bg-amber-100',   text: 'text-amber-700'   },
  completed: { label: 'Completed', bg: 'bg-brand-100',    text: 'text-gradient-primary'    },
};


export default function Badge({ status }) {
  const cfg = statusConfig[status] || statusConfig.open;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

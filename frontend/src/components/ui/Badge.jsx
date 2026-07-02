const statusConfig = {
  Active:    { label: 'Active',    bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Sold:      { label: 'Sold',      bg: 'bg-gray-100',    text: 'text-gray-500'    },
  Pending:   { label: 'Pending',   bg: 'bg-amber-100',   text: 'text-amber-700'   },
  Confirmed: { label: 'Confirmed', bg: 'bg-blue-100',    text: 'text-blue-700'    },
  Completed: { label: 'Completed', bg: 'bg-gray-800',    text: 'text-white'       },
};

export default function Badge({ status }) {
  const cfg = statusConfig[status] || statusConfig.Active;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

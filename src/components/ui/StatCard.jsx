export default function StatCard({ icon: Icon, label, value, sub, color = 'gray' }) {
  const colorMap = {
    gray:  'bg-gray-100   text-gray-600',
    black: 'bg-gray-900   text-white',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50   text-amber-600',
    blue:  'bg-blue-50    text-blue-600',
  };

  return (
    <div className="card p-5 flex items-start gap-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

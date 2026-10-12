import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color = 'emerald', trend, trendText }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      pill: 'bg-emerald-100 text-emerald-800'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      pill: 'bg-blue-100 text-blue-800'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      pill: 'bg-amber-100 text-amber-800'
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
      pill: 'bg-indigo-100 text-indigo-800'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      pill: 'bg-rose-100 text-rose-800'
    },
    violet: {
      bg: 'bg-violet-50 text-violet-600',
      border: 'border-violet-100',
      pill: 'bg-violet-100 text-violet-800'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`rounded-2xl border ${scheme.border} bg-white p-5 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${scheme.bg}`}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {trend && (
          <span className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>

      {(subtext || trendText) && (
        <p className="mt-1 text-xs font-medium text-slate-500 flex items-center gap-1.5">
          {trendText && <span className="text-slate-400">{trendText}</span>}
          {subtext && <span>{subtext}</span>}
        </p>
      )}
    </div>
  );
};

export default StatCard;

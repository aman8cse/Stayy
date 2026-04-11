const toneClassMap = {
  info: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300',
};

export default function InlineNotice({ tone = 'info', children, className = '' }) {
  const toneClass = toneClassMap[tone] ?? toneClassMap.info;
  return (
    <div className={`rounded-2xl border p-4 text-sm ${toneClass} ${className}`.trim()}>
      {children}
    </div>
  );
}

import { useSchedule } from '../store/ScheduleContext';

export default function WarningBanner() {
  const { warnings } = useSchedule();

  if (warnings.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded px-4 py-2 flex items-center gap-2 text-emerald-800 text-sm">
        <span className="font-bold">✓</span>
        <span>Bra bemanning! Alla kritiska tider är täckta.</span>
      </div>
    );
  }

  const critical = warnings.filter(w => w.type === 'critical');
  const alerts = warnings.filter(w => w.type === 'alert');

  return (
    <div className="flex flex-col gap-2">
      {critical.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2">
          <div className="text-red-900 text-xs font-bold mb-1">
            🚨 Kritiska luckor ({critical.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {critical.slice(0, 8).map((w, i) => (
              <span
                key={i}
                className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-medium"
              >
                {w.message}
              </span>
            ))}
            {critical.length > 8 && (
              <span className="text-red-700 text-xs font-semibold">
                +{critical.length - 8} fler
              </span>
            )}
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded px-4 py-2">
          <div className="text-amber-900 text-xs font-bold mb-1">
            ⚠️ Varningar ({alerts.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {alerts.slice(0, 5).map((w, i) => (
              <span
                key={i}
                className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-medium"
              >
                {w.message}
              </span>
            ))}
            {alerts.length > 5 && (
              <span className="text-amber-700 text-xs font-semibold">
                +{alerts.length - 5} fler
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

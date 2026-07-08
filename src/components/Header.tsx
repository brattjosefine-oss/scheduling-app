import { useSchedule } from '../store/ScheduleContext';
import type { Day, WeekType } from '../types';
import { DAYS } from '../utils/scheduleUtils';

const DAY_LABELS: Record<Day, string> = {
  Mån: 'Måndag',
  Tis: 'Tisdag',
  Ons: 'Onsdag',
  Tor: 'Torsdag',
  Fre: 'Fredag',
};

export default function Header() {
  const { currentWeek, activeDay, activeTab, setWeek, setActiveDay } = useSchedule();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm flex-none">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* App title */}
        <div className="flex items-center gap-3 flex-none">
          <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold leading-none">VC</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Schemaläggning</h1>
            <p className="text-xs text-gray-500 leading-tight">Vårdcentral</p>
          </div>
        </div>

        {/* Week type toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5 flex-none">
          <WeekButton week="odd" currentWeek={currentWeek} label="Udda vecka" setWeek={setWeek} />
          <WeekButton week="even" currentWeek={currentWeek} label="Jämn vecka" setWeek={setWeek} />
        </div>

        {/* Day navigation — only shown on schedule tab */}
        {activeTab === 'schedule' && (
          <nav className="flex items-center gap-1 flex-1 justify-center">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                title={DAY_LABELS[day]}
                className={`
                  px-3 py-1.5 rounded text-sm font-semibold transition-colors
                  ${activeDay === day
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                {day}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

function WeekButton({
  week,
  currentWeek,
  label,
  setWeek,
}: {
  week: WeekType;
  currentWeek: WeekType;
  label: string;
  setWeek: (w: WeekType) => void;
}) {
  const active = week === currentWeek;
  return (
    <button
      onClick={() => setWeek(week)}
      className={`
        px-3 py-1 rounded text-xs font-semibold transition-colors
        ${active ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}
      `}
    >
      {label}
    </button>
  );
}

import { useSchedule } from '../../store/ScheduleContext';
import {
  STAFF,
  DAYS,
  TIME_SLOTS,
  ACTIVITY_DEFINITIONS,
  isPersonWorking,
  isFixedSlot,
} from '../../utils/scheduleUtils';
import type { ActivityValue } from '../../types';

export default function Statistics() {
  const { workingHours, currentWeek, getActivity } = useSchedule();

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-gray-900">Statistik — {currentWeek === 'odd' ? 'Udda' : 'Jämn'} vecka</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {STAFF.map(person => (
          <PersonStats
            key={person}
            person={person}
            getActivity={getActivity}
            workingHours={workingHours}
            currentWeek={currentWeek}
          />
        ))}
      </div>
    </div>
  );
}

function PersonStats({
  person,
  getActivity,
  workingHours,
  currentWeek,
}: {
  person: string;
  getActivity: (person: string, day: string, time: string) => ActivityValue;
  workingHours: ReturnType<typeof useSchedule>['workingHours'];
  currentWeek: ReturnType<typeof useSchedule>['currentWeek'];
}) {
  const stats: Record<string, number> = {};
  ACTIVITY_DEFINITIONS.forEach(d => (stats[d.label] = 0));

  let totalSlots = 0;

  DAYS.forEach(day => {
    TIME_SLOTS.forEach(time => {
      if (
        isPersonWorking(person, day, time, currentWeek, workingHours) &&
        !isFixedSlot(person, day, time, currentWeek)
      ) {
        totalSlots++;
        const act = getActivity(person, day, time);
        stats[act] = (stats[act] ?? 0) + 1;
      }
    });
  });

  const activities = ACTIVITY_DEFINITIONS.filter(d => d.key !== 'LEDIG');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-bold text-gray-900 mb-3 text-sm">{person}</h3>
      <div className="space-y-2">
        {activities.map(def => {
          const count = stats[def.label] ?? 0;
          const pct = totalSlots > 0 ? Math.round((count / totalSlots) * 100) : 0;

          return (
            <div key={def.key}>
              <div className="flex justify-between items-center mb-0.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-none"
                    style={{ backgroundColor: def.color }}
                  />
                  <span className="text-xs text-gray-700 font-medium">{def.label}</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: def.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
        {totalSlots} tillgängliga tider
      </div>
    </div>
  );
}

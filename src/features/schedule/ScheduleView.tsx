import { useSchedule } from '../../store/ScheduleContext';
import WarningBanner from '../../components/WarningBanner';
import {
  STAFF,
  TIME_SLOTS,
  isPersonWorking,
  isFixedSlot,
  getFixedSlotName,
  isLunchTime,
  getAvailableOptions,
  validateLunchActivity,
  getActivityDefinition,
} from '../../utils/scheduleUtils';
import type { ActivityValue, Day } from '../../types';

// ============================================
// SCHEDULE VIEW
// ============================================

export default function ScheduleView() {
  const { activeDay } = useSchedule();

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Warnings */}
      <WarningBanner />

      {/* Lunch rule info */}
      <div className="bg-amber-50 border border-amber-200 rounded px-3 py-1.5 text-xs text-amber-800">
        <strong>Lunch (12:00–13:00):</strong> Endast Recept tillåtet, max 1 av 2 halvtimmar
      </div>

      {/* Main grid */}
      <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded shadow-sm">
        <DayGrid day={activeDay} />
      </div>
    </div>
  );
}

// ============================================
// DAY GRID — time rows × staff columns
// ============================================

function DayGrid({ day }: { day: Day }) {
  const { currentWeek, workingHours } = useSchedule();

  return (
    <table className="w-full border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
      <colgroup>
        {/* Time column */}
        <col style={{ width: '56px' }} />
        {/* One column per staff member */}
        {STAFF.map(person => (
          <col key={person} />
        ))}
      </colgroup>

      {/* Header row — staff names */}
      <thead>
        <tr className="bg-gray-900 text-white sticky top-0 z-10">
          <th className="py-2 px-2 text-left font-semibold text-gray-400 text-xs border-r border-gray-700">
            Tid
          </th>
          {STAFF.map(person => {
            const isWorking = TIME_SLOTS.some(time =>
              isPersonWorking(person, day, time, currentWeek, workingHours),
            );
            return (
              <th
                key={person}
                className={`py-2 px-1 text-center font-semibold text-xs border-r border-gray-700 last:border-r-0 ${
                  isWorking ? 'text-white' : 'text-gray-500'
                }`}
              >
                <span className="block truncate">{person}</span>
                {!isWorking && (
                  <span className="text-gray-500 font-normal text-xs">ledig</span>
                )}
              </th>
            );
          })}
        </tr>
      </thead>

      {/* Time rows */}
      <tbody>
        {TIME_SLOTS.map(time => (
          <TimeRow key={time} day={day} time={time} />
        ))}
      </tbody>
    </table>
  );
}

// ============================================
// TIME ROW
// ============================================

function TimeRow({ day, time }: { day: Day; time: string }) {
  const isLunch = isLunchTime(time);
  const isHour = time.endsWith(':00');

  return (
    <tr
      className={`border-b ${
        isLunch
          ? 'bg-amber-50 border-amber-200'
          : isHour
          ? 'border-gray-300'
          : 'border-gray-100'
      }`}
    >
      {/* Time label */}
      <td
        className={`py-0 px-2 text-right font-mono text-xs border-r whitespace-nowrap align-middle schedule-cell ${
          isLunch
            ? 'text-amber-700 border-amber-200 font-semibold'
            : 'text-gray-400 border-gray-200'
        }`}
      >
        {isHour ? time : <span className="opacity-50">{time}</span>}
      </td>

      {/* Staff cells */}
      {STAFF.map(person => (
        <ActivityCell key={person} person={person} day={day} time={time} />
      ))}
    </tr>
  );
}

// ============================================
// ACTIVITY CELL
// ============================================

function ActivityCell({
  person,
  day,
  time,
}: {
  person: string;
  day: Day;
  time: string;
}) {
  const { currentWeek, workingHours, getActivity, setActivity } = useSchedule();
  const isLunch = isLunchTime(time);

  const working = isPersonWorking(person, day, time, currentWeek, workingHours);
  const fixed = isFixedSlot(person, day, time, currentWeek);
  const activity = getActivity(person, day, time) as ActivityValue;

  // Not working
  if (!working) {
    return (
      <td
        className={`border-r border-gray-100 last:border-r-0 text-center schedule-cell ${
          isLunch ? 'bg-amber-50' : 'bg-gray-50'
        }`}
      >
        <span className="text-gray-300 text-xs">—</span>
      </td>
    );
  }

  // Fixed slot (e.g. BVC, Synergimöte)
  if (fixed) {
    const name = getFixedSlotName(person, day, time, currentWeek);
    return (
      <td
        className={`border-r border-gray-100 last:border-r-0 schedule-cell ${
          isLunch ? 'bg-amber-50' : ''
        }`}
      >
        <div
          className="mx-0.5 rounded px-1 py-0.5 text-center font-semibold text-white text-xs activity-cell truncate"
          style={{ backgroundColor: '#ec4899' }}
          title={name}
        >
          {name}
        </div>
      </td>
    );
  }

  // Editable slot
  const options = getAvailableOptions(person, time);
  const def = getActivityDefinition(activity);

  function handleChange(value: string) {
    const newActivity = value as ActivityValue;

    if (!validateLunchActivity(person, day, time, newActivity, getActivity)) {
      alert('Max 1 Recept under lunch (12:00–13:00)');
      return;
    }

    setActivity(person, day, time, newActivity);
  }

  const isEmpty = activity === 'Ledig';

  return (
    <td
      className={`border-r border-gray-100 last:border-r-0 schedule-cell p-0.5 ${
        isLunch ? 'bg-amber-50' : ''
      }`}
    >
      <div
        className="relative rounded overflow-hidden activity-cell h-full"
        style={{
          backgroundColor: isEmpty ? undefined : def.color,
          minHeight: '36px',
        }}
      >
        <select
          value={activity}
          onChange={e => handleChange(e.target.value)}
          className={`
            w-full h-full appearance-none cursor-pointer text-xs font-semibold
            border-none outline-none rounded px-1 py-1
            ${isEmpty
              ? 'bg-transparent text-gray-400 hover:bg-gray-100'
              : 'bg-transparent text-white'}
          `}
          style={{ minHeight: '36px' }}
        >
          {options.map(opt => (
            <option key={opt} value={opt} className="text-gray-900 bg-white">
              {opt}
            </option>
          ))}
        </select>
      </div>
    </td>
  );
}

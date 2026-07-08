import { useState } from 'react';
import { useSchedule } from '../../store/ScheduleContext';
import { STAFF, DAYS } from '../../utils/scheduleUtils';
import type { Day, WeekType } from '../../types';

const WEEK_OPTIONS = [
  { value: 'odd' as WeekType, label: 'Udda vecka' },
  { value: 'even' as WeekType, label: 'Jämn vecka' },
];

const PRESET_OPTIONS = [
  '08:00-17:00',
  '08:00-12:00',
  '12:00-17:00',
  '08:00-16:00',
  'Ledig',
];

export default function Settings() {
  const { workingHours, setWorkingHours } = useSchedule();
  const [expandedPerson, setExpandedPerson] = useState<string | null>(STAFF[0]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Inställningar — Arbetstider</h2>
        <p className="text-xs text-gray-500">Format: HH:MM-HH:MM eller "Ledig"</p>
      </div>

      {STAFF.map(person => (
        <div key={person} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Person header */}
          <button
            onClick={() => setExpandedPerson(expandedPerson === person ? null : person)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900 text-sm">{person}</span>
            <span className="text-gray-400 text-xs">{expandedPerson === person ? '▲' : '▼'}</span>
          </button>

          {/* Expandable content */}
          {expandedPerson === person && (
            <div className="border-t border-gray-100 p-4 space-y-4">
              {WEEK_OPTIONS.map(({ value: week, label }) => (
                <div key={week}>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    {label}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {DAYS.map(day => (
                      <DayInput
                        key={day}
                        person={person}
                        week={week}
                        day={day}
                        value={workingHours[person]?.[week]?.[day] ?? '08:00-17:00'}
                        onChange={(v) => setWorkingHours(person, week, day, v)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DayInput({
  day,
  value,
  onChange,
}: {
  person: string;
  week: WeekType;
  day: Day;
  value: string;
  onChange: (v: string) => void;
}) {
  const isLedig = value === 'Ledig';

  return (
    <div>
      <label className="block text-xs text-gray-600 font-semibold mb-1">{day}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="08:00-17:00"
        list={`presets-${day}`}
        className={`w-full px-2 py-1.5 border rounded text-xs font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          isLedig
            ? 'bg-gray-50 border-gray-200 text-gray-400'
            : 'border-gray-300 text-gray-900'
        }`}
      />
      <datalist id={`presets-${day}`}>
        {PRESET_OPTIONS.map(p => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </div>
  );
}

import type {
  ActivityDefinition,
  ActivityValue,
  Day,
  FixedSlots,
  WeekType,
} from '../types';

// ============================================
// CONSTANTS
// ============================================

export const STAFF: string[] = [
  'Josefine',
  'Max',
  'Jens',
  'Rita',
  'Sara',
  'Tom',
  'Ingrid',
  'Helena',
  'Sandra',
];

export const DAYS: Day[] = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre'];

export const TIME_SLOTS: string[] = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

export const LUNCH_TIMES: string[] = ['12:00', '12:30'];

export const ACTIVITY_DEFINITIONS: ActivityDefinition[] = [
  { key: 'AKUT',      label: 'Akut',       color: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-white' },
  { key: 'TELEQ',     label: 'TeleQ',      color: '#3b82f6', bgClass: 'bg-blue-500',    textClass: 'text-white' },
  { key: 'MOTTAGNING',label: 'Mottagning', color: '#ef4444', bgClass: 'bg-red-500',     textClass: 'text-white' },
  { key: 'ADMIN',     label: 'Admin',      color: '#f59e0b', bgClass: 'bg-amber-500',   textClass: 'text-white' },
  { key: 'RECEPT',    label: 'Recept',     color: '#8b5cf6', bgClass: 'bg-violet-500',  textClass: 'text-white' },
  { key: 'TELEFON',   label: 'Telefon',    color: '#06b6d4', bgClass: 'bg-cyan-500',    textClass: 'text-white' },
  { key: 'MOTE',      label: 'Möte',       color: '#ec4899', bgClass: 'bg-pink-500',    textClass: 'text-white' },
  { key: 'CHEFSTID',  label: 'Chefstid',   color: '#6b7280', bgClass: 'bg-gray-500',   textClass: 'text-white' },
  { key: 'LEDIG',     label: 'Ledig',      color: '#d1d5db', bgClass: 'bg-gray-200',   textClass: 'text-gray-500' },
];

export const ACTIVITY_OPTIONS: ActivityValue[] = ACTIVITY_DEFINITIONS.map(d => d.label);

export const FIXED_SLOTS: FixedSlots = {
  odd: {
    Max: [
      { day: 'Tis', start: '08:30', end: '09:30', name: 'Synergimöte' },
      { day: 'Tis', start: '13:00', end: '14:30', name: 'Hemsjukvård' },
      { day: 'Ons', start: '08:00', end: '12:00', name: 'BVC' },
    ],
    Jens: [
      { day: 'Tis', start: '09:00', end: '12:00', name: 'Lillåhem-rond' },
      { day: 'Ons', start: '08:00', end: '12:00', name: 'BVC' },
    ],
    Sara: [{ day: 'Ons', start: '09:00', end: '12:00', name: 'Orsagården' }],
    Josefine: [{ day: 'Ons', start: '13:00', end: '15:00', name: 'MVC' }],
    Helena: [{ day: 'Tor', start: '09:00', end: '12:00', name: 'Skolläkare' }],
  },
  even: {
    Max: [
      { day: 'Tis', start: '08:30', end: '09:30', name: 'Synergimöte' },
      { day: 'Tis', start: '13:00', end: '14:30', name: 'Hemsjukvård' },
      { day: 'Ons', start: '08:00', end: '12:00', name: 'BVC' },
    ],
    Jens: [{ day: 'Tis', start: '09:00', end: '12:00', name: 'Lillåhem-rond' }],
    Sara: [{ day: 'Ons', start: '09:00', end: '12:00', name: 'Orsagården' }],
    Rita: [{ day: 'Ons', start: '13:00', end: '15:00', name: 'MVC' }],
    Helena: [{ day: 'Tor', start: '09:00', end: '12:00', name: 'Skolläkare' }],
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function isLunchTime(time: string): boolean {
  return LUNCH_TIMES.includes(time);
}

export function isPersonWorking(
  person: string,
  day: Day,
  time: string,
  weekType: WeekType,
  workingHours: Record<string, Record<WeekType, Record<Day, string>>>,
): boolean {
  const hours = workingHours[person]?.[weekType]?.[day] ?? '08:00-17:00';
  if (hours === 'Ledig') return false;

  const [start, end] = hours.split('-');
  const slotStart = timeToMinutes(start);
  const slotEnd = timeToMinutes(end);
  const slotTime = timeToMinutes(time);

  return slotTime >= slotStart && slotTime < slotEnd;
}

export function isFixedSlot(
  person: string,
  day: Day,
  time: string,
  weekType: WeekType,
): boolean {
  const fixed = FIXED_SLOTS[weekType][person] ?? [];
  return fixed.some(slot => {
    if (slot.day !== day) return false;
    const start = timeToMinutes(slot.start);
    const end = timeToMinutes(slot.end);
    const t = timeToMinutes(time);
    return t >= start && t < end;
  });
}

export function getFixedSlotName(
  person: string,
  day: Day,
  time: string,
  weekType: WeekType,
): string {
  const fixed = FIXED_SLOTS[weekType][person] ?? [];
  const slot = fixed.find(s => {
    if (s.day !== day) return false;
    const start = timeToMinutes(s.start);
    const end = timeToMinutes(s.end);
    const t = timeToMinutes(time);
    return t >= start && t < end;
  });
  return slot?.name ?? '';
}

export function getActivityDefinition(label: ActivityValue): ActivityDefinition {
  return (
    ACTIVITY_DEFINITIONS.find(d => d.label === label) ??
    ACTIVITY_DEFINITIONS[ACTIVITY_DEFINITIONS.length - 1]
  );
}

export function getActivityStyle(label: ActivityValue): string {
  const def = getActivityDefinition(label);
  return def.bgClass + ' ' + def.textClass;
}

export function validateLunchActivity(
  person: string,
  day: Day,
  time: string,
  activity: ActivityValue,
  getActivity: (person: string, day: string, time: string) => ActivityValue,
): boolean {
  if (!isLunchTime(time)) return true;

  if (activity !== 'Recept' && activity !== 'Ledig') return false;

  if (activity === 'Recept') {
    const otherLunchTime = time === '12:00' ? '12:30' : '12:00';
    const otherActivity = getActivity(person, day, otherLunchTime);
    if (otherActivity === 'Recept') return false;
  }

  return true;
}

export function getAvailableOptions(
  person: string,
  time: string,
): ActivityValue[] {
  let options = [...ACTIVITY_OPTIONS];

  if (isLunchTime(time)) {
    options = ['Recept', 'Ledig'];
  }

  if (person !== 'Josefine') {
    options = options.filter(a => a !== 'Chefstid');
  }

  return options;
}

export function buildDefaultSchedule(): Record<string, Record<string, Record<string, ActivityValue>>> {
  const schedule: Record<string, Record<string, Record<string, ActivityValue>>> = {};
  STAFF.forEach(person => {
    schedule[person] = {};
    DAYS.forEach(day => {
      schedule[person][day] = {};
      TIME_SLOTS.forEach(slot => {
        schedule[person][day][slot] = 'Ledig';
      });
    });
  });
  return schedule;
}

export function buildDefaultWorkingHours(): Record<string, Record<WeekType, Record<Day, string>>> {
  const hours: Record<string, Record<WeekType, Record<Day, string>>> = {};
  STAFF.forEach(person => {
    hours[person] = {
      odd: { Mån: '08:00-17:00', Tis: '08:00-17:00', Ons: '08:00-17:00', Tor: '08:00-17:00', Fre: '08:00-17:00' },
      even: { Mån: '08:00-17:00', Tis: '08:00-17:00', Ons: '08:00-17:00', Tor: '08:00-17:00', Fre: '08:00-17:00' },
    };
  });
  return hours;
}

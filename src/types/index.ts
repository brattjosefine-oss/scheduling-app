// ============================================
// CORE TYPES
// ============================================

export type WeekType = 'odd' | 'even';

export type Day = 'Mån' | 'Tis' | 'Ons' | 'Tor' | 'Fre';

export type ActivityKey =
  | 'AKUT'
  | 'TELEQ'
  | 'MOTTAGNING'
  | 'ADMIN'
  | 'RECEPT'
  | 'TELEFON'
  | 'MOTE'
  | 'CHEFSTID'
  | 'LEDIG';

export type ActivityValue =
  | 'Akut'
  | 'TeleQ'
  | 'Mottagning'
  | 'Admin'
  | 'Recept'
  | 'Telefon'
  | 'Möte'
  | 'Chefstid'
  | 'Ledig';

export interface ActivityDefinition {
  key: ActivityKey;
  label: ActivityValue;
  color: string;
  bgClass: string;
  textClass: string;
}

export interface FixedSlot {
  day: Day;
  start: string;
  end: string;
  name: string;
}

// schedule[person][day][time] = activity
export type Schedule = Record<string, Record<string, Record<string, ActivityValue>>>;

// workingHours[person][weekType][day] = '08:00-17:00' | 'Ledig'
export type WorkingHours = Record<string, Record<WeekType, Record<Day, string>>>;

export type FixedSlots = Record<WeekType, Record<string, FixedSlot[]>>;

export interface Warning {
  type: 'critical' | 'alert';
  message: string;
  day: Day;
  time?: string;
}

export type ActiveTab = 'schedule' | 'stats' | 'settings';

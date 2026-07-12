import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ActiveTab, ActivityValue, Day, Schedule, WeekType, WorkingHours, Warning } from '../types';
import {
  DAYS,
  FIXED_SLOTS,
  STAFF,
  TIME_SLOTS,
  buildDefaultSchedule,
  buildDefaultWorkingHours,
  isFixedSlot,
  isLunchTime,
  isPersonWorking,
} from '../utils/scheduleUtils';

// ============================================
// CONTEXT TYPES
// ============================================

interface ScheduleContextValue {
  // State
  schedule: Schedule;
  workingHours: WorkingHours;
  currentWeek: WeekType;
  activeDay: Day;
  activeTab: ActiveTab;

  // Actions
  setActivity: (person: string, day: Day, time: string, activity: ActivityValue) => void;
  setWorkingHours: (person: string, week: WeekType, day: Day, hours: string) => void;
  setWeek: (week: WeekType) => void;
  setActiveDay: (day: Day) => void;
  setActiveTab: (tab: ActiveTab) => void;
  getActivity: (person: string, day: string, time: string) => ActivityValue;

  // Derived
  warnings: Warning[];
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

// ============================================
// BEMANNING CHECK
// ============================================

function computeWarnings(
  schedule: Schedule,
  workingHours: WorkingHours,
  currentWeek: WeekType,
): Warning[] {
  const warnings: Warning[] = [];

  const getActivity = (person: string, day: string, time: string): ActivityValue =>
    (schedule[person]?.[day]?.[time] as ActivityValue) ?? 'Ledig';

  DAYS.forEach(day => {
    // TeleQ check — should have ≥ 2 on Mån/Tis/Ons/Fre
    if (day !== 'Tor') {
      let teleqCount = 0;
      LUNCH_TIMES_LOCAL.forEach(time => {
        STAFF.forEach(person => {
          if (
            isPersonWorking(person, day, time, currentWeek, workingHours) &&
            !isFixedSlot(person, day, time, currentWeek) &&
            getActivity(person, day, time) === 'TeleQ'
          ) {
            teleqCount++;
          }
        });
      });
      if (teleqCount < 2) {
        warnings.push({
          type: 'critical',
          message: `TeleQ saknas ${day} (${teleqCount}/2)`,
          day,
        });
      }
    }

    // Akut coverage check (08:00-17:00, excluding lunch)
    TIME_SLOTS.forEach(time => {
      if (isLunchTime(time)) return;
      const hour = parseInt(time.split(':')[0], 10);
      if (hour < 8 || hour >= 17) return;

      const akutCount = STAFF.filter(
        person =>
          isPersonWorking(person, day, time, currentWeek, workingHours) &&
          !isFixedSlot(person, day, time, currentWeek) &&
          getActivity(person, day, time) === 'Akut',
      ).length;

      if (akutCount === 0) {
        warnings.push({
          type: 'critical',
          message: `Akut saknas ${day} ${time}`,
          day,
          time,
        });
      }
    });

    // Lunch Recept check
    const lunchReceptCount = LUNCH_TIMES_LOCAL.filter(time =>
      STAFF.some(
        person =>
          isPersonWorking(person, day, time, currentWeek, workingHours) &&
          !isFixedSlot(person, day, time, currentWeek) &&
          getActivity(person, day, time) === 'Recept',
      ),
    ).length;

    if (lunchReceptCount > 1) {
      warnings.push({
        type: 'alert',
        message: `För många Recept under lunch ${day} (${lunchReceptCount}/1)`,
        day,
      });
    }
  });

  return warnings;
}

const LUNCH_TIMES_LOCAL = ['12:00', '12:30'];

// ============================================
// PROVIDER
// ============================================

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [schedule, setScheduleState] = useState<Schedule>(() => {
    const stored = localStorage.getItem('schedule');
    if (stored) {
      try { return JSON.parse(stored) as Schedule; } catch { /* ignore */ }
    }
    return buildDefaultSchedule();
  });

  const [workingHours, setWorkingHoursState] = useState<WorkingHours>(() => {
    const stored = localStorage.getItem('workingHours');
    if (stored) {
      try { return JSON.parse(stored) as WorkingHours; } catch { /* ignore */ }
    }
    return buildDefaultWorkingHours();
  });

  const [currentWeek, setCurrentWeek] = useState<WeekType>('odd');
  const [activeDay, setActiveDay] = useState<Day>('Mån');
  const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');
  const [warnings, setWarnings] = useState<Warning[]>([]);

  // Persist schedule to localStorage
  useEffect(() => {
    localStorage.setItem('schedule', JSON.stringify(schedule));
  }, [schedule]);

  // Persist workingHours to localStorage
  useEffect(() => {
    localStorage.setItem('workingHours', JSON.stringify(workingHours));
  }, [workingHours]);

  // Recompute warnings when relevant state changes
  useEffect(() => {
    setWarnings(computeWarnings(schedule, workingHours, currentWeek));
  }, [schedule, workingHours, currentWeek]);

  const getActivity = useCallback(
    (person: string, day: string, time: string): ActivityValue =>
      (schedule[person]?.[day]?.[time] as ActivityValue) ?? 'Ledig',
    [schedule],
  );

  const setActivity = useCallback(
    (person: string, day: Day, time: string, activity: ActivityValue) => {
      setScheduleState(prev => ({
        ...prev,
        [person]: {
          ...prev[person],
          [day]: {
            ...prev[person]?.[day],
            [time]: activity,
          },
        },
      }));
    },
    [],
  );

  const setWorkingHoursAction = useCallback(
    (person: string, week: WeekType, day: Day, hours: string) => {
      setWorkingHoursState(prev => ({
        ...prev,
        [person]: {
          ...prev[person],
          [week]: {
            ...prev[person]?.[week],
            [day]: hours,
          },
        },
      }));
    },
    [],
  );

  const setWeek = useCallback((week: WeekType) => setCurrentWeek(week), []);
  const setActiveDayAction = useCallback((day: Day) => setActiveDay(day), []);
  const setActiveTabAction = useCallback((tab: ActiveTab) => setActiveTab(tab), []);

  return (
    <ScheduleContext.Provider
      value={{
        schedule,
        workingHours,
        currentWeek,
        activeDay,
        activeTab,
        setActivity,
        setWorkingHours: setWorkingHoursAction,
        setWeek,
        setActiveDay: setActiveDayAction,
        setActiveTab: setActiveTabAction,
        getActivity,
        warnings,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
}

// Re-export for convenience in components
export { FIXED_SLOTS };

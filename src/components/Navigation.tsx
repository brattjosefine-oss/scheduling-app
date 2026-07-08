import { useSchedule } from '../store/ScheduleContext';
import type { ActiveTab } from '../types';

const TABS: { id: ActiveTab; label: string; icon: string }[] = [
  { id: 'schedule', label: 'Schema', icon: '📅' },
  { id: 'stats', label: 'Statistik', icon: '📊' },
  { id: 'settings', label: 'Inställningar', icon: '⚙️' },
];

export default function Navigation() {
  const { activeTab, setActiveTab } = useSchedule();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 flex gap-1 flex-none">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2
            ${activeTab === tab.id
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}
          `}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

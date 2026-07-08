import Header from './components/Header';
import Navigation from './components/Navigation';
import ScheduleView from './features/schedule/ScheduleView';
import Statistics from './features/statistics/Statistics';
import Settings from './features/settings/Settings';
import { useSchedule } from './store/ScheduleContext';

export default function App() {
  const { activeTab } = useSchedule();

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header />
      <Navigation />

      <main className="flex-1 overflow-auto p-4">
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'stats' && <Statistics />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

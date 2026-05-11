import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Class } from '../types';
import { apiService } from '../services/api';
import ClassManagement from '../components/ClassManagement';
import AnnouncementSection from '../components/AnnouncementSection';
import NotesManager from '../components/NotesManager';
import EvaluationsView from '../components/EvaluationsView';
import { BookOpen, Bell, FileText, Star } from 'lucide-react';

type Tab = 'classes' | 'announcements' | 'notes' | 'evaluations';

export default function LecturerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { fetchClasses(); }, []);

   const fetchClasses = async () => { try { const data = await apiService.Classes.getMyClassesAsLecturer(); setClasses(data); } catch (error) { console.error('Failed to fetch classes:', error); } };

  const tabs = [
    { id: 'classes', label: 'My Classes', icon: BookOpen },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'evaluations', label: 'Evaluations', icon: Star },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-700">MyClassroom</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name}</p>
          </div>
          <button onClick={logout} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">Sign Out</button>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>
          <main className="flex-1">
            {activeTab === 'classes' && <ClassManagement classes={classes} onRefresh={fetchClasses} />}
            {activeTab === 'announcements' && <AnnouncementSection classes={classes} onClassUpdate={() => setRefreshKey(k => k+1)} />}
            {activeTab === 'notes' && <NotesManager classes={classes} onRefresh={() => setRefreshKey(k => k+1)} />}
            {activeTab === 'evaluations' && <EvaluationsView classes={classes} refreshKey={refreshKey} />}
          </main>
        </div>
      </div>
    </div>
  );
}

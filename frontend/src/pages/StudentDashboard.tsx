import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Class } from '../types';
import { apiService } from '../services/api';
import ClassCard from '../components/ClassCard';
import NotesBrowser from '../components/NotesBrowser';
import AssignmentsList from '../components/AssignmentsList';
import TodoList from '../components/TodoList';
import { PlusCircle, BookOpen, ClipboardList, CheckSquare } from 'lucide-react';

type Tab = 'classes' | 'available' | 'notes' | 'assignments' | 'todos';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchClasses(); fetchAvailableClasses(); }, []);

  const fetchClasses = async () => {
    try { const data = await apiService.Classes.getMyClasses(); setClasses(data); }
    catch (error) { console.error('Failed to fetch classes:', error); }
    finally { setLoading(false); }
  };

  const fetchAvailableClasses = async () => {
    try { const data = await apiService.Classes.getAvailable(); setAvailableClasses(data); }
    catch (error) { console.error('Failed to fetch available classes:', error); }
  };

   const tabs = [
     { id: 'classes', label: 'My Classes', icon: BookOpen },
     { id: 'available', label: 'Browse Classes', icon: BookOpen },
     { id: 'notes', label: 'Notes', icon: PlusCircle },
     { id: 'assignments', label: 'Assignments', icon: ClipboardList },
     { id: 'todos', label: 'To-Do', icon: CheckSquare },
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
            {loading ? <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div> : (
              <>
                {activeTab === 'classes' && <ClassCard classes={classes} onRefresh={fetchClasses} />}
                {activeTab === 'notes' && <NotesBrowser classes={classes} />}
                 {activeTab === 'assignments' && <AssignmentsList />}
                {activeTab === 'todos' && <TodoList />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

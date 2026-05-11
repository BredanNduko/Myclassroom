import { useState } from 'react';
import { Class } from '../types';
import { apiService } from '../services/api';
import { BookOpen, Clock, MapPin, Calendar, Trash2, PlusCircle } from 'lucide-react';

interface Props { classes: Class[]; onRefresh: () => void; }

export default function ClassCard({ classes, onRefresh }: Props) {
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async (classId: string) => {
    try { setEnrolling(true); await apiService.Classes.enroll(classId); onRefresh(); }
    catch (error) { console.error('Enrollment failed:', error); alert('Failed to enroll in class'); }
    finally { setEnrolling(false); }
  };

  const handleDrop = async (classId: string) => {
    if (!window.confirm('Are you sure you want to drop this class?')) return;
    try { await apiService.Classes.drop(classId); onRefresh(); }
    catch (error) { console.error('Drop failed:', error); }
  };

  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
        <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No classes enrolled yet</h3>
        <p className="text-gray-500 mb-6">Browse available classes and enroll to get started</p>
        <AddClassButton onEnroll={handleEnroll} enrolling={enrolling} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
        <AddClassButton onEnroll={handleEnroll} enrolling={enrolling} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{cls.name}</h3>
              <button onClick={() => handleDrop(cls.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Drop class"><Trash2 size={16} /></button>
            </div>
            <p className="text-sm text-primary-600 font-medium mb-4">{cls.code}</p>
            {cls.schedule && <div className="flex items-center gap-2 text-sm text-gray-600 mb-2"><Clock size={16} /><span>{cls.schedule}</span></div>}
            {cls.location && <div className="flex items-center gap-2 text-sm text-gray-600 mb-2"><MapPin size={16} /><span>{cls.location}</span></div>}
            {cls.semester && <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar size={16} /><span>{cls.semester}</span></div>}
            {cls.lecturerName && <p className="text-sm text-gray-500 mt-3 pt-3 border-t">Lecturer: {cls.lecturerName}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddClassButton({ onEnroll, enrolling }: { onEnroll: (id: string) => void, enrolling: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailable = async () => {
    setLoading(true);
    try { const data = await apiService.Classes.getAvailable(); setAvailableClasses(data); }
    catch (error) { console.error('Failed:', error); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => { fetchAvailable(); setShowModal(true); }} disabled={enrolling} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition">
        <PlusCircle size={20} /> Add Class
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b"><div className="flex justify-between items-center"><h3 className="text-xl font-semibold text-gray-800">Enroll in a Class</h3><button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button></div></div>
            <div className="p-6">
              {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div> : availableClasses.length === 0 ? <p className="text-center text-gray-500 py-8">No classes available to enroll</p> : (
                <div className="space-y-3">
                  {availableClasses.map((cls) => (
                    <div key={cls.id} className="border rounded-lg p-4 hover:border-primary-300 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{cls.name}</h4>
                          <p className="text-sm text-gray-500">{cls.code}</p>
                          {cls.schedule && <p className="text-sm text-gray-500 mt-1">{cls.schedule}</p>}
                          {cls.lecturerName && <p className="text-sm text-gray-500"> Lecturer: {cls.lecturerName}</p>}
                        </div>
                        <button onClick={() => { onEnroll(cls.id); setShowModal(false); }} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg">Enroll</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect } from 'react';
import { Class, Note } from '../types';
import { apiService } from '../services/api';
import { FileText, Download, Calendar } from 'lucide-react';

interface Props { classes: Class[]; }

export default function NotesBrowser({ classes }: Props) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (selectedClassId) fetchNotes(selectedClassId); else setNotes([]); }, [selectedClassId]);

  const fetchNotes = async (classId: string) => {
    setLoading(true);
    try { const data = await apiService.Notes.getByClass(classId); setNotes(data); }
    catch (error) { console.error('Failed to fetch notes:', error); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4"><FileText className="text-primary-600" size={24} /><h2 className="text-2xl font-bold text-gray-800">Class Notes</h2></div>
        {classes.length === 0 ? <div className="text-center py-12"><p className="text-gray-500">Enroll in a class to view notes</p></div> : (
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <button key={cls.id} onClick={() => setSelectedClassId(cls.id)} className={`px-4 py-2 rounded-lg font-medium transition ${selectedClassId === cls.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{cls.name}</button>
            ))}
          </div>
        )}
      </div>
      {selectedClassId && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes: {classes.find(c => c.id === selectedClassId)?.name}</h3>
          {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div> : notes.length === 0 ? (
            <div className="text-center py-12"><FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" /><p className="text-gray-500">No notes available yet</p></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{note.title}</h4>
                      {note.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-3"><span className="flex items-center gap-1"><Calendar size={12} />{new Date(note.createdAt).toLocaleDateString()}</span><span>by {note.lecturerName}</span></div>
                    </div>
                    {note.filePath && <button onClick={() => apiService.Notes.download(note.id)} className="ml-3 p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Download"><Download size={18} /></button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

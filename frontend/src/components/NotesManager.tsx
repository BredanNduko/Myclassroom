import { useState, useEffect } from 'react';
import { Class, Note } from '../types';
import { apiService } from '../services/api';
import { FileText, Trash2, Download, PlusCircle, Calendar } from 'lucide-react';

interface Props { classes: Class[]; onRefresh?: () => void; }

export default function NotesManager({ classes, onRefresh }: Props) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { if (selectedClassId) fetchNotes(selectedClassId); else setNotes([]); }, [selectedClassId, onRefresh]);

  const fetchNotes = async (classId: string) => {
    try { const data = await apiService.Notes.getByClass(classId); setNotes(data); }
    catch (error) { console.error('Failed:', error); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('classId', selectedClassId);
    formData.append('title', title);
    formData.append('description', description);
    try {
      setUploading(true);
      await apiService.Notes.create(formData);
      setShowForm(false); setTitle(''); setDescription('');
      fetchNotes(selectedClassId); onRefresh?.();
    } catch (error) { console.error('Failed:', error); alert('Failed to upload note'); }
    finally { setUploading(false); }
  };

  const deleteNote = async (id: string) => { if (!window.confirm('Delete this note?')) return; try { await apiService.Notes.delete(id); fetchNotes(selectedClassId); onRefresh?.(); } catch (error) { console.error('Failed:', error); } };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-6"><FileText className="text-primary-600" size={24} /><h2 className="text-2xl font-bold text-gray-800">Notes Management</h2></div>
        {classes.length === 0 ? (
          <div className="text-center py-12"><FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" /><p className="text-gray-500">Create a class first to upload notes</p></div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {classes.map((cls) => (
                <button key={cls.id} onClick={() => setSelectedClassId(cls.id)} className={`px-4 py-2 rounded-lg font-medium transition ${selectedClassId === cls.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{cls.name}</button>
              ))}
            </div>
            {selectedClassId && (
              <div className="space-y-4">
                {!showForm ? <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"><PlusCircle size={20} /> Upload Note</button> : (
                  <form onSubmit={handleSubmit} className="border rounded-lg p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Note</h3>
                    <div className="space-y-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" /></div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload Note'}</button>
                        <button type="button" onClick={() => { setShowForm(false); setTitle(''); setDescription(''); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                      </div>
                    </div>
                  </form>
                )}
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="text-blue-500" size={24} />
                          <div>
                            <h4 className="font-semibold text-gray-800">{note.title}</h4>
                            {note.description && <p className="text-sm text-gray-600 mt-1">{note.description}</p>}
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                              <span className="flex items-center gap-1"><Calendar size={12} />{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        {note.filePath && <button onClick={() => window.open(`/api/notes/${note.id}/download`, '_blank')} className="ml-3 p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Download"><Download size={18} /></button>}
                        <button onClick={() => deleteNote(note.id)} className="ml-2 p-2 text-gray-400 hover:text-red-500 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

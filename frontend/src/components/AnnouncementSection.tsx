import { useState, useEffect } from 'react';
import { Class, Announcement } from '../types';
import { apiService } from '../services/api';
import { Bell, PlusCircle, Megaphone, Calendar, AlertCircle } from 'lucide-react';

interface Props { classes: Class[]; onClassUpdate?: () => void; }

export default function AnnouncementSection({ classes, onClassUpdate }: Props) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{ title: string; content: string; priority: 'low' | 'normal' | 'high' }>({ title: '', content: '', priority: 'normal' });

  useEffect(() => { if (selectedClassId) fetchAnnouncements(selectedClassId); else setAnnouncements([]); }, [selectedClassId]);

  const fetchAnnouncements = async (classId: string) => {
    try { const data = await apiService.Announcements.getByClass(classId); setAnnouncements(data); }
    catch (error) { console.error('Failed:', error); }
  };

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    try {
      await apiService.Announcements.create({ ...formData, classId: selectedClassId });
      setShowForm(false); setFormData({ title: '', content: '', priority: 'normal' });
      fetchAnnouncements(selectedClassId); onClassUpdate?.();
    } catch (error) { console.error('Failed:', error); alert('Failed to create announcement'); }
  };

  const deleteAnnouncement = async (id: string) => { try { await apiService.Announcements.delete(id); fetchAnnouncements(selectedClassId); } catch (error) { console.error('Failed:', error); } };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-2"><Bell className="text-primary-600" size={24} /><h2 className="text-2xl font-bold text-gray-800">Announcements</h2></div></div>
        {classes.length === 0 ? (
          <div className="text-center py-12"><Bell className="mx-auto h-16 w-16 text-gray-300 mb-4" /><p className="text-gray-500">Create a class first to make announcements</p></div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {classes.map((cls) => (
                <button key={cls.id} onClick={() => setSelectedClassId(cls.id)} className={`px-4 py-2 rounded-lg font-medium transition ${selectedClassId === cls.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{cls.name}</button>
              ))}
            </div>
            {selectedClassId && (
              <div className="space-y-4">
                {!showForm && announcements.length > 0 && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"><PlusCircle size={20} /> New Announcement</button>}
                {showForm && (
                  <form onSubmit={createAnnouncement} className={`p-4 border-2 rounded-lg ${formData.priority === 'high' ? 'border-red-200 bg-red-50' : formData.priority === 'low' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                    <div className="flex justify-between items-center mb-3"><h4 className="font-semibold text-gray-800">New Announcement</h4><button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">✕</button></div>
                    <div className="space-y-3">
                      <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Announcement title" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" required />
                      <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="What do you want to tell your students?" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none" required />
                      <div className="flex gap-2">
                        {(['low', 'normal', 'high'] as const).map((p) => (
                          <button key={p} type="button" onClick={() => setFormData({ ...formData, priority: p })} className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${formData.priority === p ? 'bg-primary-100 border-primary-300 text-primary-700' : 'border-gray-300 text-gray-600'}`}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium">Post Announcement</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                      </div>
                    </div>
                  </form>
                )}
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann.id} className={`border rounded-lg p-4 ${ann.priority === 'high' ? 'border-red-200 bg-red-50' : ann.priority === 'low' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1"><Megaphone size={16} className="text-primary-600" /><h4 className="font-semibold text-gray-800">{ann.title}</h4></div>
                          <p className="text-gray-700 mb-2">{ann.content}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500"><span className="flex items-center gap-1"><Calendar size={12} />{formatDate(ann.createdAt)}</span>{ann.priority === 'high' && <span className="flex items-center gap-1 text-red-600"><AlertCircle size={12} /> High Priority</span>}</div>
                        </div>
                        <button onClick={() => deleteAnnouncement(ann.id)} className="ml-3 p-2 text-gray-400 hover:text-red-500 rounded-lg" title="Delete"><Megaphone size={16} /></button>
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

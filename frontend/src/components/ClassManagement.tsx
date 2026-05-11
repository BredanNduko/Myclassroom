import { useState } from 'react';
import { Class } from '../types';
import { apiService } from '../services/api';
import { BookOpen, Clock, MapPin, Calendar, Plus, Trash2, Edit2, X } from 'lucide-react';

interface Props { classes: Class[]; onRefresh: () => void; }

export default function ClassManagement({ classes, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', schedule: '', location: '', semester: 'Current' });

  const resetForm = () => { setFormData({ name: '', code: '', schedule: '', location: '', semester: 'Current' }); setEditingClass(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) await apiService.Classes.updateClass(editingClass.id, formData);
      else await apiService.Classes.createClass(formData);
      setShowModal(false); resetForm(); onRefresh();
    } catch (error) { console.error('Failed:', error); alert(editingClass ? 'Failed to update class' : 'Failed to create class'); }
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({ name: cls.name, code: cls.code, schedule: cls.schedule || '', location: cls.location || '', semester: cls.semester || 'Current' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this class? This will also remove all associated notes, assignments, and announcements.')) return;
    try { await apiService.Classes.deleteClass(id); onRefresh(); }
    catch (error) { console.error('Failed:', error); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2"><BookOpen className="text-primary-600" size={28} /><h2 className="text-2xl font-bold text-gray-800">My Classes</h2></div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition"><Plus size={20} /> New Class</button>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No classes created yet</h3>
          <p className="text-gray-500 mb-6">Start by creating your first class</p>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"><Plus size={20} /> Create Class</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{cls.name}</h3>
                  <p className="text-sm text-primary-600 font-medium">{cls.code}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(cls)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(cls.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {cls.schedule && <div className="flex items-center gap-2"><Clock size={16} /><span>{cls.schedule}</span></div>}
                {cls.location && <div className="flex items-center gap-2"><MapPin size={16} /><span>{cls.location}</span></div>}
                <div className="flex items-center gap-2"><Calendar size={16} /><span>Semester: {cls.semester}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">{editingClass ? 'Edit Class' : 'Create New Class'}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Class Code</label><input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="e.g., CS101" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label><input type="text" value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="e.g., Mon, Wed, Fri 10:00-11:30" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="e.g., Room 301" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Semester</label><input type="text" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" placeholder="e.g., Spring 2024" /></div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium">{editingClass ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Assignment } from '../types';
import { apiService } from '../services/api';
import { ClipboardList, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

export default function AssignmentsList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try { const data = await apiService.Assignments.getPending(); setAssignments(data); }
    catch (error) { console.error('Failed:', error); }
    finally { setLoading(false); }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isOverdue = (assignment: Assignment) => !assignment.dueDate || assignment.submittedAt ? false : new Date(assignment.dueDate) < new Date();

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4"><ClipboardList className="text-primary-600" size={24} /><h2 className="text-2xl font-bold text-gray-800">Pending Assignments</h2></div>
        {assignments.length === 0 ? (
          <div className="text-center py-12"><CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-3" /><p className="text-gray-500">All caught up! No pending assignments.</p></div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className={`border rounded-lg p-4 ${isOverdue(assignment) ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{assignment.className}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                      <span className="flex items-center gap-1"><Calendar size={14} />Due: {assignment.dueDate ? formatDate(assignment.dueDate) : 'No due date'}</span>
                      <span>{assignment.points} pts</span>
                    </div>
                  </div>
                  {isOverdue(assignment) && <div className="flex items-center gap-1 text-red-600 text-sm font-medium"><AlertCircle size={16} />Overdue</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

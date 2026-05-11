import { useState, useEffect } from 'react';
import { Class, Evaluation } from '../types';
import { apiService } from '../services/api';
import { Star, MessageSquare, User, TrendingUp, Eye } from 'lucide-react';

interface Props { classes: Class[]; refreshKey: number; }

export default function EvaluationsView({ classes, refreshKey }: Props) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState<{ avg: number; count: number; distribution: Record<number, number> }>({ avg: 0, count: 0, distribution: {1:0,2:0,3:0,4:0,5:0} });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (selectedClassId) fetchEvaluations(selectedClassId); else { setEvaluations([]); setStats({ avg: 0, count: 0, distribution: {1:0,2:0,3:0,4:0,5:0} }); } }, [selectedClassId, refreshKey]);

   const fetchEvaluations = async (classId: string) => {
     setLoading(true);
     try {
       const data = await apiService.Evaluations.getByClass(classId);
       setEvaluations(data);
       if (data.length > 0) {
         const sum = data.reduce((acc: number, e: Evaluation) => acc + e.rating, 0);
         const avg = sum / data.length;
         const distribution: Record<number, number> = {1:0,2:0,3:0,4:0,5:0};
         data.forEach((e: Evaluation) => { distribution[e.rating]++; });
         setStats({ avg, count: data.length, distribution });
       }
     } catch (error) { console.error('Failed:', error); }
     finally { setLoading(false); }
   };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-6"><Star className="text-primary-600" size={24} /><h2 className="text-2xl font-bold text-gray-800">Teaching Evaluations</h2></div>
        {classes.length === 0 ? (
          <div className="text-center py-12"><Star className="mx-auto h-16 w-16 text-gray-300 mb-4" /><p className="text-gray-500">Create a class to receive evaluations</p></div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {classes.map((cls) => (
                <button key={cls.id} onClick={() => setSelectedClassId(cls.id)} className={`px-4 py-2 rounded-lg font-medium transition ${selectedClassId === cls.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{cls.name}</button>
              ))}
            </div>
            {selectedClassId && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
                  <h3 className="text-sm font-medium text-primary-600 mb-2">Average Rating</h3>
                  <div className="flex items-baseline gap-1"><span className="text-4xl font-bold text-primary-700">{stats.avg.toFixed(1)}</span><span className="text-2xl text-primary-600">/5</span></div>
                  <div className="flex mt-2">{[1,2,3,4,5].map((star) => (<Star key={star} size={16} className={star <= Math.round(stats.avg) ? 'text-yellow-400 fill-current' : 'text-gray-300'} />))}</div>
                </div>
                <div className="md:col-span-2 bg-gray-50 rounded-xl p-6 border">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Rating Distribution</h3>
                  <div className="space-y-2">
                    {[5,4,3,2,1].map((star) => {
                      const count = stats.distribution[star];
                      const percentage = stats.count ? (count / stats.count * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <div className="w-8 text-sm text-gray-600">{star} ★</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden"><div className="bg-primary-500 h-full transition-all" style={{ width: `${percentage}%` }}></div></div>
                          <div className="w-12 text-sm text-gray-500 text-right">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {selectedClassId && loading && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}
            {selectedClassId && !loading && evaluations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Eye size={20} /> Individual Evaluations ({evaluations.length})</h3>
                <div className="space-y-3">
                   {evaluations.map((ev) => (
                     <div key={ev.id} className="border rounded-lg p-4 bg-gray-50">
                       <div className="flex items-start justify-between">
                         <div className="flex items-center gap-2"><User size={16} className="text-gray-500" /><span className="font-medium text-gray-800">{ev.studentName}</span></div>
                         <div className="flex items-center gap-1">{[1,2,3,4,5].map((star) => (<Star key={star} size={14} className={star <= ev.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />))}</div>
                       </div>
                       {ev.feedback && <div className="mt-2 flex items-start gap-2 text-gray-600 text-sm"><MessageSquare size={14} className="mt-1 flex-shrink-0" /><p>{ev.feedback}</p></div>}
                       <p className="text-xs text-gray-400 mt-2">{new Date(ev.submittedAt).toLocaleDateString()}</p>
                     </div>
                   ))}
                </div>
              </div>
            )}
            {selectedClassId && !loading && evaluations.length === 0 && (
              <div className="text-center py-12 mt-4"><TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-3" /><p className="text-gray-500">No evaluations yet. Students will see evaluation prompts after completing the class.</p></div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

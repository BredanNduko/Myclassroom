import { useState, useEffect } from 'react';
import { Todo } from '../types';
import { apiService } from '../services/api';
import { PlusCircle, CheckSquare, Square, Trash2, Calendar, Flag } from 'lucide-react';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try { const data = await apiService.Todos.getAll(); setTodos(data); }
    catch (error) { console.error('Failed:', error); }
    finally { setLoading(false); }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try { await apiService.Todos.create({ text: newTodo, dueDate: dueDate || undefined, priority }); setNewTodo(''); setDueDate(''); setPriority('medium'); fetchTodos(); }
    catch (error) { console.error('Failed to add todo:', error); }
  };

  const completeTodo = async (id: string) => { try { await apiService.Todos.complete(id); fetchTodos(); } catch (error) { console.error('Failed:', error); } };
  const deleteTodo = async (id: string) => { if (!window.confirm('Delete this task?')) return; try { await apiService.Todos.delete(id); fetchTodos(); } catch (error) { console.error('Failed:', error); } };

  const getPriorityColor = (p: string) => { switch (p) { case 'high': return 'text-red-600 bg-red-50 border-red-200'; case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'; case 'low': return 'text-green-600 bg-green-50 border-green-200'; } };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4"><CheckSquare className="text-primary-600" size={24} /><h2 className="text-2xl font-bold text-gray-800">My To-Do List</h2></div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()} placeholder="What needs to be done?" className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          <select value={priority} onChange={e => setPriority(e.target.value as any)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
          <button onClick={addTodo} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition flex items-center gap-2"><PlusCircle size={20} /> Add</button>
        </div>
      </div>
      <div className="space-y-4">
        {pendingTodos.length === 0 && completedTodos.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center"><CheckSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" /><p className="text-gray-500">Your to-do list is empty</p></div>
        )}
        {pendingTodos.map((todo) => (
          <div key={todo.id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition">
            <div className="flex items-start gap-3">
              <button onClick={() => completeTodo(todo.id)} className="mt-1 text-gray-400 hover:text-primary-600"><Square size={20} /></button>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{todo.text}</p>
                <div className="flex items-center gap-3 mt-2">
                  {todo.dueDate && <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar size={12} />{new Date(todo.dueDate).toLocaleDateString()}</span>}
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(todo.priority)}`}><Flag size={10} className="inline mr-1" />{todo.priority}</span>
                </div>
              </div>
              <button onClick={() => deleteTodo(todo.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {completedTodos.length > 0 && (
          <div className="pt-4 border-t mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Completed ({completedTodos.length})</h4>
            <div className="space-y-2 opacity-60">
              {completedTodos.map((todo) => (
                <div key={todo.id} className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 line-through text-gray-500"><CheckSquare size={20} /><span>{todo.text}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

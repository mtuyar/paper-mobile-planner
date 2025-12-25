import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Sparkles, X, ChevronDown, ChevronUp, Calendar, List, CheckSquare, Settings } from 'lucide-react';
import { breakdownTaskWithAI } from './services/geminiService';
import { Task, CategoryType, CATEGORIES, Habit, ViewMode } from './types';
import { DoodleChart } from './components/DoodleChart';
import { CalendarView } from './components/CalendarView';
import { HabitTracker } from './components/HabitTracker';

const App: React.FC = () => {
  // --- STATE ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('journal-ai-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('journal-ai-habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('tasks');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  
  // Inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<CategoryType>('personal');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('journal-ai-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('journal-ai-habits', JSON.stringify(habits));
  }, [habits]);

  // --- HANDLERS: TASKS ---
  const addTask = (title: string, category: CategoryType, subTasks: string[] = [], description?: string, isAi = false, date?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      isCompleted: false,
      category,
      createdAt: Date.now(),
      dueDate: date || undefined,
      subTasks: subTasks.map(st => ({ id: crypto.randomUUID(), title: st, isCompleted: false })),
      aiGenerated: isAi,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, newTaskCategory, [], undefined, false, newTaskDate);
    setNewTaskTitle('');
    setNewTaskDate('');
    setShowAddModal(false);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st)
      };
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // --- HANDLERS: AI ---
  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await breakdownTaskWithAI(aiPrompt);
      addTask(result.title, 'ideas', result.steps, result.description, true, new Date().toISOString().split('T')[0]);
      setAiPrompt('');
      setShowAiModal(false);
    } catch (error) {
      alert("Hata! Mürekkep bitti, tekrar dene.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- HANDLERS: HABITS ---
  const addHabit = (title: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      title,
      streak: 0,
      completedDates: []
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const toggleHabit = (habitId: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const isCompleted = h.completedDates.includes(date);
      let newDates;
      if (isCompleted) {
        newDates = h.completedDates.filter(d => d !== date);
      } else {
        newDates = [...h.completedDates, date];
      }
      return { ...h, completedDates: newDates };
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // --- RENDER HELPERS ---
  const filteredTasks = activeCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === activeCategory);

  const completedCount = tasks.filter(t => t.isCompleted).length;

  return (
    <div className="min-h-screen md:p-8 flex items-center justify-center font-hand text-ink bg-[#e5e5f7]">
      
      {/* Notebook Container */}
      <div className="relative w-full max-w-5xl bg-paper md:shadow-2xl md:rounded-lg overflow-hidden flex flex-col md:flex-row h-screen md:h-[850px] border-stone-200">
        
        {/* Binding Effect (Desktop Only) */}
        <div className="absolute left-0 md:left-12 top-0 bottom-0 w-8 z-20 hidden md:flex flex-col justify-center items-center space-y-4">
           {Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className="w-12 h-4 bg-stone-300 rounded-full border-b-2 border-stone-400 shadow-sm transform -rotate-2"></div>
           ))}
        </div>

        {/* Binding Effect (Mobile Top Spiral) */}
        <div className="absolute top-0 left-0 right-0 h-8 z-20 flex md:hidden justify-center items-center space-x-2 bg-stone-100 border-b border-stone-300">
             {Array.from({ length: 15 }).map((_, i) => (
               <div key={i} className="w-2 h-6 bg-stone-300 rounded-full border-r border-stone-400 shadow-sm transform rotate-0"></div>
             ))}
        </div>

        {/* Sidebar (Desktop) */}
        <div className="hidden md:block w-1/3 bg-paper-dark p-8 border-r border-stone-300 relative z-10">
          <div className="mb-8">
            <h1 className="font-typewriter font-bold text-3xl tracking-tight mb-2">Journal.ai</h1>
            <p className="text-ink-light italic text-lg">Akıllı ajandanız.</p>
          </div>

          <nav className="space-y-3 mb-8">
            {[
              { id: 'tasks', label: 'Günlük Plan', icon: List },
              { id: 'calendar', label: 'Aylık Takvim', icon: Calendar },
              { id: 'habits', label: 'Alışkanlıklar', icon: CheckSquare }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id as ViewMode)}
                className={`w-full text-left px-4 py-3 rounded flex items-center gap-3 transition-all ${viewMode === item.id ? 'bg-white shadow-sm font-bold border border-stone-200' : 'hover:bg-white/50'}`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>

          {viewMode === 'tasks' && (
            <div className="mb-8 bg-white p-4 rounded-sm shadow-sm rotate-1 border border-stone-200">
              <h3 className="font-bold text-xl mb-2 text-center border-b border-stone-200 pb-2">İlerleme</h3>
              <DoodleChart completed={completedCount} total={tasks.length} />
            </div>
          )}

          <div className="mt-auto space-y-4 absolute bottom-8 left-8 right-8">
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full py-3 bg-ink text-white rounded-sm font-bold font-typewriter shadow-md hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 transform hover:-translate-y-1"
            >
              <Plus size={18} /> Yeni Ekle
            </button>
            <button 
              onClick={() => setShowAiModal(true)}
              className="w-full py-3 bg-indigo-600 text-white rounded-sm font-bold font-typewriter shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 transform hover:-translate-y-1"
            >
              <Sparkles size={18} /> Yapay Zeka
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-paper relative md:ml-6 flex flex-col h-full pt-10 md:pt-0">
          {/* Lined Paper Background */}
          <div className="absolute inset-0 bg-paper-lines opacity-50 pointer-events-none"></div>
          {/* Red Margin */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-red-300 opacity-50"></div>

          <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10">
            {viewMode === 'tasks' && (
              <>
                <div className="flex justify-between items-end mb-6 pb-2 border-b-2 border-ink pl-4 md:pl-0">
                  <div>
                    <h2 className="text-3xl font-bold font-typewriter">
                       {activeCategory === 'all' ? 'Görevler' : CATEGORIES.find(c => c.id === activeCategory)?.label}
                    </h2>
                    <span className="text-ink-light font-typewriter text-sm capitalize">
                      {new Date().toLocaleDateString('tr-TR', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {/* Category Filter Pills (Mobile Scrollable) */}
                  <div className="hidden md:flex gap-2">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => setActiveCategory(cat.id === activeCategory ? 'all' : cat.id)}
                        className={`w-4 h-4 rounded-full border border-stone-400 ${cat.color} ${activeCategory === cat.id ? 'ring-2 ring-offset-1 ring-ink' : ''}`}
                        title={cat.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Mobile Categories */}
                <div className="md:hidden flex gap-2 overflow-x-auto pb-4 pl-4 mb-2 no-scrollbar">
                    <button 
                         onClick={() => setActiveCategory('all')}
                         className={`whitespace-nowrap px-3 py-1 rounded-full text-sm border font-bold ${activeCategory === 'all' ? 'bg-ink text-white border-ink' : 'bg-white border-stone-300'}`}
                    >
                        Tümü
                    </button>
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => setActiveCategory(cat.id)}
                        className={`whitespace-nowrap px-3 py-1 rounded-full text-sm border font-bold ${activeCategory === cat.id ? 'bg-white shadow-md border-ink' : 'bg-white/50 border-stone-300'}`}
                      >
                         <span className={`inline-block w-2 h-2 rounded-full mr-2 ${cat.color}`}></span>
                         {cat.label}
                      </button>
                    ))}
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="text-center mt-20 opacity-40">
                    <div className="text-6xl mb-4">✎</div>
                    <p className="text-2xl">Sayfa boş.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredTasks.map((task) => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onToggle={() => toggleTask(task.id)} 
                        onDelete={() => deleteTask(task.id)}
                        onToggleSubTask={toggleSubTask}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {viewMode === 'calendar' && <CalendarView tasks={tasks} />}
            {viewMode === 'habits' && (
              <HabitTracker 
                habits={habits} 
                onToggleHabit={toggleHabit} 
                onAddHabit={addHabit}
                onDeleteHabit={deleteHabit}
              />
            )}
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden absolute bottom-6 left-4 right-4 bg-paper-dark rounded-full shadow-xl border border-stone-300 z-30 px-6 py-3 flex justify-between items-center">
              <button onClick={() => setViewMode('tasks')} className={`flex flex-col items-center gap-1 ${viewMode === 'tasks' ? 'text-ink' : 'text-stone-400'}`}>
                 <List size={24} strokeWidth={viewMode === 'tasks' ? 2.5 : 2} />
              </button>
              <button onClick={() => setViewMode('calendar')} className={`flex flex-col items-center gap-1 ${viewMode === 'calendar' ? 'text-ink' : 'text-stone-400'}`}>
                 <Calendar size={24} strokeWidth={viewMode === 'calendar' ? 2.5 : 2} />
              </button>
              
              {/* Floating Action Button integrated in nav */}
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-ink text-white rounded-full p-4 -mt-12 shadow-lg border-4 border-paper hover:scale-110 transition-transform"
              >
                <Plus size={28} />
              </button>

              <button onClick={() => setViewMode('habits')} className={`flex flex-col items-center gap-1 ${viewMode === 'habits' ? 'text-ink' : 'text-stone-400'}`}>
                 <CheckSquare size={24} strokeWidth={viewMode === 'habits' ? 2.5 : 2} />
              </button>
              <button onClick={() => setShowAiModal(true)} className={`flex flex-col items-center gap-1 ${showAiModal ? 'text-indigo-600' : 'text-stone-400'}`}>
                 <Sparkles size={24} />
              </button>
          </div>

        </div>
      </div>

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-paper p-6 rounded shadow-xl max-w-md w-full border-2 border-ink rotate-1 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-2 right-2 hover:bg-stone-200 rounded p-1"><X size={20} /></button>
            <h3 className="font-typewriter font-bold text-xl mb-4">Yeni Kayıt</h3>
            <form onSubmit={handleManualAdd}>
              <input 
                autoFocus
                type="text" 
                placeholder="Ne yapılması gerekiyor?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-transparent border-b-2 border-ink/30 focus:border-ink outline-none text-xl p-2 mb-4 font-hand placeholder-ink/40"
              />
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setNewTaskCategory(cat.id)}
                      className={`w-8 h-8 rounded-full border-2 ${newTaskCategory === cat.id ? 'border-ink scale-110' : 'border-transparent'} ${cat.color} shadow-sm transition-transform`}
                      title={cat.label}
                    />
                  ))}
                </div>
                <input 
                  type="date" 
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="bg-stone-100 border border-stone-300 rounded px-2 py-1 font-typewriter text-sm outline-none focus:border-ink"
                />
              </div>

              <button type="submit" className="w-full bg-ink text-white font-typewriter font-bold py-3 rounded hover:bg-stone-800 transition-colors">
                Yapıştır
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-indigo-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full relative border-t-8 border-indigo-500">
             <button onClick={() => !isAiLoading && setShowAiModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
             
             <div className="text-center mb-6">
               <div className="inline-block p-3 bg-indigo-100 rounded-full mb-3 text-indigo-600">
                 <Sparkles size={32} />
               </div>
               <h3 className="font-typewriter font-bold text-2xl">Sihirli Planlayıcı</h3>
               <p className="text-gray-500 font-sans text-sm mt-1">Hedefini söyle, adımları planlayayım.</p>
             </div>

             <form onSubmit={handleAiGenerate}>
               <textarea 
                 value={aiPrompt}
                 onChange={(e) => setAiPrompt(e.target.value)}
                 disabled={isAiLoading}
                 placeholder="Örn: 3 günlük Roma tatili planla..."
                 className="w-full h-32 bg-gray-50 border border-gray-200 rounded p-4 font-hand text-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-none mb-4"
               />
               
               <button 
                 type="submit" 
                 disabled={isAiLoading || !aiPrompt.trim()}
                 className={`w-full py-3 rounded font-bold font-typewriter flex items-center justify-center gap-2 transition-all ${isAiLoading ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'}`}
               >
                 {isAiLoading ? (
                   <>
                     <span className="animate-spin">✦</span> Düşünüyor...
                   </>
                 ) : (
                   <>Planı Oluştur</>
                 )}
               </button>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-component for individual Task Item
const TaskItem: React.FC<{ 
  task: Task; 
  onToggle: () => void; 
  onDelete: () => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
}> = ({ task, onToggle, onDelete, onToggleSubTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryColor = CATEGORIES.find(c => c.id === task.category)?.color || 'bg-gray-100';

  return (
    <div className={`group relative transition-all duration-300 ${task.isCompleted ? 'opacity-60' : 'opacity-100'}`}>
      
      {/* Tape effect */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-white/40 backdrop-blur-sm border-l border-r border-white/60 rotate-1 shadow-sm z-10 pointer-events-none hidden md:block"></div>

      <div className={`p-4 rounded-sm border-l-4 ${task.isCompleted ? 'bg-stone-100 border-stone-300' : 'bg-white border-ink shadow-sm'} transition-colors relative`}>
        <div className="flex items-start gap-3">
          
          <button 
            onClick={onToggle}
            className={`mt-1 w-6 h-6 border-2 border-ink rounded-full flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-ink text-white' : 'hover:bg-stone-100'}`}
          >
            {task.isCompleted && <Check size={14} strokeWidth={3} />}
          </button>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 
                className={`text-xl font-bold leading-tight cursor-pointer ${task.isCompleted ? 'line-through decoration-2 decoration-ink/50' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {task.title}
              </h3>
              
              <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                {task.aiGenerated && <Sparkles size={14} className="text-indigo-500" />}
                <button onClick={onDelete} className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-1 items-center">
                {task.description && <span className="text-ink-light text-lg mr-2">{task.description}</span>}
                <span className={`px-2 py-0.5 text-xs font-typewriter rounded-sm ${categoryColor} border border-stone-200/50 transform -rotate-1`}>
                #{task.category}
                </span>
                {task.dueDate && (
                    <span className="text-xs font-typewriter text-ink-light bg-stone-100 px-1 border border-stone-200">
                        Tarih: {task.dueDate}
                    </span>
                )}
            </div>
          </div>
        </div>

        {/* Subtasks */}
        {(task.subTasks.length > 0) && (
          <div className="mt-3 ml-2 border-l-2 border-stone-300 pl-4 space-y-2">
             <button 
               onClick={() => setIsExpanded(!isExpanded)}
               className="text-sm font-typewriter text-stone-500 flex items-center gap-1 hover:text-ink mb-2"
             >
               {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
               {isExpanded ? 'Gizle' : `${task.subTasks.filter(s => s.isCompleted).length}/${task.subTasks.length} Adım`}
             </button>
             
             {isExpanded && (
               <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                 {task.subTasks.map(sub => (
                   <div key={sub.id} className="flex items-center gap-2 group/sub">
                     <button 
                       onClick={() => onToggleSubTask(task.id, sub.id)}
                       className={`w-4 h-4 border border-ink rounded-sm flex items-center justify-center ${sub.isCompleted ? 'bg-ink/80 text-white' : 'hover:bg-stone-50'}`}
                     >
                        {sub.isCompleted && <Check size={10} />}
                     </button>
                     <span className={`text-lg ${sub.isCompleted ? 'line-through text-stone-400' : ''}`}>
                       {sub.title}
                     </span>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
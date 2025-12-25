import React from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { Habit } from '../types';

interface HabitTrackerProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => void;
  onAddHabit: (title: string) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, onToggleHabit, onAddHabit, onDeleteHabit }) => {
  const [newHabit, setNewHabit] = React.useState('');
  
  // Generate last 5 days
  const dates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - i));
    return d.toISOString().split('T')[0];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.trim()) {
      onAddHabit(newHabit);
      setNewHabit('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b-2 border-ink pb-2 mb-6">
        <h2 className="text-3xl font-bold font-typewriter">Alışkanlık Takibi</h2>
        <span className="text-sm font-hand">Zinciri kırma!</span>
      </div>

      <div className="bg-white p-4 rounded-sm shadow-sm rotate-1 border border-stone-200 relative">
         {/* Tape */}
         <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-yellow-100/80 backdrop-blur-sm border-l-2 border-r-2 border-white/60 -rotate-2 shadow-sm z-10 pointer-events-none"></div>

         <div className="grid grid-cols-[1fr_repeat(5,auto)] gap-4 items-center mb-2 font-typewriter font-bold text-sm text-center">
            <div className="text-left pl-2">Alışkanlık</div>
            {dates.map(date => (
              <div key={date} className="w-8">
                {new Date(date).getDate()}
              </div>
            ))}
         </div>

         {habits.length === 0 && (
           <div className="text-center py-8 text-stone-400 font-hand text-xl">
             Henüz alışkanlık eklenmedi. Ufak başla!
           </div>
         )}

         {habits.map(habit => (
           <div key={habit.id} className="grid grid-cols-[1fr_repeat(5,auto)] gap-4 items-center py-3 border-b border-stone-100 last:border-0 group">
             <div className="flex items-center justify-between pr-2">
                <span className="font-hand text-xl">{habit.title}</span>
                <button onClick={() => onDeleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                  <Trash2 size={14} />
                </button>
             </div>
             {dates.map(date => {
               const isCompleted = habit.completedDates.includes(date);
               return (
                 <button
                   key={date}
                   onClick={() => onToggleHabit(habit.id, date)}
                   className={`w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center transition-all duration-200 ${isCompleted ? 'bg-green-100 rotate-3' : 'hover:bg-stone-50'}`}
                 >
                   {isCompleted && <X size={20} className="text-ink" />}
                 </button>
               );
             })}
           </div>
         ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <input 
          type="text" 
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Yeni bir alışkanlık..."
          className="flex-1 bg-transparent border-b-2 border-ink/30 focus:border-ink outline-none font-hand text-xl p-2"
        />
        <button type="submit" className="bg-ink text-white p-2 rounded-full hover:bg-stone-800 transition-colors">
          <Plus size={24} />
        </button>
      </form>
    </div>
  );
};
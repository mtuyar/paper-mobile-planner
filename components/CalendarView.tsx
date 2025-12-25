import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getTasksForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
     const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
     setSelectedDay(dateStr);
  };

  const selectedDayTasks = selectedDay ? tasks.filter(t => t.dueDate === selectedDay) : [];

  return (
    <div className="h-full flex flex-col relative">
      
      {/* Header with Navigation */}
      <div className="flex justify-between items-end border-b-2 border-ink pb-2 mb-6">
        <h2 className="text-3xl font-bold font-typewriter capitalize flex items-center gap-2">
           {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-stone-200 rounded"><ChevronLeft size={20}/></button>
          <button onClick={nextMonth} className="p-1 hover:bg-stone-200 rounded"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center font-typewriter font-bold text-ink/60">
        {['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr gap-2 flex-1 overflow-y-auto">
        {blanks.map(b => <div key={`blank-${b}`} className="p-2 opacity-50 bg-stone-100/30 border border-transparent rounded-sm"></div>)}
        
        {days.map(day => {
          const dayTasks = getTasksForDay(day);
          const todayDate = new Date();
          const isToday = day === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear();
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDay === dateStr;

          return (
            <div 
              key={day} 
              onClick={() => handleDayClick(day)}
              className={`min-h-[80px] border-2 cursor-pointer transition-all duration-200 flex flex-col
                ${isSelected ? 'border-ink bg-yellow-50 scale-105 shadow-md z-10' : 
                  isToday ? 'border-red-400 bg-red-50' : 'border-stone-300 bg-white/50 hover:border-ink hover:bg-white'} 
                rounded-sm p-1 relative`}
            >
              <span className={`text-sm font-typewriter font-bold ${isToday ? 'text-red-500' : 'text-stone-500'}`}>
                {day}
              </span>
              
              <div className="mt-auto flex flex-wrap gap-1 content-end">
                {dayTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`w-2 h-2 rounded-full ${task.isCompleted ? 'bg-green-400' : 'bg-ink'} opacity-80`}
                  ></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Post-it Overlay Detail View */}
      {selectedDay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/10 backdrop-blur-[1px]">
          <div className="bg-highlighter-yellow w-64 md:w-80 min-h-[300px] shadow-[4px_4px_10px_rgba(0,0,0,0.2)] transform -rotate-1 p-6 relative flex flex-col">
             {/* Sticky Note Top */}
             <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-yellow-200/50 backdrop-blur-sm shadow-sm z-10 rotate-1"></div>
             
             <button 
               onClick={() => setSelectedDay(null)} 
               className="absolute top-2 right-2 text-ink/50 hover:text-ink transition-colors"
             >
               <X size={24} />
             </button>

             <h3 className="font-hand text-3xl font-bold mb-4 border-b border-ink/20 pb-2 text-center">
               {new Date(selectedDay).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
             </h3>

             <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {selectedDayTasks.length === 0 ? (
                  <div className="text-center text-ink/50 font-hand mt-8 italic">
                    Bugün için plan yok. <br/>
                    Biraz dinlen! ☕️
                  </div>
                ) : (
                  selectedDayTasks.map(task => (
                    <div key={task.id} className="flex items-start gap-2">
                       <div className={`mt-1 w-4 h-4 border border-ink rounded-sm flex items-center justify-center ${task.isCompleted ? 'bg-ink text-yellow-100' : ''}`}>
                         {task.isCompleted && <Check size={12} />}
                       </div>
                       <span className={`font-hand text-lg leading-tight ${task.isCompleted ? 'line-through opacity-50' : ''}`}>
                         {task.title}
                       </span>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
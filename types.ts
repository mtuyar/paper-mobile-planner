export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  category: 'personal' | 'work' | 'ideas' | 'urgent';
  createdAt: number;
  dueDate?: string; // YYYY-MM-DD format
  subTasks: SubTask[];
  aiGenerated?: boolean;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedDates: string[]; // List of YYYY-MM-DD
}

export type CategoryType = Task['category'];
export type ViewMode = 'tasks' | 'calendar' | 'habits';

export const CATEGORIES: { id: CategoryType; label: string; color: string; rotate: string }[] = [
  { id: 'urgent', label: 'Acil!', color: 'bg-red-100', rotate: '-rotate-2' },
  { id: 'work', label: 'İş', color: 'bg-blue-100', rotate: 'rotate-1' },
  { id: 'personal', label: 'Kişisel', color: 'bg-yellow-100', rotate: '-rotate-1' },
  { id: 'ideas', label: 'Fikirler', color: 'bg-green-100', rotate: 'rotate-2' },
];
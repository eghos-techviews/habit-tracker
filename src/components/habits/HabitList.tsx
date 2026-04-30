'use client';

import type { Habit } from '@/types/habit';
import HabitCard from './HabitCard';

type HabitListProps = {
  habits: Habit[];
  today: string;
  onToggleComplete: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
};

export default function HabitList({ habits, today, onToggleComplete, onEdit, onDelete }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div data-testid="empty-state" className="text-center py-16 px-4">
        <div className="text-5xl mb-4">🌱</div>
        <h3 className="text-lg font-semibold text-gray-700">No habits yet</h3>
        <p className="text-gray-500 mt-1 text-sm">Create your first habit to get started.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {habits.map((habit) => (
        <li key={habit.id}>
          <HabitCard
            habit={habit}
            today={today}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
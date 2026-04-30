'use client';

import { useState } from 'react';
import type { Habit } from '@/types/habit';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';

type HabitCardProps = {
  habit: Habit;
  today: string;
  onToggleComplete: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
};

export default function HabitCard({ habit, today, onToggleComplete, onEdit, onDelete }: HabitCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const slug = getHabitSlug(habit.name);
  const streak = calculateCurrentStreak(habit.completions, today);
  const isCompleted = habit.completions.includes(today);

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`rounded-xl border p-4 transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base truncate ${isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-sm text-gray-500 mt-0.5">{habit.description}</p>
          )}
          <div data-testid={`habit-streak-${slug}`} className="mt-2 flex items-center gap-1 text-sm">
            <span className="text-orange-500">🔥</span>
            <span className={streak > 0 ? 'text-orange-600 font-medium' : 'text-gray-400'}>
              {streak} day{streak !== 1 ? 's' : ''} streak
            </span>
          </div>
        </div>
        <button
          data-testid={`habit-complete-${slug}`}
          onClick={() => onToggleComplete(habit)}
          aria-label={isCompleted ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${isCompleted ? 'bg-green-500 border-green-500 text-white focus:ring-green-500' : 'border-gray-300 hover:border-green-400 focus:ring-indigo-500'}`}
        >
          {isCompleted && <span className="text-sm">✓</span>}
        </button>
      </div>

      {!confirmingDelete ? (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            data-testid={`habit-edit-${slug}`}
            onClick={() => onEdit(habit)}
            className="flex-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium py-1 px-3 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            Edit
          </button>
          <button
            data-testid={`habit-delete-${slug}`}
            onClick={() => setConfirmingDelete(true)}
            className="flex-1 text-sm text-red-500 hover:text-red-600 font-medium py-1 px-3 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-red-100">
          <p className="text-sm text-red-600 font-medium mb-2">Delete this habit?</p>
          <div className="flex gap-2">
            <button
              data-testid="confirm-delete-button"
              onClick={() => { onDelete(habit); setConfirmingDelete(false); }}
              className="flex-1 text-sm bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="flex-1 text-sm bg-gray-100 text-gray-700 py-1 px-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
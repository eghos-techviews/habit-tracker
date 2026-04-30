'use client';

import { useState, useEffect } from 'react';
import type { Habit } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';

type HabitFormProps = {
  initial?: Habit;
  onSave: (data: { name: string; description: string; frequency: 'daily' }) => void;
  onCancel: () => void;
};

export default function HabitForm({ initial, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description);
    }
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateHabitName(name);
    if (!validation.valid) {
      setNameError(validation.error);
      return;
    }
    setNameError(null);
    onSave({ name: validation.value, description: description.trim(), frequency: 'daily' });
  }

  return (
    <form data-testid="habit-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 mb-1">
          Habit Name <span className="text-red-500">*</span>
        </label>
        <input
          id="habit-name"
          type="text"
          data-testid="habit-name-input"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(null); }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. Drink Water"
        />
        {nameError && (
          <p role="alert" className="mt-1 text-sm text-red-600">{nameError}</p>
        )}
      </div>
      <div>
        <label htmlFor="habit-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="habit-description"
          data-testid="habit-description-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Optional description..."
        />
      </div>
      <div>
        <label htmlFor="habit-frequency" className="block text-sm font-medium text-gray-700 mb-1">
          Frequency
        </label>
        <select
          id="habit-frequency"
          data-testid="habit-frequency-select"
          value="daily"
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        >
          <option value="daily">Daily</option>

        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          data-testid="habit-save-button"
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          {initial ? 'Save changes' : 'Create habit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
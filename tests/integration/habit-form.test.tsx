import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HabitForm from '@/components/habits/HabitForm';
import HabitCard from '@/components/habits/HabitCard';
import type { Habit } from '@/types/habit';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeEach(() => {
  localStorage.clear();
});

const today = '2024-06-15';

const sampleHabit: Habit = {
  id: 'habit-1',
  userId: 'user-1',
  name: 'Drink Water',
  description: 'Stay hydrated',
  frequency: 'daily',
  createdAt: '2024-06-01T00:00:00.000Z',
  completions: [],
};

describe('habit form', () => {
  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<HabitForm onSave={onSave} onCancel={vi.fn()} />);

    await user.click(screen.getByTestId('habit-save-button'));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Habit name is required'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<HabitForm onSave={onSave} onCancel={vi.fn()} />);

    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water');
    await user.type(screen.getByTestId('habit-description-input'), 'Stay hydrated');
    await user.click(screen.getByTestId('habit-save-button'));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        name: 'Drink Water',
        description: 'Stay hydrated',
        frequency: 'daily',
      })
    );
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<HabitForm initial={sampleHabit} onSave={onSave} onCancel={vi.fn()} />);

    const nameInput = screen.getByTestId('habit-name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'Read Books');
    await user.click(screen.getByTestId('habit-save-button'));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        name: 'Read Books',
        description: sampleHabit.description,
        frequency: 'daily',
      })
    );
    expect(sampleHabit.id).toBe('habit-1');
    expect(sampleHabit.userId).toBe('user-1');
    expect(sampleHabit.completions).toEqual([]);
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <HabitCard
        habit={sampleHabit}
        today={today}
        onToggleComplete={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByTestId('habit-delete-drink-water'));
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('confirm-delete-button'));
    expect(onDelete).toHaveBeenCalledWith(sampleHabit);
  });

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    const { rerender } = render(
      <HabitCard
        habit={sampleHabit}
        today={today}
        onToggleComplete={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('0 days streak');

    await user.click(screen.getByTestId('habit-complete-drink-water'));
    expect(onToggle).toHaveBeenCalledWith(sampleHabit);

    const completedHabit: Habit = { ...sampleHabit, completions: [today] };
    rerender(
      <HabitCard
        habit={completedHabit}
        today={today}
        onToggleComplete={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('1 day streak');
  });
});
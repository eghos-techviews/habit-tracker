'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import HabitForm from '@/components/habits/HabitForm';
import HabitList from '@/components/habits/HabitList';
import { getSession, getHabits, saveHabits } from '@/lib/storage';
import { toggleHabitCompletion } from '@/lib/habits';
import { logOut } from '@/lib/auth';
import type { Habit } from '@/types/habit';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function DashboardContent() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [session, setSession] = useState<{ userId: string; email: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const today = getToday();

  const loadData = useCallback(() => {
    const s = getSession();
    if (!s) return;
    setSession(s);
    const all = getHabits();
    setHabits(all.filter((h) => h.userId === s.userId));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleSaveHabit(data: { name: string; description: string; frequency: 'daily' }) {
    const s = getSession();
    if (!s) return;
    const allHabits = getHabits();

    if (editingHabit) {
      const updated: Habit = { ...editingHabit, name: data.name, description: data.description };
      saveHabits(allHabits.map((h) => (h.id === editingHabit.id ? updated : h)));
    } else {
      const newHabit: Habit = {
        id: generateId(),
        userId: s.userId,
        name: data.name,
        description: data.description,
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        completions: [],
      };
      saveHabits([...allHabits, newHabit]);
    }

    setShowForm(false);
    setEditingHabit(null);
    loadData();
  }

  function handleToggleComplete(habit: Habit) {
    const toggled = toggleHabitCompletion(habit, today);
    const allHabits = getHabits();
    saveHabits(allHabits.map((h) => (h.id === habit.id ? toggled : h)));
    loadData();
  }

  function handleEdit(habit: Habit) {
    setEditingHabit(habit);
    setShowForm(true);
  }

  function handleDelete(habit: Habit) {
    saveHabits(getHabits().filter((h) => h.id !== habit.id));
    loadData();
  }

  function handleLogout() {
    logOut();
    router.push('/login');
  }

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Habit Tracker</h1>
            {session && <p className="text-xs text-gray-500">{session.email}</p>}
          </div>
          <button
            data-testid="auth-logout-button"
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-600 font-medium py-1 px-3 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {showForm ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {editingHabit ? 'Edit habit' : 'New habit'}
            </h2>
            <HabitForm
              initial={editingHabit ?? undefined}
              onSave={handleSaveHabit}
              onCancel={() => { setShowForm(false); setEditingHabit(null); }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Today</h2>
              <p className="text-sm text-gray-500">{today}</p>
            </div>
            <button
              data-testid="create-habit-button"
              onClick={() => { setEditingHabit(null); setShowForm(true); }}
              className="bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              + New habit
            </button>
          </div>
        )}

        <HabitList
          habits={habits}
          today={today}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
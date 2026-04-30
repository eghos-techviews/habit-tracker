export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="min-h-screen flex flex-col items-center justify-center bg-indigo-600"
    >
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Habit Tracker</h1>
        <p className="mt-2 text-indigo-200 text-lg">Build better habits, one day at a time.</p>
      </div>
    </div>
  );
}
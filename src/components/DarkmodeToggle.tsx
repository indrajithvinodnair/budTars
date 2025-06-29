import { useDarkMode } from '../contexts/DarkmodeContext';

export function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <button 
      onClick={toggleDarkMode}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
}
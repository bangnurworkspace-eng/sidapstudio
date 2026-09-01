import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border border-gray-200 dark:border-gray-800 hover:border-gray-400/50 dark:hover:border-white/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white/50 dark:bg-black/50 backdrop-blur-sm"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-dark-accent" />
        ) : (
          <Moon className="w-5 h-5 text-light-accent" />
        )}
      </motion.div>
    </button>
  );
}

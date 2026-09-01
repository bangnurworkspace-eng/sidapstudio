import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsVisible(latest > 500);
  });

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-8 right-8 p-4 bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/50 border-b-gray-200 border-r-gray-200 dark:border-white/20 dark:border-t-white/30 dark:border-l-white/30 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 text-black dark:text-white hover:-translate-y-1 hover:border-gray-400/50 dark:hover:border-white/30 hover:shadow-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

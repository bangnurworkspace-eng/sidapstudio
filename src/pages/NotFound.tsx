import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg text-[#222222] dark:text-[#F8F8F8] px-6">
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-8xl md:text-9xl font-light tracking-tighter mb-4"
        >
          404
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-light-secondary dark:text-dark-secondary font-light mb-12"
        >
          The page you are looking for does not exist.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white dark:bg-white dark:text-black uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

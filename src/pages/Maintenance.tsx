import { motion } from 'motion/react';
import { Settings } from 'lucide-react';

export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg text-[#222222] dark:text-[#F8F8F8] px-6">
      <div className="text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, rotate: -180 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 text-light-accent dark:text-dark-accent"
        >
          <Settings className="w-16 h-16 animate-[spin_4s_linear_infinite]" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl font-light tracking-tighter mb-4"
        >
          We'll be back soon
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg text-light-secondary dark:text-dark-secondary font-light max-w-md mx-auto"
        >
          Sidap Studio is currently undergoing scheduled maintenance to improve our digital experience. Thank you for your patience.
        </motion.p>
      </div>
    </div>
  );
}

import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';

export function BackgroundAtmosphere() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Ambient Glows */}
      <motion.div
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-light-accent/[0.05] dark:bg-dark-accent/[0.03] blur-[100px] md:blur-[140px]"
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
          x: [0, 40, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-[30%] -right-[15%] w-[50%] h-[70%] rounded-full bg-gray-400/[0.03] dark:bg-white/[0.02] blur-[120px] md:blur-[160px]"
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
          x: [0, -30, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      <motion.div
        className="absolute -bottom-[20%] left-[20%] w-[70%] h-[60%] rounded-full bg-light-accent/[0.04] dark:bg-dark-accent/[0.02] blur-[120px] md:blur-[160px]"
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5],
          x: [0, 20, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10,
        }}
      />
    </div>
  );
}

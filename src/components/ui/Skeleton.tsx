import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  key?: string | number;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-white/5 rounded-md ${className}`} style={style}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
      />
    </div>
  );
}

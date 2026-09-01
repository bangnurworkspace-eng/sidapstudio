import { motion, useReducedMotion } from 'motion/react';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerChildren?: number;
  yOffset?: number;
}

const transition = {
  duration: 1.2,
  ease: [0.16, 1, 0.3, 1]
};

export function ScrollReveal({ 
  children, 
  className = "", 
  delay = 0,
  staggerChildren = 0.2,
  yOffset = 30
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : yOffset 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ...transition,
        delay,
        staggerChildren,
        when: "beforeChildren"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({ 
  children, 
  className = "", 
  yOffset = 30 
}: { 
  children: ReactNode; 
  className?: string; 
  yOffset?: number;
  key?: string | number;
}) {
  const prefersReducedMotion = useReducedMotion();

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : yOffset 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition
    }
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

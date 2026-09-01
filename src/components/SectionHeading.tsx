import { motion, useReducedMotion } from 'motion/react';

interface SectionHeadingProps {
  subtitle: string;
  title: string;
  align?: 'left' | 'center';
}

export function SectionHeading({ subtitle, title, align = 'center' }: SectionHeadingProps) {
  const isCenter = align === 'center';
  const prefersReducedMotion = useReducedMotion();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : 20,
      filter: prefersReducedMotion ? 'none' : 'blur(5px)'
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={`mb-16 md:mb-24 ${isCenter ? 'text-center flex flex-col items-center' : 'text-left flex flex-col items-start'}`}
    >
      <motion.p
        variants={itemVariants}
        className="uppercase tracking-[0.25em] text-[10px] font-bold text-light-accent dark:text-dark-accent mb-6 bg-gray-100 dark:bg-white/5 px-4 py-1.5 rounded-sm inline-block will-change-transform"
      >
        {subtitle}
      </motion.p>
      <motion.h2
        variants={itemVariants}
        className="text-5xl md:text-7xl lg:text-[84px] leading-[1.1] font-serif font-light tracking-tight text-balance will-change-transform"
      >
        {title}
      </motion.h2>
    </motion.div>
  );
}

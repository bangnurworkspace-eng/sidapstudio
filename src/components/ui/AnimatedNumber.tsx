import { useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'motion/react';

export function AnimatedNumber({ value, suffix = "" }: { value: number, suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const spring = useSpring(0, {
    stiffness: 40,
    damping: 15,
  });
  
  const display = useTransform(spring, (current) => Math.round(current).toString() + suffix);

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

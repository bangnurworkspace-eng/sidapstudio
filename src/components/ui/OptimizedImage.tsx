import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Skeleton } from './Skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string; // used for image
  containerClassName?: string; // used for wrapper
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className = "", 
  containerClassName = "",
  priority = false, 
  ...props 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName} ${!isLoaded ? 'bg-gray-100 dark:bg-white/5' : ''}`}>
      {/* Blur placeholder / Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      )}
      
      {src ? (
        <motion.img
          src={src}
          alt={alt}
          className={`${className}`}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={
            isLoaded 
              ? { opacity: 1, filter: 'blur(0px)' } 
              : { opacity: 0, filter: 'blur(10px)' }
          }
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          onLoad={() => setIsLoaded(true)}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          {...props}
        />
      ) : null}
    </div>
  );
}

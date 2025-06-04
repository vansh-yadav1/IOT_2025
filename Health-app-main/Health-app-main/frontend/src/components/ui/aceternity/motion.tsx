import { motion } from 'framer-motion';
import { forwardRef } from 'react';

export const MotionDiv = motion(
  forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
    <div ref={ref} {...props} />
  ))
); 
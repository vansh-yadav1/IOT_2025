import { HTMLMotionProps } from "framer-motion";

export interface ExtendedMotionProps extends HTMLMotionProps<"div"> {
  className?: string;
} 
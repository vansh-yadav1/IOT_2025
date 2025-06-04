import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../utils/cn";

// 3D Card component
export const Card3D = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const cardWidth = rect.width;
    const cardHeight = rect.height;
    
    const cardCenterX = rect.left + cardWidth / 2;
    const cardCenterY = rect.top + cardHeight / 2;
    
    const mouseX = e.clientX - cardCenterX;
    const mouseY = e.clientY - cardCenterY;
    
    // Adjust rotation intensity (smaller values for more subtle effect)
    const rotateYMultiplier = 10; 
    const rotateXMultiplier = 10;
    
    setRotateY((mouseX / cardWidth) * rotateYMultiplier);
    setRotateX(-(mouseY / cardHeight) * rotateXMultiplier);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative w-full h-full rounded-xl transition-all duration-200 ease-linear", className)}
      style={{
        transformStyle: "preserve-3d",
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Meteor Effect Component
export const MeteorEffect = ({ 
  className,
  number = 20
}: { 
  className?: string;
  number?: number;
}) => {
  const meteors = Array.from({ length: number });
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {meteors.map((_, idx) => (
        <span
          key={idx}
          className={cn(
            "absolute top-1/2 left-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-white shadow-[0_0_0_1px_#ffffff10] before:absolute before:top-1/2 before:left-1/2 before:h-[1px] before:w-[50px] before:-translate-y-1/2 before:translate-x-0 before:bg-gradient-to-r before:from-[#64748b] before:to-transparent before:blur-[2px]",
            "opacity-0"
          )}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 10 + 5}s`,
            opacity: Math.random(),
          }}
        />
      ))}
    </div>
  );
};

// Shimmer Button Component
export function ShimmerButton({
  children,
  className,
  shimmerClassName,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  shimmerClassName?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "relative inline-flex h-10 overflow-hidden rounded-lg px-4 py-2 bg-primary-600 text-white dark:text-white border border-primary-700",
        "shadow-inner shadow-primary-400/20",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <motion.span
        className={cn(
          "absolute inset-0 z-0 opacity-50 bg-gradient-to-r from-transparent via-primary-400 to-transparent",
          "translate-x-[0%]",
          shimmerClassName
        )}
        style={{
          backgroundSize: "200% 100%",
        }}
        animate={{
          translateX: ["0%", "100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </button>
  );
}

// Spotlight Effect
export const SpotlightEffect = ({
  children,
  className = "",
  size = 400,
}: {
  children: React.ReactNode;
  className?: string;
  size?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    setPosition({ x, y });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, rgba(120, 255, 255, 0.15), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

// Floating Animation Component
export const FloatingAnimation = ({
  children,
  className,
  amplitude = 5, // Smaller amplitude for subtle movement
  frequency = 2,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  frequency?: number;
  delay?: number;
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [amplitude * -1, amplitude, amplitude * -1],
      }}
      transition={{
        duration: frequency,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
};

// Glowing Border
export const GlowingBorder = ({
  children,
  className,
  glowColor = "rgba(124, 58, 237, 0.6)",
  borderRadius = "0.5rem",
  borderWidth = "2px",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderRadius?: string;
  borderWidth?: string;
}) => {
  return (
    <div
      className={cn(
        "relative p-[1px] overflow-hidden",
        className
      )}
      style={{
        borderRadius: borderRadius,
      }}
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `linear-gradient(45deg, transparent 20%, ${glowColor}, transparent 80%)`,
          filter: "blur(8px)",
          borderRadius: borderRadius,
        }}
      />
      <div
        className="absolute inset-0 rounded-[inherit] border"
        style={{
          borderWidth: borderWidth,
          borderColor: glowColor,
          borderRadius: borderRadius,
        }}
      />
      <div className="relative bg-background rounded-[inherit] h-full">
        {children}
      </div>
    </div>
  );
};

// Navbar Pill with Highlight Effect
export const NavbarPill = ({
  children,
  isActive = false,
  className = "",
  activeClassName = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
  inactiveClassName = "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
  ...props
}: {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "relative px-4 py-2 rounded-full font-medium transition-all duration-200",
        isActive ? activeClassName : inactiveClassName,
        className
      )}
      {...props}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="navbar-pill-indicator"
          className="absolute inset-0 rounded-full bg-purple-100 dark:bg-purple-900/30 -z-10"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        />
      )}
    </div>
  );
}; 
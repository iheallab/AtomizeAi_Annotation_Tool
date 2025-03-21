
import { useEffect } from 'react';

// Staggered animation for elements appearing in sequence
export const useStaggerAnimation = (selector: string, delay = 0.1) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el, index) => {
      const animDelay = delay * index;
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        (el as HTMLElement).style.transition = `opacity 0.5s ease, transform 0.5s ease`;
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'translateY(0)';
      }, animDelay * 1000);
    });
    
    return () => {
      elements.forEach((el) => {
        (el as HTMLElement).style.opacity = '';
        (el as HTMLElement).style.transform = '';
        (el as HTMLElement).style.transition = '';
      });
    };
  }, [selector, delay]);
};

// Smooth fade-in animation
export const useFadeIn = (delay = 0) => {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { 
      duration: 0.6,
      delay,
      ease: [0.16, 1, 0.3, 1] // Custom cubic-bezier easing function
    }
  };
};

// Slide up animation with fade
export const useSlideUp = (delay = 0) => {
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.5,
      delay,
      ease: [0.16, 1, 0.3, 1]
    }
  };
};

// Spring animation for UI elements
export const useSpring = (delay = 0) => {
  return {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
      delay
    }
  };
};

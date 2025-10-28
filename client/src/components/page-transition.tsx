import { useEffect, useState, useRef, ReactElement } from "react";
import { useLocation } from "wouter";

interface PageTransitionProps {
  children: ReactElement;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  // Store displayed children in state (not ref) to control rendering
  const [displayChildren, setDisplayChildren] = useState(children);
  const [animationClass, setAnimationClass] = useState("page-enter");
  const prevLocationRef = useRef(location);

  useEffect(() => {
    if (location !== prevLocationRef.current) {
      // Start exit animation with current (old) children
      setAnimationClass("page-exit");
      
      // After exit animation completes, update to new children and start enter animation
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setAnimationClass("page-enter");
        prevLocationRef.current = location;
      }, 200); // Match page-exit duration
      
      return () => clearTimeout(timer);
    } else {
      // Initial render or no location change
      setDisplayChildren(children);
      setAnimationClass("page-enter");
    }
  }, [location, children]);

  return (
    <div className={animationClass} key={location}>
      {displayChildren}
    </div>
  );
}

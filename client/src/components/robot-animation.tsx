import { useEffect, useState } from "react";
import { Bot } from "lucide-react";

export function RobotAnimation() {
  const [position, setPosition] = useState(-100); // Start outside screen (left)
  const [phase, setPhase] = useState("walking-in"); // walking-in, waving, walking-out, hidden

  useEffect(() => {
    // Small delay to ensure everything is rendered
    const startTimeout = setTimeout(() => {
      // Phase 1: Walk to center
      const walkInInterval = setInterval(() => {
        setPosition((prev) => {
          if (prev >= 45) { // Center-ish
            clearInterval(walkInInterval);
            setPhase("waving");
            return 45;
          }
          return prev + 1.2; // Increased speed for immediate feedback
        });
      }, 16);
    }, 100);

    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    if (phase === "waving") {
      // Phase 2: Wave for 3 seconds
      const waveTimeout = setTimeout(() => {
        setPhase("walking-out");
      }, 3000);
      return () => clearTimeout(waveTimeout);
    }

    if (phase === "walking-out") {
      // Phase 3: Walk out to the right
      const walkOutInterval = setInterval(() => {
        setPosition((prev) => {
          if (prev >= 110) {
            clearInterval(walkOutInterval);
            setPhase("hidden");
            return 110;
          }
          return prev + 1.2; // Increased speed
        });
      }, 16);
      return () => clearInterval(walkOutInterval);
    }
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div 
      className="fixed bottom-32 md:bottom-10 z-[200] pointer-events-none transition-transform duration-300 select-none"
      style={{ 
        left: `${position}%`,
        transform: `translateX(-50%) ${phase === "waving" ? "scale(1.5)" : "scale(1.3)"}`
      }}
    >
      <div className="relative">
        {/* Robot Body */}
        <div className="bg-primary backdrop-blur-md p-3 rounded-2xl border-2 border-white/20 shadow-[0_0_30px_rgba(168,85,247,0.8)] flex items-center justify-center">
          <Bot className={`w-12 h-12 text-white ${phase === "walking-in" || phase === "walking-out" ? "animate-bounce" : ""}`} />
        </div>

        {/* Waving Arm Animation */}
        {phase === "waving" && (
          <div 
            className="absolute -top-6 -right-4 text-3xl animate-[wave_1s_ease-in-out_infinite] pointer-events-none"
            style={{ transformOrigin: "bottom left" }}
          >
            👋
          </div>
        )}

        {/* Small Talk Bubble */}
        {phase === "waving" && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap animate-bounce pointer-events-none shadow-2xl">
            مرحباً بكم في فيرو!
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(30deg); }
        }
      `}} />
    </div>
  );
}

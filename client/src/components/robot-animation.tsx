import { useEffect, useState } from "react";
import { Bot } from "lucide-react";

export function RobotAnimation() {
  const [position, setPosition] = useState(-100); // Start outside screen (left)
  const [phase, setPhase] = useState("walking-in"); // walking-in, waving, walking-out, hidden

  useEffect(() => {
    // Phase 1: Walk to center
    const walkInInterval = setInterval(() => {
      setPosition((prev) => {
        if (prev >= 45) { // Center-ish (45% for visual balance)
          clearInterval(walkInInterval);
          setPhase("waving");
          return 45;
        }
        return prev + 0.5;
      });
    }, 20);

    return () => clearInterval(walkInInterval);
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
          return prev + 0.5;
        });
      }, 20);
      return () => clearInterval(walkOutInterval);
    }
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div 
      className="fixed bottom-10 z-[100] pointer-events-none transition-transform duration-300 select-none"
      style={{ 
        left: `${position}%`,
        transform: `translateX(-50%) ${phase === "waving" ? "scale(1.2)" : "scale(1)"}`
      }}
    >
      <div className="relative">
        {/* Robot Body */}
        <div className="bg-primary/20 backdrop-blur-md p-3 rounded-2xl border border-primary/40 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center">
          <Bot className={`w-10 h-10 text-primary ${phase === "walking-in" || phase === "walking-out" ? "animate-bounce" : ""}`} />
        </div>

        {/* Waving Arm Animation */}
        {phase === "waving" && (
          <div 
            className="absolute -top-4 -right-2 text-2xl animate-[wave_1s_ease-in-out_infinite] pointer-events-none"
            style={{ transformOrigin: "bottom left" }}
          >
            👋
          </div>
        )}

        {/* Small Talk Bubble */}
        {phase === "waving" && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap animate-bounce pointer-events-none">
            مرحباً بكم في فيرو!
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }
      `}} />
    </div>
  );
}

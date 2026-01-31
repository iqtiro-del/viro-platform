import { useEffect, useState } from "react";
import { Bot } from "lucide-react";

export function RobotAnimation() {
  const [position, setPosition] = useState(-50); // Start closer for mobile
  const [phase, setPhase] = useState("walking-in");

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      const walkInInterval = setInterval(() => {
        setPosition((prev) => {
          if (prev >= 50) { // Center of the container
            clearInterval(walkInInterval);
            setPhase("waving");
            return 50;
          }
          return prev + 1.5;
        });
      }, 16);
    }, 500);

    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    if (phase === "waving") {
      const waveTimeout = setTimeout(() => {
        setPhase("walking-out");
      }, 3000);
      return () => clearTimeout(waveTimeout);
    }

    if (phase === "walking-out") {
      const walkOutInterval = setInterval(() => {
        setPosition((prev) => {
          if (prev >= 150) {
            clearInterval(walkOutInterval);
            setPhase("hidden");
            return 150;
          }
          return prev + 1.5;
        });
      }, 16);
      return () => clearInterval(walkOutInterval);
    }
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div 
      className="absolute bottom-full mb-0 z-[200] pointer-events-none transition-transform duration-300 select-none"
      style={{ 
        left: `${position}%`,
        transform: `translateX(-50%) ${phase === "waving" ? "scale(1.2)" : "scale(1)"}`
      }}
    >
      <div className="relative">
        <div className="bg-primary backdrop-blur-md p-2 rounded-2xl border-2 border-white/20 shadow-[0_0_20px_rgba(168,85,247,0.8)] flex items-center justify-center">
          <Bot className={`w-8 h-8 text-white ${phase === "walking-in" || phase === "walking-out" ? "animate-bounce" : ""}`} />
        </div>

        {phase === "waving" && (
          <div 
            className="absolute -top-4 -right-2 text-xl animate-[wave_1s_ease-in-out_infinite]"
            style={{ transformOrigin: "bottom left" }}
          >
            👋
          </div>
        )}

        {phase === "waving" && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap animate-bounce shadow-xl">
            مرحباً بك!
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

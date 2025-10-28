export function NeonBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Animated gradient background - soft neon glow */}
      <div className="absolute inset-0 animated-gradient" />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(hsl(280 70% 65% / 0.03) 1px, transparent 1px),
          linear-gradient(90deg, hsl(195 75% 60% / 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        opacity: 0.5,
      }} />

      {/* Soft glowing orbs - very subtle */}
      <div 
        className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, hsl(240 70% 60% / 0.15) 0%, transparent 70%)',
          animation: 'float 30s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute bottom-[20%] right-[15%] w-[450px] h-[450px] rounded-full blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, hsl(280 70% 58% / 0.15) 0%, transparent 70%)',
          animation: 'float 35s ease-in-out infinite reverse',
        }}
      />
      <div 
        className="absolute top-[50%] right-[25%] w-[400px] h-[400px] rounded-full blur-3xl opacity-25"
        style={{
          background: 'radial-gradient(circle, hsl(195 75% 58% / 0.12) 0%, transparent 70%)',
          animation: 'float 40s ease-in-out infinite',
          animationDelay: '5s',
        }}
      />
    </div>
  );
}

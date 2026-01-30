export function NeonBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Dynamic Animated Gradient Mesh */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          background: `
            radial-gradient(circle at 0% 0%, hsl(280 80% 60% / 0.15) 0%, transparent 50%),
            radial-gradient(circle at 100% 0%, hsl(195 80% 60% / 0.15) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, hsl(240 80% 60% / 0.15) 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, hsl(330 80% 60% / 0.15) 0%, transparent 50%)
          `,
          animation: 'background-drift 60s ease-in-out infinite alternate',
        }}
      />
      
      {/* Subtle Noise Texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

      {/* Very Soft Floating Orbs */}
      <div 
        className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 dark:opacity-10"
        style={{
          background: 'radial-gradient(circle, hsl(280 70% 65% / 0.2) 0%, transparent 70%)',
          animation: 'slow-float 45s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 dark:opacity-10"
        style={{
          background: 'radial-gradient(circle, hsl(195 75% 60% / 0.2) 0%, transparent 70%)',
          animation: 'slow-float 50s ease-in-out infinite reverse',
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes background-drift {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes slow-float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -50px); }
          66% { transform: translate(-20px, 40px); }
        }
      `}} />
    </div>
  );
}

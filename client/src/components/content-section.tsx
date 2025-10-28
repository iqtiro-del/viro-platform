interface ContentSectionProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function ContentSection({ children, className = "", animate = true }: ContentSectionProps) {
  return (
    <div className={`container mx-auto px-4 py-8 ${animate ? 'content-reveal' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className = "" }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-accent font-bold neon-text-glow tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-base text-muted-foreground/80">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

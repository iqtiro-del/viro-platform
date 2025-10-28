import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCardSkeleton() {
  return (
    <Card className="glass-morphism border-border/30">
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full mt-4" />
      </CardContent>
    </Card>
  );
}

export function LoadingProductGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 content-reveal">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LoadingPageHeader() {
  return (
    <div className="mb-8 space-y-4 content-reveal">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
  );
}

export function LoadingTransactionRow() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

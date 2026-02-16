

export default function Loading(){
     return (
   
      <div className="h-full bg-background relative overflow-hidden flex flex-col">
        {/* Top header skeleton */}
        <header className="fixed md:absolute top-0 left-0 right-0 z-50 flex items-center gap-3 px-2 py-3 backdrop-blur-xl bg-background/80 border-b border-glass-border pt-[max(env(safe-area-inset-top),0.75rem)]">
          <div className="p-2 rounded-full bg-secondary/50">
            <div className="h-5 w-5 rounded bg-muted animate-pulse" />
          </div>

          <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="h-4 w-28 bg-muted rounded animate-pulse" />
            <div className="mt-2 h-3 w-16 bg-muted/70 rounded animate-pulse" />
          </div>

          <div className="flex items-center gap-1">
            <div className="p-2 rounded-full bg-secondary/50">
              <div className="h-5 w-5 rounded bg-muted animate-pulse" />
            </div>
            <div className="p-2 rounded-full bg-secondary/50">
              <div className="h-5 w-5 rounded bg-muted animate-pulse" />
            </div>
            <div className="p-2 rounded-full bg-secondary/50">
              <div className="h-5 w-5 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </header>

        {/* Main skeleton */}
        <main className="flex-1 min-h-0 overflow-y-auto pt-20 pb-24 flex flex-col custom-scrollbar">
          <div className="flex justify-center py-4">
            <span className="px-4 py-1.5 text-xs bg-secondary/60 backdrop-blur-sm rounded-full border border-glass-border">
              <span className="inline-block h-3 w-10 bg-muted rounded animate-pulse align-middle" />
            </span>
          </div>

          <div className="space-y-3 px-4 pb-6">
            {/* Received bubble */}
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-glass-border bg-message-received overflow-hidden">
                <div className="px-4 py-3 space-y-2">
                  <div className="h-3 w-52 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex items-center justify-end gap-1 px-3 pb-2">
                  <div className="h-2.5 w-10 bg-muted/70 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Sent bubble with "reply" preview */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md border border-glass-border bg-message-sent overflow-hidden">
                <div className="mx-2 mt-2 px-3 pt-2 pb-1 rounded bg-secondary/30 border-l-2 border-primary/50">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  <div className="mt-2 h-3 w-44 bg-muted/80 rounded animate-pulse" />
                </div>

                <div className="px-4 py-3 space-y-2">
                  <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-36 bg-muted rounded animate-pulse" />
                </div>

                <div className="flex items-center justify-end gap-2 px-3 pb-2">
                  <div className="h-2.5 w-10 bg-muted/70 rounded animate-pulse" />
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Image message bubble */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md border border-glass-border bg-message-sent overflow-hidden">
                <div className="p-2">
                  <div className="h-40 w-56 max-w-full rounded-xl bg-muted animate-pulse" />
                </div>
                <div className="flex items-center justify-end gap-2 px-3 pb-2">
                  <div className="h-2.5 w-10 bg-muted/70 rounded animate-pulse" />
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Deleted message row */}
            <div className="flex justify-end">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-glass-border">
                <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
                <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                <div className="h-2.5 w-10 bg-muted/70 rounded animate-pulse ml-2" />
              </div>
            </div>

            {/* Voice message bubble */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md border border-glass-border bg-message-sent overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 min-w-55">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                  <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />

                  <div className="flex-1 flex items-center gap-1 h-8">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full bg-muted animate-pulse"
                        style={{ height: 10 + ((i * 7) % 18) }}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="h-3 w-8 bg-muted rounded animate-pulse" />
                    <div className="h-2.5 w-8 bg-muted/70 rounded animate-pulse" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-3 pb-2">
                  <div className="h-2.5 w-10 bg-muted/70 rounded animate-pulse" />
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom composer skeleton */}
        <div className="fixed md:absolute bottom-0 left-0 right-0 z-50 p-3 backdrop-blur-xl bg-background/80 border-t border-glass-border pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-secondary/50">
              <div className="h-6 w-6 bg-muted rounded animate-pulse" />
            </div>

            <div className="flex-1 relative min-w-0">
              <div className="h-12 w-full bg-secondary/50 border border-glass-border rounded-full backdrop-blur-sm flex items-center px-4">
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                  <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-full bg-primary/60">
              <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
  
  );
}

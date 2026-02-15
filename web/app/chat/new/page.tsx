import { StartMessagingClient } from './_components/StartMessagingClient.tsx'

export default function StartMessagingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Start Messaging</h1>
            <p className="text-sm text-muted-foreground">
              Find and message users or join groups
            </p>
          </div>
          <StartMessagingClient />
        </div>
      </div>
    </main>
  )
}

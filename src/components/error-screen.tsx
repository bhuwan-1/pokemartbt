// Full-screen friendly fallback. A hard navigation to "/" guarantees a clean state,
// even if the React tree is in a broken state when the error occurred.
export function ErrorScreen({
  title = 'Something went wrong',
  message = "An unexpected error occurred. Let's get you back on track.",
  icon = 'error',
}: {
  title?: string
  message?: string
  icon?: string
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="material-symbols-outlined text-[64px] text-primary">{icon}</span>
      <h1 className="text-headline-lg text-on-surface">{title}</h1>
      <p className="max-w-md text-body-md text-on-surface-variant">{message}</p>
      <button
        type="button"
        onClick={() => window.location.assign('/')}
        className="mt-2 rounded-lg bg-primary px-6 py-3 text-body-md font-bold text-on-primary shadow-md transition-transform hover:scale-[1.02] active:translate-y-px"
      >
        Back to home
      </button>
    </div>
  )
}

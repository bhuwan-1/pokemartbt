import { isRouteErrorResponse, useRouteError } from 'react-router'
import { ErrorScreen } from '@/components/error-screen'

// React Router `errorElement`: catches thrown route/render errors, loader errors,
// and unmatched routes (404). Shown full-screen with a route back to home.
export function ErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <ErrorScreen
        icon="search_off"
        title="Page not found"
        message="That page doesn't exist or may have moved."
      />
    )
  }

  console.error('Route error:', error)
  return <ErrorScreen />
}

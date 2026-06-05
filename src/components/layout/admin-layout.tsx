import { Link, Outlet, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { STORE_NAME } from '@/lib/config'
import { useAuth } from '@/features/auth/auth-context'

export function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-40 h-20 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-10">
          <Link to="/admin" className="text-headline-md tracking-tight text-foreground">
            {STORE_NAME} <span className="text-primary">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link to="/">View store</Link>
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut()
                navigate('/admin/login')
              }}
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 pt-24 pb-12 md:px-10">
        <Outlet />
      </main>
    </div>
  )
}

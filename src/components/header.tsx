"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
// UserRole is now a string type
import Link from "next/link"

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Curated Portal
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link href="/rss.xml" className="text-sm text-muted-foreground hover:text-foreground">
            RSS
          </Link>
          
          {session ? (
            <div className="flex items-center gap-4">
              {session.user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              
              <span className="text-sm text-muted-foreground">
                {session.user.name || session.user.email}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => signIn()}
            >
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

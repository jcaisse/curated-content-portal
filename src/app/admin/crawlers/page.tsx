"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

type Crawler = {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  minMatchScore: number
  createdAt: string
  _count?: { keywords: number; runs: number }
}

export default function CrawlersPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [crawlers, setCrawlers] = React.useState<Crawler[]>([])
  const [query, setQuery] = React.useState("")

  const fetchCrawlers = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/admin/crawlers", { credentials: "include" })
      if (!res.ok) {
        throw new Error(`Failed to load crawlers (${res.status})`)
      }
      const data = await res.json()
      setCrawlers(data as Crawler[])
    } catch (e: any) {
      setError(e?.message || "Failed to load crawlers")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCrawlers()
  }, [fetchCrawlers])

  async function toggleActive(c: Crawler) {
    try {
      const res = await fetch(`/api/admin/crawlers/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !c.isActive }),
      })
      if (!res.ok) throw new Error(`Failed to update (${res.status})`)
      const updated = await res.json()
      setCrawlers((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...updated } : x)))
    } catch (e) {
      // no toast available yet; set error banner
      setError((e as any)?.message || "Failed to update crawler")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Crawlers</h1>
          <p className="text-muted-foreground">Manage crawlers and embedded keyword tools</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="h-10 w-64 rounded-md border border-input bg-background px-3 text-sm"
            placeholder="Search crawlers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Link href="/admin/crawlers/new">
            <Button>New Crawler</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="max-w-full">
        <CardHeader>
          <CardTitle>All Crawlers</CardTitle>
        </CardHeader>
        <CardContent className="max-w-full">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : crawlers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No crawlers yet. Create one to get started.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {crawlers
                .filter(c => !query || c.name.toLowerCase().includes(query.toLowerCase()) || (c.description||"").toLowerCase().includes(query.toLowerCase()))
                .map((c) => (
                <div key={c.id} className="rounded-lg border p-4 flex flex-col justify-between max-w-full">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/admin/crawlers/${c.id}`} className="font-medium hover:underline line-clamp-1 break-words">
                        {c.name}
                      </Link>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">{c._count?.keywords ?? 0} keywords</span>
                        <span className="text-xs text-muted-foreground">{c._count?.runs ?? 0} runs</span>
                      </div>
                    </div>
                    {c.description ? (
                      <div className="text-sm text-muted-foreground line-clamp-3 break-words">
                        {c.description}
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Active</span>
                      <Switch checked={c.isActive} onCheckedChange={() => toggleActive(c)} />
                    </div>
                    <Link href={`/admin/crawlers/${c.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


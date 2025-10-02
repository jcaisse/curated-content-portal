"use client"

import React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { moderationStatusSchema } from "@/lib/api/validators"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, RefreshCcw, Check, X, Archive, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type CrawlerKeyword = { id: string; term: string; source: "ai" | "manual"; createdAt: string }

type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED"
const moderationStatuses: ModerationStatus[] = moderationStatusSchema.options as ModerationStatus[]

type ModerationItem = {
  id: string
  url: string
  urlHash: string
  title: string
  summary?: string | null
  content?: string | null
  imageUrl?: string | null
  author?: string | null
  source: string
  language?: string | null
  score: number
  status: ModerationStatus
  discoveredAt: string
  decidedAt?: string | null
  decidedBy?: string | null
  rejectionReason?: string | null
}

type PortalSettings = {
  subdomain: string | null
  title: string | null
  description: string | null
  theme: Record<string, unknown> | null
  updatedAt: string
}

export default function EditCrawlerPage() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const id = params?.id as string

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [minMatchScore, setMinMatchScore] = React.useState(0.75)
  const [saving, setSaving] = React.useState(false)
  const [keywords, setKeywords] = React.useState<CrawlerKeyword[]>([])

  // AI extraction
  const [extractText, setExtractText] = React.useState("")
  const [maxKeywords, setMaxKeywords] = React.useState(20)
  const [extracted, setExtracted] = React.useState<Array<{ name: string; relevance: number; confidence: string }>>([])
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [adding, setAdding] = React.useState(false)
  const [manualCsv, setManualCsv] = React.useState("")
  const [stats, setStats] = React.useState<{ lastHour?: any; lastDay?: any; lastWeek?: any }>({})
  const [extracting, setExtracting] = React.useState(false)
  const [debugLines, setDebugLines] = React.useState<string[]>([])
  const [activeTab, setActiveTab] = React.useState<string>("keywords")

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/admin/crawlers/${id}`, { credentials: "include" })
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const c = await res.json()
      setName(c.name || "")
      setDescription(c.description || "")
      setIsActive(!!c.isActive)
      setMinMatchScore(Number(c.minMatchScore ?? 0.75))
    } catch (e: any) {
      setError(e?.message || "Failed to load crawler")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    if (id) load()
  }, [id, load])

  const loadKeywords = React.useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/admin/crawlers/${id}/keywords`, { credentials: "include" })
      if (res.ok) {
        const list = await res.json()
        setKeywords(list)
      }
    } catch {}
  }, [id])

  React.useEffect(() => {
    loadKeywords()
  }, [loadKeywords])

  const loadStats = React.useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/admin/crawlers/${id}/stats`, { credentials: "include" })
      if (res.ok) setStats(await res.json())
    } catch {}
  }, [id])

  React.useEffect(() => {
    loadStats()
  }, [loadStats])

  async function save() {
    try {
      setSaving(true)
      setError(null)
      const res = await fetch(`/api/admin/crawlers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, isActive, minMatchScore }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || `Failed (${res.status})`)
      }
      await load()
    } catch (e: any) {
      setError(e?.message || "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!confirm("Delete this crawler?")) return
    try {
      const res = await fetch(`/api/admin/crawlers/${id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || `Failed (${res.status})`)
      }
      router.push("/admin/crawlers")
    } catch (e: any) {
      setError(e?.message || "Failed to delete crawler")
    }
  }

  async function handleExtract() {
    try {
      setError(null)
      setExtracting(true)
      setDebugLines((d) => [...d, `→ Calling /api/admin/keywords/extract (len=${extractText.length}, max=${maxKeywords})`])
      const res = await fetch('/api/admin/keywords/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: extractText, maxKeywords }),
      })
      setDebugLines((d) => [...d, `← Response ${res.status}`])
      const data = await res.json()
      if (!res.ok) {
        // 503 or validation: try fallbackKeywords shape
        const kws = (data?.keywords || data?.fallbackKeywords || []) as Array<any>
        setDebugLines((d) => [...d, `Parsed ${kws.length} keywords (fallback=${!!data?.fallbackKeywords})`])
        const mapped = kws.map((k: any) => ({
          name: k.name || k.term || '',
          relevance: typeof k.relevance === 'number' ? k.relevance : 0.5,
          confidence: (k.confidence || 'medium') as string,
        })).filter((k: any) => k.name)
        setExtracted(mapped)
        setSelected(new Set(mapped.map((k: any) => k.name)))
        setDebugLines((d) => [...d, `Auto-selected ${mapped.length} keywords`])
        return
      }
      const kws = (data?.keywords || []) as Array<any>
      setDebugLines((d) => [...d, `Parsed ${kws.length} keywords`])
      const mapped = kws.map((k: any) => ({
        name: k.name || k.term || '',
        relevance: typeof k.relevance === 'number' ? k.relevance : 0.5,
        confidence: (k.confidence || 'medium') as string,
      })).filter((k: any) => k.name)
      setExtracted(mapped)
      setSelected(new Set(mapped.map((k: any) => k.name)))
      setDebugLines((d) => [...d, `Auto-selected ${mapped.length} keywords`])
    } catch (e: any) {
      setError(e?.message || 'Failed to extract keywords')
      setDebugLines((d) => [...d, `✗ Error: ${e?.message || 'unknown'}`])
    }
    finally {
      setExtracting(false)
    }
  }

  function toggleSelect(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(extracted.map((k) => k.name)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  async function addSelected() {
    if (!id || selected.size === 0) return
    try {
      setAdding(true)
      const payload = Array.from(selected).map((term) => ({ term, source: 'ai' as const }))
      const res = await fetch(`/api/admin/crawlers/${id}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ keywords: payload }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || `Failed (${res.status})`)
      }
      await loadKeywords()
      // Keep extracted visible but clear selection
      setSelected(new Set())
    } catch (e: any) {
      setError(e?.message || 'Failed to add keywords')
    } finally {
      setAdding(false)
    }
  }

  async function addManual() {
    if (!id || !manualCsv.trim()) return
    const terms = manualCsv.split(',').map((s) => s.trim()).filter(Boolean)
    if (terms.length === 0) return
    try {
      const payload = Array.from(new Set(terms)).map((term) => ({ term, source: 'manual' as const }))
      const res = await fetch(`/api/admin/crawlers/${id}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ keywords: payload }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || `Failed (${res.status})`)
      }
      setManualCsv('')
      await loadKeywords()
    } catch (e: any) {
      setError(e?.message || 'Failed to add manual keywords')
    }
  }

  async function removeKeyword(keywordId: string) {
    if (!id) return
    try {
      const res = await fetch(`/api/admin/crawlers/${id}/keywords/${keywordId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || `Failed (${res.status})`)
      }
      setKeywords((prev) => prev.filter((k) => k.id !== keywordId))
    } catch (e: any) {
      setError(e?.message || 'Failed to remove keyword')
    }
  }

  function SourcesSection({ id }: { id: string }) {
    type Source = { 
      id: string
      url: string
      type: string
      enabled: boolean
      maxPages?: number
      maxDepth?: number
      followLinks?: boolean
    }
    const [sources, setSources] = React.useState<Source[]>([])
    const [url, setUrl] = React.useState("")
    const [type, setType] = React.useState("rss")
    const [maxPages, setMaxPages] = React.useState(10)
    const [maxDepth, setMaxDepth] = React.useState(2)
    const [followLinks, setFollowLinks] = React.useState(true)
    const [loading, setLoading] = React.useState(false)
    
    React.useEffect(() => { (async () => {
      try {
        const r = await fetch(`/api/admin/crawlers/${id}/sources`, { credentials: 'include' })
        if (r.ok) setSources(await r.json())
      } catch {}
    })() }, [id])
    
    async function addSource() {
      if (!url) return
      setLoading(true)
      try {
        const payload = type === 'web' 
          ? { url, type, maxPages, maxDepth, followLinks }
          : { url, type }
        const r = await fetch(`/api/admin/crawlers/${id}/sources`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          credentials: 'include', 
          body: JSON.stringify(payload) 
        })
        if (r.ok) {
          const created = await r.json()
          setSources((s) => [created, ...s])
          setUrl("")
        }
      } finally { setLoading(false) }
    }
    
    async function toggleEnabled(srcId: string, enabled: boolean) {
      await fetch(`/api/admin/crawlers/${id}/sources/${srcId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify({ enabled }) 
      })
      setSources((s) => s.map(x => x.id === srcId ? { ...x, enabled } : x))
    }
    
    async function removeSource(srcId: string) {
      await fetch(`/api/admin/crawlers/${id}/sources/${srcId}`, { method: 'DELETE', credentials: 'include' })
      setSources((s) => s.filter(x => x.id !== srcId))
    }
    
    return (
      <div className="space-y-4">
        <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
          <div className="font-medium text-sm">Add Source</div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input 
                placeholder="https://example.com/feed.xml or https://example.com" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
              />
              <select 
                className="rounded-md border bg-background px-3 py-2 text-sm w-32"
                value={type} 
                onChange={(e) => setType(e.target.value)}
              >
                <option value="rss">RSS Feed</option>
                <option value="web">Web Crawl</option>
              </select>
            </div>
            
            {type === 'web' && (
              <div className="grid grid-cols-3 gap-3 rounded border bg-background/50 p-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Max Pages</label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={100} 
                    value={maxPages} 
                    onChange={(e) => setMaxPages(parseInt(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Max Depth</label>
                  <Input 
                    type="number" 
                    min={0} 
                    max={5} 
                    value={maxDepth} 
                    onChange={(e) => setMaxDepth(parseInt(e.target.value))} 
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={followLinks} 
                      onChange={(e) => setFollowLinks(e.target.checked)}
                      className="rounded"
                    />
                    Follow Links
                  </label>
                </div>
              </div>
            )}
            
            <div>
              <Button onClick={addSource} disabled={!url || loading}>
                {loading ? 'Adding…' : `Add ${type === 'rss' ? 'RSS Feed' : 'Web Crawler'}`}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {sources.map((s) => (
            <div key={s.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={s.type === 'rss' ? 'default' : 'secondary'}>
                      {s.type === 'rss' ? 'RSS' : 'WEB'}
                    </Badge>
                    <Badge variant={s.enabled ? 'default' : 'outline'}>
                      {s.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="font-mono text-sm truncate mb-2" title={s.url}>{s.url}</div>
                  {s.type === 'web' && (
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div>Max pages: {s.maxPages ?? 10} · Max depth: {s.maxDepth ?? 2}</div>
                      <div>Follow links: {s.followLinks ? 'Yes' : 'No'}</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleEnabled(s.id, !s.enabled)}>
                    {s.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => removeSource(s.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {sources.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No sources yet. Add an RSS feed or web crawler to start collecting content.
            </div>
          )}
        </div>
      </div>
    )
  }

  function PostsSection({ id }: { id: string }) {
    const [posts, setPosts] = React.useState<Array<{ id: string; title: string; status: string; createdAt: string }>>([])
    React.useEffect(() => { (async () => {
      try {
        const r = await fetch(`/api/admin/crawlers/${id}/posts?status=REVIEW`, { credentials: 'include' })
        if (r.ok) setPosts(await r.json())
      } catch {}
    })() }, [id])
    async function setStatus(postId: string, status: 'PUBLISHED' | 'REJECTED') {
      const r = await fetch(`/api/admin/crawlers/${id}/posts`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ postId, status }) })
      if (r.ok) setPosts((ps) => ps.filter(p => p.id !== postId))
    }
    return (
      <div className="grid grid-cols-1 gap-2">
        {posts.map((p) => (
          <div key={p.id} className="rounded border p-2">
            <div className="font-medium truncate">{p.title}</div>
            <div className="text-xs text-muted-foreground">status: {p.status} · {new Date(p.createdAt).toLocaleString()}</div>
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={() => setStatus(p.id, 'PUBLISHED')}>Publish</Button>
              <Button size="sm" variant="destructive" onClick={() => setStatus(p.id, 'REJECTED')}>Reject</Button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <div className="text-sm text-muted-foreground">No posts awaiting moderation.</div>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Crawler</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/crawlers"><Button variant="outline">Back</Button></Link>
          <Button variant="destructive" onClick={remove}>Delete</Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <CrawlerRunnerCard id={id} />

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">Active</label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Min Match Score (0-1)</label>
                <Input type="number" step="0.01" min={0} max={1} value={minMatchScore}
                  onChange={(e) => setMinMatchScore(parseFloat(e.target.value))} />
              </div>
              <div className="pt-2">
                <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Last Hour</div>
              <div className="mt-1 text-sm">Runs: {stats.lastHour?.count ?? 0}</div>
              <div className="text-sm">Pages: {stats.lastHour?.pages ?? 0}</div>
              <div className="text-sm">Avg Duration: {Math.round((stats.lastHour?.avgMs ?? 0)/1000)}s</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Last Day</div>
              <div className="mt-1 text-sm">Runs: {stats.lastDay?.count ?? 0}</div>
              <div className="text-sm">Pages: {stats.lastDay?.pages ?? 0}</div>
              <div className="text-sm">Avg Duration: {Math.round((stats.lastDay?.avgMs ?? 0)/1000)}s</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Last Week</div>
              <div className="mt-1 text-sm">Runs: {stats.lastWeek?.count ?? 0}</div>
              <div className="text-sm">Pages: {stats.lastWeek?.pages ?? 0}</div>
              <div className="text-sm">Avg Duration: {Math.round((stats.lastWeek?.avgMs ?? 0)/1000)}s</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crawler Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
              <TabsTrigger value="portal">Portal</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>

            <TabsContent value="keywords">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Paste up to 5000 chars for AI extraction</label>
                <Textarea value={extractText} onChange={(e) => setExtractText(e.target.value)} maxLength={5000} rows={10} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm">Max Keywords</label>
                <Input type="number" min={1} max={50} value={maxKeywords} onChange={(e) => setMaxKeywords(parseInt(e.target.value || "20", 10))} className="w-24" />
                <Button onClick={handleExtract} disabled={!extractText.trim() || extracting}>{extracting ? 'Extracting…' : 'Extract'}</Button>
                <Button variant="outline" onClick={() => { setExtracted([]); setSelected(new Set()) }}>Clear</Button>
              </div>

              {extracting && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground animate-spin"></div>
                  Extracting keywords…
                </div>
              )}

              {debugLines.length > 0 && (
                <div className="mt-2 rounded border bg-muted/20 p-2 text-xs font-mono max-h-36 overflow-y-auto">
                  {debugLines.map((ln, i) => (
                    <div key={i}>{ln}</div>
                  ))}
                </div>
              )}

              {extracted.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>Clear Selection</Button>
                    <Button size="sm" onClick={addSelected} disabled={selected.size === 0 || adding}>{adding ? "Adding..." : `Add selected (${selected.size})`}</Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {extracted.map((k) => {
                      const isSel = selected.has(k.name)
                      return (
                        <div key={k.name} className={`flex items-center justify-between rounded-md border p-2 ${isSel ? 'bg-blue-50 border-blue-300' : ''}`}>
                          <div className="min-w-0">
                            <div className="truncate font-medium">{k.name}</div>
                            <div className="text-xs text-muted-foreground">relevance {(k.relevance * 100).toFixed(0)}% · {k.confidence}</div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => toggleSelect(k.name)}>{isSel ? 'Deselect' : 'Select'}</Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="mb-1 block text-sm font-medium">Add manual keywords (comma separated)</label>
                <Textarea rows={3} value={manualCsv} onChange={(e) => setManualCsv(e.target.value)} />
                <div>
                  <Button variant="outline" size="sm" onClick={addManual} disabled={!manualCsv.trim()}>Add Manual</Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-medium">Current Crawler Keywords ({keywords.length})</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {keywords.map((kw) => (
                  <div key={kw.id} className="flex items-center justify-between rounded-md border p-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{kw.term}</div>
                      <div className="text-xs text-muted-foreground">source: {kw.source}</div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removeKeyword(kw.id)}>Remove</Button>
                  </div>
                ))}
                {keywords.length === 0 && (
                  <div className="text-sm text-muted-foreground">No keywords yet.</div>
                )}
              </div>
            </div>
            </div>
            </TabsContent>

            <TabsContent value="sources">
              <SourcesSection id={id} />
            </TabsContent>

            <TabsContent value="queue">
              <ModerationQueueSection
                crawlerId={id}
                onActionComplete={() => {
                  loadKeywords()
                  loadStats()
                }}
              />
            </TabsContent>

            <TabsContent value="portal">
              <PortalSettingsSection crawlerId={id} />
            </TabsContent>

            <TabsContent value="posts">
              <PostsSection id={id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function ModerationQueueSection({ crawlerId, onActionComplete }: { crawlerId: string; onActionComplete?: () => void }) {
  const [items, setItems] = React.useState<ModerationItem[]>([])
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = React.useState<ModerationStatus>("PENDING")
  const [loading, setLoading] = React.useState(false)
  const [isActionPending, setIsActionPending] = React.useState(false)
  const { toast } = useToast()

  const loadItems = React.useCallback(async () => {
    if (!crawlerId) return
    try {
      setLoading(true)
      const query = new URLSearchParams({ status: statusFilter }).toString()
      const res = await fetch(`/api/admin/crawlers/${crawlerId}/moderation?${query}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const data = (await res.json()) as ModerationItem[]
      setItems(data)
      setSelectedIds(new Set())
    } catch (error: any) {
      toast({ title: "Failed to load moderation queue", description: error?.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [crawlerId, statusFilter, toast])

  React.useEffect(() => {
    loadItems()
  }, [loadItems])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === items.length) return new Set()
      return new Set(items.map((item) => item.id))
    })
  }

  const runAction = async (action: "APPROVE" | "REJECT" | "ARCHIVE", ids?: string[]) => {
    const targetIds = ids ?? Array.from(selectedIds)
    if (targetIds.length === 0) return
    try {
      setIsActionPending(true)
      const res = await fetch(`/api/admin/crawlers/${crawlerId}/moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemIds: targetIds, action }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || `Failed (${res.status})`)
      }
      toast({
        title: action === "APPROVE" ? "Approved" : action === "REJECT" ? "Rejected" : "Archived",
        description: `${targetIds.length} item(s) updated`,
      })
      setSelectedIds(new Set())
      await loadItems()
      onActionComplete?.()
    } catch (error: any) {
      toast({ title: "Bulk action failed", description: error?.message, variant: "destructive" })
    } finally {
      setIsActionPending(false)
    }
  }

  const statusBadgeVariant = (status: ModerationStatus) => {
    switch (status) {
      case "APPROVED":
        return "default" as const
      case "REJECTED":
        return "destructive" as const
      case "ARCHIVED":
        return "secondary" as const
      default:
        return "outline" as const
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(value: ModerationStatus) => setStatusFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {statusFilter === "PENDING" ? "Pending" : statusFilter === "APPROVED" ? "Approved" : statusFilter === "REJECTED" ? "Rejected" : "Archived"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {moderationStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === "PENDING" ? "Pending" : status === "APPROVED" ? "Approved" : status === "REJECTED" ? "Rejected" : "Archived"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={loadItems} disabled={loading} title="Refresh">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </Button>
          <div className="text-sm text-muted-foreground">{items.length} item(s)</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Checkbox
            checked={selectedIds.size > 0 && selectedIds.size === items.length}
            onCheckedChange={toggleSelectAll}
            aria-label="Toggle select all"
            disabled={items.length === 0}
          />
          <Button size="sm" variant="outline" onClick={toggleSelectAll} disabled={items.length === 0}>
            {selectedIds.size === items.length ? "Clear Selection" : "Select All"}
          </Button>
          <Button
            size="sm"
            onClick={() => runAction("APPROVE")}
            disabled={selectedIds.size === 0 || isActionPending}
            className="gap-2"
          >
            {isActionPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Approve
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => runAction("REJECT")}
            disabled={selectedIds.size === 0 || isActionPending}
            className="gap-2"
          >
            {isActionPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => runAction("ARCHIVE")}
            disabled={selectedIds.size === 0 || isActionPending}
            className="gap-2"
          >
            {isActionPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            Archive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading moderation queue…
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            {statusFilter === "PENDING"
              ? "No pending items right now. Run the crawler to ingest new content."
              : "No items in this state."}
          </div>
        ) : (
          items.map((item) => {
            const selected = selectedIds.has(item.id)
            return (
              <div key={item.id} className={cn("rounded-lg border bg-card p-4 shadow-sm transition", selected && "ring-2 ring-primary/40")}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleSelect(item.id)}
                        aria-label="Select moderation item"
                      />
                      <h3 className="text-base font-semibold leading-tight">
                        {item.title || "Untitled"}
                      </h3>
                      <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Score {(item.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {item.summary || item.content?.slice(0, 280) || "No summary"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> View source
                      </a>
                      <span>Source: {item.source}</span>
                      {item.author && <span>Author: {item.author}</span>}
                      <span>
                        Discovered {formatDistanceToNow(new Date(item.discoveredAt), { addSuffix: true })}
                      </span>
                      {item.decidedAt && (
                        <span>
                          {item.status === "APPROVED"
                            ? "Approved"
                            : item.status === "REJECTED"
                              ? "Rejected"
                              : "Archived"}
                          {item.decidedBy ? ` by ${item.decidedBy}` : ""} {formatDistanceToNow(new Date(item.decidedAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {item.rejectionReason && (
                      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                        Rejection reason: {item.rejectionReason}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                    onClick={() => runAction("APPROVE", [item.id])}
                      disabled={isActionPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                    onClick={() => runAction("REJECT", [item.id])}
                      disabled={isActionPending}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                    onClick={() => runAction("ARCHIVE", [item.id])}
                      disabled={isActionPending}
                    >
                      Archive
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function PortalSettingsSection({ crawlerId }: { crawlerId: string }) {
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [data, setData] = React.useState<PortalSettings | null>(null)
  const [subdomain, setSubdomain] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [themeJson, setThemeJson] = React.useState("")
  const { toast } = useToast()

  const load = React.useCallback(async () => {
    if (!crawlerId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/crawlers/${crawlerId}/portal`, { credentials: "include" })
      if (res.status === 404) {
        setData(null)
        setSubdomain("")
        setTitle("")
        setDescription("")
        setThemeJson(JSON.stringify({ layout: "masonry", accentColor: "#2563eb" }, null, 2))
        return
      }
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const json = (await res.json()) as PortalSettings
      setData(json)
      setSubdomain(json.subdomain ?? "")
      setTitle(json.title ?? "")
      setDescription(json.description ?? "")
      setThemeJson(JSON.stringify(json.theme ?? {}, null, 2) || "{}")
    } catch (error: any) {
      toast({ title: "Failed to load portal settings", description: error?.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [crawlerId, toast])

  React.useEffect(() => {
    load()
  }, [load])

  async function save() {
    try {
      setSaving(true)
      const body: Record<string, unknown> = {
        subdomain: subdomain || undefined,
        title: title || undefined,
        description: description || undefined,
      }
      if (themeJson.trim()) {
        try {
          body.theme = JSON.parse(themeJson)
        } catch (error) {
          toast({ title: "Invalid theme JSON", description: "Please provide valid JSON", variant: "destructive" })
          return
        }
      }

      const res = await fetch(`/api/admin/crawlers/${crawlerId}/portal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || `Failed (${res.status})`)
      }
      toast({ title: "Portal settings saved" })
      await load()
    } catch (error: any) {
      toast({ title: "Failed to save", description: error?.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Portal Subdomain</label>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            placeholder="e.g. design-inspiration"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
            className="max-w-md"
          />
          {subdomain && (
            <div className="text-sm text-muted-foreground">{subdomain}.yourdomain.com</div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Portal Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-xl" maxLength={200} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Portal Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Theme JSON</label>
        <Textarea
          value={themeJson}
          onChange={(e) => setThemeJson(e.target.value)}
          rows={6}
          className="font-mono text-xs"
        />
        <div className="text-xs text-muted-foreground">
          Configure colors, layout, etc. Must be valid JSON. Example:
          <pre className="mt-2 rounded-lg bg-muted p-3 text-[11px]">
{`{
  "layout": "masonry",
  "accentColor": "#2563eb"
}`}
          </pre>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Portal Settings"}
        </Button>
        <Button type="button" variant="outline" onClick={load} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Reload
        </Button>
        {data?.updatedAt && (
          <div className="text-xs text-muted-foreground">
            Last updated {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })}
          </div>
        )}
      </div>

      {subdomain && (
        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          Once DNS is configured, portal will be available at <span className="font-medium">https://{subdomain}.yourdomain.com</span>.
          Hook deployment to provision the domain and point to the generated static build.
        </div>
      )}
    </div>
  )
}

function CrawlerRunnerCard({ id }: { id: string }) {
  const [running, setRunning] = React.useState(false)
  const [runs, setRuns] = React.useState<any[]>([])
  const [polling, setPolling] = React.useState(false)
  const [dismissedRuns, setDismissedRuns] = React.useState<Set<string>>(new Set())
  const { toast } = useToast()

  const loadRuns = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/crawlers/${id}/runs`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setRuns(data)
        
        // Check if any run is in progress
        const hasRunning = data.some((r: any) => r.status === 'RUNNING' || r.status === 'PENDING')
        if (hasRunning && !polling) {
          setPolling(true)
        } else if (!hasRunning && polling) {
          setPolling(false)
        }
      }
    } catch (error) {
      console.error('Failed to load runs:', error)
    }
  }, [id, polling])

  React.useEffect(() => {
    loadRuns()
  }, [loadRuns])

  // Poll for updates when a run is active
  React.useEffect(() => {
    if (!polling) return
    
    const interval = setInterval(() => {
      loadRuns()
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [polling, loadRuns])

  const runCrawler = async () => {
    try {
      setRunning(true)
      const res = await fetch(`/api/admin/crawlers/${id}/run`, {
        method: 'POST',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const error = await res.json().catch(() => null)
        throw new Error(error?.error || 'Failed to start crawler')
      }
      
      toast({
        title: 'Crawler Started',
        description: 'The crawler is now running. Status will update below.',
      })
      
      setPolling(true)
      setTimeout(() => loadRuns(), 1000)
    } catch (error: any) {
      toast({
        title: 'Failed to Start Crawler',
        description: error?.message || 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setRunning(false)
    }
  }

  const latestRun = runs[0]
  const isActive = latestRun?.status === 'RUNNING' || latestRun?.status === 'PENDING'

  const dismissRun = (runId: string) => {
    setDismissedRuns((prev) => new Set(prev).add(runId))
  }

  const visibleRuns = runs.filter((run) => !dismissedRuns.has(run.id))

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Crawler Runner
            {isActive && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-normal text-muted-foreground">Running...</span>
              </div>
            )}
          </CardTitle>
          <Button 
            onClick={runCrawler} 
            disabled={running || isActive}
            size="lg"
            className="min-w-[140px]"
          >
            {running || isActive ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Running...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Crawler
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {visibleRuns.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            {runs.length === 0 ? 'No crawler runs yet. Click "Run Crawler" to start.' : 'All runs dismissed.'}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleRuns.slice(0, 5).map((run) => (
              <div 
                key={run.id} 
                className={`rounded-lg border p-3 ${
                  run.status === 'RUNNING' ? 'bg-blue-50 border-blue-300' :
                  run.status === 'COMPLETED' ? 'bg-green-50 border-green-300' :
                  run.status === 'FAILED' ? 'bg-red-50 border-red-300' :
                  'bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        run.status === 'RUNNING' ? 'default' :
                        run.status === 'COMPLETED' ? 'default' :
                        run.status === 'FAILED' ? 'destructive' :
                        'outline'
                      }>
                        {run.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {run.itemsFound !== null && (
                        <div className="text-muted-foreground">
                          Found: <span className="font-medium text-foreground">{run.itemsFound}</span>
                        </div>
                      )}
                      {run.itemsProcessed !== null && (
                        <div className="text-muted-foreground">
                          Processed: <span className="font-medium text-foreground">{run.itemsProcessed}</span>
                        </div>
                      )}
                      {run.completedAt && (
                        <div className="text-muted-foreground col-span-2">
                          Duration: <span className="font-medium text-foreground">
                            {Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s
                          </span>
                        </div>
                      )}
                    </div>

                    {run.error && (
                      <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                        Error: {run.error}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => dismissRun(run.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="Dismiss"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helpers for keyword selection and API calls
// Note: These use closures inside the component in practice; keeping simple here by attaching to window is avoided.




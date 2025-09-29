"use client"

import React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card as UICard } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type CrawlerKeyword = { id: string; term: string; source: "ai" | "manual"; createdAt: string }

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

  async function loadKeywords() {
    if (!id) return
    try {
      const res = await fetch(`/api/admin/crawlers/${id}/keywords`, { credentials: "include" })
      if (res.ok) {
        const list = await res.json()
        setKeywords(list)
      }
    } catch {}
  }

  React.useEffect(() => {
    loadKeywords()
  }, [id])

  React.useEffect(() => {
    async function loadStats() {
      if (!id) return
      try {
        const res = await fetch(`/api/admin/crawlers/${id}/stats`, { credentials: 'include' })
        if (res.ok) setStats(await res.json())
      } catch {}
    }
    loadStats()
  }, [id])

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
    const [sources, setSources] = React.useState<Array<{ id: string; url: string; type: string; enabled: boolean }>>([])
    const [url, setUrl] = React.useState("")
    const [type, setType] = React.useState("rss")
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
        const r = await fetch(`/api/admin/crawlers/${id}/sources`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ url, type }) })
        if (r.ok) {
          const created = await r.json()
          setSources((s) => [created, ...s])
          setUrl("")
        }
      } finally { setLoading(false) }
    }
    async function toggleEnabled(srcId: string, enabled: boolean) {
      await fetch(`/api/admin/crawlers/${id}/sources/${srcId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ enabled }) })
      setSources((s) => s.map(x => x.id === srcId ? { ...x, enabled } : x))
    }
    async function removeSource(srcId: string) {
      await fetch(`/api/admin/crawlers/${id}/sources/${srcId}`, { method: 'DELETE', credentials: 'include' })
      setSources((s) => s.filter(x => x.id !== srcId))
    }
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="https://example.com/feed.xml or https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Input className="w-28" value={type} onChange={(e) => setType(e.target.value)} />
          <Button onClick={addSource} disabled={!url || loading}>{loading ? 'Adding…' : 'Add'}</Button>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sources.map((s) => (
            <div key={s.id} className="rounded border p-2 text-sm">
              <div className="font-mono truncate" title={s.url}>{s.url}</div>
              <div className="text-xs text-muted-foreground">type: {s.type} · enabled: {String(s.enabled)}</div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleEnabled(s.id, !s.enabled)}>{s.enabled ? 'Disable' : 'Enable'}</Button>
                <Button size="sm" variant="destructive" onClick={() => removeSource(s.id)}>Remove</Button>
              </div>
            </div>
          ))}
          {sources.length === 0 && <div className="text-sm text-muted-foreground">No sources yet.</div>}
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
          <Tabs defaultValue="keywords">
            <TabsList>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
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

            <TabsContent value="posts">
              <PostsSection id={id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Helpers for keyword selection and API calls
// Note: These use closures inside the component in practice; keeping simple here by attaching to window is avoided.




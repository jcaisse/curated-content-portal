"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function NewCrawlerPage() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [minMatchScore, setMinMatchScore] = React.useState(0.75)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  // AI extraction state for pre-create
  const [extractText, setExtractText] = React.useState("")
  const [maxKeywords, setMaxKeywords] = React.useState(20)
  const [extracting, setExtracting] = React.useState(false)
  const [debugLines, setDebugLines] = React.useState<string[]>([])
  const [extracted, setExtracted] = React.useState<Array<{ name: string; relevance: number; confidence: string }>>([])
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [manualCsv, setManualCsv] = React.useState("")
  const [confirmedKeywords, setConfirmedKeywords] = React.useState<Set<string>>(new Set())

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)
      const res = await fetch("/api/admin/crawlers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, isActive, minMatchScore }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || `Failed (${res.status})`)
      }
      const created = await res.json()
      // If user confirmed keywords, immediately add them to the new crawler
      if (confirmedKeywords.size > 0) {
        try {
          const payload = Array.from(confirmedKeywords).map((term) => ({ term, source: 'manual' as const }))
          const addRes = await fetch(`/api/admin/crawlers/${created.id}/keywords`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ keywords: payload }),
          })
          if (!addRes.ok) {
            const j = await addRes.json().catch(() => null)
            console.warn('Failed to add keywords on create:', j?.error || addRes.status)
          }
        } catch (err) {
          console.warn('Add keywords error:', (err as any)?.message)
        }
      }
      router.push(`/admin/crawlers/${created.id}`)
    } catch (e: any) {
      setError(e?.message || "Failed to create crawler")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Crawler</h1>
        <Link href="/admin/crawlers"><Button variant="outline">Back</Button></Link>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Crawler Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
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
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keywords (optional - configure before or after creation)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: Extraction & Manual Entry */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Paste up to 5000 chars for AI extraction</label>
                <Textarea value={extractText} onChange={(e) => setExtractText(e.target.value)} maxLength={5000} rows={10} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm">Max Keywords</label>
                <Input type="number" min={1} max={50} value={maxKeywords} onChange={(e) => setMaxKeywords(parseInt(e.target.value || '20', 10))} className="w-24" />
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
                  {debugLines.map((ln, i) => (<div key={i}>{ln}</div>))}
                </div>
              )}

              {extracted.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelected(new Set(extracted.map(k => k.name)))}>Select All</Button>
                    <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>Clear Selection</Button>
                    <Button size="sm" onClick={addSelectedToConfirmed} disabled={selected.size === 0}>{`Add (${selected.size})`}</Button>
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
                <Textarea rows={3} value={manualCsv} onChange={(e) => setManualCsv(e.target.value)} placeholder="keyword1, keyword2, keyword3" />
                <div>
                  <Button variant="outline" size="sm" onClick={addManual} disabled={!manualCsv.trim()}>Add Manual</Button>
                </div>
              </div>
            </div>

            {/* Right: Confirmed Keywords */}
            <div className="space-y-3">
              <div className="font-medium">Keywords to be saved with crawler ({confirmedKeywords.size})</div>
              <div className="text-xs text-muted-foreground">
                These keywords will be added to the crawler when you click "Create" above.
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Array.from(confirmedKeywords).map((term) => (
                  <div key={term} className="flex items-center justify-between rounded-md border p-2 bg-green-50 border-green-300">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{term}</div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removeConfirmedKeyword(term)}>Remove</Button>
                  </div>
                ))}
                {confirmedKeywords.size === 0 && (
                  <div className="text-sm text-muted-foreground col-span-2">
                    No keywords added yet. Use AI extraction or manual entry to add keywords.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Save Button - Prominent at bottom */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="font-medium text-lg">Ready to create your crawler?</div>
                <div className="text-sm text-muted-foreground">
                  {confirmedKeywords.size > 0 
                    ? `This crawler will be created with ${confirmedKeywords.size} keyword${confirmedKeywords.size === 1 ? '' : 's'}.`
                    : "You can add keywords now or after creating the crawler."}
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/crawlers">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={submitting} size="lg" className="min-w-[160px]">
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    `Create Crawler${confirmedKeywords.size > 0 ? ` (${confirmedKeywords.size} keywords)` : ''}`
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )

  function toggleSelect(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function addSelectedToConfirmed() {
    setConfirmedKeywords((prev) => {
      const next = new Set(prev)
      selected.forEach((term) => next.add(term))
      return next
    })
    setSelected(new Set())
  }

  function addManual() {
    if (!manualCsv.trim()) return
    const terms = manualCsv.split(',').map((s) => s.trim()).filter(Boolean)
    if (terms.length === 0) return
    setConfirmedKeywords((prev) => {
      const next = new Set(prev)
      terms.forEach((term) => next.add(term))
      return next
    })
    setManualCsv('')
  }

  function removeConfirmedKeyword(term: string) {
    setConfirmedKeywords((prev) => {
      const next = new Set(prev)
      next.delete(term)
      return next
    })
  }

  async function handleExtract() {
    try {
      setExtracting(true)
      setError(null)
      setDebugLines((d) => [...d, `→ Calling /api/admin/keywords/extract (len=${extractText.length}, max=${maxKeywords})`])
      const res = await fetch('/api/admin/keywords/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: extractText, maxKeywords }),
      })
      setDebugLines((d) => [...d, `← Response ${res.status}`])
      const data = await res.json().catch(() => ({}))
      const kws = (data?.keywords || data?.fallbackKeywords || []) as Array<any>
      setDebugLines((d) => [...d, `Parsed ${kws.length} keywords`])
      const mapped = kws.map((k: any) => ({
        name: k.name || k.term || '',
        relevance: typeof k.relevance === 'number' ? k.relevance : 0.5,
        confidence: (k.confidence || 'medium') as string,
      })).filter((k: any) => k.name)
      setExtracted(mapped)
      setSelected(new Set(mapped.map((k) => k.name)))
      setDebugLines((d) => [...d, `Auto-selected ${mapped.length} keywords`])
    } catch (e: any) {
      setError(e?.message || 'Failed to extract keywords')
      setDebugLines((d) => [...d, `✗ Error: ${e?.message || 'unknown'}`])
    } finally {
      setExtracting(false)
    }
  }
}


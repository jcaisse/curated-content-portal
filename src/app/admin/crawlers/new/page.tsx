"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Stepper, Step } from "@/components/ui/stepper"
import { ArrowLeft, ArrowRight, Sparkles, Plus, Trash2, Loader2 } from "lucide-react"

const WIZARD_STEPS: Step[] = [
  { id: 1, title: "Basic Details", description: "Name & settings" },
  { id: 2, title: "Keywords", description: "AI or manual" },
  { id: 3, title: "Sources", description: "RSS & web crawl" },
  { id: 4, title: "Portal Settings", description: "Subdomain & theme" },
  { id: 5, title: "Review & Create", description: "Confirm & launch" },
]

type SourceType = 'rss' | 'web'

interface Source {
  type: SourceType
  url: string
  maxPages?: number
  maxDepth?: number
  followLinks?: boolean
}

export default function NewCrawlerWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Step 1: Basic Details
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [minMatchScore, setMinMatchScore] = React.useState(0.75)

  // Step 2: Keywords
  const [extractText, setExtractText] = React.useState("")
  const [maxKeywords, setMaxKeywords] = React.useState(20)
  const [extracting, setExtracting] = React.useState(false)
  const [extracted, setExtracted] = React.useState<Array<{ name: string; relevance: number; confidence: string }>>([])
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [manualCsv, setManualCsv] = React.useState("")
  const [confirmedKeywords, setConfirmedKeywords] = React.useState<Set<string>>(new Set())

  // Step 3: Sources
  const [sources, setSources] = React.useState<Source[]>([])
  const [newSourceUrl, setNewSourceUrl] = React.useState("")
  const [newSourceType, setNewSourceType] = React.useState<SourceType>('rss')
  const [newSourceMaxPages, setNewSourceMaxPages] = React.useState(10)
  const [newSourceMaxDepth, setNewSourceMaxDepth] = React.useState(2)
  const [newSourceFollowLinks, setNewSourceFollowLinks] = React.useState(true)
  const [recommending, setRecommending] = React.useState(false)
  const [recommendations, setRecommendations] = React.useState<Array<{ url: string; description: string }>>([])

  // Step 4: Portal Settings
  const [subdomain, setSubdomain] = React.useState("")
  const [portalTitle, setPortalTitle] = React.useState("")
  const [portalDescription, setPortalDescription] = React.useState("")

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return name.trim().length > 0
      case 2:
        return true // Keywords are optional
      case 3:
        return true // Sources are optional
      case 4:
        return true // Portal settings are optional
      case 5:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1)
      setError(null)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setError(null)

      // Step 1: Create crawler
      const crawlerRes = await fetch("/api/admin/crawlers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, isActive, minMatchScore }),
      })

      if (!crawlerRes.ok) {
        const j = await crawlerRes.json().catch(() => null)
        throw new Error(j?.error || `Failed to create crawler (${crawlerRes.status})`)
      }

      const crawler = await crawlerRes.json()
      const crawlerId = crawler.id

      // Step 2: Add keywords
      if (confirmedKeywords.size > 0) {
        const keywordsPayload = Array.from(confirmedKeywords).map((term) => ({ 
          term, 
          source: 'manual' as const 
        }))
        
        await fetch(`/api/admin/crawlers/${crawlerId}/keywords`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ keywords: keywordsPayload }),
        })
      }

      // Step 3: Add sources
      if (sources.length > 0) {
        for (const source of sources) {
          await fetch(`/api/admin/crawlers/${crawlerId}/sources`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(source),
          })
        }
      }

      // Step 4: Create portal settings
      if (subdomain.trim()) {
        await fetch(`/api/admin/crawlers/${crawlerId}/portal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            subdomain: subdomain.trim(),
            title: portalTitle.trim() || name,
            description: portalDescription.trim() || description,
          }),
        })
      }

      // Success! Redirect to crawler page
      router.push(`/admin/crawlers/${crawlerId}`)
    } catch (e: any) {
      setError(e?.message || "Failed to create crawler")
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2: Keyword functions
  const toggleSelect = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const addSelectedToConfirmed = () => {
    setConfirmedKeywords((prev) => {
      const next = new Set(prev)
      selected.forEach((term) => next.add(term))
      return next
    })
    // Remove added keywords from extracted list
    setExtracted((prev) => prev.filter((k) => !selected.has(k.name)))
    setSelected(new Set())
  }

  const addManual = () => {
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

  const removeConfirmedKeyword = (term: string) => {
    setConfirmedKeywords((prev) => {
      const next = new Set(prev)
      next.delete(term)
      return next
    })
  }

  const handleExtract = async () => {
    try {
      setExtracting(true)
      setError(null)
      const res = await fetch('/api/admin/keywords/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: extractText, maxKeywords }),
      })
      const data = await res.json().catch(() => ({}))
      const kws = (data?.keywords || data?.fallbackKeywords || []) as Array<any>
      const mapped = kws.map((k: any) => ({
        name: k.name || k.term || '',
        relevance: typeof k.relevance === 'number' ? k.relevance : 0.5,
        confidence: (k.confidence || 'medium') as string,
      })).filter((k: any) => k.name)
      setExtracted(mapped)
      setSelected(new Set(mapped.map((k) => k.name)))
    } catch (e: any) {
      setError(e?.message || 'Failed to extract keywords')
    } finally {
      setExtracting(false)
    }
  }

  // Step 3: Source functions
  const addSource = () => {
    if (!newSourceUrl.trim()) return
    
    const newSource: Source = {
      type: newSourceType,
      url: newSourceUrl.trim(),
    }

    if (newSourceType === 'web') {
      newSource.maxPages = newSourceMaxPages
      newSource.maxDepth = newSourceMaxDepth
      newSource.followLinks = newSourceFollowLinks
    }

    setSources([...sources, newSource])
    setNewSourceUrl("")
  }

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index))
  }

  const getAIRecommendations = async () => {
    if (confirmedKeywords.size === 0) {
      setError("Please add some keywords first to get AI recommendations")
      return
    }

    try {
      setRecommending(true)
      setError(null)
      
      // For wizard, we'll just use a mock endpoint since we don't have a crawler ID yet
      // In reality, we'd pass keywords directly to the AI
      const keywordsArray = Array.from(confirmedKeywords)
      
      const res = await fetch('/api/admin/keywords/recommend-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ keywords: keywordsArray }),
      })

      if (!res.ok) {
        throw new Error('Failed to get recommendations')
      }

      const data = await res.json()
      setRecommendations(data.recommendations || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to get AI recommendations')
    } finally {
      setRecommending(false)
    }
  }

  const addRecommendation = (url: string) => {
    // Try to detect if it's RSS or web
    const isRss = url.includes('/feed') || url.includes('/rss') || url.includes('.xml')
    setSources([...sources, {
      type: isRss ? 'rss' : 'web',
      url: url,
      ...(isRss ? {} : { maxPages: 10, maxDepth: 2, followLinks: true })
    }])
    setRecommendations(recommendations.filter(r => r.url !== url))
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Crawler</h1>
        <Link href="/admin/crawlers"><Button variant="outline">Cancel</Button></Link>
      </div>

      <Stepper steps={WIZARD_STEPS} currentStep={currentStep} className="mb-8" />

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Basic Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Crawler Name *</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                maxLength={100}
                placeholder="e.g., Tech News Crawler"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                maxLength={1000}
                rows={4}
                placeholder="Describe what this crawler will collect..."
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Active</label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <span className="text-sm text-muted-foreground">
                {isActive ? "Crawler will run automatically" : "Crawler is paused"}
              </span>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Minimum Match Score (0-1)</label>
              <Input 
                type="number" 
                step="0.01" 
                min={0} 
                max={1} 
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(parseFloat(e.target.value))} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Content must score at least this high to be accepted (0.75 recommended)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Keywords */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Keywords (Optional)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add keywords to help the crawler identify relevant content. You can use AI extraction or add manually.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left: Extraction & Manual Entry */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    <Sparkles className="inline h-4 w-4 mr-1" />
                    AI Keyword Extraction
                  </label>
                  <Textarea 
                    value={extractText} 
                    onChange={(e) => setExtractText(e.target.value)} 
                    maxLength={5000} 
                    rows={8}
                    placeholder="Paste text here (up to 5000 characters) and AI will extract relevant keywords..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm">Max Keywords</label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={50} 
                    value={maxKeywords} 
                    onChange={(e) => setMaxKeywords(parseInt(e.target.value || '20', 10))} 
                    className="w-24" 
                  />
                  <Button onClick={handleExtract} disabled={!extractText.trim() || extracting}>
                    {extracting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting…
                      </>
                    ) : (
                      'Extract'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => { 
                    setExtracted([])
                    setSelected(new Set())
                    setExtracting(false)
                  }}>
                    Clear
                  </Button>
                </div>

                {extracted.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelected(new Set(extracted.map(k => k.name)))}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
                        Clear Selection
                      </Button>
                      <Button size="sm" onClick={addSelectedToConfirmed} disabled={selected.size === 0}>
                        {`Add (${selected.size})`}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {extracted.map((k) => {
                        const isSel = selected.has(k.name)
                        return (
                          <div 
                            key={k.name} 
                            className={`flex items-center justify-between rounded-md border p-2 ${isSel ? 'bg-blue-50 border-blue-300' : ''}`}
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium">{k.name}</div>
                              <div className="text-xs text-muted-foreground">
                                relevance {(k.relevance * 100).toFixed(0)}% · {k.confidence}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => toggleSelect(k.name)}>
                              {isSel ? 'Deselect' : 'Select'}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="mb-1 block text-sm font-medium">Manual Keywords</label>
                  <Textarea 
                    rows={3} 
                    value={manualCsv} 
                    onChange={(e) => setManualCsv(e.target.value)} 
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <Button variant="outline" size="sm" onClick={addManual} disabled={!manualCsv.trim()}>
                    Add Manual
                  </Button>
                </div>
              </div>

              {/* Right: Confirmed Keywords */}
              <div className="space-y-3">
                <div className="font-medium">Confirmed Keywords ({confirmedKeywords.size})</div>
                <div className="text-xs text-muted-foreground">
                  These keywords will be added to your crawler
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {Array.from(confirmedKeywords).map((term) => (
                    <div key={term} className="flex items-center justify-between rounded-md border p-2 bg-green-50 border-green-300">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{term}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeConfirmedKeyword(term)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {confirmedKeywords.size === 0 && (
                    <div className="text-sm text-muted-foreground p-4 text-center border-2 border-dashed rounded-md">
                      No keywords added yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Sources */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Sources (Optional)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add RSS feeds or websites for the crawler to monitor
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AI Recommendations */}
            {confirmedKeywords.size > 0 && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Source Recommendations
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Get AI-powered source suggestions based on your keywords
                    </div>
                  </div>
                  <Button onClick={getAIRecommendations} disabled={recommending}>
                    {recommending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Getting recommendations...
                      </>
                    ) : (
                      'Get Recommendations'
                    )}
                  </Button>
                </div>

                {recommendations.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start justify-between bg-white rounded-md border p-3">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="font-medium text-sm truncate">{rec.url}</div>
                          <div className="text-xs text-muted-foreground mt-1">{rec.description}</div>
                        </div>
                        <Button size="sm" onClick={() => addRecommendation(rec.url)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add Source Form */}
            <div className="space-y-4 border rounded-lg p-4">
              <div className="font-medium">Add New Source</div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newSourceType === 'rss' ? 'default' : 'outline'}
                  onClick={() => setNewSourceType('rss')}
                  size="sm"
                >
                  RSS Feed
                </Button>
                <Button
                  type="button"
                  variant={newSourceType === 'web' ? 'default' : 'outline'}
                  onClick={() => setNewSourceType('web')}
                  size="sm"
                >
                  Web Crawl
                </Button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">URL</label>
                <Input
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder={newSourceType === 'rss' ? 'https://example.com/feed.xml' : 'https://example.com'}
                />
              </div>

              {newSourceType === 'web' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Max Pages</label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={newSourceMaxPages}
                      onChange={(e) => setNewSourceMaxPages(parseInt(e.target.value) || 10)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Max Depth</label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={newSourceMaxDepth}
                      onChange={(e) => setNewSourceMaxDepth(parseInt(e.target.value) || 2)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                    <label className="text-sm font-medium">Follow Links</label>
                    <Switch checked={newSourceFollowLinks} onCheckedChange={setNewSourceFollowLinks} />
                  </div>
                </div>
              )}

              <Button onClick={addSource} disabled={!newSourceUrl.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Source
              </Button>
            </div>

            {/* Sources List */}
            <div>
              <div className="font-medium mb-3">Added Sources ({sources.length})</div>
              {sources.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center border-2 border-dashed rounded-md">
                  No sources added yet
                </div>
              ) : (
                <div className="space-y-2">
                  {sources.map((source, idx) => (
                    <div key={idx} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            {source.type.toUpperCase()}
                          </span>
                          <span className="truncate text-sm">{source.url}</span>
                        </div>
                        {source.type === 'web' && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Max {source.maxPages} pages, depth {source.maxDepth}, 
                            {source.followLinks ? ' following links' : ' no links'}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeSource(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Portal Settings */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Portal Settings (Optional)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create a public portal for this crawler with a custom subdomain
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Subdomain</label>
              <div className="flex items-center gap-2">
                <Input
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="myportal"
                  maxLength={50}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.spoot.com</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Only lowercase letters, numbers, and hyphens allowed
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Portal Title</label>
              <Input
                value={portalTitle}
                onChange={(e) => setPortalTitle(e.target.value)}
                placeholder={name || "My Portal"}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Defaults to crawler name if left empty
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Portal Description</label>
              <Textarea
                value={portalDescription}
                onChange={(e) => setPortalDescription(e.target.value)}
                placeholder={description || "Portal description..."}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Defaults to crawler description if left empty
              </p>
            </div>

            {subdomain && (
              <div className="rounded-lg border bg-blue-50 p-4">
                <div className="font-medium text-sm mb-1">Your portal will be available at:</div>
                <div className="text-blue-600 font-mono">
                  https://{subdomain}.spoot.com
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: You'll need to add this subdomain to the Caddyfile and restart Caddy for SSL to work
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review & Create */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review your crawler configuration before creating
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Details Summary */}
            <div>
              <div className="font-medium mb-2">Basic Details</div>
              <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={isActive ? 'text-green-600' : 'text-gray-500'}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Match Score:</span>
                  <span className="font-medium">{minMatchScore}</span>
                </div>
                {description && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Description:</div>
                    <div className="text-sm">{description}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Keywords Summary */}
            <div>
              <div className="font-medium mb-2">Keywords ({confirmedKeywords.size})</div>
              {confirmedKeywords.size > 0 ? (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex flex-wrap gap-2">
                    {Array.from(confirmedKeywords).map((term) => (
                      <span key={term} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No keywords added</div>
              )}
            </div>

            {/* Sources Summary */}
            <div>
              <div className="font-medium mb-2">Sources ({sources.length})</div>
              {sources.length > 0 ? (
                <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
                  {sources.map((source, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-semibold text-blue-600">{source.type.toUpperCase()}</span>: {source.url}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No sources added</div>
              )}
            </div>

            {/* Portal Summary */}
            <div>
              <div className="font-medium mb-2">Portal Settings</div>
              {subdomain ? (
                <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subdomain:</span>
                    <span className="font-mono text-blue-600">https://{subdomain}.spoot.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Title:</span>
                    <span className="font-medium">{portalTitle || name}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No portal configured</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || submitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {WIZARD_STEPS.length}
        </div>

        {currentStep < 5 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || !canProceed()}
            size="lg"
            className="min-w-[200px]"
          >
            {submitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Creating...
              </>
            ) : (
              <>
                Create Crawler
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
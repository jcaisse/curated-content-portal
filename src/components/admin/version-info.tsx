"use client"
import React from 'react'

export function VersionInfo() {
  const [sha, setSha] = React.useState<string | null>(null)
  React.useEffect(() => {
    fetch('/api/build-info').then(r => r.json()).then(d => setSha(d.sha)).catch(() => {})
  }, [])
  return (
    <div className="text-xs text-muted-foreground">Build: {sha || '...'}</div>
  )
}

"use client"
import * as React from "react"

type TabsProps = {
  defaultValue: string
  children: React.ReactNode
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue)
  return (
    <div data-tabs>
      {React.Children.map(children, (child: any) => {
        if (child?.type?.displayName === 'TabsList') return React.cloneElement(child, { value, setValue })
        if (child?.props?.value && child.type?.displayName === 'TabsContent') {
          return value === child.props.value ? child : null
        }
        return child
      })}
    </div>
  )
}

type TabsListProps = { children: React.ReactNode; value?: string; setValue?: (v: string) => void }
export function TabsList({ children, value, setValue }: TabsListProps) {
  return (
    <div className="inline-flex rounded-md border p-1 gap-1">
      {React.Children.map(children, (child: any) => React.cloneElement(child, { activeValue: value, setValue }))}
    </div>
  )
}
TabsList.displayName = 'TabsList'

type TabsTriggerProps = { value: string; children: React.ReactNode; activeValue?: string; setValue?: (v: string) => void }
export function TabsTrigger({ value, children, activeValue, setValue }: TabsTriggerProps) {
  const active = activeValue === value
  return (
    <button type="button" onClick={() => setValue && setValue(value)} className={"px-3 py-1 rounded text-sm " + (active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
      {children}
    </button>
  )
}
TabsTrigger.displayName = 'TabsTrigger'

type TabsContentProps = { value: string; children: React.ReactNode }
export function TabsContent({ children }: TabsContentProps) {
  return <div className="pt-4">{children}</div>
}
TabsContent.displayName = 'TabsContent'



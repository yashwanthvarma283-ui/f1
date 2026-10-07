import React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface TabItem<T extends string = string> {
  id: T
  label: string
  count?: number | string
  badge?: string
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[]
  activeTab: T
  onChange: (tabId: T) => void
  layoutId?: string
  className?: string
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  layoutId = 'activeTabIndicator',
  className,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center p-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-sm select-none shadow-xs',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-3.5 py-1.5 rounded-md font-medium text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
              isActive
                ? 'text-[var(--text)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 rounded-md bg-[var(--surface-1)] shadow-xs border border-[var(--border)]"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-mono',
                    isActive
                      ? 'bg-[var(--accent)] text-white font-bold'
                      : 'bg-[var(--surface-3)] text-[var(--text-muted)]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

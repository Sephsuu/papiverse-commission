"use client"

import { Button } from "@/components/ui/button"

interface TabSwitcherProps {
  tabs: string[]
  selectedTab: string
  setSelectedTab: (tab: string) => void
}

export function AppTabSwitcher({ tabs, selectedTab, setSelectedTab }: TabSwitcherProps) {
  return (
    <div className="w-fit flex items-center justify-center bg-slate-50 shadow-sm rounded-full">
      {tabs.map((item, i) => (
        <Button
          key={i}
          onClick={() => setSelectedTab(item)}
          className={`w-30 rounded-full bg-slate-50 text-dark hover:border hover:border-slate-300 hover:text-darkbrown hover:bg-transparent 
            ${selectedTab === item && "bg-darkbrown! text-light! hover:opacity-100"}`}
        >
          {item}
        </Button>
      ))}
    </div>
  )
}

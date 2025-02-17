"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DialogProps } from "@radix-ui/react-dialog"
import { Search } from "lucide-react"
import { useHotkeys } from "react-hotkeys-hook"
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function GlobalSearch({ ...props }: DialogProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault()
    setOpen(true)
  })

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline-block">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white/40">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} {...props}>
        <CommandInput
          placeholder="Type a command or search..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard"))}
            >
              Dashboard
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/goals"))}
            >
              Goals
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/deals"))}
            >
              Deals
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/wallet"))}
            >
              Wallet
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/notifications"))}
            >
              Notifications
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
            >
              Settings
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/goals/create"))}
            >
              Create New Goal
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/wallet?action=add-tokens"))}
            >
              Add Tokens
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
} 
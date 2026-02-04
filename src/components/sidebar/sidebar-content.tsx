"use client"

import {
  PlusIcon as AddIcon,
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  XIcon as CloseIcon,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { startTransition, useState } from "react"
import { Logo } from "../logo"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

type Prompt = {
  id: string
  title: string
  content: string
}

export type SidebarContentProps = {
  prompts: Prompt[]
}

export function SidebarContent({ prompts }: SidebarContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialQuery = searchParams.get("q") ?? ""

  const [query, setQuery] = useState(initialQuery)
  const [isCollapsed, setIsCollapsed] = useState(false)

  function collapsedSidebar() {
    setIsCollapsed(true)
  }
  function expandSidebar() {
    setIsCollapsed(false)
  }

  function handleNewPrompt() {
    router.push("/new")
  }

  function handleQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = event.target.value
    setQuery(newQuery)

    startTransition(() => {
      const url = newQuery ? `/?q=${encodeURIComponent(newQuery)}` : "/"
      router.push(url, { scroll: false })
    })
  }

  return (
    <aside
      className="border-r border-gray-700 flex flex-col h-full bg-gray-800 transition-[transform,width] duration-300 ease-in-out fixed md:relative left-0 top-0 z-50 md:z-auto w-[80vw] sm:w-[320px] data-[collapsed=true]:md:w-16 data-[collapsed=false]:md:w-[24rem]"
      data-collapsed={isCollapsed}
    >
      {isCollapsed && (
        <section className="px-2 py-6">
          <header className="flex items-center justify-center mb-6">
            <Button
              onClick={expandSidebar}
              variant="icon"
              className="hidden md:inline-flex p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg transition-colors"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ArrowRightToLineIcon className="w-5 h-5 text-gray-100" />
            </Button>
          </header>
        </section>
      )}

      {!isCollapsed && (
        <section className="p-6">
          <div className="md:hidden mb-4">
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                aria-label="Close menu"
                title="Close menu"
              >
                <CloseIcon className="w-5 h-5 text-gray-100" />
              </Button>
            </div>
          </div>
          <div className="flex w-full items-center justify-between mb-6">
            <header className="flex w-full items-center justify-between">
              <Logo />
              <Button
                className="hidden md:inline-flex p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg transition-colors"
                variant="icon"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                value={query}
                onClick={collapsedSidebar}
              >
                <ArrowLeftToLineIcon className="w-5 h-5 text-gray-100" />
              </Button>
            </header>
          </div>
          <section className="mb-5">
            <form action="">
              <Input
                name="q"
                type="text"
                value={query}
                placeholder="Search prompts..."
                onChange={handleQueryChange}
                autoFocus
              />
            </form>
          </section>
          <div>
            <Button
              onClick={handleNewPrompt}
              className="w-full"
              size="lg"
              aria-label="New prompt"
              title="New prompt"
            >
              <AddIcon className="w-5 h-5 mr-2" />
              New prompt
            </Button>
          </div>
        </section>
      )}
      {prompts.map((prompt) => (
        <p key={prompt.id}>{prompt.title}</p>
      ))}
    </aside>
  )
}

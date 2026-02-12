"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createPromptAction } from "@/app/actions/prompt.actions"
import {
  type CreatePromptDTO,
  createPromptSchema,
} from "@/core/domain/prompts/create-prompt.dto"
import { Button } from "../ui/button"
import { Form, FormControl, FormField, FormItem } from "../ui/form"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

export function PromptForm() {
  const router = useRouter()

  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  const { control, handleSubmit, reset } = form

  async function handleCreatePrompt(data: CreatePromptDTO) {
    const result = await createPromptAction(data)

    if (!result.success) {
      toast.error(result.message)
      reset()
      return
    }

    toast.success(result.message)
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleCreatePrompt)} className="space-y-6">
        <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
          <Button type="submit" size="sm">
            Save
          </Button>
        </header>
        <FormField
          name="title"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Prompt title"
                  className="mb-4"
                  variant="transparent"
                  size="lg"
                  autoFocus
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="content"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Write your prompt here..."
                  variant="transparent"
                  size="lg"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

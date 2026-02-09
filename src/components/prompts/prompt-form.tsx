"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  type CreatePromptDTO,
  createPromptSchema,
} from "@/core/domain/prompts/create-prompt.dto"
import { Button } from "../ui/button"
import { Form, FormControl, FormField, FormItem } from "../ui/form"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

export function PromptForm() {
  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  const { control } = form

  return (
    <Form {...form}>
      <form action="" className="space-y-6">
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
          name="title"
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

"use server"

import z from "zod"
import { CreatePromptUseCase } from "@/core/application/prompts/create-prompt.use-case"
import { SearchPromptsUseCase } from "@/core/application/prompts/search-prompts.use-case"
import {
  type CreatePromptDTO,
  createPromptSchema,
} from "@/core/domain/prompts/create-prompt.dto"
import type { PromptSummary } from "@/core/domain/prompts/prompt.entity"
import { PrismaPromptRepository } from "@/infra/repository/prisma-prompt.repository"
import { prisma } from "@/lib/prisma"

export async function createPromptAction(formData: CreatePromptDTO) {
  const validated = createPromptSchema.safeParse(formData)

  if (!validated.success) {
    const { fieldErrors } = z.flattenError(validated.error)
    return {
      success: false,
      message: "Invalid form data.",
      errors: fieldErrors,
    }
  }

  const repository = new PrismaPromptRepository(prisma)
  const useCase = new CreatePromptUseCase(repository)

  try {
    await useCase.execute(validated.data)
    return {
      success: true,
      message: "Prompt created successfully.",
    }
  } catch (error) {
    const _error = error as Error

    if (_error.message === "PROMPT_ALREADY_EXISTS") {
      return {
        success: false,
        message: "A prompt with this title already exists.",
      }
    }

    return {
      success: false,
      message: "Failed to create prompt.",
    }
  }
}

type SearchFormState = {
  success: boolean
  prompts?: PromptSummary[]
  message?: string
}

export async function searchPromptAction(
  _prev: SearchFormState,
  formData: FormData,
): Promise<SearchFormState> {
  const term = String(formData.get("q") ?? "").trim()

  const repository = new PrismaPromptRepository(prisma)
  const useCase = new SearchPromptsUseCase(repository)

  try {
    const results = await useCase.execute(term)

    const summaries = results.map(({ id, title, content }) => ({
      id,
      title,
      content,
    }))

    return {
      success: true,
      prompts: summaries,
    }
  } catch {
    return {
      success: false,
      message: "Failed to search prompts.",
    }
  }
}

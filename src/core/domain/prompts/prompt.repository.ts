import type { CreatePromptDTO } from "./create-prompt.dto"
import type { Prompt } from "./prompt.entity"

export interface PromptRepository {
  create(formData: CreatePromptDTO): Promise<void>
  findMany(): Promise<Prompt[]>
  findByTitle(title: string): Promise<Prompt | null>
  searchMany(term: string): Promise<Prompt[]>
}

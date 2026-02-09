import type { PrismaClient } from "@prisma/client"
import type { Prompt } from "@/core/domain/prompts/prompt.entity"
import type { PromptRepository } from "@/core/domain/prompts/prompt.repository"

export class PrismaPromptRepository implements PromptRepository {
  constructor(private prisma: PrismaClient) {}

  async create(formData: { title: string; content: string }): Promise<void> {
    await this.prisma.prompt.create({
      data: {
        title: formData.title,
        content: formData.content,
      },
    })
  }

  async findByTitle(title: string): Promise<Prompt | null> {
    const prompt = await this.prisma.prompt.findMany({
      where: { title },
    })
    return prompt.length > 0 ? prompt[0] : null
  }

  async findMany(): Promise<Prompt[]> {
    const prompts = await this.prisma.prompt.findMany({
      orderBy: { createdAt: "desc" },
    })
    return prompts
  }

  async searchMany(term?: string): Promise<Prompt[]> {
    const q = term?.trim() ?? ""

    const prompts = await this.prisma.prompt.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    })
    return prompts
  }
}

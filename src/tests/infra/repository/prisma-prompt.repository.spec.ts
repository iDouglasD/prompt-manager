import type { Prompt } from "@/core/domain/prompts/prompt.entity"
import { PrismaPromptRepository } from "@/infra/repository/prisma-prompt.repository"

type PromptDelegateMock = {
  findMany: jest.MockedFunction<
    (args: {
      orderBy?: { createdAt: "asc" | "desc" }
      where?: {
        OR: Array<{
          title?: { contains: string; mode: "insensitive" }
          content?: { contains: string; mode: "insensitive" }
        }>
      }
    }) => Promise<Prompt[]>
  >
}

type PrismaMock = {
  prompt: PromptDelegateMock
}

function createMockPrisma() {
  const mock: PrismaMock = {
    prompt: {
      findMany: jest.fn(),
    },
  }
  return mock
}

describe("PrismaPromptRepository", () => {
  let prisma: ReturnType<typeof createMockPrisma>
  let repository: PrismaPromptRepository

  beforeEach(() => {
    prisma = createMockPrisma()
    repository = new PrismaPromptRepository(prisma)
  })

  describe("findMany", () => {
    it("should return prompts ordered by createdAt descending", async () => {
      const now = new Date()
      const input = [
        {
          id: "1",
          title: "First",
          content: "Content 1",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "2",
          title: "Second",
          content: "Content 2",
          createdAt: now,
          updatedAt: now,
        },
      ]

      prisma.prompt.findMany.mockResolvedValue(input)

      const results = await repository.findMany()

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      })
      expect(results).toEqual(input)
    })
  })

  describe("searchMany", () => {
    it("should search with term empty and not use where clause", async () => {
      const now = new Date()
      const input = [
        {
          id: "1",
          title: "First",
          content: "Content 1",
          createdAt: now,
          updatedAt: now,
        },
      ]

      prisma.prompt.findMany.mockResolvedValue(input)

      const results = await repository.searchMany("    ")

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: "desc" },
      })
      expect(results).toMatchObject(input)
    })

    it("should search with term and use OR clause in where", async () => {
      const now = new Date()
      const input = [
        {
          id: "1",
          title: "First",
          content: "Content 1",
          createdAt: now,
          updatedAt: now,
        },
      ]
      const text = " First "

      prisma.prompt.findMany.mockResolvedValue(input)

      const results = await repository.searchMany(text)

      expect(prisma.prompt.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: text.trim(), mode: "insensitive" } },
            { content: { contains: text.trim(), mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      })
      expect(results).toMatchObject(input)
    })
  })
})

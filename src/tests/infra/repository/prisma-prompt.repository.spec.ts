import type { CreatePromptDTO } from "@/core/domain/prompts/create-prompt.dto"
import type { Prompt } from "@/core/domain/prompts/prompt.entity"
import { PrismaPromptRepository } from "@/infra/repository/prisma-prompt.repository"

type PromptDelegateMock = {
  create: jest.MockedFunction<
    (args: { data: CreatePromptDTO }) => Promise<void>
  >
  findFirst: jest.MockedFunction<
    (args: {
      where: { title: string }
    }) => Promise<Pick<Prompt, "id" | "title" | "content"> | null>
  >
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
      findFirst: jest.fn(),
      create: jest.fn(),
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

  describe("create", () => {
    it("should create a prompt with correct data", async () => {
      const input = {
        title: "Test Prompt",
        content: "This is a test prompt.",
      }

      await repository.create(input)

      expect(prisma.prompt.create).toHaveBeenCalledWith({
        data: input,
      })
    })
  })

  describe("findByTitle", () => {
    it("should find a prompt by title", async () => {
      const title = "Test Prompt"
      const input = {
        id: "1",
        title: "Test Prompt",
        content: "This is a test prompt.",
      }

      prisma.prompt.findFirst.mockResolvedValue(input)

      const result = await repository.findByTitle(title)

      expect(prisma.prompt.findFirst).toHaveBeenCalledWith({
        where: { title: input.title },
      })
      expect(result).toEqual(input)
    })
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

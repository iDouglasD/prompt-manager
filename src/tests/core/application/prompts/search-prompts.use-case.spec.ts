import { SearchPromptsUseCase } from "@/core/application/prompts/search-prompts.use-case"
import type { Prompt } from "@/core/domain/prompts/prompt.entity"
import type { PromptRepository } from "@/core/domain/prompts/prompt.repository"

describe("SearchPromptsUseCase", () => {
  const input: Prompt[] = [
    {
      id: "1",
      title: "First Prompt",
      content: "Content of first prompt",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: "Second Prompt",
      content: "Content of second prompt",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const repository: PromptRepository = {
    findMany: async () => input,
    searchMany: async (term: string) => {
      term = term.toLocaleLowerCase()
      return input.filter(
        (prompt) =>
          prompt.title.toLocaleLowerCase().includes(term) ||
          prompt.content.toLocaleLowerCase().includes(term),
      )
    },
  }

  it("should return all prompts when no search term is provided", async () => {
    const useCase = new SearchPromptsUseCase(repository)

    const results = await useCase.execute("")

    expect(results).toHaveLength(2)
  })

  it("should return matching prompts when a search term is provided", async () => {
    const useCase = new SearchPromptsUseCase(repository)
    const query = "first"

    const results = await useCase.execute(query)
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe("1")
  })

  it("should return all prompts when the search term is only white spaces", async () => {
    const findMany = jest.fn().mockResolvedValue(input)
    const searchMany = jest.fn().mockResolvedValue([])
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    }

    const useCase = new SearchPromptsUseCase(repositoryWithSpies)
    const query = "   "

    const results = await useCase.execute(query)

    expect(results).toHaveLength(2)
    expect(findMany).toHaveBeenCalledTimes(1)
    expect(searchMany).not.toHaveBeenCalled()
  })

  it("should return matching prompts when the search term has leading or trailing white spaces", async () => {
    const firstElement = input.slice(0, 1)
    const findMany = jest.fn().mockResolvedValue(input)
    const searchMany = jest.fn().mockResolvedValue(firstElement)
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    }

    const useCase = new SearchPromptsUseCase(repositoryWithSpies)
    const query = " second "

    const results = await useCase.execute(query)

    expect(results).toMatchObject(firstElement)
    expect(searchMany).toHaveBeenCalledWith(query.trim())
    expect(findMany).not.toHaveBeenCalled()
  })

  it("should return all prompts when the search term is undefined", async () => {
    const findMany = jest.fn().mockResolvedValue(input)
    const searchMany = jest.fn().mockResolvedValue([])
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    }

    const useCase = new SearchPromptsUseCase(repositoryWithSpies)
    const query = undefined

    const results = await useCase.execute(query)

    expect(results).toMatchObject(input)
    expect(findMany).toHaveBeenCalledTimes(1)
    expect(searchMany).not.toHaveBeenCalled()
  })
})

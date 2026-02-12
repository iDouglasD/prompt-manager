import {
  createPromptAction,
  searchPromptAction,
} from "@/app/actions/prompt.actions"

jest.mock("@/lib/prisma", () => ({ prisma: {} }))

const mockedSearchExecute = jest.fn()
const mockedCreateExecute = jest.fn()

jest.mock("@/core/application/prompts/search-prompts.use-case", () => ({
  SearchPromptsUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedSearchExecute })),
}))

jest.mock("@/core/application/prompts/create-prompt.use-case", () => ({
  CreatePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedCreateExecute })),
}))

describe("Server actions: Prompts", () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset()
    mockedCreateExecute.mockReset()
  })

  describe("createPromptAction", () => {
    it("should create a prompt successfully", async () => {
      mockedCreateExecute.mockResolvedValue(undefined)

      const data = {
        title: "New Prompt",
        content: "This is a new prompt.",
      }
      const result = await createPromptAction(data)

      expect(result).toEqual({
        success: true,
        message: "Prompt created successfully.",
      })
    })

    it("should return validation errors for empty form data", async () => {
      const data = {
        title: "",
        content: "",
      }

      const result = await createPromptAction(data)

      expect(result?.success).toBe(false)
      expect(result?.message).toBe("Invalid form data.")
      expect(result?.errors).toBeDefined()
    })

    it("should return error message when PROMPT_ALREADY_EXISTS happen", async () => {
      mockedCreateExecute.mockRejectedValue(new Error("PROMPT_ALREADY_EXISTS"))

      const data = {
        title: "Existing Prompt",
        content: "This prompt already exists.",
      }

      const result = await createPromptAction(data)

      expect(result?.success).toBe(false)
      expect(result?.message).toBe("A prompt with this title already exists.")
    })

    it("should return generic error message when creation fails", async () => {
      mockedCreateExecute.mockRejectedValue(new Error("UNKNOWN"))
      const data = {
        title: "Another Prompt",
        content: "This is another prompt.",
      }
      const result = await createPromptAction(data)

      expect(result?.success).toBe(false)
      expect(result?.message).toBe("Failed to create prompt.")
    })
  })

  describe("searchPromptAction", () => {
    it("should search prompts and return results", async () => {
      const input = [
        { id: "1", title: "AI Prompt", content: "This is a prompt about AI." },
      ]
      mockedSearchExecute.mockResolvedValue(input)

      const formData = new FormData()
      formData.append("q", "AI")

      const result = await searchPromptAction({ success: true }, formData)
      expect(result.success).toBe(true)
      expect(result.prompts).toEqual(input)
    })

    it("should return success and list of prompts when no term is provided", async () => {
      const input = [
        {
          id: "1",
          title: "First Prompt",
          content: "This is the first prompt content.",
        },
        {
          id: "2",
          title: "Second Prompt",
          content: "This is the second prompt content.",
        },
      ]
      mockedSearchExecute.mockResolvedValue(input)

      const formData = new FormData()
      formData.append("q", "")

      const result = await searchPromptAction({ success: true }, formData)

      expect(result.success).toBeDefined()
      expect(result.prompts).toEqual(input)
    })

    it("should handle errors and return generic failed message", async () => {
      const error = new Error("unexpected error")
      mockedSearchExecute.mockRejectedValue(error)

      const formData = new FormData()
      formData.append("q", "error")

      const result = await searchPromptAction({ success: true }, formData)

      expect(result.success).toBe(false)
      expect(result.prompts).toBe(undefined)
      expect(result.message).toBe("Failed to search prompts.")
    })

    it("should trim whitespace from the search term before searching", async () => {
      const input = [
        { id: "1", title: "Trimmed Prompt", content: "Content for trimmed." },
      ]
      mockedSearchExecute.mockResolvedValue(input)

      const formData = new FormData()
      formData.append("q", "  Trimmed Prompt   ")

      const result = await searchPromptAction({ success: true }, formData)

      expect(mockedSearchExecute).toHaveBeenCalledWith("Trimmed Prompt")
      expect(result.success).toBe(true)
      expect(result.prompts).toEqual(input)
    })

    it("should be treated empty query as search term empty", async () => {
      const input = [
        {
          id: "1",
          title: "First Prompt",
          content: "This is the first prompt content.",
        },
        {
          id: "2",
          title: "Second Prompt",
          content: "This is the second prompt content.",
        },
      ]
      mockedSearchExecute.mockResolvedValue(input)

      const formData = new FormData()

      const result = await searchPromptAction({ success: true }, formData)

      expect(mockedSearchExecute).toHaveBeenCalledWith("")
      expect(result.success).toBe(true)
      expect(result.prompts).toEqual(input)
    })
  })
})

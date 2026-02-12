import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { PromptForm } from "@/components/prompts"
import { render, screen } from "@/lib/test-utils"

const refreshMock = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}))

const createActionMock = jest.fn()
jest.mock("@/app/actions/prompt.actions", () => ({
  createPromptAction: (...args: unknown[]) => createActionMock(...args),
}))

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const makeSut = () => {
  return render(<PromptForm />)
}

describe("PromptForm", () => {
  beforeEach(() => {
    createActionMock.mockReset()
    refreshMock.mockReset()
    ;(toast.success as jest.Mock).mockReset()
    ;(toast.error as jest.Mock).mockReset()
  })

  const user = userEvent.setup()

  it("should create a new prompt successfully", async () => {
    const successMessage = "Prompt created successfully."
    createActionMock.mockResolvedValueOnce({
      success: true,
      message: successMessage,
    })
    makeSut()

    const titleInput = screen.getByPlaceholderText("Prompt title")
    const contentInput = screen.getByPlaceholderText(
      "Write your prompt here...",
    )
    const submitButton = screen.getByRole("button", { name: /save/i })

    await user.type(titleInput, "Test Prompt")
    await user.type(contentInput, "This is a test prompt content.")
    await user.click(submitButton)

    expect(createActionMock).toHaveBeenCalledWith({
      title: "Test Prompt",
      content: "This is a test prompt content.",
    })
    expect(toast.success).toHaveBeenCalledWith(successMessage)
    expect(refreshMock).toHaveBeenCalledTimes(1)
  })

  it("should show error message when prompt creation fails", async () => {
    const errorMessage = "Failed to create prompt."
    createActionMock.mockResolvedValueOnce({
      success: false,
      message: errorMessage,
    })
    makeSut()

    const titleInput = screen.getByPlaceholderText("Prompt title")
    const contentInput = screen.getByPlaceholderText(
      "Write your prompt here...",
    )
    const submitButton = screen.getByRole("button", { name: /save/i })

    await user.type(titleInput, "Test Prompt")
    await user.type(contentInput, "This is a test prompt content.")
    await user.click(submitButton)

    expect(toast.error).toHaveBeenCalledWith(errorMessage)
    expect(refreshMock).not.toHaveBeenCalled()
  })
})

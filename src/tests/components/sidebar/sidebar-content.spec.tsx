import { userEvent } from "@testing-library/user-event"
import {
  SidebarContent,
  type SidebarContentProps,
} from "@/components/sidebar/sidebar-content"
import { render, screen } from "@/lib/test-utils"

const pushMock = jest.fn()
let mockSearchParams = new URLSearchParams()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => mockSearchParams,
}))

const initialPrompts = [
  {
    id: "1",
    title: "First Prompt",
    content: "This is the first prompt content.",
  },
]

const makeSut = (
  { prompts = initialPrompts }: SidebarContentProps = {} as SidebarContentProps,
) => {
  return render(<SidebarContent prompts={prompts} />)
}

describe("SidebarContent", () => {
  const user = userEvent.setup()

  describe("base", () => {
    it("should render correctly button to create a new prompt", () => {
      makeSut()

      expect(screen.getByRole("complementary")).toBeVisible()
      expect(screen.getByRole("button", { name: /new prompt/i })).toBeVisible()
    })

    it("should render correctly prompts list", () => {
      makeSut()

      expect(screen.getByText(initialPrompts[0].title)).toBeInTheDocument()
    })

    it("should update search input value when user types", async () => {
      makeSut()

      const text = "AI"
      const searchInput = screen.getByPlaceholderText(/search prompts.../i)

      await user.type(searchInput, text)

      expect(searchInput).toHaveValue(text)
    })
  })

  describe("when sidebar is collapsed and expand", () => {
    it("should render correctly the sidebar expanded and button to collapse sidebar", () => {
      makeSut()

      const aside = screen.getByRole("complementary")
      expect(aside).toBeVisible()

      const collapseButton = screen.getByRole("button", {
        name: /collapse sidebar/i,
      })
      expect(collapseButton).toBeVisible()

      const expandButton = screen.queryByRole("button", {
        name: /expand sidebar/i,
      })
      expect(expandButton).not.toBeInTheDocument()
    })

    it('should expand when user clicks on "expand sidebar" button', async () => {
      makeSut()

      const collapseButton = screen.getByRole("button", {
        name: /collapse sidebar/i,
      })
      await user.click(collapseButton)

      const expandButton = screen.getByRole("button", {
        name: /expand sidebar/i,
      })
      await user.click(expandButton)

      expect(
        screen.getByRole("button", { name: /collapse sidebar/i }),
      ).toBeVisible()
      expect(
        screen.getByRole("navigation", { name: /prompt list/i }),
      ).toBeVisible()
    })

    it("should render correctly the sidebar collapsed and button to expand sidebar", async () => {
      makeSut()

      const collapseButton = screen.getByRole("button", {
        name: /collapse sidebar/i,
      })
      expect(collapseButton).toBeVisible()

      await user.click(collapseButton)

      const expandButton = screen.getByRole("button", {
        name: /expand sidebar/i,
      })
      expect(expandButton).toBeInTheDocument()
      expect(collapseButton).not.toBeInTheDocument()
    })

    it("should render create new prompt button when sidebar is collapsed", async () => {
      makeSut()
      const collapseButton = screen.getByRole("button", {
        name: /collapse sidebar/i,
      })

      await user.click(collapseButton)

      const newPromptButton = screen.getByRole("button", {
        name: /new prompt/i,
      })
      expect(newPromptButton).toBeVisible()
    })

    it("should not render prompts list when sidebar is collapsed", async () => {
      makeSut()
      const collapseButton = screen.getByRole("button", {
        name: /collapse sidebar/i,
      })

      await user.click(collapseButton)

      const nav = screen.queryByRole("navigation", { name: /prompt list/i })
      expect(nav).not.toBeInTheDocument()
    })
  })

  describe("when new prompt button is clicked", () => {
    it("should call the router push method", async () => {
      makeSut()

      const newPromptButton = screen.getByRole("button", {
        name: /new prompt/i,
      })

      await user.click(newPromptButton)

      expect(pushMock).toHaveBeenCalledWith("/new")
    })
  })

  describe("Search", () => {
    it("should navigate with URL query param when user types in search input", async () => {
      const text = "AI prompt"
      makeSut()
      const searchInput = screen.getByPlaceholderText(/search prompts.../i)

      await user.type(searchInput, text)

      expect(pushMock).toHaveBeenCalled()
      const lastCall = pushMock.mock.calls.at(-1)
      expect(lastCall?.[0]).toBe(`/?q=${encodeURIComponent(text)}`)

      await user.clear(searchInput)
      const lastClearCall = pushMock.mock.calls.at(-1)
      expect(lastClearCall?.[0]).toBe("/")
    })

    it("should submit the form when user types in search input", async () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, "requestSubmit")
        .mockImplementation(() => undefined)
      makeSut()

      const searchInput = screen.getByPlaceholderText(/search prompts.../i)

      await user.type(searchInput, "test submit")
      expect(submitSpy).toHaveBeenCalled()
      submitSpy.mockRestore()
    })

    it("should submit the form automatically on mount when there is a query param", async () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, "requestSubmit")
        .mockImplementation(() => undefined)
      const text = "initial query"
      const searchParams = new URLSearchParams({ q: text })
      mockSearchParams = searchParams
      makeSut()

      expect(submitSpy).toHaveBeenCalled()
      submitSpy.mockRestore()
    })

    it("should initialize the search input with query param value", () => {
      const text = "initial query"
      const searchParam = new URLSearchParams({ q: text })
      mockSearchParams = searchParam
      makeSut()

      const searchInput = screen.getByPlaceholderText(/search prompts.../i)

      expect(searchInput).toHaveValue(text)
    })
  })
})

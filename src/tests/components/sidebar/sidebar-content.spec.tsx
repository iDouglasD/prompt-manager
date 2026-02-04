import { userEvent } from "@testing-library/user-event"
import { SidebarContent } from "@/components/sidebar/sidebar-content"
import { render, screen } from "@/lib/test-utils"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

const makeSut = () => {
  return render(<SidebarContent />)
}

describe("SidebarContent", () => {
  const user = userEvent.setup()

  it("should render correctly button to create a new prompt", () => {
    makeSut()

    expect(screen.getByRole("complementary")).toBeVisible()
    expect(screen.getByRole("button", { name: /new prompt/i })).toBeVisible()
  })

  describe("when sidebar is collapsed and expand button is clicked", () => {
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
  })
})

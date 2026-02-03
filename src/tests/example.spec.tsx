import { render, screen } from "@/lib/test-utils"

describe("Example test suite", () => {
  it("should pass a basic test", () => {
    render(<div>Test</div>)

    expect(screen.getByText("Test")).toBeInTheDocument()
  })
})

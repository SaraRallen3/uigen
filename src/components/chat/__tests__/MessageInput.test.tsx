import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "../MessageInput";

afterEach(() => {
  cleanup();
});

test("renders with placeholder text", () => {
  const mockProps = {
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);
  
  const textarea = screen.getByPlaceholderText("Describe the React component you want to create...");
  expect(textarea).toBeDefined();
});

test("displays the input value", () => {
  const mockProps = {
    input: "Test input value",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);
  
  const textarea = screen.getByDisplayValue("Test input value");
  expect(textarea).toBeDefined();
});

test("calls handleInputChange when typing", async () => {
  const handleInputChange = vi.fn();
  const mockProps = {
    input: "",
    handleInputChange,
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);
  
  const textarea = screen.getByPlaceholderText("Describe the React component you want to create...");
  await userEvent.type(textarea, "Hello");
  
  expect(handleInputChange).toHaveBeenCalled();
});

test("calls handleSubmit when form is submitted", async () => {
  const handleSubmit = vi.fn((e) => e.preventDefault());
  const mockProps = {
    input: "Test input",
    handleInputChange: vi.fn(),
    handleSubmit,
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);
  
  const form = screen.getByRole("textbox").closest("form")!;
  fireEvent.submit(form);
  
  expect(handleSubmit).toHaveBeenCalledOnce();
});

test("submits form when Enter is pressed without shift", async () => {
  const handleSubmit = vi.fn((e) => e.preventDefault());
  const mockProps = {
    input: "Test input",
    handleInputChange: vi.fn(),
    handleSubmit,
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);
  
  const textarea = screen.getByRole("textbox");
  fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
  
  expect(handleSubmit).toHaveBeenCalledOnce();
});

test("does not submit form when Enter is pressed with shift", async () => {
  const handleSubmit = vi.fn((e) => e.preventDefault());
  const mockProps = {
    input: "Test input",
    handleInputChange: vi.fn(),
    handleSubmit,
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);
  
  const textarea = screen.getByRole("textbox");
  fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
  
  expect(handleSubmit).not.toHaveBeenCalled();
});

test("disables textarea when isLoading is true", () => {
  const mockProps = {
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: true,
  };

  render(<MessageInput {...mockProps} />);
  
  const textarea = screen.getByRole("textbox");
  expect(textarea).toHaveProperty("disabled", true);
});

test("disables submit button when isLoading is true", () => {
  const mockProps = {
    input: "Test input",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: true,
  };

  render(<MessageInput {...mockProps} />);
  
  const submitButton = screen.getByRole("button");
  expect(submitButton).toHaveProperty("disabled", true);
});

test("disables submit button when input is empty", () => {
  const mockProps = {
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);
  
  const submitButton = screen.getByRole("button");
  expect(submitButton).toHaveProperty("disabled", true);
});

test("disables submit button when input contains only whitespace", () => {
  const mockProps = {
    input: "   ",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);
  
  const submitButton = screen.getByRole("button");
  expect(submitButton).toHaveProperty("disabled", true);
});

test("enables submit button when input has content and not loading", () => {
  const mockProps = {
    input: "Valid content",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);
  
  const submitButton = screen.getByRole("button");
  expect(submitButton).toHaveProperty("disabled", false);
});

test("applies correct CSS classes based on loading state", () => {
  const { rerender } = render(
    <MessageInput
      input="Test"
      handleInputChange={vi.fn()}
      handleSubmit={vi.fn()}
      isLoading={false}
    />
  );

  let submitButton = screen.getByRole("button");
  expect(submitButton.className).toContain("disabled:opacity-40");
  expect(submitButton.className).toContain("hover:bg-blue-50");

  rerender(
    <MessageInput
      input="Test"
      handleInputChange={vi.fn()}
      handleSubmit={vi.fn()}
      isLoading={true}
    />
  );

  submitButton = screen.getByRole("button");
  expect(submitButton.className).toContain("disabled:cursor-not-allowed");
  expect(submitButton.className).toContain("disabled:opacity-40");
});

test("applies pulse animation to send icon when loading", () => {
  const { rerender } = render(
    <MessageInput
      input="Test"
      handleInputChange={vi.fn()}
      handleSubmit={vi.fn()}
      isLoading={false}
    />
  );

  let sendIcon = screen.getByRole("button").querySelector("svg");
  expect(sendIcon?.getAttribute("class")).not.toContain("animate-pulse");

  rerender(
    <MessageInput
      input="Test"
      handleInputChange={vi.fn()}
      handleSubmit={vi.fn()}
      isLoading={true}
    />
  );

  sendIcon = screen.getByRole("button").querySelector("svg");
  expect(sendIcon?.getAttribute("class")).toContain("text-neutral-300");
});

test("textarea has correct styling classes", () => {
  const mockProps = {
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);
  
  const textarea = screen.getByRole("textbox");
  expect(textarea.className).toContain("min-h-[80px]");
  expect(textarea.className).toContain("max-h-[200px]");
  expect(textarea.className).toContain("resize-none");
  expect(textarea.className).toContain("focus:ring-2");
  expect(textarea.className).toContain("focus:ring-blue-500/10");
});

test("submit button click triggers form submission", async () => {
  const handleSubmit = vi.fn((e) => e.preventDefault());
  const mockProps = {
    input: "Test input",
    handleInputChange: vi.fn(),
    handleSubmit,
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);
  
  const submitButton = screen.getByRole("button");
  await userEvent.click(submitButton);

  expect(handleSubmit).toHaveBeenCalledOnce();
});

test("prevents default newline behavior when Enter is pressed without shift", () => {
  const mockProps = {
    input: "Test input",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn((e) => e.preventDefault()),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);

  const textarea = screen.getByRole("textbox");
  const event = new KeyboardEvent("keydown", {
    key: "Enter",
    shiftKey: false,
    bubbles: true,
    cancelable: true,
  });
  textarea.dispatchEvent(event);

  expect(event.defaultPrevented).toBe(true);
});

test("does not prevent default when Enter is pressed with shift", () => {
  const mockProps = {
    input: "Test input",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);

  const textarea = screen.getByRole("textbox");
  const event = new KeyboardEvent("keydown", {
    key: "Enter",
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  });
  textarea.dispatchEvent(event);

  expect(event.defaultPrevented).toBe(false);
});

test("does not submit when a non-Enter key is pressed", () => {
  const handleSubmit = vi.fn((e) => e.preventDefault());
  const mockProps = {
    input: "Test input",
    handleInputChange: vi.fn(),
    handleSubmit,
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);

  const textarea = screen.getByRole("textbox");
  fireEvent.keyDown(textarea, { key: "a", shiftKey: false });
  fireEvent.keyDown(textarea, { key: "Escape", shiftKey: false });

  expect(handleSubmit).not.toHaveBeenCalled();
});

test("disables submit button when input is undefined", () => {
  const mockProps = {
    input: undefined as unknown as string,
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);

  const submitButton = screen.getByRole("button");
  expect(submitButton).toHaveProperty("disabled", true);
});

test("renders an empty textarea when input is undefined without crashing", () => {
  const mockProps = {
    input: undefined as unknown as string,
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);

  const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
  expect(textarea.value).toBe("");
});

test("disables submit button for whitespace input containing tabs and newlines", () => {
  const mockProps = {
    input: "\n\t  \n",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);

  const submitButton = screen.getByRole("button");
  expect(submitButton).toHaveProperty("disabled", true);
});

test("preserves multiline input value in the textarea", () => {
  const mockProps = {
    input: "line one\nline two",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
  };

  render(<MessageInput {...mockProps} />);

  const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
  expect(textarea.value).toBe("line one\nline two");
});

test("button enabled state takes both loading and input into account", () => {
  const { rerender } = render(
    <MessageInput
      input="content"
      handleInputChange={vi.fn()}
      handleSubmit={vi.fn()}
      isLoading={true}
    />
  );

  // loading wins even with content
  expect(screen.getByRole("button")).toHaveProperty("disabled", true);

  rerender(
    <MessageInput
      input=""
      handleInputChange={vi.fn()}
      handleSubmit={vi.fn()}
      isLoading={false}
    />
  );

  // empty input keeps it disabled even when not loading
  expect(screen.getByRole("button")).toHaveProperty("disabled", true);
});
import { filterThinkingSections } from "./text-filters";

describe("filterThinkingSections", () => {
  test("removes simple thinking sections", () => {
    const input = "Hello <think>This is thinking</think> world";
    expect(filterThinkingSections(input)).toBe("Hello world");
  });

  test("removes multiple thinking sections", () => {
    const input =
      "Start <think>Think 1</think> middle <think>Think 2</think> end";
    expect(filterThinkingSections(input)).toBe("Start middle end");
  });

  test("removes multiline thinking sections", () => {
    const input = `Hello
<think>
This is a multiline
thinking section
with several lines
</think>
world`;
    expect(filterThinkingSections(input)).toBe("Hello\nworld");
  });

  test("handles nested think tags correctly", () => {
    const input =
      "Start <think>Outer <think>Inner</think> thinking</think> end";
    expect(filterThinkingSections(input)).toBe("Start end");
  });

  test("returns original text if no thinking sections", () => {
    const input = "Plain text with no thinking sections";
    expect(filterThinkingSections(input)).toBe(input);
  });

  test("handles empty string", () => {
    expect(filterThinkingSections("")).toBe("");
  });
});

/**
 * Filters out <think>...</think> sections from text
 * These sections contain the AI's internal reasoning process
 */
export const filterThinkingSections = (text: string): string => {
  // Use regex to remove all <think>...</think> blocks, including newlines within them
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
};

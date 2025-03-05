import {
  hasLearningStructure,
  extractLearningSteps,
} from "./learningPathUtils";

// Helper function to clean text with markdown symbols
export const cleanMarkdownText = (text: string): string => {
  if (!text) return "";

  // Remove markdown formatting symbols without losing content
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold asterisks
    .replace(/\*(.*?)\*/g, "$1") // Remove italic asterisks
    .replace(/__(.*?)__/g, "$1") // Remove bold underscores
    .replace(/_(.*?)_/g, "$1") // Remove italic underscores
    .replace(/`(.*?)`/g, "$1") // Remove code backticks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Keep link text, remove URL
};

// Function to detect questions in the text
export const detectQuestions = (text: string): string[] => {
  if (!text) return [];

  const questions: string[] = [];

  // Pattern to match sentences ending with question marks
  const questionRegex = /([^.!?]+\?)/g;
  const matches = text.match(questionRegex);

  if (matches) {
    matches.forEach((question) => {
      questions.push(question.trim());
    });
  }

  return questions;
};

// Enhanced formatBotMessage function with code block support
export const formatBotMessage = (
  text: string,
  isLearningPath: boolean = false
) => {
  if (!text) return "";

  // Format learning path sections specially
  if (isLearningPath) {
    text = text.replace(
      /^(Step \d+:|#+ Step \d+:|#+ \d+\.|Phase \d+:)/gim,
      '<h3 class="font-bold text-green-400 text-lg mt-4 mb-2">$1</h3>'
    );

    // Add learning path intro
    text =
      `<div class="bg-gray-900 p-3 mb-4 rounded-md border-l-4 border-green-400">
              <h2 class="font-bold text-xl text-green-400 mb-2">Learning Path</h2>
              <p class="text-sm opacity-80">Follow this structured guide to master this technology.</p>
            </div>` + text;
  }

  // Process code blocks first before other formatting
  // Match code blocks with language specification: ```language ... ```
  let formattedText = text.replace(
    /```([a-zA-Z0-9_-]*)\n([\s\S]*?)\n```/g,
    (_, language, code) => {
      // Clean the language name
      const lang = language.trim().toLowerCase() || "plaintext";

      // Determine language-specific styling
      let langClass = "";
      let langLabel = lang;

      // Handle common programming languages
      if (["javascript", "js", "typescript", "ts"].includes(lang)) {
        langClass = "text-yellow-300";
        langLabel =
          lang === "js" ? "JavaScript" : lang === "ts" ? "TypeScript" : lang;
      } else if (["python", "py"].includes(lang)) {
        langClass = "text-blue-300";
        langLabel = "Python";
      } else if (["bash", "shell", "sh", "zsh"].includes(lang)) {
        langClass = "text-green-300";
        langLabel = "Terminal";
      } else if (["html", "xml"].includes(lang)) {
        langClass = "text-orange-300";
        langLabel = lang.toUpperCase();
      } else if (["css", "scss", "sass"].includes(lang)) {
        langClass = "text-pink-300";
        langLabel = lang.toUpperCase();
      } else if (["json"].includes(lang)) {
        langClass = "text-cyan-300";
        langLabel = "JSON";
      } else if (["sql"].includes(lang)) {
        langClass = "text-blue-300";
        langLabel = "SQL";
      }

      // Escape HTML in the code
      const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Return styled code block
      return `
        <div class="my-4 rounded-md overflow-hidden border border-gray-700 bg-gray-900">
          <div class="flex justify-between items-center px-4 py-1 bg-gray-800 border-b border-gray-700">
            <span class="text-xs font-semibold ${
              langClass || "text-gray-300"
            }">${langLabel}</span>
            <span class="text-xs text-gray-400">code</span>
          </div>
          <pre class="p-4 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">${escapedCode}</pre>
        </div>
      `;
    }
  );

  // Handle inline code blocks (text between backticks)
  formattedText = formattedText.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-gray-900 text-orange-300 font-mono text-sm">$1</code>'
  );

  // Rest of text formatting
  // Convert URLs, bold, italic, lists, etc.

  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  formattedText = formattedText.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${url}</a>`;
  });

  // Format bold and italic
  formattedText = formattedText.replace(
    /\*\*(.*?)\*\*/g,
    "<strong class='text-green-400'>$1</strong>"
  );
  formattedText = formattedText.replace(
    /\*(.*?)\*/g,
    "<strong class='text-green-400'>$1</strong>"
  );
  formattedText = formattedText.replace(/_(.*?)_/g, "<em>$1</em>");

  // Format headers if not a learning path
  if (!isLearningPath) {
    formattedText = formattedText.replace(
      /^##\s(.+)$/gm,
      '<h3 class="font-bold text-green-400 text-lg mt-4 mb-2">$1</h3>'
    );
    formattedText = formattedText.replace(
      /^#\s(.+)$/gm,
      '<h2 class="font-bold text-xl text-green-400 mt-5 mb-3">$1</h2>'
    );
  }

  // Format lists
  formattedText = formattedText.replace(
    /^[-*]\s(.+)$/gm,
    '<div class="flex items-start mb-2"><span class="mr-2 text-green-400">→</span><span>$1</span></div>'
  );

  formattedText = formattedText.replace(
    /^(\d+)\.\s(.+)$/gm,
    '<div class="flex items-start mb-2"><span class="mr-2 text-purple-400 min-w-[1.5rem] text-right">$1.</span><span>$2</span></div>'
  );

  // Handle line breaks
  formattedText = formattedText
    .split("\n")
    .map((line) => {
      if (
        line.includes('<div class="flex items-start') ||
        line.includes("<h2") ||
        line.includes("<h3") ||
        line.includes("<pre") ||
        line.includes("<code") ||
        line.includes('<div class="my-4 rounded-md')
      ) {
        return line;
      }
      return line + "<br />";
    })
    .join("");

  return formattedText;
};

export { hasLearningStructure, extractLearningSteps };

import { printStep } from "../io/terminal.js";
import { bedrockLLM } from "../llm/bedrock.js";
import { AgentState, categorySuggestionSchema } from "../state.js";

function contentToString(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  try {
    const json = JSON.stringify(content);
    return json ?? String(content);
  } catch {
    return String(content);
  }
}

function parseJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return parsed;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = trimmed.slice(start, end + 1);
      const parsed: unknown = JSON.parse(slice);
      return parsed;
    }
    throw new Error("Failed to parse JSON from model output.");
  }
}

export async function categorizeInvoiceTool(
  state: AgentState,
): Promise<Partial<AgentState>> {
  printStep("Categorize Invoice");

  const prompt = [
    "Categorize the invoice into a short category label.",
    "Return ONLY JSON with keys: category, confidence.",
    "Confidence must be a number between 0 and 1.",
    "",
    "Extracted fields:",
    JSON.stringify(state.extracted),
    "",
    "Raw text:",
    state.rawText,
  ].join("\n");

  try {
    const response = await bedrockLLM.invoke([
      ["system", "You categorize invoices."],
      ["human", prompt],
    ]);

    const content = contentToString(response.content);
    const json = parseJsonFromText(content);
    const parsed = categorySuggestionSchema.safeParse(json);

    printStep(JSON.stringify(parsed));

    if (!parsed.success) {
      return {
        errors: [...state.errors, parsed.error.message],
      };
    }

    return { categorySuggestion: parsed.data };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown categorization error";

    printStep(JSON.stringify(error));
    return { errors: [...state.errors, message] };
  }
}

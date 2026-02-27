import { printStep } from "../io/terminal.js";
import { bedrockLLM } from "../llm/bedrock.js";
import {
  AgentState,
  ExtractedInvoice,
  extractedInvoiceSchema,
} from "../state.js";

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

const emptyExtracted: ExtractedInvoice = {
  vendor: null,
  date: null,
  total: null,
  currency: null,
};

export async function extractInvoiceTool(
  state: AgentState,
): Promise<Partial<AgentState>> {
  printStep("Extract Invoice");

  const prompt = [
    "Extract invoice fields from the text below.",
    "Return ONLY JSON with keys: vendor, date, total, currency.",
    "Use null if a field is missing.",
    "Date should be ISO format YYYY-MM-DD if possible.",
    "Total should be a number without currency symbols.",
    "Currency should be ISO 4217 (e.g., USD, EUR) when possible.",
    "",
    "Invoice text:",
    state.rawText,
  ].join("\n");

  try {
    const response = await bedrockLLM.invoke([
      ["system", "You extract structured invoice data."],
      ["human", prompt],
    ]);

    const content = contentToString(response.content);
    const json = parseJsonFromText(content);
    const parsed = extractedInvoiceSchema.safeParse(json);

    if (!parsed.success) {
      return {
        extracted: emptyExtracted,
        errors: [...state.errors, parsed.error.message],
      };
    }

    return { extracted: parsed.data };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown extraction error";
    return {
      extracted: emptyExtracted,
      errors: [...state.errors, message],
    };
  }
}

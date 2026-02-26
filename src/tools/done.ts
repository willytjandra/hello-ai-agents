import { printStep } from "../io/terminal.js";
import { AgentState } from "../state.js";

export async function doneTool(
  state: AgentState,
): Promise<Partial<AgentState>> {
  printStep("Done");

  const extracted = state.extracted ?? {
    vendor: null,
    date: null,
    total: null,
    currency: null,
  };

  console.log("Summary:");
  console.log(`Vendor: ${extracted.vendor ?? "unknown"}`);
  console.log(`Date: ${extracted.date ?? "unknown"}`);
  console.log(`Total: ${extracted.total ?? "unknown"}`);
  console.log(`Currency: ${extracted.currency ?? "unknown"}`);

  if (state.categorySuggestion) {
    const { category, confidence } = state.categorySuggestion;
    console.log(`Category: ${category} (confidence: ${confidence})`);
  } else {
    console.log("Category: unknown");
  }

  if (state.errors.length > 0) {
    console.log("Errors:");
    for (const err of state.errors) {
      console.log(`- ${err}`);
    }
  }

  return {};
}

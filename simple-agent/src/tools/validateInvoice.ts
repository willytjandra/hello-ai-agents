import { printStep } from "../io/terminal.js";
import { AgentState, computeMissingFields } from "../state.js";

export async function validateInvoiceTool(
  state: AgentState,
): Promise<Partial<AgentState>> {
  printStep("Validate Invoice");
  const missingFields = computeMissingFields(state.extracted);
  return { missingFields };
}

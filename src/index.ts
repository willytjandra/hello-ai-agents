import "dotenv/config";
import { buildGraph } from "./graph.js";
import { printStep, promptUser } from "./io/terminal.js";
import { AgentState } from "./state.js";

printStep("Invoice Triage Agent");

const rawText = await promptUser(
  "Paste the invoice text (single line is fine): ",
);

const initialState: AgentState = {
  rawText,
  extracted: null,
  missingFields: [],
  categorySuggestion: null,
  lastQuestion: null,
  errors: [],
  stepCount: 0,
};

const graph = buildGraph();
await graph.invoke(initialState);

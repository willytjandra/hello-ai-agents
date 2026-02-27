import { END, START, StateGraph } from "@langchain/langgraph";
import { printStep } from "./io/terminal.js";
import { AgentState, AgentUpdate, agentStateSchema } from "./state.js";
import { askUserTool } from "./tools/askUser.js";
import { categorizeInvoiceTool } from "./tools/categorizeInvoice.js";
import { doneTool } from "./tools/done.js";
import { extractInvoiceTool } from "./tools/extractInvoice.js";
import { validateInvoiceTool } from "./tools/validateInvoice.js";

export type RouterDecision = "extract" | "askUser" | "categorize" | "done";

const MAX_STEPS = 10;

async function routerNode(state: AgentState): Promise<AgentUpdate> {
  printStep("Router");
  const nextCount = state.stepCount + 1;

  if (nextCount > MAX_STEPS) {
    return {
      stepCount: nextCount,
      errors: [
        ...state.errors,
        `Step limit ${MAX_STEPS} exceeded; exiting to avoid infinite loop.`,
      ],
    };
  }

  return { stepCount: nextCount };
}

function decideNext(state: AgentState): RouterDecision {
  if (state.stepCount > MAX_STEPS) {
    return "done";
  }

  if (state.errors.length !== 0) {
    return "done";
  }

  if (state.extracted === null) {
    return "extract";
  }

  if (state.missingFields.length > 0) {
    return "askUser";
  }

  if (state.categorySuggestion === null) {
    return "categorize";
  }

  return "done";
}

export function buildGraph() {
  const graph = new StateGraph(agentStateSchema)
    .addNode("router", routerNode)
    .addNode("extract", extractInvoiceTool)
    .addNode("validate", validateInvoiceTool)
    .addNode("askUser", askUserTool)
    .addNode("categorize", categorizeInvoiceTool)
    .addNode("done", doneTool)
    .addEdge(START, "router")
    .addConditionalEdges("router", decideNext, {
      extract: "extract",
      askUser: "askUser",
      categorize: "categorize",
      done: "done",
    })
    .addEdge("extract", "validate")
    .addEdge("validate", "router")
    .addEdge("askUser", "validate")
    .addEdge("categorize", "router")
    .addEdge("done", END);

  return graph.compile();
}

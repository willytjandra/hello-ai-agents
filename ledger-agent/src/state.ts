import type { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";
import type { ChartOfAccount } from "./domain/models.js";
import type { MemoryStore } from "./domain/store.js";

export type MessagesValue = BaseMessage[];

export const IntentSchema = z.enum(["add_expense", "unknown"]);

export const ExtractedExpenseSchema = z.object({
  merchant: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().min(1).optional(),
  dateText: z.string().min(1).optional(),
  participants: z.array(z.string().min(1)).optional(),
  categoryHint: z.string().min(1).optional(),
});

export const ExtractResultSchema = z.object({
  intent: IntentSchema,
  extracted: ExtractedExpenseSchema.nullable(),
});

export const CoaAlternativeSchema = z.object({
  accountId: z.string().min(1),
  reason: z.string().min(1),
});

export const CoaSelectionSchema = z.object({
  accountId: z.string().min(1),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1),
  alternatives: z.array(CoaAlternativeSchema).optional(),
});

export type ExtractedExpense = z.infer<typeof ExtractedExpenseSchema>;
export type ExtractResult = z.infer<typeof ExtractResultSchema>;
export type CoaSelection = z.infer<typeof CoaSelectionSchema>;

export type TaskState = {
  intent: "add_expense" | "unknown";
  extracted: ExtractedExpense | null;
  normalized: {
    dateISO?: string;
    paidByName?: string;
    splitType?: "equal" | "custom";
  } | null;
  coa: {
    accounts: ChartOfAccount[] | null;
    selectedAccountId: string | null;
    selectionConfidence: number | null;
    selectionReason: string | null;
    needsUserConfirmation: boolean;
    userConfirmedAccountId: string | null;
  };
  missing: string[];
  created: { ledgerId?: string; expenseId?: string } | null;
};

export type AgentState = {
  messages: MessagesValue;
  task: TaskState;
  ui: { lastQuestion?: string | null };
  memory: MemoryStore;
  errors: string[];
  stepCount: number;
  done: boolean;
};

export function createInitialState(memory: MemoryStore): AgentState {
  return {
    messages: [],
    task: {
      intent: "unknown",
      extracted: null,
      normalized: null,
      coa: {
        accounts: null,
        selectedAccountId: null,
        selectionConfidence: null,
        selectionReason: null,
        needsUserConfirmation: false,
        userConfirmedAccountId: null,
      },
      missing: [],
      created: null,
    },
    ui: { lastQuestion: null },
    memory,
    errors: [],
    stepCount: 0,
    done: false,
  };
}

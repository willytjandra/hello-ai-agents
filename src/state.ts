import { StateSchema } from "@langchain/langgraph";
import { z } from "zod";

export const requiredFields = ["vendor", "date", "total", "currency"] as const;

export const requiredFieldSchema = z.enum(requiredFields);

export type RequiredField = (typeof requiredFields)[number];

function emptyToNull(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value;
}

function numberFromUnknown(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const normalized = value.replace(/[^0-9.-]/g, "");
    if (normalized === "") {
      return null;
    }
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }
  return value;
}

function confidenceFromUnknown(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/%/g, "").trim();
    if (cleaned === "") {
      return value;
    }
    const num = Number(cleaned);
    if (!Number.isFinite(num)) {
      return value;
    }
    return num > 1 && num <= 100 ? num / 100 : num;
  }
  return value;
}

const nullableTrimmedString = z.preprocess(
  emptyToNull,
  z.union([z.string().min(1), z.null()]),
);

const nullableNumber = z.preprocess(
  numberFromUnknown,
  z.union([z.number().finite(), z.null()]),
);

const currencyString = z.preprocess(
  (value) => {
    const normalized = emptyToNull(value);
    if (typeof normalized === "string") {
      return normalized.toUpperCase();
    }
    return normalized;
  },
  z.union([z.string().min(1), z.null()]),
);

export const extractedInvoiceSchema = z.object({
  vendor: nullableTrimmedString,
  date: nullableTrimmedString,
  total: nullableNumber,
  currency: currencyString,
});

export type ExtractedInvoice = z.infer<typeof extractedInvoiceSchema>;

export const categorySuggestionSchema = z.object({
  category: z.string().min(1),
  confidence: z.preprocess(confidenceFromUnknown, z.number().min(0).max(1)),
});

export type CategorySuggestion = z.infer<typeof categorySuggestionSchema>;

export const agentStateSchema = new StateSchema({
  rawText: z.string(),
  extracted: extractedInvoiceSchema.nullable(),
  missingFields: z.array(requiredFieldSchema),
  categorySuggestion: categorySuggestionSchema.nullable(),
  lastQuestion: z.string().nullable(),
  errors: z.array(z.string()),
  stepCount: z.number().int().nonnegative(),
});

export type AgentState = typeof agentStateSchema.State;
export type AgentUpdate = typeof agentStateSchema.Update;

export function computeMissingFields(
  extracted: ExtractedInvoice | null,
): RequiredField[] {
  if (!extracted) {
    return [...requiredFields];
  }

  return requiredFields.filter((field) => {
    const value = extracted[field];
    return value === null || value === "";
  });
}

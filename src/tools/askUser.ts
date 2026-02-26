import { z } from "zod";
import { printStep, promptUser } from "../io/terminal.js";
import {
  AgentState,
  ExtractedInvoice,
  RequiredField,
  computeMissingFields,
} from "../state.js";

type ParsedField =
  | { ok: true; value: ExtractedInvoice[RequiredField] }
  | { ok: false; error: string };

const nonEmptyString = z.string().min(1);
const totalSchema = z.number();

function parseFieldValue(field: RequiredField, input: string): ParsedField {
  const trimmed = input.trim();

  if (field === "total") {
    const normalized = trimmed.replace(/[^\d.-]/g, "");
    const numberValue = Number(normalized);
    const result = totalSchema.safeParse(numberValue);
    if (!result.success) {
      return { ok: false, error: "Total must be a valid number." };
    }
    return { ok: true, value: result.data };
  }

  const textResult = nonEmptyString.safeParse(trimmed);
  if (!textResult.success) {
    return { ok: false, error: "Value cannot be empty." };
  }

  const value =
    field === "currency" ? textResult.data.toUpperCase() : textResult.data;

  return { ok: true, value };
}

function updateExtracted(
  extracted: ExtractedInvoice,
  field: RequiredField,
  value: ExtractedInvoice[RequiredField],
): ExtractedInvoice {
  switch (field) {
    case "vendor":
      return { ...extracted, vendor: value as string };
    case "date":
      return { ...extracted, date: value as string };
    case "total":
      return { ...extracted, total: value as number };
    case "currency":
      return { ...extracted, currency: value as string };
  }
}

export async function askUserTool(
  state: AgentState,
): Promise<Partial<AgentState>> {
  printStep("Ask User");

  if (state.missingFields.length === 0) {
    return {};
  }

  const field = state.missingFields[0];
  const question = `Please provide the invoice ${field}: `;
  const answer = await promptUser(question);

  const parsed = parseFieldValue(field, answer);
  if (!parsed.ok) {
    return {
      lastQuestion: question,
      errors: [...state.errors, parsed.error],
    };
  }

  const base: ExtractedInvoice = state.extracted ?? {
    vendor: null,
    date: null,
    total: null,
    currency: null,
  };

  const updated = updateExtracted(base, field, parsed.value);
  const missingFields = computeMissingFields(updated);

  printStep(JSON.stringify(updated));

  return {
    extracted: updated,
    missingFields,
    lastQuestion: question,
  };
}

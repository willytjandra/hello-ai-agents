import type { ChartOfAccount } from "../models.js";

export const HARD_CODED_COA: ChartOfAccount[] = [
  {
    id: "coa_meals",
    code: "6001",
    name: "Meals and Entertainment",
    type: "EXPENSE",
  },
  {
    id: "coa_travel",
    code: "6002",
    name: "Travel",
    type: "EXPENSE",
  },
  {
    id: "coa_supplies",
    code: "6003",
    name: "Office Supplies",
    type: "EXPENSE",
  },
  {
    id: "coa_utilities",
    code: "6004",
    name: "Utilities",
    type: "EXPENSE",
  },
  {
    id: "coa_advertising",
    code: "6005",
    name: "Advertising",
    type: "EXPENSE",
  },
  {
    id: "coa_sales",
    code: "4001",
    name: "Sales",
    type: "INCOME",
  },
];

export function listCoaAccounts(): ChartOfAccount[] {
  return [...HARD_CODED_COA];
}

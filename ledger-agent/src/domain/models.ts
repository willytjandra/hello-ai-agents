export type User = {
  id: string;
  name: string;
};

export type Ledger = {
  id: string;
  name: string;
  memberIds: string[];
};

export type ChartOfAccount = {
  id: string;
  code: string;
  name: string;
  type: "EXPENSE" | "INCOME";
};

export type Split = {
  type: "EQUAL" | "CUSTOM";
  shares: Record<string, number>;
};

export type Expense = {
  id: string;
  ledgerId: string;
  merchant: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  paidBy: string;
  notes?: string;
  receiptPath?: string;
};

export type Invite = {
  id: string;
  ledgerId: string;
  invitedName: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
};

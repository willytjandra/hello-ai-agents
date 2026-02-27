import type { Expense, Invite, Ledger, User } from "./models.js";

export type IdCounters = {
  user: number;
  ledger: number;
  expense: number;
  invite: number;
};

export type MemoryStore = {
  users: User[];
  ledgers: Ledger[];
  expenses: Expense[];
  invites: Invite[];
  counters: IdCounters;
};

export const CURRENT_USER: User = {
  id: "u_me",
  name: "Me",
};

export function createStore(): MemoryStore {
  return {
    users: [CURRENT_USER],
    ledgers: [],
    expenses: [],
    invites: [],
    counters: {
      user: 1,
      ledger: 1,
      expense: 1,
      invite: 1,
    },
  };
}

function nextId(
  store: MemoryStore,
  key: keyof IdCounters,
  prefix: string,
): string {
  const value = store.counters[key];
  store.counters[key] = value + 1;
  return `${prefix}_${value}`;
}

export function findUserByName(
  store: MemoryStore,
  name: string,
): User | undefined {
  const normalized = name.trim().toLowerCase();
  return store.users.find((u) => u.name.toLowerCase() === normalized);
}

export function findUserById(
  store: MemoryStore,
  userId: string,
): User | undefined {
  return store.users.find((u) => u.id === userId);
}

export function addUser(store: MemoryStore, name: string): User {
  const user: User = {
    id: nextId(store, "user", "u"),
    name,
  };
  store.users.push(user);
  return user;
}

export function findLedgerByName(
  store: MemoryStore,
  name: string,
): Ledger | undefined {
  const normalized = name.trim().toLowerCase();
  return store.ledgers.find((l) => l.name.toLowerCase() === normalized);
}

export function findLedgerById(
  store: MemoryStore,
  ledgerId: string,
): Ledger | undefined {
  return store.ledgers.find((l) => l.id === ledgerId);
}

export function addLedger(
  store: MemoryStore,
  name: string,
  memberIds: string[],
): Ledger {
  const ledger: Ledger = {
    id: nextId(store, "ledger", "l"),
    name,
    memberIds,
  };
  store.ledgers.push(ledger);
  return ledger;
}

export function addInvite(
  store: MemoryStore,
  ledgerId: string,
  invitedName: string,
): Invite {
  const invite: Invite = {
    id: nextId(store, "invite", "inv"),
    ledgerId,
    invitedName,
    status: "PENDING",
  };
  store.invites.push(invite);
  return invite;
}

export function addExpense(
  store: MemoryStore,
  input: Omit<Expense, "id">,
): Expense {
  const expense: Expense = {
    id: nextId(store, "expense", "e"),
    ...input,
  };
  store.expenses.push(expense);
  return expense;
}

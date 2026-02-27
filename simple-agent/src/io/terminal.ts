import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

export async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(question);
    return answer.trim();
  } finally {
    rl.close();
  }
}

export function printStep(step: string): void {
  console.log(`\n=== ${step} ===`);
}

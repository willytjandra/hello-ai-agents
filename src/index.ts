import "dotenv/config";
import { bedrockLLM } from "./llm/bedrock.js";

const response = await bedrockLLM.invoke([
  ["system", "You are a helpful assistant"],
  ["human", "Say hello in one short sentence"],
]);

console.log(response.content);

import { ChatBedrockConverse } from "@langchain/aws";
import z from "zod";

const envSchema = z.object({
  MODEL_ID: z.string().min(1),
  REGION: z.string().min(1),
});

const env = envSchema.parse(process.env);

export const bedrockLLM = new ChatBedrockConverse({
  model: env.MODEL_ID,
  region: env.REGION ?? "ap-southeast-2",
  maxTokens: 4096,
  temperature: 0.5,
});

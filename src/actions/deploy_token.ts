import { Action } from "../types/action";
import { SonicAgentKit } from "../agent";
import { z } from "zod";
import { deployToken } from "../tools";
import { debug } from "../utils/debug";

const deployTokenAction: Action = {
  name: "DEPLOY_TOKEN_ACTION",
  similes: [
    "create token",
    "deploy token",
    "launch token",
    "create new token",
    "deploy new token",
  ],
  description: `Deploy a new BEP20 token on BNB Chain.
  Requires name, symbol, initial supply and metadata URI.
  Initial supply will be in token units.`,
  examples: [
    [
      {
        input: {
          name: "My Token",
          symbol: "MTK",
          initialSupply: 1000000,
          uri: "https://metadata.url",
        },
        output: {
          status: "success",
          contractAddress: "0xabc...",
        },
        explanation: "Deploy a new token with 1M supply",
      },
    ],
  ],
  schema: z.object({
    name: z.string(),
    symbol: z.string(),
    initialSupply: z.number(),
    uri: z.string().url(),
  }),
  handler: async (agent: SonicAgentKit, input: Record<string, any>) => {
    debug.log("=== DEPLOY TOKEN ACTION START ===");
    debug.log("Input:", input);

    const contractAddress = await deployToken(
      agent,
      input.name,
      input.symbol,
      input.initialSupply,
      input.uri,
    );

    const result = {
      status: "success",
      contractAddress,
    };
    debug.log("=== DEPLOY TOKEN ACTION END ===");
    debug.log("Result:", result);

    return result;
  },
};

export default deployTokenAction;

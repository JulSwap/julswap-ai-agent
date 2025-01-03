import { Action } from "../types/action";
import { JulswapAgentKit } from "../agent";
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
  description: `Deploy a new BEP20 token on BSC.
  Requires name, symbol, and initial supply.
  Initial supply will be in token units.`,
  examples: [
    [
      {
        input: {
          name: "My Token",
          symbol: "MTK",
          initialSupply: 1000000,
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
  }),
  handler: async (agent: JulswapAgentKit, input: Record<string, any>) => {
    debug.log("=== DEPLOY TOKEN ACTION START ===");
    debug.log("Input:", input);

    const contractAddress = await deployToken(
      agent,
      input.name,
      input.symbol,
      input.initialSupply,
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

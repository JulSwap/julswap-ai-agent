import { Action } from "../types/action";
import { SonicAgentKit } from "../agent";
import { z } from "zod";
import { get_balance } from "../tools";
import { debug } from "../utils/debug";

const balanceAction: Action = {
  name: "BALANCE_ACTION",
  similes: [
    "check balance",
    "get wallet balance",
    "view balance",
    "show balance",
    "check token balance",
  ],
  description: `Get the BNB balance of a wallet address.
  If you want to get the balance of your wallet, you don't need to provide the tokenAddress.
  Balance will be returned in BNB.`,
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          balance: "100",
          token: "BNB",
        },
        explanation: "Get BNB balance of the wallet",
      },
    ],
    [
      {
        input: {
          tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          balance: "1000",
          token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        explanation: "Get USDC token balance",
      },
    ],
  ],
  schema: z.object({
    tokenAddress: z.string().optional(),
  }),
  handler: async (agent: SonicAgentKit, input: Record<string, any>) => {
    debug.log("=== BALANCE ACTION START ===");
    debug.log("Input:", input);
    debug.log("Agent wallet:", agent.wallet_address);

    const balance = await get_balance(agent, input.tokenAddress);
    debug.log("Retrieved balance:", balance);

    const result = {
      status: "success",
      balance: balance,
      token: input.tokenAddress || "BNB",
    };
    debug.log("=== BALANCE ACTION END ===");
    debug.log("Result:", result);

    return result;
  },
};

export default balanceAction;

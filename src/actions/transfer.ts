import { Action } from "../types/action";
import { SonicAgentKit } from "../agent";
import { z } from "zod";
import { transfer } from "../tools";
import { debug } from "../utils/debug";

const transferAction: Action = {
  name: "TRANSFER_ACTION",
  similes: [
    "send tokens",
    "transfer funds",
    "send money",
    "transfer tokens",
    "send BNB",
  ],
  description: `Transfer BNB or tokens to another address.
  If you want to transfer BNB, you don't need to provide the tokenAddress.
  Amount will be in BNB or token units.`,
  examples: [
    [
      {
        input: {
          to: "0x123...",
          amount: 1.5,
        },
        output: {
          status: "success",
          hash: "0xabc...",
          token: "BNB",
        },
        explanation: "Transfer 1.5 BNB",
      },
    ],
  ],
  schema: z.object({
    to: z.string(),
    amount: z.number(),
    tokenAddress: z.string().optional(),
  }),
  handler: async (agent: SonicAgentKit, input: Record<string, any>) => {
    debug.log("=== TRANSFER ACTION START ===");
    debug.log("Input:", input);

    const hash = await transfer(
      agent,
      input.to,
      input.amount,
      input.tokenAddress,
    );

    const result = {
      status: "success",
      hash: hash,
      token: input.tokenAddress || "BNB",
    };
    debug.log("=== TRANSFER ACTION END ===");
    debug.log("Result:", result);

    return result;
  },
};

export default transferAction;

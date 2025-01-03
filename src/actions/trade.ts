import { Action } from "../types/action";
import { SonicAgentKit } from "../agent";
import { z } from "zod";
import { trade } from "../tools";
import { debug } from "../utils/debug";

const tradeAction: Action = {
  name: "TRADE_ACTION",
  similes: ["swap tokens", "exchange tokens", "trade tokens", "convert tokens"],
  description: `Trade tokens on BSC using OpenOcean.
  Requires: from token, to token, and amount.
  Slippage is optional (default 1%).`,
  examples: [
    [
      {
        input: {
          fromToken: "0x...", // USDT
          toToken: "0x...", // BUSD
          amount: "100",
          slippage: 1,
        },
        output: {
          status: "success",
          txHash: "0x...",
        },
        explanation: "Swap 100 USDT to BUSD with 1% slippage",
      },
    ],
  ],
  schema: z.object({
    fromToken: z.string(),
    toToken: z.string(),
    amount: z.string(),
    slippage: z.number().optional(),
  }),
  handler: async (agent: SonicAgentKit, input: Record<string, any>) => {
    debug.log("=== TRADE ACTION START ===");
    debug.log("Input:", input);

    const txHash = await trade(
      agent,
      input.fromToken,
      input.toToken,
      input.amount,
      input.slippage,
    );

    const result = {
      status: "success",
      txHash,
    };

    debug.log("=== TRADE ACTION END ===");
    debug.log("Result:", result);

    return result;
  },
};

export default tradeAction; 
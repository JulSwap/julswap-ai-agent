import { Action } from "../types/action";
import { JulswapAgentKit } from "../agent";
import { z } from "zod";
import { fetchPrice } from "../tools";
import { debug } from "../utils/debug";

const priceAction: Action = {
  name: "PRICE_ACTION",
  similes: [
    "check price",
    "get token price",
    "view price",
    "show price",
    "token price",
  ],
  description: `Get the price of a token on BSC.
  Requires token contract address.
  Price will be returned in USD.`,
  examples: [
    [
      {
        input: {
          tokenAddress: "0xf5d8015d625be6f59b8073c8189bd51ba28792e1",
        },
        output: {
          status: "success",
          price: "$0.00199141148567287",
          name: "Example Token",
          token: "0xf5d8015d625be6f59b8073c8189bd51ba28792e1",
        },
        explanation: "Get price of token in USD",
      },
    ],
  ],
  schema: z.object({
    tokenAddress: z.string(),
  }),
  handler: async (agent: JulswapAgentKit, input: Record<string, any>) => {
    debug.log("=== PRICE ACTION START ===");
    debug.log("Input:", input);

    const { price, name } = await fetchPrice(input.tokenAddress);

    const result = {
      status: "success",
      price: `$${price}`,
      name,
      token: input.tokenAddress,
    };
    debug.log("=== PRICE ACTION END ===");
    debug.log("Result:", result);

    return result;
  },
};

export default priceAction; 
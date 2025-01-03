import { z } from "zod";
import { Action } from "../types/action";
import {
  getTokenDataByAddress,
  getTokenDataByTicker,
} from "../tools/get_token_data";

export const getTokenDataByAddressAction: Action = {
  name: "get_token_data_by_address",
  description: "Get detailed token information by address",
  similes: ["token info", "token details", "token data"],
  schema: z.object({
    address: z.string(),
  }),
  examples: [
    [
      {
        input: { address: "0xf5d8015d625be6f59b8073c8189bd51ba28792e1" },
        output: {
          /* token data */
        },
        explanation: "Get token data using contract address",
      },
    ],
  ],
  handler: async (agent, input) => {
    const data = await getTokenDataByAddress(agent, input.address);
    return { data };
  },
};

export const getTokenDataByTickerAction: Action = {
  name: "get_token_data_by_ticker",
  description: "Get detailed token information by ticker symbol",
  similes: ["token info", "token details", "token data"],
  schema: z.object({
    ticker: z.string(),
  }),
  examples: [
    [
      {
        input: { ticker: "JULD" },
        output: {
          /* token data */
        },
        explanation: "Get token data using ticker symbol",
      },
    ],
  ],
  handler: async (agent, input) => {
    const data = await getTokenDataByTicker(input.ticker, agent);
    return { data };
  },
};

export default {
  getTokenDataByAddressAction,
  getTokenDataByTickerAction,
};

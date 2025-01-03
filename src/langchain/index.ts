import { Tool } from "langchain/tools";
import { JulswapAgentKit } from "../index";
import { ACTIONS } from "../actions";
import { debug } from "../utils/debug";
import { BNB_ADDRESS, BUSD_ADDRESS, DEFAULT_SLIPPAGE } from "../constants";

export class SonicBalanceTool extends Tool {
  name = "sonic_balance";
  description = `Get the BNB balance of a wallet address.
  Current wallet address: ${this.sonickit.wallet_address}
  If no address is provided, returns the agent's own wallet balance.
  Balance will be returned in BNB.`;

  constructor(private sonickit: JulswapAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const result = await ACTIONS.BALANCE_ACTION.handler(this.sonickit, {
        tokenAddress: input || undefined,
      });
      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}

export class SonicTransferTool extends Tool {
  name = "sonic_transfer";
  description = `Transfer BNB or tokens to another address.
  Current wallet address: ${this.sonickit?.wallet_address}
  Format: transfer {amount} BNB to {address}
  Example: transfer 0.1 BNB to 0x1234...`;

  constructor(private sonickit: JulswapAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      debug.log("Transfer input:", input);

      // Parse amount and address from input string
      const match = input.match(
        /transfer\s+([\d.]+)\s*bnb\s+to\s+(0x[a-fA-F0-9]{40})/i,
      );
      if (!match) {
        throw new Error(
          "Invalid input format. Expected: 'transfer {amount} BNB to {address}'",
        );
      }

      const [, amount, to] = match;
      const parsedInput = {
        to: to,
        amount: parseFloat(amount),
      };

      debug.log("Parsed transfer input:", parsedInput);

      const result = await ACTIONS.TRANSFER_ACTION.handler(
        this.sonickit,
        parsedInput,
      );
      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}

export class SonicDeployTokenTool extends Tool {
  name = "sonic_deploy_token";
  description = `Deploy a new token on the blockchain.
  Current wallet address: ${this.sonickit?.wallet_address}
  Format: deploy_token {name} {symbol} {initial_supply}
  Example: deploy_token "My Token" MTK 1000000`;

  constructor(private sonickit: JulswapAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      debug.log("Deploy token input:", input);

      // Parse token details from input string
      const match = input.match(
        /(?:create|deploy|launch)?\s*(?:a\s+)?(?:new\s+)?token\s*"?([^"\n]+)"?\s+(\w+)\s+(\d+)/i,
      );
      if (!match) {
        throw new Error(
          "Please provide: token name, symbol and initial supply. " +
            "For example: 'create token My Token MTK 1000000' or 'deploy token Test TTK 500000'",
        );
      }

      const [, name, symbol, supply] = match;
      const parsedInput = {
        name,
        symbol,
        initialSupply: parseInt(supply),
      };

      debug.log("Parsed deploy input:", parsedInput);

      const result = await ACTIONS.DEPLOY_TOKEN_ACTION.handler(
        this.sonickit,
        parsedInput,
      );

      return JSON.stringify({
        status: "success",
        contractAddress: result,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}

export class SonicPriceTool extends Tool {
  name = "sonic_price";
  description = `Get the price of a token on BSC.
  Format: get price {token_address}
  Example: get price 0xf5d8015d625be6f59b8073c8189bd51ba28792e1
  Price will be returned in USD.`;

  constructor(private sonickit: JulswapAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      debug.log("Price input:", input);

      // Extract any ethereum address from the input
      const address = input.match(/0x[a-fA-F0-9]{40}/i)?.[0];
      if (!address) {
        throw new Error("Please provide a token address to check its price.");
      }

      const result = await ACTIONS.PRICE_ACTION.handler(this.sonickit, {
        tokenAddress: address,
      });

      return `The price of the token with address \`${address}\` is **$${result.price}** USD.`;
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}

export class SonicTradeTool extends Tool {
  name = "sonic_trade";
  description = `Trade tokens on BSC.
  You can use token symbols (like BNB, BUSD) or contract addresses.
  Examples: 
  - trade bnb to 0xf5d8...
  - trade 0.1 bnb to busd
  - trade 100 busd to bnb`;

  constructor(private sonickit: JulswapAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      debug.log("Trade input:", input);

      // Extract amount if present, default to 0.1 if not specified
      const amount = input.match(/[\d.]+/)?.[0];

      // Extract any ethereum address
      const address = input.match(/0x[a-fA-F0-9]{40}/i)?.[0];

      // Determine from/to tokens based on input
      const isFromBnb = input.toLowerCase().includes("bnb to");
      const isToBnb = input.toLowerCase().includes("to bnb");

      const fromToken = isFromBnb ? BNB_ADDRESS : address;
      const toToken = isToBnb ? BNB_ADDRESS : address;

      const result = await ACTIONS.TRADE_ACTION.handler(this.sonickit, {
        fromToken,
        toToken,
        amount,
        slippage: DEFAULT_SLIPPAGE,
      });

      return `Successfully traded ${amount} tokens. Transaction hash: ${result.txHash}`;
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
      });
    }
  }
}

export function createSonicTools(sonicKit: JulswapAgentKit) {
  return [
    new SonicBalanceTool(sonicKit),
    new SonicTransferTool(sonicKit),
    new SonicDeployTokenTool(sonicKit),
    new SonicPriceTool(sonicKit),
    new SonicTradeTool(sonicKit),
  ];
}

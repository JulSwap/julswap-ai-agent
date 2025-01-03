import { Tool } from "langchain/tools";
import { SonicAgentKit } from "../index";
import { ACTIONS } from "../actions";
import { debug } from "../utils/debug";

export class SonicBalanceTool extends Tool {
  name = "sonic_balance";
  description = `Get the BNB balance of a wallet address.
  Current wallet address: ${this.sonickit.wallet_address}
  If no address is provided, returns the agent's own wallet balance.
  Balance will be returned in BNB.`;

  constructor(private sonickit: SonicAgentKit) {
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

  constructor(private sonickit: SonicAgentKit) {
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
  Format: deploy_token {name} {symbol} {initial_supply} {uri}
  Example: deploy_token "My Token" MTK 1000000 "https://metadata.url"`;

  constructor(private sonickit: SonicAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      debug.log("Deploy token input:", input);

      // Parse token details from input string
      const match = input.match(
        /deploy_token\s+"([^"]+)"\s+(\w+)\s+(\d+)\s+"([^"]+)"/i,
      );
      if (!match) {
        throw new Error(
          'Invalid input format. Expected: deploy_token "Token Name" SYMBOL 1000000 "https://metadata.url"',
        );
      }

      const [, name, symbol, supply, uri] = match;
      const parsedInput = {
        name,
        symbol,
        initialSupply: parseInt(supply),
        uri,
      };

      debug.log("Parsed deploy input:", parsedInput);

      const result = await deployToken(
        this.sonickit,
        parsedInput.name,
        parsedInput.symbol,
        parsedInput.initialSupply,
        parsedInput.uri,
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

export function createSonicTools(sonicKit: SonicAgentKit) {
  return [
    new SonicBalanceTool(sonicKit),
    new SonicTransferTool(sonicKit),
    new SonicDeployTokenTool(sonicKit),
  ];
}

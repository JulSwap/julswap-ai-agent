import { SonicAgentKit } from "../agent";
import { debug } from "../utils/debug";

/**
 * Get the balance of BNB for a wallet
 * @param agent - SonicAgentKit instance
 * @param wallet_address - Optional wallet address. If not provided, returns agent's wallet balance
 * @returns Promise resolving to the balance in BNB
 */
export async function get_balance(
  agent: SonicAgentKit,
  wallet_address?: string,
): Promise<number> {
  debug.log("=== GET_BALANCE START ===");
  debug.log("Input wallet_address:", wallet_address);
  debug.log("Agent wallet_address:", agent.wallet_address);

  const address = wallet_address || agent.wallet_address;
  debug.log("Using address:", address);

  const balanceWei = await agent.connection.eth.getBalance(address);
  debug.log("Balance in Wei:", balanceWei);

  const balanceEth = Number(
    agent.connection.utils.fromWei(balanceWei, "ether"),
  );
  debug.log("Balance in BNB:", balanceEth);
  debug.log("=== GET_BALANCE END ===");

  return balanceEth;
}

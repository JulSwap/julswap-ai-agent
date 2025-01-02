import { SonicAgentKit } from "../agent";

/**
 * Get the balance of SOL or an SPL token for the agent's wallet
 * @param agent - SonicAgentKit instance
 * @param wallet_address - Optional wallet address. If not provided, returns 0
 * @returns Promise resolving to the balance as a number
 */
export async function get_balance(
  agent: SonicAgentKit,
  wallet_address?: string,
): Promise<number> {
  if (!wallet_address) {
    return 0;
  }
  const balanceWei = await agent.connection.eth.getBalance(wallet_address);
  return balanceWei || 0;
}

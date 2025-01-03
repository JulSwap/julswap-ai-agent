import { SonicAgentKit } from "../index";
import { getAllTld } from "@onsol/tldparser";

/**
 * Get all active top-level domains (TLDs) in the AllDomains Name Service
 * @param agent SonicAgentKit instance
 * @returns Array of active TLD strings
 */
export async function getAllDomainsTLDs(
  agent: SonicAgentKit,
): Promise<string[]> {
  try {
    const tlds = await getAllTld(agent.connection);
    return tlds.map((tld) => String(tld.tld));
  } catch (error: any) {
    throw new Error(`Failed to fetch TLDs: ${error.message}`);
  }
}

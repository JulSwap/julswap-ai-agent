import { JulswapAgentKit } from "../index";
import { debug } from "../utils/debug";
/**
 * Fetch the token price on BSC using GeckoTerminal API v2
 * @param tokenId The token contract address
 * @returns The token price in USD
 */
export interface TokenPriceResponse {
  price: string;
  name?: string;
}

export async function fetchPrice(tokenId: string): Promise<TokenPriceResponse> {
  try {
    debug.log("=== FETCH PRICE START ===");
    debug.log("Token ID:", tokenId);
    // Convert token address to lowercase for consistent comparison
    const normalizedTokenId = tokenId.toLowerCase();
    const url = `https://api.geckoterminal.com/api/v2/simple/networks/bsc/token_price/${normalizedTokenId}`;
    debug.log("URL:", url);
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    };

    const response = await fetch(url, { ...options, cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }

    const data = await response.json();
    debug.log("Raw response:", data);

    // Use normalized token address for lookup
    const price = data.data?.attributes?.token_prices?.[normalizedTokenId];
    debug.log("Price:", price);

    if (!price) {
      throw new Error("Price data not available for the given token.");
    }

    return {
      price,
    };
  } catch (error: any) {
    throw new Error(`Price fetch failed: ${error.message}`);
  }
}

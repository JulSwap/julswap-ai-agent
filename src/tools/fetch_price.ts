import { JulswapAgentKit } from "../index";
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
    const url = `https://api.geckoterminal.com/api/v2/simple/networks/bsc/token_price/${tokenId}`;

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
    const price = data.data?.attributes?.token_prices?.[tokenId];
    const name = data.data?.attributes?.name || "Unknown Token";

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

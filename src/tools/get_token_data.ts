import { EvmTokenData } from "../types";
import { JulswapAgentKit } from "../agent";

export async function getTokenDataByAddress(
  agent: JulswapAgentKit,
  mint: string,
): Promise<EvmTokenData | undefined> {
  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/${agent.chain}/tokens/${mint}`;
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch token data: ${response.statusText}`);
    }

    const data = await response.json();
    const attrs = data.data?.attributes;

    if (!attrs) {
      return undefined;
    }

    // Format numbers to be human readable
    const formatNumber = (num: string | number) => {
      const value = Number(num);
      if (value >= 1e9) {
        return `${(value / 1e9).toFixed(2)}B`;
      } else if (value >= 1e6) {
        return `${(value / 1e6).toFixed(2)}M`;
      } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(2)}K`;
      }
      return value.toLocaleString('en-US', {
        maximumFractionDigits: 2
      });
    };

    // Convert total supply from wei to tokens
    const totalSupply = attrs.total_supply 
      ? Number(attrs.total_supply) / Math.pow(10, attrs.decimals)
      : 0;

    return {
      address: mint,
      name: attrs.name,
      symbol: attrs.symbol,
      decimals: attrs.decimals,
      totalSupply: formatNumber(totalSupply),
      price: `$${Number(attrs.price_usd).toFixed(6)}`,
      fdv: `$${formatNumber(attrs.fdv_usd)}`,
      marketCap: `$${formatNumber(attrs.market_cap_usd)}`,
      volume24h: `$${formatNumber(attrs.volume_usd.h24)}`,
    };
  } catch (error: any) {
    console.error("Error fetching token data:", error);
    return undefined;
  }
}

export async function getTokenAddressFromTicker(
  ticker: string,
  agent: JulswapAgentKit,
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${ticker}`,
    );
    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return null;
    }

    // Filter for Solana pairs only and sort by FDV
    const evmPairs = data.pairs
      .filter((pair: any) => pair.chainId === agent.chain)
      .sort((a: any, b: any) => (b.fdv || 0) - (a.fdv || 0));

    const tokenPairs = evmPairs.filter(
      (pair: any) =>
        pair.baseToken.symbol.toLowerCase() === ticker.toLowerCase(),
    );

    // Return the address of the highest FDV Solana pair
    return tokenPairs[0].baseToken.address;
  } catch (error) {
    console.error("Error fetching token address from DexScreener:", error);
    return null;
  }
}

export async function getTokenDataByTicker(
  ticker: string,
  agent: JulswapAgentKit,
): Promise<EvmTokenData | undefined> {
  const address = await getTokenAddressFromTicker(ticker, agent);
  if (!address) {
    throw new Error(`Token address not found for ticker: ${ticker}`);
  }
  return getTokenDataByAddress(agent, address);
}

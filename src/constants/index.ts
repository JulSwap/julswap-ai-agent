/**
 * Common token addresses used across the toolkit
 */
export const BNB_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
export const BUSD_ADDRESS = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";

export const DEFAULT_SLIPPAGE = 1;
/**
 * Jupiter API URL
 */
export const OPEN_OCEAN_API_URL = "https://open-api-pro.openocean.finance";
export const REFERRAL_ADDRESS = "0x7A0e07F5235DEaF86d781EFb22584cFC14a26850";

export const CHAINS = [
  {
    id: 1,
    name: "eth",
  },
  {
    id: 56,
    name: "bsc",
  },
  {
    id: 137,
    name: "polygon",
  },
  {
    id: 43114,
    name: "avalanche",
  },
  {
    id: 42161,
    name: "arb",
  },
  {
    id: 10,
    name: "op",
  },
  {
    id: 136,
    name: "sonic",
  },
] as const;

export const DEFAULT_CHAIN_ID = 56; // BSC Mainnet

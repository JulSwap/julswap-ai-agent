import { PublicKey } from "@solana/web3.js";

/**
 * Common token addresses used across the toolkit
 */
export const DEFAULT_OPTIONS = {
  SLIPPAGE_BPS: 300,
  TOKEN_DECIMALS: 9,
  RERERRAL_FEE: 200,
} as const;

/**
 * Jupiter API URL
 */
export const JUP_API = "https://quote-api.jup.ag/v6";
export const JUP_REFERRAL_ADDRESS =
  "REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3";

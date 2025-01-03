import Web3 from "web3";
import { debug } from "../utils/debug";
// import { DEFAULT_OPTIONS } from "../constants";
import { Config } from "../types";
import {
  get_balance,
  fetchPrice,
  transfer,
  /* deploy_collection,
  deploy_token,
  get_balance_other,
  getTPS,
  resolveSolDomain,
  getPrimaryDomain,
  launchPumpFunToken,
  lendAsset,
  mintCollectionNFT,
  openbookCreateMarket,
  manifestCreateMarket,
  raydiumCreateAmmV4,
  raydiumCreateClmm,
  raydiumCreateCpmm,
  registerDomain,
  request_faucet_funds,
  trade,
  limitOrder,
  cancelAllOrders,
  withdrawAll,
  transfer,
  getTokenDataByAddress,
  getTokenDataByTicker,
  stakeWithJup,
  sendCompressedAirdrop,
  orcaCreateSingleSidedLiquidityPool,
  orcaCreateCLMM,
  orcaOpenCenteredPositionWithLiquidity,
  orcaOpenSingleSidedPosition,
  FEE_TIERS,
  fetchPrice,
  pythFetchPrice,
  getAllDomainsTLDs,
  getAllRegisteredAllDomains,
  getOwnedDomainsForTLD,
  getMainAllDomainsDomain,
  getOwnedAllDomains,
  resolveAllDomains,
  create_gibwork_task,
  orcaClosePosition,
  orcaFetchPositions,
  rock_paper_scissor,
  create_TipLink,
  listNFTForSale,
  cancelListing, */
} from "../tools";
import type { TokenPriceResponse } from "../tools/fetch_price";

/* import {
  CollectionDeployment,
  CollectionOptions,
  GibworkCreateTaskReponse,
  JupiterTokenData,
  MintCollectionNFTResponse,
  PumpfunLaunchResponse,
  PumpFunTokenOptions,
} from "../types"; */

/**
 * Main class for interacting with Solana blockchain
 * Provides a unified interface for token operations, NFT management, trading and more
 *
 * @class SonicAgentKit
 * @property {Connection} connection - Solana RPC connection
 * @property {Keypair} wallet - Wallet keypair for signing transactions
 * @property {PublicKey} wallet_address - Public key of the wallet
 * @property {Config} config - Configuration object
 */
export class SonicAgentKit {
  public connection: any;
  public wallet_address: string;
  public config: Config;

  /**
   * @deprecated Using openai_api_key directly in constructor is deprecated.
   * Please use the new constructor with Config object instead:
   * @example
   * const agent = new SonicAgentKit(privateKey, rpcUrl, {
   *   OPENAI_API_KEY: 'your-key'
   * });
   */
  constructor(
    private_key: string,
    rpc_url: string,
    configOrKey: Config | string | null,
  ) {
    const web3 = new Web3(rpc_url);
    this.connection = web3;
    // Add 0x prefix if not present
    const formattedKey = private_key.startsWith("0x")
      ? private_key
      : `0x${private_key}`;
    try {
      const account = web3.eth.accounts.privateKeyToAccount(formattedKey);
      this.wallet_address = account.address;

      debug.log("Wallet address:", this.wallet_address);

      if (!this.wallet_address) {
        throw new Error("Invalid private key");
      }
    } catch (error: any) {
      throw new Error(`Failed to initialize wallet: ${error.message}`);
    }

    // Handle both old and new patterns
    if (typeof configOrKey === "string" || configOrKey === null) {
      this.config = { OPENAI_API_KEY: configOrKey || "" };
    } else {
      this.config = configOrKey;
    }
  }

  // Tool methods

  async getBalance(walletAddress?: string): Promise<number> {
    return get_balance(this, walletAddress);
  }
  async fetchPrice(tokenId: string): Promise<TokenPriceResponse> {
    return fetchPrice(tokenId);
  }

}

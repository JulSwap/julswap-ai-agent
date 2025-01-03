import { SonicAgentKit } from "../agent";
import { debug } from "../utils/debug";
import { TOKEN_METADATA } from "../constants/token_metadata";

const CONTRACT_ABI = TOKEN_METADATA.ABI;
const CONTRACT_BYTECODE = TOKEN_METADATA.BYTECODE;

export async function deployToken(
  agent: SonicAgentKit,
  name: string,
  symbol: string,
  initialSupply: number,
): Promise<string> {
  debug.log("=== DEPLOY TOKEN START ===");
  debug.log("Name:", name);
  debug.log("Symbol:", symbol);
  debug.log("Initial Supply:", initialSupply);

  try {
    const web3 = agent.connection;
    const contract = new web3.eth.Contract(CONTRACT_ABI);
    const deploy = contract.deploy({
      data: CONTRACT_BYTECODE,
      arguments: [
        name,
        symbol,
        web3.utils.toWei(initialSupply.toString(), "ether"),
      ],
    });

    // First estimate gas
    const gas = await deploy.estimateGas({
      from: agent.wallet_address,
    });

    // Get nonce and gas price
    const [nonce, gasPrice] = await Promise.all([
      web3.eth.getTransactionCount(agent.wallet_address),
      web3.eth.getGasPrice(),
    ]);

    // Create transaction
    const tx = {
      from: agent.wallet_address,
      nonce: nonce,
      gas: Math.round(gas * 1.2), // Add 20% buffer
      gasPrice: gasPrice,
      data: deploy.encodeABI(),
    };

    // Sign and send
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      process.env.SONIC_PRIVATE_KEY!,
    );

    if (!signedTx.rawTransaction) {
      throw new Error("Failed to sign transaction");
    }

    const result = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );
    debug.log("Token deployed at:", result.contractAddress);
    debug.log("=== DEPLOY TOKEN END ===");

    return result.contractAddress;
  } catch (error: any) {
    debug.log("Deploy token error:", error.message);
    throw new Error(`Token deployment failed: ${error.message}`);
  }
}

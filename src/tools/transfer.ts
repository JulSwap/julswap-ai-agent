import { JulswapAgentKit } from "../agent";
import { debug } from "../utils/debug";

const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

export async function transfer(
  agent: JulswapAgentKit,
  to: string,
  amount: number,
  tokenAddress?: string,
): Promise<string> {
  debug.log("=== TRANSFER START ===");
  debug.log("To address:", to);
  debug.log("Amount:", amount);
  debug.log("Token address:", tokenAddress);

  try {
    let tx: string;
    const web3 = agent.connection;

    if (!tokenAddress) {
      // Transfer native BNB
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 21000; // Standard gas limit for ETH transfers

      const transaction = {
        from: agent.wallet_address,
        to: to,
        value: web3.utils.toWei(amount.toString(), "ether"),
        gasPrice: gasPrice,
        gas: gasLimit,
      };

      // Sign and send the transaction
      const signedTx = await web3.eth.accounts.signTransaction(
        transaction,
        process.env.PRIVATE_KEY! ?? agent.private_key,
      );

      if (!signedTx.rawTransaction) {
        throw new Error("Failed to sign transaction");
      }

      debug.log("Signed transaction:", signedTx);
      const result = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
      );
      tx = result.transactionHash;
      debug.log("Native transfer hash:", tx);
    } else {
      // Transfer ERC20 token
      const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
      const decimals = await contract.methods.decimals().call();
      const adjustedAmount = amount * Math.pow(10, decimals);

      const result = await contract.methods
        .transfer(to, adjustedAmount)
        .send({ from: agent.wallet_address });
      tx = result.transactionHash;
      debug.log("Token transfer hash:", tx);
    }

    debug.log("=== TRANSFER END ===");
    return tx;
  } catch (error: any) {
    debug.log("Transfer error:", error.message);
    throw new Error(`Transfer failed: ${error.message}`);
  }
}

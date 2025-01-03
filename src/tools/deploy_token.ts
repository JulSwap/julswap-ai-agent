import { SonicAgentKit } from "../agent";
import { debug } from "../utils/debug";

const TOKEN_ABI = [
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "initialSupply", type: "uint256" },
      { name: "uri", type: "string" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
];

const TOKEN_BYTECODE = "0x..."; // Add your token contract bytecode here

export async function deployToken(
  agent: SonicAgentKit,
  name: string,
  symbol: string,
  initialSupply: number,
  uri: string,
): Promise<string> {
  debug.log("=== DEPLOY TOKEN START ===");
  debug.log("Name:", name);
  debug.log("Symbol:", symbol);
  debug.log("Initial Supply:", initialSupply);
  debug.log("URI:", uri);

  try {
    const web3 = agent.connection;
    const contract = new web3.eth.Contract(TOKEN_ABI);
    const deploy = contract.deploy({
      data: TOKEN_BYTECODE,
      arguments: [
        name,
        symbol,
        web3.utils.toWei(initialSupply.toString(), "ether"),
        uri,
      ],
    });

    const gas = await deploy.estimateGas();
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        data: deploy.encodeConstructorParams(),
        gas,
        gasPrice,
      },
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

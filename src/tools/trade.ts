import { SonicAgentKit } from "../agent";
import { debug } from "../utils/debug";
import { OPEN_OCEAN_API_URL, REFERRAL_ADDRESS } from "../constants";

const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

async function approveToken(
  agent: SonicAgentKit,
  tokenAddress: string,
  spenderAddress: string,
  amount: string
): Promise<void> {
  const tokenContract = new agent.connection.eth.Contract(
    ERC20_ABI,
    tokenAddress,
  );

  // Check current allowance
  const allowance = await tokenContract.methods
    .allowance(agent.wallet_address, spenderAddress)
    .call();

  const allowanceBN = BigInt(allowance);
  const amountBN = BigInt(amount);

  if (allowanceBN < amountBN) {
    // Try using MAX_UINT256 instead of exact amount
    const MAX_UINT256 =
      "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    const MAX_UINT256_BN = BigInt(MAX_UINT256);

    debug.log("Approving token...");
    debug.log("Current allowance:", allowanceBN.toString());
    debug.log("Required amount:", MAX_UINT256_BN.toString());

    // Create approval transaction
    const approveTx = tokenContract.methods.approve(
      spenderAddress,
      MAX_UINT256_BN.toString(),
    );

    // Get gas estimate and add 20%
    const gasEstimate = await approveTx.estimateGas({
      from: agent.wallet_address,
    });
    const gasLimit = Math.ceil(Number(gasEstimate) * 2);

    const tx = {
      from: agent.wallet_address,
      to: tokenAddress,
      data: approveTx.encodeABI(),
      gas: gasLimit,
      gasPrice: await agent.connection.eth.getGasPrice(),
    };

    // Sign and send transaction
    const signedTx = await agent.connection.eth.accounts.signTransaction(
      tx,
      process.env.SONIC_PRIVATE_KEY!,
    );

    if (!signedTx.rawTransaction) {
      throw new Error("Failed to sign approval transaction");
    }

    const receipt = await agent.connection.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    debug.log("Token approved:", receipt.transactionHash);
  } else {
    debug.log("Token already approved");
  }
}

interface SwapQuote {
  data: {
    outAmount: string;
    estimatedGas: string;
    to: string;
    value: string;
    data: string;
  };
}

export async function trade(
  agent: SonicAgentKit,
  fromToken: string,
  toToken: string,
  amount: string,
  slippage: number = 0.5,
): Promise<string> {
  try {
    // Enable debugging at the start
    debug.disable();

    debug.log("=== TRADE START ===");
    debug.log("From token:", fromToken);
    debug.log("To token:", toToken);
    debug.log("Amount:", amount);

    // Convert amount to Wei for BNB/tokens
    const amountInWei = agent.connection.utils.toWei(amount, "ether");
    debug.log("Amount in Wei:", amountInWei);

    // 1. Get current gas price from blockchain
    const gasPrice = await agent.connection.eth.getGasPrice();
    const gasPriceGwei = Math.round(
      Number(agent.connection.utils.fromWei(gasPrice, "gwei")),
    );
    debug.log("Current gas price (GWEI):", gasPriceGwei);

    // 2. Approve token first if it's not native token
    if (fromToken !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      debug.log("Pre-approving token...");
      await approveToken(
        agent,
        fromToken,
        "0x6352a56caadC4F1E25CD6c75970Fa768A3304e64", // OpenOcean: BSC Exchange Proxy
        amountInWei,
      );
    }

    debug.log("Token approved, now fetching quote from OpenOcean...");
    // 3. Get quote from OpenOcean
    const quoteUrl = new URL(OPEN_OCEAN_API_URL + "/v3/bsc/quote");
    quoteUrl.searchParams.append("amount", amount);
    quoteUrl.searchParams.append("gasPrice", gasPriceGwei.toString());
    quoteUrl.searchParams.append("inTokenAddress", fromToken);
    quoteUrl.searchParams.append("outTokenAddress", toToken);
    quoteUrl.searchParams.append("slippage", slippage.toString());
    quoteUrl.searchParams.append("account", agent.wallet_address);

    const headers = {
      apikey: process.env.OPEN_OCEAN_API_KEY,
      "Content-Type": "application/json",
    };

    debug.log("Quote URL:", quoteUrl.toString());

    try {
      const quoteResponse = await fetch(quoteUrl, {
        method: "GET",
        headers: headers as Record<string, string>,
      });
      // const quote = await quoteResponse.json();
      // debug.log("Quote:", quote);

      // Get swap data after quote
      debug.log("Getting swap data from OpenOcean...");
      const swapUrl = new URL(OPEN_OCEAN_API_URL + "/v4/bsc/swap");
      swapUrl.searchParams.append("amount", amount);
      swapUrl.searchParams.append("gasPrice", gasPriceGwei.toString());
      swapUrl.searchParams.append("inTokenAddress", fromToken);
      swapUrl.searchParams.append("outTokenAddress", toToken);
      swapUrl.searchParams.append("slippage", slippage.toString());
      swapUrl.searchParams.append("account", agent.wallet_address);
      swapUrl.searchParams.append("referrer", REFERRAL_ADDRESS);

      // debug.log("Swap URL:", swapUrl.toString());
      const swapResponse = await fetch(swapUrl, {
        method: "GET",
        headers: headers as Record<string, string>,
      });
      const swapData = await swapResponse.json();
      // debug.log("Swap data:", swapData);
      if (swapData.code !== 200) {
        throw new Error(`Swap request failed: ${JSON.stringify(swapData)}`);
      }

      // 4. Execute the swap with swap data
      const tx = {
        from: agent.wallet_address,
        to: swapData.data.to,
        data: swapData.data.data,
        value: swapData.data.value,
        gasLimit: Math.round(Number(swapData.data.estimatedGas) * 1.2),
        gasPrice: await agent.connection.eth.getGasPrice(),
      };

      debug.log("Transaction data:", tx);

      // Add balance checks
      const balance = await agent.connection.eth.getBalance(
        agent.wallet_address,
      );
      const requiredAmount =
        BigInt(tx.value) + BigInt(tx.gasLimit) * BigInt(tx.gasPrice);

      debug.log(
        "Wallet balance:",
        agent.connection.utils.fromWei(balance, "ether"),
        "BNB",
      );
      debug.log(
        "Required amount:",
        agent.connection.utils.fromWei(requiredAmount.toString(), "ether"),
        "BNB",
      );

      if (BigInt(balance) < requiredAmount) {
        throw new Error(
          `Insufficient BNB balance. Have: ${balance}, Need: ${requiredAmount}`,
        );
      }

      try {
        // Try to estimate gas to catch potential revert reasons
        const gasEstimate = await agent.connection.eth.estimateGas({
          from: tx.from,
          to: tx.to,
          data: tx.data,
          value: tx.value,
        });

        debug.log("Gas estimate:", gasEstimate);
        tx.gasLimit = Math.round(Number(gasEstimate) * 1.2);

        // Add debug logs for transaction data
        debug.log("Transaction data:", {
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gasLimit: tx.gasLimit,
          gasPrice: tx.gasPrice,
          data: tx.data.slice(0, 66) + "..." // Show first 66 chars of data
        });

        // Verify contract exists at destination
        const code = await agent.connection.eth.getCode(tx.to);
        if (code === "0x" || code === "0x0") {
          throw new Error("No contract found at destination address");
        }

        const signedTx = await agent.connection.eth.accounts.signTransaction(
          tx,
          process.env.SONIC_PRIVATE_KEY!,
        );

        if (!signedTx.rawTransaction) {
          throw new Error("Failed to sign transaction");
        }

        const receipt = await agent.connection.eth.sendSignedTransaction(
          signedTx.rawTransaction,
        );

        debug.log("Trade successful:", receipt.transactionHash);
        debug.log("=== TRADE END ===");

        return receipt.transactionHash;
      } catch (error: any) {
        // Enhanced error handling
        debug.log("Transaction details:", {
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gasLimit: tx.gasLimit,
          gasPrice: tx.gasPrice
        });

        if (error.message.includes("insufficient funds")) {
          throw new Error(
            `Insufficient funds for transaction. Required: ${requiredAmount}`,
          );
        }

        // Add specific error handling for common issues
        if (error.message.includes("execution reverted")) {
          const reason = error.message.match(/reason: (.*?)(?:,|$)/)?.[1] || "Unknown";
          throw new Error(`Transaction execution reverted: ${reason}`);
        }

        if (error.message.includes("nonce too low")) {
          throw new Error("Transaction nonce too low - try again");
        }

        if (error.message.includes("gas required exceeds allowance")) {
          throw new Error(
            `Gas required exceeds limit. Try increasing gas limit. Current: ${tx.gasLimit}`,
          );
        }

        debug.log("Raw error:", error);
        throw error;
      }
    } catch (error: any) {
      debug.log("Error fetching quote:", error.message);
      throw new Error(`Failed to get quote: ${error.message}`);
    }
  } catch (error: any) {
    debug.log("Trade error:", error.message);
    // Disable debugging before throwing
    debug.disable();
    throw new Error(`Trade failed: ${error.message}`);
  } finally {
    // Make sure debugging is disabled when we're done
    debug.disable();
  }
}


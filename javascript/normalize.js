// Data normalization
//
// Whichever method you used to get on-chain data, the raw result is
// still wei, hex, and Unix timestamps. This turns one raw transaction
// object into something a model, or a human, can actually read.
// Exported so direct-rpc.js, chainkit-fetch.js, and chainkit-mcp-agent.js
// can all share the exact same normalization logic.

import { ethers } from "ethers";

export function normalize(rawTx) {
  // Glacier / ChainKit SDK wraps the transaction under `nativeTransaction`
  // with different field names. Support both that and the flat ethers.js
  // format returned by direct RPC calls.
  const tx = rawTx.nativeTransaction ?? rawTx;

  const from = typeof tx.from === "object" ? tx.from?.address : tx.from;
  const to = typeof tx.to === "object" ? tx.to?.address : tx.to;
  const status = tx.txStatus ?? tx.status;

  return {
    hash: tx.txHash ?? tx.hash,
    amount: Number(ethers.formatEther(tx.value ?? "0")),
    token: tx.tokenSymbol ?? "AVAX",
    from,
    to,
    timestamp: new Date((tx.blockTimestamp ?? tx.timestamp ?? 0) * 1000).toISOString(),
    status: status === 1 || status === "1" ? "success" : "failed",
  };
}

export function normalizeMany(rawTxs) {
  return rawTxs.map(normalize);
}

const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Blockchain Monitor Starting...\n");

  // Connect to the local network
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Get network info
  const network = await provider.getNetwork();
  console.log("📡 Network Information:");
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Network Name: ${network.name}`);
  console.log(`   Block Number: ${await provider.getBlockNumber()}\n`);

  // Get accounts
  const accounts = await ethers.getSigners();
  console.log("👥 Available Accounts:");
  for (let i = 0; i < Math.min(5, accounts.length); i++) {
    const balance = await provider.getBalance(accounts[i].address);
    console.log(`   Account ${i}: ${accounts[i].address}`);
    console.log(`   Balance: ${ethers.utils.formatEther(balance)} ETH\n`);
  }

  // Monitor new blocks
  console.log("⛏️  Monitoring New Blocks (Press Ctrl+C to stop):");
  console.log("=" * 60);
  
  provider.on("block", async (blockNumber) => {
    const block = await provider.getBlock(blockNumber);
    const timestamp = new Date(block.timestamp * 1000);
    
    console.log(`\n🧱 Block #${blockNumber} Mined!`);
    console.log(`   Hash: ${block.hash}`);
    console.log(`   Timestamp: ${timestamp.toLocaleString()}`);
    console.log(`   Transactions: ${block.transactions.length}`);
    console.log(`   Gas Used: ${block.gasUsed.toString()}`);
    console.log(`   Miner: ${block.miner}`);
    
    // Show transaction details if any
    if (block.transactions.length > 0) {
      console.log(`   📝 Transactions in this block:`);
      for (let i = 0; i < block.transactions.length; i++) {
        const tx = await provider.getTransaction(block.transactions[i]);
        console.log(`      ${i + 1}. ${tx.hash.substring(0, 20)}... (${tx.to ? 'Contract Call' : 'Contract Creation'})`);
      }
    }
    console.log("-".repeat(60));
  });

  // Monitor pending transactions
  provider.on("pending", async (txHash) => {
    try {
      const tx = await provider.getTransaction(txHash);
      if (tx) {
        console.log(`⏳ Pending Transaction: ${txHash.substring(0, 20)}...`);
      }
    } catch (error) {
      // Transaction might be mined before we can fetch it
    }
  });
}

main()
  .then(() => {
    // Keep the script running
  })
  .catch((error) => {
    console.error("❌ Monitor Error:", error);
    process.exit(1);
  });

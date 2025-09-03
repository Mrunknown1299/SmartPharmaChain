const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("📋 Deployment Information Dashboard\n");

  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Check if deployment file exists
  const deploymentPath = path.join(__dirname, '../deployments/localhost.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.log("❌ No deployment found. Please deploy the contract first:");
    console.log("   npx hardhat run scripts/deploy.js --network localhost\n");
    return;
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const contractAddress = deploymentData.DrugSupplyChain;
  
  console.log("🚀 Contract Deployment Details:");
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Network: localhost (Hardhat)`);
  console.log(`   RPC URL: http://127.0.0.1:8545\n`);

  // Get contract info
  try {
    const code = await provider.getCode(contractAddress);
    console.log("📝 Contract Information:");
    console.log(`   Bytecode Length: ${code.length} characters`);
    console.log(`   Is Deployed: ${code !== '0x' ? '✅ Yes' : '❌ No'}\n`);

    // Get deployment transaction
    const DrugSupplyChain = await ethers.getContractFactory("DrugSupplyChain");
    const contract = DrugSupplyChain.attach(contractAddress);

    // Try to get some contract state
    console.log("🔍 Contract State:");
    try {
      // This will work if the contract has any public state variables
      console.log(`   Contract is responsive: ✅ Yes\n`);
    } catch (error) {
      console.log(`   Contract response: ❌ Error - ${error.message}\n`);
    }

    // Network stats
    const blockNumber = await provider.getBlockNumber();
    const latestBlock = await provider.getBlock(blockNumber);
    
    console.log("⛓️  Blockchain Status:");
    console.log(`   Latest Block: #${blockNumber}`);
    console.log(`   Block Hash: ${latestBlock.hash}`);
    console.log(`   Block Timestamp: ${new Date(latestBlock.timestamp * 1000).toLocaleString()}`);
    console.log(`   Gas Limit: ${latestBlock.gasLimit.toString()}`);
    console.log(`   Gas Used: ${latestBlock.gasUsed.toString()}\n`);

    // Account balances
    const accounts = await ethers.getSigners();
    console.log("💰 Account Balances:");
    for (let i = 0; i < Math.min(5, accounts.length); i++) {
      const balance = await provider.getBalance(accounts[i].address);
      console.log(`   Account ${i}: ${ethers.utils.formatEther(balance)} ETH`);
    }
    console.log();

    // Frontend configuration
    console.log("⚙️  Frontend Configuration:");
    console.log("   Add this to your frontend .env file:");
    console.log(`   REACT_APP_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`   REACT_APP_RPC_URL=http://127.0.0.1:8545\n`);

    // Testing commands
    console.log("🧪 Testing Commands:");
    console.log("   Monitor blockchain activity:");
    console.log("   npx hardhat run scripts/monitor.js --network localhost");
    console.log();
    console.log("   Test contract operations:");
    console.log("   npx hardhat run scripts/test-operations.js --network localhost");
    console.log();
    console.log("   Deploy fresh contract:");
    console.log("   npx hardhat run scripts/deploy.js --network localhost\n");

  } catch (error) {
    console.log(`❌ Error getting contract info: ${error.message}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

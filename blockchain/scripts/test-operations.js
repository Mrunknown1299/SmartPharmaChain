const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Smart Contract Operations...\n");

  // Get contract factory and deploy if needed
  const DrugSupplyChain = await ethers.getContractFactory("DrugSupplyChain");
  
  // Try to get deployed contract address
  let contractAddress;
  try {
    const fs = require('fs');
    const deploymentData = JSON.parse(fs.readFileSync('./deployments/localhost.json', 'utf8'));
    contractAddress = deploymentData.DrugSupplyChain;
    console.log(`📋 Using deployed contract at: ${contractAddress}\n`);
  } catch (error) {
    console.log("🚀 Deploying new contract...");
    const contract = await DrugSupplyChain.deploy();
    await contract.deployed();
    contractAddress = contract.address;
    console.log(`✅ Contract deployed at: ${contractAddress}\n`);
  }

  // Connect to the contract
  const contract = DrugSupplyChain.attach(contractAddress);
  const [owner, manufacturer, distributor, retailer, consumer] = await ethers.getSigners();

  console.log("👥 Test Accounts:");
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Manufacturer: ${manufacturer.address}`);
  console.log(`   Distributor: ${distributor.address}`);
  console.log(`   Retailer: ${retailer.address}`);
  console.log(`   Consumer: ${consumer.address}\n`);

  // Test 1: Manufacture a drug
  console.log("🏭 Test 1: Manufacturing a drug...");
  const batchId = `BATCH-${Date.now()}`;
  const drugName = "Aspirin 500mg";
  const manufacturerName = "PharmaCorp Ltd";
  const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year from now

  try {
    const tx1 = await contract.connect(manufacturer).manufactureDrug(
      batchId,
      drugName,
      manufacturerName,
      expiryDate
    );
    console.log(`   📝 Transaction Hash: ${tx1.hash}`);
    const receipt1 = await tx1.wait();
    console.log(`   ⛏️  Mined in Block: ${receipt1.blockNumber}`);
    console.log(`   ⛽ Gas Used: ${receipt1.gasUsed.toString()}`);
    console.log(`   ✅ Drug manufactured successfully!\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: Verify the drug
  console.log("🔍 Test 2: Verifying the drug...");
  try {
    const isAuthentic = await contract.verifyDrug(batchId);
    console.log(`   🔐 Is Authentic: ${isAuthentic}`);
    
    const drugDetails = await contract.getDrugDetails(batchId);
    console.log(`   📊 Drug Details:`);
    console.log(`      Name: ${drugDetails[0]}`);
    console.log(`      Manufacturer: ${drugDetails[1]}`);
    console.log(`      Manufacture Date: ${new Date(drugDetails[2].toNumber() * 1000).toLocaleString()}`);
    console.log(`      Expiry Date: ${new Date(drugDetails[3].toNumber() * 1000).toLocaleString()}`);
    console.log(`      Status: ${['Manufactured', 'Distributed', 'Retailed', 'Sold'][drugDetails[4]]}`);
    console.log(`      Manufacturer ID: ${drugDetails[5]}`);
    console.log(`      Distributor ID: ${drugDetails[6]}`);
    console.log(`      Retailer ID: ${drugDetails[7]}`);
    console.log(`      Consumer ID: ${drugDetails[8]}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 3: Distribute the drug
  console.log("🚚 Test 3: Distributing the drug...");
  try {
    const tx2 = await contract.connect(distributor).distributeDrug(batchId);
    console.log(`   📝 Transaction Hash: ${tx2.hash}`);
    const receipt2 = await tx2.wait();
    console.log(`   ⛏️  Mined in Block: ${receipt2.blockNumber}`);
    console.log(`   ✅ Drug distributed successfully!\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 4: Retail the drug
  console.log("🏪 Test 4: Retailing the drug...");
  try {
    const tx3 = await contract.connect(retailer).retailDrug(batchId);
    console.log(`   📝 Transaction Hash: ${tx3.hash}`);
    const receipt3 = await tx3.wait();
    console.log(`   ⛏️  Mined in Block: ${receipt3.blockNumber}`);
    console.log(`   ✅ Drug retailed successfully!\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 5: Sell to consumer
  console.log("🛒 Test 5: Selling to consumer...");
  try {
    const tx4 = await contract.connect(retailer).sellDrug(batchId, consumer.address);
    console.log(`   📝 Transaction Hash: ${tx4.hash}`);
    const receipt4 = await tx4.wait();
    console.log(`   ⛏️  Mined in Block: ${receipt4.blockNumber}`);
    console.log(`   ✅ Drug sold to consumer successfully!\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 6: Final verification
  console.log("🔍 Test 6: Final verification after full supply chain...");
  try {
    const finalDetails = await contract.getDrugDetails(batchId);
    console.log(`   📊 Final Drug Status:`);
    console.log(`      Status: ${['Manufactured', 'Distributed', 'Retailed', 'Sold'][finalDetails[4]]}`);
    console.log(`      Manufacturer: ${finalDetails[5]}`);
    console.log(`      Distributor: ${finalDetails[6]}`);
    console.log(`      Retailer: ${finalDetails[7]}`);
    console.log(`      Consumer: ${finalDetails[8]}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log("🎉 All tests completed!");
  console.log(`📋 Test Batch ID: ${batchId}`);
  console.log("💡 You can use this batch ID to test in your frontend!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test Error:", error);
    process.exit(1);
  });

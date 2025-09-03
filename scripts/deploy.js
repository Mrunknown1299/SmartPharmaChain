const hre = require("hardhat");

async function main() {
  console.log("Deploying SmartMediChain contract...");

  // Get the ContractFactory and Signers here.
  const PharmaceuticalSupplyChain = await hre.ethers.getContractFactory("PharmaceuticalSupplyChain");
  
  // Deploy the contract
  const pharmaceuticalSupplyChain = await PharmaceuticalSupplyChain.deploy();

  await pharmaceuticalSupplyChain.waitForDeployment();

  const contractAddress = await pharmaceuticalSupplyChain.getAddress();
  console.log("PharmaceuticalSupplyChain deployed to:", contractAddress);
  
  // Save the contract address and ABI to a file for frontend use
  const fs = require('fs');
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ PharmaceuticalSupplyChain: contractAddress }, undefined, 2)
  );

  const PharmaceuticalSupplyChainArtifact = await hre.artifacts.readArtifact("PharmaceuticalSupplyChain");

  fs.writeFileSync(
    contractsDir + "/PharmaceuticalSupplyChain.json",
    JSON.stringify(PharmaceuticalSupplyChainArtifact, null, 2)
  );

  console.log("Contract address and ABI saved to frontend/src/contracts/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`Starting deployment to network: ${hre.network.name}...`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} native tokens`);

  const SkillPassport = await hre.ethers.getContractFactory("SkillPassport");
  const passport = await SkillPassport.deploy();

  await passport.waitForDeployment();
  const contractAddress = await passport.getAddress();

  console.log("--------------------------------------------------");
  console.log(`🎉 SkillPassport successfully deployed!`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Owner/Initial Issuer: ${deployer.address}`);
  console.log("--------------------------------------------------");

  // Export deployment info for frontend consumption
  const configDir = path.join(__dirname, "..", "src", "config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const deploymentData = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    address: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(configDir, "deployedContracts.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("Updated src/config/deployedContracts.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

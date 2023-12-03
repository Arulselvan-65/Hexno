const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const NftMarket = await ethers.getContractFactory("NftMarket");
  const nftMarket = await NftMarket.deploy();


   console.log("NftMarket deployed to:", nftMarket.target);

  const ERC20Token = await ethers.getContractFactory("ERC20Token");
  const erc20Token = await ERC20Token.deploy();

  console.log("ERC20Token deployed to:", erc20Token.target);

  const CrowdFund = await ethers.getContractFactory("CrowdFund");
  const crowdFund = await CrowdFund.deploy(100, nftMarket.target, erc20Token.target);

console.log("CrowdFund deployed to:", crowdFund.target);
const filename = 'crowdFundAddress.json';
const newData = { address: crowdFund.target};
fs.writeFileSync(filename, JSON.stringify(newData, null, 2), 'utf8');
console.log(`Address stored in ${filename}.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

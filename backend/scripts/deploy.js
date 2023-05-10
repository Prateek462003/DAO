const {CDNFTCONTRACT_ADDRESS} = require("../constants");
const {ethers} = require("hardhat");

async function main(){
  const fakeNFTMarketplace = await ethers.getContractFactory("FakeNFTMarketplace");
  const deployFakeNFTMarketplace = await fakeNFTMarketplace.deploy();
  await deployFakeNFTMarketplace.deployed()
  console.log("Fake NFT marketplace contract deployed at: ", deployFakeNFTMarketplace.address);

  const daoContract = await ethers.getContractFactory("CryptoDevsDAO");
  const deployDaoContract = await daoContract.deploy(
    deployFakeNFTMarketplace.address,
    CDNFTCONTRACT_ADDRESS,
    {
      value : ethers.utils.parseEther("0.9"),
    }
  );
  await deployDaoContract.deployed();
  console.log("Cypto Devs DAO contract deployed at:", deployDaoContract.address);

}

main();
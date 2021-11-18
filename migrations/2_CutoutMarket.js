const NFTMarket = artifacts.require("CutoutMarket");
const NFTFactory = artifacts.require("CutoutNFTFactory");

module.exports = async (deployer)=>{
  
  await deployer.deploy(NFTMarket);
  console.log("Esta es la dirección de NFT Market", NFTMarket.address);
  await deployer.deploy(NFTFactory, NFTMarket.address);
  console.log("Esta es la dirección de NFT Factory", NFTFactory.address);
  return

  
}


 



const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat.config");
const { verify } = require("../scripts/utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // console.log(deployer);

    // const accounts = await ethers.getSigners();
    // let deployer = accounts[0].address;

    console.log("deployer", deployer);

    log("Deploying NFT Token...");
    let tokenUris = [
        "ipfs://Qmcpug9R4NKntYWkgYBtF5CzVx1frGVPz8FdAVTHNbWTTh",
        "ipfs://QmPPnWLe9T3pE74M2z6hLtBT3S5omfHpatiM2V3i64nZMJ",
        "ipfs://QmR3HKUomhWdowqBHeqy4nYFsJFmKmP6WfhepYSZWBNmgg",
    ];
    const OurNft = await deploy("OurNft", {
        from: deployer,
        args: [tokenUris],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    log("NFT Token Deployed. Deploying NftBridge...");

    const NftBridge = await deploy("NftBridge", {
        from: deployer,
        args: [OurNft.address],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    log(`NftBridge deployed!`);
    log(`NFT Deployed at : ${OurNft.address}`);
    log(`NftBridge Deployed at : ${NftBridge.address}`);

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(NftBridge.address, [OurNft.address]);
        await verify(OurNft.address, [tokenUris]);
    }
};

module.exports.tags = ["all", "NftBridgeToken"];

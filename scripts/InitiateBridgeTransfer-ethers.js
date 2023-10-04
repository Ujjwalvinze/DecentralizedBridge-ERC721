const { ethers, network } = require("hardhat");
const web3 = require("web3");
const { developmentChains, networkConfig } = require("../helper-hardhat.config");
require("dotenv").config();

const {
    nftAddress_localhost,
    nftAddress_ganache,
    nftAddress_goerli,
    nftAddress_mumbai,
    bridgeAddress_localhost,
    bridgeAddress_ganache,
    bridgeAddress_goerli,
    bridgeAddress_mumbai,
    HARDHAT_PRIVATE_KEY,
    REAL_PRIV_KEY,
    GANACHE_PRIVATE_KEY,
} = require("./utils/addresses");

async function initiateBridgeTransfer() {
    const TOKEN_ID = 99;
    const NONCE = 1;
    const BREED_NUMBER = 1;
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const chainId = network.config.chainId;

    let privateKey;
    let bridgeAddress;
    let nftAddress;

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        privateKey = REAL_PRIV_KEY;
        if (chainId == 5) {
            bridgeAddress = bridgeAddress_goerli;
            nftAddress = nftAddress_goerli;
        } else {
            bridgeAddress = bridgeAddress_mumbai;
            nftAddress = nftAddress_mumbai;
        }
    } else {
        if (chainId == 1337) {
            privateKey = GANACHE_PRIVATE_KEY;
            bridgeAddress = bridgeAddress_ganache;
            nftAddress = nftAddress_ganache;
        } else {
            privateKey = HARDHAT_PRIVATE_KEY;
            bridgeAddress = bridgeAddress_localhost;
            nftAddress = nftAddress_localhost;
        }
    }

    // console.log("bridge = ", bridgeAddress, "\nnft = ", nftAddress);

    const nftBridge = await ethers.getContractAt("NftBridge", bridgeAddress);
    const ourNft = await ethers.getContractAt("OurNft", nftAddress);

    // const NftContractOwner = await ourNft.owner();

    const nftMintTx = await ourNft.mintNft(deployer.address, TOKEN_ID, BREED_NUMBER);
    await nftMintTx.wait();

    console.log("Nft Minted!");

    const ownerTransferTx = await ourNft.transferOwnership(await nftBridge.getAddress());
    await ownerTransferTx.wait();

    console.log("Ownership transferred");

    const encodedWeb3 = web3.utils
        .soliditySha3(
            { t: "address", v: deployer.address },
            { t: "uint256", v: TOKEN_ID },
            { t: "uint256", v: NONCE },
        )
        .toString("hex");

    const { signature: signatureWeb3 } = web3.eth.accounts.sign(encodedWeb3, privateKey);
    // const signatureWeb3 = await deployer.signMessage(encodedWeb3);

    signatureToSend = signatureWeb3;

    const tx = await nftBridge.initiateTransfer(TOKEN_ID, NONCE, signatureToSend);
    await tx.wait();

    // console.log(tx);
    console.log("Bridge Address = ", bridgeAddress);
    console.log("Nft Address = ", nftAddress);
    console.log("Deployer Address = ", deployer.address);
    console.log("signature to expect = ", signatureToSend);
}

initiateBridgeTransfer().catch((error) => {
    console.log("this ", error);
});

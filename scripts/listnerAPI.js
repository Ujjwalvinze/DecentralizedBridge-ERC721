const { ethers, deployments, network, getNamedAccounts } = require("hardhat");
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

async function receiveTransfer() {
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

    const goerliProvider = new ethers.JsonRpcProvider(process.env.GOERLI_RPC_URL, "any");
    const mumbaiProvider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL, "any");

    const goerliSigner = new ethers.Wallet(privateKey, goerliProvider);
    const mumbaiSigner = new ethers.Wallet(privateKey, mumbaiProvider);

    const nftBridge_goerli = await ethers.getContractAt(
        "NftBridge",
        bridgeAddress_goerli,
        goerliSigner,
    );
    const nftBridge_mumbai = await ethers.getContractAt(
        "NftBridge",
        bridgeAddress_mumbai,
        mumbaiSigner,
    );
    const ourNft = await ethers.getContractAt("OurNft", nftAddress_mumbai, mumbaiSigner);

    // const ownerTransferTx = await ourNft.transferOwnership(await nftBridge_mumbai.getAddress());
    // await ownerTransferTx.wait();

    console.log("Ownership transferred");

    console.log("Started...");
    console.log("Bridge Address = ", bridgeAddress);
    console.log("Nft Address = ", nftAddress);
    console.log("Deployer Address = ", mumbaiSigner.address);
    nftBridge_goerli.addListener("TransferInitiated", async (owner, tokenId, nonce, signature) => {
        console.log(owner);
        console.log(mumbaiSigner.address);
        await nftBridge_mumbai.mintTransferredToken(BREED_NUMBER, owner, tokenId, nonce, signature);

        // const NewOwner = await ourNft.ownerOf(tokenId);

        // console.log("Transfer Complete. Owner = ", NewOwner);
    });
}

receiveTransfer();

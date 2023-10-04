const { ethers } = require("ethers");
require("dotenv").config();

async function receiveTransfer() {
    const goerliProvider = new ethers.JsonRpcProvider(process.env.GOERLI_RPC_URL, "any");
    const mumbaiProvider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL, "any");

    const goerliSigner = new ethers.Wallet(process.env.PRIVATE_KEY, goerliProvider);
    const mumbaiSigner = new ethers.Wallet(process.env.PRIVATE_KEY, mumbaiProvider);

    const goerliBridgeFile = require("../deployments/goerli/Bridge.json");
    const mumbaiBridgeFile = require("../deployments/mumbai/Bridge.json");

    const goerliBridgeABI = goerliBridgeFile.abi;
    const goerliBridgeAddress = goerliBridgeFile.address;

    const mumbaiBridgeABI = mumbaiBridgeFile.abi;
    const mumbaiBridgeAddress = mumbaiBridgeFile.address;

    console.log(goerliBridgeAddress, "\n", mumbaiBridgeAddress);

    const goerliBridge = new ethers.Contract(goerliBridgeAddress, goerliBridgeABI, goerliSigner);
    const mumbaiBridge = new ethers.Contract(mumbaiBridgeAddress, mumbaiBridgeABI, mumbaiSigner);

    goerliBridge.addListener("TransferInitiated", async (from, to, amount, nonce, signature) => {
        console.log(`from = ${from}\nto = ${to}`);

        await mumbaiBridge.mintTransferredAmount(from, to, amount, nonce, signature);
        // const txReceipt = await txResponse.wait(1);

        console.log("Bridge Complete");
        // console.log(txResponse);
    });
}

receiveTransfer();

const { ethers } = require("ethers");

async function updateOwner() {
    const ganacheProvider = new ethers.JsonRpcProvider("http://127.0.0.1:7545/");
    const user = new ethers.Wallet(
        "3e13cb114e8b6d65cc7eee7520786ce128eac21856bfc194554952f28d043370",
        ganacheProvider,
    );

    const ganacheBridgeFile = require("../deployments/ganache/Bridge.json");
    const ganacheBridgeABI = ganacheBridgeFile.abi;
    const ganacheBridgeAddress = ganacheBridgeFile.address;
    const Bridge = new ethers.Contract(ganacheBridgeAddress, ganacheBridgeABI, user);

    const ourTokenFile = require("../deployments/ganache/OurToken.json");
    const ourTokenABI = ourTokenFile.abi;
    const outTokenAddress = ourTokenFile.address;
    const OurToken = new ethers.Contract(outTokenAddress, ourTokenABI, user);

    const txResponse = await OurToken.updateOwner(ganacheBridgeAddress);
}

updateOwner()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });

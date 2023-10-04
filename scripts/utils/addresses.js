require("dotenv").config();

const bridgeGanache = require("../../deployments/ganache/NftBridge.json");
const nftGanache = require("../../deployments/ganache/OurNft.json");
let bridgeAddress_ganache = bridgeGanache.address;
let nftAddress_ganache = nftGanache.address;

const bridgeLocalhost = require("../../deployments/localhost/NftBridge.json");
const nftLocalhost = require("../../deployments/localhost/OurNft.json");
let bridgeAddress_localhost = bridgeLocalhost.address;
let nftAddress_localhost = nftLocalhost.address;

const bridgeGoerli = require("../../deployments/goerli/NftBridge.json");
const nftGoerli = require("../../deployments/goerli/OurNft.json");
let bridgeAddress_goerli = bridgeGoerli.address;
let nftAddress_goerli = nftGoerli.address;

const bridgeMumbai = require("../../deployments/mumbai/NftBridge.json");
const nftMumbai = require("../../deployments/mumbai/OurNft.json");
let bridgeAddress_mumbai = bridgeMumbai.address;
let nftAddress_mumbai = nftMumbai.address;

let HARDHAT_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
let REAL_PRIV_KEY = "0x" + process.env.PRIVATE_KEY;
let GANACHE_PRIVATE_KEY = "0xd58c8f8dbba60cead7ce63c545812fa133009f8f4f36322182ab8fd2228c3a1f";

module.exports = {
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
};

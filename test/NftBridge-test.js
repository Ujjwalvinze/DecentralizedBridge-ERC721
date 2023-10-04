const { expect, assert } = require("chai");
const { ethers, deployments, network, getNamedAccounts } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat.config");
const web3 = require("web3");

describe("NftBridge", function () {
    let nftBridge;
    let accounts;
    let deployer;
    let user;
    let ourNft;

    let TOKEN_ID, NONCE, HARDHAT_PRIVATE_KEY, GANACHE_PRIVATE_KEY, BREED_NUMBER;

    beforeEach(async () => {
        TOKEN_ID = 99;
        NONCE = 1;
        HARDHAT_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        BREED_NUMBER = 0;

        await deployments.fixture("all");
        nftBridge = await ethers.getContractAt(
            "NftBridge",
            "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        );
        ourNft = await ethers.getContractAt("OurNft", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];

        const nftMintTx = await ourNft.mintNft(deployer.address, TOKEN_ID, BREED_NUMBER);
        await nftMintTx.wait();

        const ownerTransferTx = await ourNft.transferOwnership(await nftBridge.getAddress());
        await ownerTransferTx.wait();
    });

    describe("Checking signature", () => {
        it("(web3 vs ethers) Message is same. Sign is different", async () => {
            const message = deployer.address.toString() + TOKEN_ID + NONCE;

            const encodedWeb3 = web3.utils
                .soliditySha3(
                    { t: "address", v: deployer.address },
                    { t: "uint256", v: TOKEN_ID },
                    { t: "uint256", v: NONCE },
                )
                .toString("hex");

            const encodedEthers = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256"],
                [deployer.address, TOKEN_ID, NONCE],
            );

            const { signature: signatureWeb3 } = web3.eth.accounts.sign(
                encodedEthers,
                HARDHAT_PRIVATE_KEY,
            );

            const signatureEthers = await deployer.signMessage(encodedEthers);

            assert.equal(encodedEthers, encodedWeb3);
            assert.notEqual(signatureEthers, signatureWeb3);
        });
    });

    let signatureToSend;

    beforeEach(async () => {
        const message = deployer.address.toString() + TOKEN_ID + NONCE;

        const encodedWeb3 = web3.utils
            .soliditySha3(
                { t: "address", v: deployer.address },
                { t: "uint256", v: TOKEN_ID },
                { t: "uint256", v: NONCE },
            )
            .toString("hex");

        const { signature: signatureWeb3 } = web3.eth.accounts.sign(
            encodedWeb3,
            HARDHAT_PRIVATE_KEY,
        );

        signatureToSend = signatureWeb3;
    });

    describe("Initiate bridge function", () => {
        it("Check transfer event is emitted", async () => {
            expect(await nftBridge.initiateTransfer(TOKEN_ID, NONCE, signatureToSend)).to.be.ok;

            await expect(
                nftBridge.initiateTransfer(TOKEN_ID, NONCE, signatureToSend),
            ).to.be.revertedWith("ERC721: invalid token ID");
        });
    });

    describe("mintTransferredToken function", () => {
        let signRecieved;
        beforeEach(async () => {
            // console.log(signatureToSend);
            const tx = await nftBridge.initiateTransfer(TOKEN_ID, NONCE, signatureToSend);
            const rres = await tx.wait();
            console.log(rres);
        });

        // it("Function should revert on wrong signature", async () => {
        //     let falseSignature = signatureToSend;
        //     falseSignature[4] = "1";
        //     falseSignature[5] = "1";
        //     falseSignature[6] = "1";

        //     await expect(
        //         nftBridge.mintTransferredToken(
        //             BREED_NUMBER,
        //             deployer.address,
        //             TOKEN_ID,
        //             NONCE,
        //             falseSignature,
        //         ),
        //     ).to.be.reverted;
        // });

        it("Function should work with correct signature", async () => {
            // const tx = await nftBridge.initiateTransfer(TOKEN_ID, NONCE, signatureToSend);
            // await tx.wait();
            console.log("run");
            return true;
        });
    });
});

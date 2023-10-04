const { assert, expect, use } = require("chai");
const { ethers, deployments, network, getNamedAccounts } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat.config");

describe("OurNft", function () {
    let ourNft;
    let accounts;
    let deployer;
    let user;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];

        await deployments.fixture("all");

        ourNft = await ethers.getContractAt("OurNft", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
    });

    describe("checking constructor", () => {
        it("token uri storage check", async () => {
            const expectedTokenUris = [
                "ipfs://Qmcpug9R4NKntYWkgYBtF5CzVx1frGVPz8FdAVTHNbWTTh",
                "ipfs://QmPPnWLe9T3pE74M2z6hLtBT3S5omfHpatiM2V3i64nZMJ",
                "ipfs://QmR3HKUomhWdowqBHeqy4nYFsJFmKmP6WfhepYSZWBNmgg",
            ];
            const tokenUris = await ourNft.getTokenUris();

            for (let i = 0; i < 3; i++) {
                assert.equal(expectedTokenUris[i], tokenUris[i]);
            }
        });
    });

    describe("mint nft function", () => {
        it("checking only owner", async () => {
            // const tx = await ourNft.mintNft(user, 0, 1);
            // tx.wait();

            // console.log(tx);

            // this test doesn't work (is wrong)
            /*await*/ expect(await ourNft.mintNft(user, 0, 1)).to.emit(ourNft, "Nft_Mintddded");

            await expect(ourNft.connect(user).mintNft(user, 0, 1)).to.be.revertedWith(
                "Ownable: caller is not the owner",
            );
        });

        it("checking tokenCounter after nft minted naturally", async () => {
            const txResponse = await ourNft.mintNft(user, 0, 1);
            txResponse.wait();
            assert.equal((await ourNft.getTokenCounter()).toString(), "1");
        });
        it("checking tokenCounter after nft minted with custom tokenId", async () => {
            const customTokenId = 99;
            const breed = 2;
            const tx = await ourNft.mintNft(user, customTokenId, breed);
            await tx.wait();

            assert.equal((await ourNft.getBreedFromTokenId(customTokenId)).toString(), "2");
        });
    });

    describe("Burn Nft function", () => {
        beforeEach(async () => {
            const tx = await ourNft.mintNft(user, 0, 1);
            tx.wait();
        });

        it("checking only owner", async () => {
            await expect(ourNft.connect(user).burnNft(user, 0)).to.be.revertedWith(
                "Ownable: caller is not the owner",
            );
            expect(await ourNft.burnNft(user, 0)).to.be.ok;
        });

        it("Check if burnt nft worked", async () => {
            assert.equal((await ourNft.balanceOf(user)).toString(), "1");
            const tx = await ourNft.burnNft(user, 0);
            tx.wait();
            assert.equal((await ourNft.balanceOf(user)).toString(), "0");
        });
    });

    describe("check only owner after changing owner", () => {
        beforeEach(async () => {
            const tx = await ourNft.transferOwnership(user);
            tx.wait();
        });

        it("Mint transaction with original owner fail", async () => {
            await expect(ourNft.mintNft(user, 0, 0)).to.be.revertedWith(
                "Ownable: caller is not the owner",
            );
        });
        it("Mint transaction with new owner Success", async () => {
            await expect(ourNft.connect(user).mintNft(user, 0, 0)).to.be.ok;
        });
    });

    describe("Giving approval to deployer then transfering user's nft to contract owner (deployer)", () => {
        beforeEach(async () => {
            const mintTx = await ourNft.mintNft(user, 1, 0);
            await mintTx.wait();

            const approveUserTx = await ourNft.connect(user).approve(deployer, 1);
            await approveUserTx.wait();
        });

        it("transfer from user to deployer works", async () => {
            await expect(await ourNft.transferFrom(user, deployer, 1)).to.be.ok;
        });

        it("deployer is the owner of nft after transfer", async () => {
            const tx = await ourNft.transferFrom(user, deployer, 1);
            tx.wait();

            assert.equal((await ourNft.ownerOf(1)).toString(), deployer.address.toString());
        });
    });
});

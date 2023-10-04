const { ethers, getNamedAccounts } = require("hardhat");

async function updateOwner() {
    const deployer = (await getNamedAccounts()).deployer;
    const Bridge = await ethers.getContract("Bridge");
    const OurToken = await ethers.getContract("OurToken");

    const bridgeAddress = await Bridge.getAddress();
    // console.log(await Bridge.getAddress());

    const txResponse = await OurToken.updateOwner(bridgeAddress);
}

updateOwner()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });

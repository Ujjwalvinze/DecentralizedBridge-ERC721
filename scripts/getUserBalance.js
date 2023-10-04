const { getNamedAccounts, ethers } = require("hardhat");

const DECIMALS_FOR_ETH = 1000000000000000000;
async function getBalance() {
    const deployer = (await getNamedAccounts()).deployer;
    const user = deployer;
    const ourTokenContract = await ethers.getContract("OurToken");

    const balance = await ourTokenContract.balanceOf(user);

    console.log(`Balance of user ${user} is = ${balance}`);
}

getBalance()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });

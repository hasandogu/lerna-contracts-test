const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const MyERC721 = artifacts.require('MyERC721');

module.exports = async function (deployer) {
	const instance = await deployProxy(MyERC721, ["MyERC721", "MYERC721", "ipfs://"], { deployer });
};
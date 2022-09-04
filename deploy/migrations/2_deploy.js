const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const ERC721Core = artifacts.require('ERC721Core');

module.exports = async function (deployer) {
	const instance = await deployProxy(ERC721Core, ["Core", "COR", "ipfs://"], { deployer });
};
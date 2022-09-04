const ethUtil = require('ethereumjs-util');

const ganache = {
	communityWallet: "0x60b96db8abD8492664b17f175852A6B9bbd35A87", 
	treasuryWallet: "0x534266bab545c7f341074FfF033af20cBFFB52E0", 
}

const rinkeby = {
	communityWallet: "0x60b96db8abD8492664b17f175852A6B9bbd35A87", 
	treasuryWallet: "0x534266bab545c7f341074FfF033af20cBFFB52E0",
}

const ropsten = {
	communityWallet: "0x60b96db8abD8492664b17f175852A6B9bbd35A87",
	treasuryWallet: "0x534266bab545c7f341074FfF033af20cBFFB52E0",
}

const goerli = {
	communityWallet: "0x60b96db8abD8492664b17f175852A6B9bbd35A87", 
	treasuryWallet: "0x534266bab545c7f341074FfF033af20cBFFB52E0",
}

const mainnet = {
	communityWallet: "0x23a3610C1B2193284B921C11303489753EAdE84c",
	treasuryWallet: "0x64981B16ee3Ea70e6dc11A9a82aDabd1433522c8",
}

const polygon_mumbai = {
	communityWallet: "0x60b96db8abD8492664b17f175852A6B9bbd35A87",
	treasuryWallet: "0x534266bab545c7f341074FfF033af20cBFFB52E0",
}

const polygon_mainnet = {
	communityWallet: "0x23a3610C1B2193284B921C11303489753EAdE84c",
	treasuryWallet: "0x64981B16ee3Ea70e6dc11A9a82aDabd1433522c8",
}

let settings = {
  "default": ganache,
	"ganache": ganache,
  "ropsten": ropsten,
  "rinkeby": rinkeby,
  "goerli": goerli,
  "mainnet": mainnet,
  "polygon_mumbai": polygon_mumbai,
  "polygon_mainnet": polygon_mainnet
};

function getSettings(network) {
  if (settings[network] !== undefined) {
    return settings[network];
  } else {
    return settings["default"];
  }
}

async function getProxyImplementation(proxy, network, ProxyAdmin) {
  if (network === "test" || network == "ganache") {
    network = "unknown-1337"
  }

  if (network === "e2e") {
    network = "unknown-17"
  }

  let json;
  try {
    json = require(`../.openzeppelin/${network}.json`)
  } catch (e) {
    const tconfig = require('../truffle-config.js')
    const network_id = tconfig.networks[network].network_id;
    json = require(`../.openzeppelin/unknown-${network_id}.json`)
  }
  const c = await ProxyAdmin.at(json.admin.address)
  const deployed = await proxy.deployed()
  return c.getProxyImplementation(deployed.address)
}

function id(str) {
	return `0x${ethUtil.keccak256(str).toString("hex").substring(0, 8)}`;
}

module.exports = { getSettings, getProxyImplementation, id };
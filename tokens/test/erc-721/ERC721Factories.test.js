const UpgradeableBeacon = artifacts.require("UpgradeableBeacon.sol");
const BeaconProxy = artifacts.require("BeaconProxy.sol");
const ERC721Orderinbox = artifacts.require("ERC721Orderinbox.sol");
const ERC721OrderinboxFactory = artifacts.require("ERC721OrderinboxFactory.sol");

const truffleAssert = require('truffle-assertions');

const zeroWord = "0x0000000000000000000000000000000000000000000000000000000000000000";
const zeroAddress = "0x0000000000000000000000000000000000000000";

contract("Test factories minimal", accounts => {

	const tokenOwner = accounts[1];
  const salt = 3;

  let factory;
  beforeEach(async () => {
		const impl = await ERC721Orderinbox.new();
		const beacon = await UpgradeableBeacon.new(impl.address);
		factory = await ERC721OrderinboxFactory.new(beacon.address, [zeroAddress]);
	})

	it("should create erc721 private from factory, getAddress works correctly", async () => {
    let proxy;
    const addressBeforeDeploy = await factory.getAddress("name", "OIX", "https://ipfs.orderinbox.com", "https://ipfs.orderinbox.com", [], salt)

		const resultCreateToken = await factory.createPrivateToken("name", "OIX", "https://ipfs.orderinbox.com", "https://ipfs.orderinbox.com", [], salt, {from: tokenOwner});
      truffleAssert.eventEmitted(resultCreateToken, 'Create721OrderinboxPrivateProxy', (ev) => {
        proxy = ev.proxy;
        return true;
      });
		const token = await ERC721Orderinbox.at(proxy);
    const minter = tokenOwner;
    let transferTo = accounts[2];

    assert.equal(proxy, addressBeforeDeploy, "correct address got before deploy")

    const tokenId = 1;
    const tokenURI = "//uri";
    console.log("Before call _mintAndTransfer");
    const tx = await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});

		console.log("mint through proxy", tx.receipt.gasUsed);
    assert.equal(await token.ownerOf(tokenId), transferTo);
    assert.equal(await token.name(), "name")

    const txTransfer = await token.safeTransferFrom(transferTo, minter, tokenId, { from: transferTo });
    console.log("transfer through proxy", txTransfer.receipt.gasUsed);
	})

  it("should create erc721 public from factory, getAddress works correctly", async () => {
    let proxy;
    const addressBeforeDeploy = await factory.getAddress("name", "OIX", "https://ipfs.orderinbox.com", "https://ipfs.orderinbox.com", salt)

		const resultCreateToken = await factory.methods['createToken(string,string,string,string,uint256)']("name", "OIX", "https://ipfs.orderinbox.com", "https://ipfs.orderinbox.com", salt, {from: tokenOwner});
      truffleAssert.eventEmitted(resultCreateToken, 'Create721OrderinboxProxy', (ev) => {
        proxy = ev.proxy;
        return true;
      });
		const token = await ERC721Orderinbox.at(proxy);
    const minter = tokenOwner;
    let transferTo = accounts[2];

    assert.equal(proxy, addressBeforeDeploy, "correct address got before deploy")

    const tokenId = 1;
    const tokenURI = "//uri";
    console.log("Before call _mintAndTransfer");
    const tx = await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});

		console.log("mint through proxy", tx.receipt.gasUsed);
    assert.equal(await token.ownerOf(tokenId), transferTo);
    assert.equal(await token.name(), "name")

    const txTransfer = await token.safeTransferFrom(transferTo, minter, tokenId, { from: transferTo });
    console.log("transfer through proxy", txTransfer.receipt.gasUsed);
	})

  function creators(list) {
  	const value = 10000 / list.length
  	return list.map(account => ({ account, value }))
  }

});
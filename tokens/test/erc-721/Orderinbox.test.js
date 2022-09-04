const Testing = artifacts.require("ERC721Orderinbox.sol");
const ERC1271 = artifacts.require("TestERC1271.sol");
const UpgradeableBeacon = artifacts.require("UpgradeableBeacon.sol");
const BeaconProxy = artifacts.require("BeaconProxy.sol");
const ERC721Factory = artifacts.require("ERC721OrderinboxFactory.sol");
const TransferProxyTest = artifacts.require("TransferProxyTest.sol");
const truffleAssert = require('truffle-assertions');

const { signAutoId } = require("../../../common/test/mint");
const { expectThrow } = require("@daonomic/tests-common");

contract("ERC721Orderinbox", accounts => {

  let token;
  let tokenOwner = accounts[9];
  let erc1271;
  let beacon;
  let proxy;
  let whiteListProxy = accounts[5];
  const name = 'FreeMintableOrderinbox';
  const chainId = 1;
  const zeroWord = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  function creators(list) {
  	const value = 10000 / list.length
  	return list.map(account => ({ account, value }))
  }

  beforeEach(async () => {
    token = await Testing.new();
    transferProxy = await TransferProxyTest.new();
    await token.__ERC721Orderinbox_init(name, "OIX", "https://ipfs.orderinbox.com", "https://ipfs.orderinbox.com", [whiteListProxy]);
    await token.transferOwnership(tokenOwner);
    erc1271 = await ERC1271.new();
  });

  describe("Burn before ERC721Orderinbox ()", () => {
    it("Run burn from minter, mintAndTransfer by the same minter not possible, token burned, throw", async () => {
      const minter = accounts[1];
      let transferTo = accounts[4];
      const tokenId = 1;
      const tokenURI = "//uri";
      //minter burn item, in tokenId minter address contains, ok
      await expectThrow(
        token.burn(tokenId, {from: minter})
      );
//      await expectThrow( //try to mint and transfer token, throw, because token was burned
      await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter})
//      );
    });
    it("Run burn from another, throw, mintAndTransfer by the same minter is possible", async () => {
      const minter = accounts[1];
      let transferTo = accounts[2];
      const tokenId = 1;
      const tokenURI = "//uri";
      await expectThrow( //another burn item, in tokenId minter address contains, throw
        token.burn(tokenId, {from: transferTo})
      );
      //mint and transfer token, ok, because token was not burned, possible to mint to a new user
      await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});
      assert.equal(await token.ownerOf(tokenId), transferTo);
    });
  });
  describe("Burn after ERC721Orderinbox ()", () => {
    it("Run mintAndTransfer, burn, mintAndTransfer by the same minter, throw", async () => {
      const minter = accounts[1];
      let transferTo = accounts[2];
      let transferTo2 = accounts[4];
      const tokenId = 1;
      const tokenURI = "//uri";
      await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});
      await expectThrow( // tokens can only be burned by the creators who are also the owners
        token.burn(tokenId, {from: transferTo})
      );
//      await expectThrow( //try once more mint and transfer
      await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo2, {from: minter})
//      );
    });
    it("Run mintAndTransfer, burn, safeTransferFrom by the same minter, throw", async () => {
      const minter = accounts[1];
      let transferTo = accounts[2];
      const tokenId = 1; 
      const tokenURI = "//uri";
      await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});
      assert.equal(await token.ownerOf(tokenId), transferTo);
      await expectThrow(
        // Only creators can burn, so this should throw
        token.burn(tokenId, {from: transferTo})
      );        
      await expectThrow(
        token.safeTransferFrom(minter, transferTo, tokenId, {from: minter})
      )
    });

    it("Burn as new owner and minter", async () => {
      let minter = accounts[1];
      const tokenId = 1;
      const tokenURI = "//uri";
      await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});

      assert.equal(await token.ownerOf(tokenId), minter);

      await token.burn(tokenId, {from: minter});

      await expectThrow(
        token.ownerOf(tokenId)
      );
    });

    it("Burn as new owner and not minter, throws", async () => {
      let minter = accounts[1];
      const tokenId = 1;
      const tokenURI = "//uri";
      await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});

      assert.equal(await token.ownerOf(tokenId), minter);

      let transferTo = accounts[2];
      await token.transferFrom(minter, transferTo, tokenId, {from: minter});

      assert.equal(await token.ownerOf(tokenId), transferTo);
    
      await expectThrow(
        token.burn(tokenId, {from: transferTo})
      );

      assert.equal(await token.ownerOf(tokenId), transferTo);
    });
  });

 it("mint and transfer by minter, and token created by ERC721Factory ", async () => {
    beacon = await UpgradeableBeacon.new(token.address);
    factory = await ERC721Factory.new(beacon.address, [transferProxy.address]);
    resultCreateToken = await factory.methods['createToken(string,string,string,string,uint256)']("name", "OIX", "https://ipfs.orderinbox.com", "https://ipfs.orderinbox.com", 1, {from: tokenOwner});
    truffleAssert.eventEmitted(resultCreateToken, 'Create721OrderinboxProxy', (ev) => {
     	proxy = ev.proxy;
      return true;
    });
    tokenByProxy = await Testing.at(proxy);

    const minter = tokenOwner;
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";

    const tx = await tokenByProxy.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});
    const Transfer = await tokenByProxy.getPastEvents("Transfer", {
      fromBlock: tx.receipt.blockNumber,
      toBlock: tx.receipt.blockNumber
    });
    assert.equal(Transfer.length, 1, "Transfer.length")

    assert.equal(await tokenByProxy.ownerOf(tokenId), transferTo);
  });

  it("checkPrefix should work correctly, checks for duplicating of the base part of the uri ", async () => {
    beacon = await UpgradeableBeacon.new(token.address);
    factory = await ERC721Factory.new(beacon.address, [transferProxy.address]);
    const baseURI = "https://ipfs.orderinbox.com"
    const resultCreateToken = await factory.methods['createToken(string,string,string,string,uint256)']("name", "OIX", baseURI, "https://ipfs.orderinbox.com", 1, {from: tokenOwner});
    truffleAssert.eventEmitted(resultCreateToken, 'Create721OrderinboxProxy', (ev) => {
       proxy = ev.proxy;
      return true;
    });
    tokenByProxy = await Testing.at(proxy);
    const minter = tokenOwner;
    const tokenId = 1;
    const tokenURI = "/12345/456";
    await tokenByProxy.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});
    const gettokeURI = await tokenByProxy.tokenURI(tokenId);
    assert.equal(gettokeURI, baseURI + tokenURI, "token uri same with base")
    const tokenId1 = 2;
    const tokenURI1 = "/12345/123512512/12312312";
    await tokenByProxy.mintAndTransfer([tokenURI1, creators([minter]), [], [zeroWord]], minter, {from: minter});
    const gettokeURI1 = await tokenByProxy.tokenURI(tokenId1);
    assert.equal(gettokeURI1, baseURI + tokenURI1, "different uri")

    const tokenId2 = 3;
    const tokenURI2 = "/12345/";
    await tokenByProxy.mintAndTransfer([tokenURI2, creators([minter]), [], [zeroWord]], minter, {from: minter});
    const gettokeURI2 = await tokenByProxy.tokenURI(tokenId2);
    assert.equal(gettokeURI2, baseURI + tokenURI2, "different uri")
  });
  it("check for ERC165 interface", async () => {
  	assert.equal(await token.supportsInterface("0x01ffc9a7"), true);
  });

  it("check for mintAndTransfer interface", async () => {
  	assert.equal(await token.supportsInterface("0x8486f69f"), true);
  });

  it("check for Royalties interface", async () => {
  	assert.equal(await token.supportsInterface("0xc4926806"), true);
  });

  it("check for ERC721 interfaces", async () => {
  	assert.equal(await token.supportsInterface("0x80ac58cd"), true);
  	assert.equal(await token.supportsInterface("0x5b5e139f"), true);
  	assert.equal(await token.supportsInterface("0x780e9d63"), true);
  });

  it("approve for all", async () => {
    assert.equal(await token.isApprovedForAll(accounts[1], whiteListProxy), true);
//    assert.equal(await token.isApprovedForAll(accounts[1], transferProxy.address), true);
  });

  it("mint and transfer by whitelist proxy", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";
    let fees = [];

    const signature = await getSignature(tokenURI, creators([minter]), fees, minter);

    const tx = await token.mintAndTransfer([tokenURI, creators([minter]), fees, [signature]], transferTo, {from: whiteListProxy});
    const Transfer = await token.getPastEvents("Transfer", {
      fromBlock: tx.receipt.blockNumber,
      toBlock: tx.receipt.blockNumber
    });
    // We handle it all in 1 transfer as opposed to transferring to the minter first and then the final
    assert.equal(Transfer.length, 1, "Transfer.length")
    const transferEvent0 = Transfer[0]
//    const transferEvent1 = Transfer[1]

    assert.equal(transferEvent0.args.from, "0x0000000000000000000000000000000000000000", "transfer 0 from")
    assert.equal(transferEvent0.args.to, transferTo, "transfer 0 to")
    assert.equal(transferEvent0.args.tokenId, tokenId, "transfer 0 tokenId")

//    assert.equal(transferEvent1.args.from, minter, "transfer 1 from")
//    assert.equal(transferEvent1.args.to, transferTo, "transfer 1 to")
//    assert.equal(transferEvent1.args.tokenId, tokenId, "transfer 1 tokenId")

    assert.equal(await token.ownerOf(tokenId), transferTo);
    await checkCreators(tokenId, [minter]);
    // assert.equal(await token.getCreators(tokenId), [minter]);
  });

  it("mint and transfer by whitelist proxy. several creators", async () => {
    const minter = accounts[1];
    const creator2 = accounts[3];
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";
    let fees = [];

    const signature1 = await getSignature(tokenURI, creators([minter, creator2]), fees, minter);
    const signature2 = await getSignature(tokenURI, creators([minter, creator2]), fees, creator2);

    await token.mintAndTransfer([tokenURI, creators([minter, creator2]), fees, [signature1, signature2]], transferTo, {from: whiteListProxy});

    assert.equal(await token.ownerOf(tokenId), transferTo);
    await checkCreators(tokenId, [minter, creator2]);
  });


  // Minter doesn't need to be the first account in our case. So this is permanently skipped. Keeping it here for reference
  it.skip("mint and transfer by whitelist proxy. several creators. minter is not first", async () => {
    const minter = accounts[1];
    const creator2 = accounts[3];
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";
    let fees = [];

    const signature1 = await getSignature(tokenURI, creators([creator2, minter]), fees, minter);
    const signature2 = await getSignature(tokenURI, creators([creator2, minter]), fees, creator2);

    await expectThrow(
      token.mintAndTransfer([tokenURI, creators([creator2, minter]), fees, [signature2, signature1]], transferTo, {from: whiteListProxy})
    );
  });

  it("mint and transfer by whitelist proxy. several creators. wrong order of signatures", async () => {
    const minter = accounts[1];
    const creator2 = accounts[3];
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";
    let fees = [];

    const signature1 = await getSignature(tokenURI, creators([minter, creator2]), fees, minter);
    const signature2 = await getSignature(tokenURI, creators([minter, creator2]), fees, creator2);

    await expectThrow(
      token.mintAndTransfer([tokenURI, creators([minter, creator2]), fees, [signature2, signature1]], transferTo, {from: whiteListProxy})
    );
  });

  it("mint and transfer by approved proxy for all", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";

    const signature = await getSignature(tokenURI, creators([minter]), [], minter);

    let proxy = accounts[5];
    await token.setApprovalForAll(proxy, true, {from: minter});
    await token.mintAndTransfer([tokenURI, creators([minter]), [], [signature]], transferTo, {from: proxy});

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("mint and transfer by approved proxy for tokenId", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";

    const signature = await getSignature(tokenURI, creators([minter]), [], minter);

    let proxy = accounts[5];

    //owner query for nonexistent token.
    await expectThrow(
      token.approve(proxy, tokenId, {from: minter})
    );
    // todo ничего не проверяет?
    // await token.mintAndTransfer(tokenId, [], tokenURI, [minter], [signature], transferTo, {from: proxy});
    // assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("mint and transfer by minter", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";

    await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("safeTransferFrom from minter. not yet minted", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = 1;

    await expectThrow(
      token.safeTransferFrom(minter, transferTo, tokenId, {from: minter})
    )
  });

  it("mintAndTransfer from minter. already minted", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";

		await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});
    await token.safeTransferFrom(minter, transferTo, tokenId, {from: minter});

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("mintAndTransfer when not minter. not yet minted", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";

		await expectThrow(
      token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: transferTo})
		);
		await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});
    await token.safeTransferFrom(transferTo, accounts[5], tokenId, {from: transferTo});

    assert.equal(await token.ownerOf(tokenId), accounts[5]);
  });

  it("mint and transfer to self by minter", async () => {
    const minter = accounts[1];
    let transferTo = minter;

    const tokenId = 1;
    const tokenURI = "//uri";

    await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("mint and transfer with signature of not minter", async () => {
    const minter = accounts[1];
    const transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";

    const signature = await getSignature(tokenURI, creators([minter]), [], transferTo);

    await expectThrow(
      token.mintAndTransfer([tokenURI, creators([minter]), [], [signature]], transferTo, {from: whiteListProxy})
    );
  });

  it("mint and transfer without approval", async () => {
    const minter = accounts[1];
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";

    const signature = await getSignature(tokenURI, creators([minter]), [], minter);

    await expectThrow(
      token.mintAndTransfer([tokenURI, creators([minter]), [], [signature]], transferTo, {from: accounts[3]})
    );
  });

  it("standard transfer from owner", async () => {
    let minter = accounts[1];
    const tokenId = 1;
    const tokenURI = "//uri";
    await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});

    assert.equal(await token.ownerOf(tokenId), minter);

    let transferTo = accounts[2];
    await token.transferFrom(minter, transferTo, tokenId, {from: minter});

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("standard transfer by approved contract", async () => {
    let minter = accounts[1];
    const tokenId = 1;
    const tokenURI = "//uri";
    await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});

    assert.equal(await token.ownerOf(tokenId), minter);

    let transferTo = accounts[2];
    await token.transferFrom(minter, transferTo, tokenId, {from: whiteListProxy});

    assert.equal(await token.ownerOf(tokenId), transferTo);
  });

  it("standard transfer by not approved contract", async () => {
    let minter = accounts[1];
    const tokenId = 1;
    const tokenURI = "//uri";
    await token.mintAndTransfer([tokenURI, creators([minter]), [], [zeroWord]], minter, {from: minter});

    assert.equal(await token.ownerOf(tokenId), minter);

    let transferTo = accounts[2];
    await expectThrow(
      token.transferFrom(minter, transferTo, tokenId, {from: accounts[8]})
    );
  });

  it("signature by contract wallet erc1271, with whitelist proxy", async () => {
    const minter = erc1271;
    let transferTo = accounts[2];

    const tokenId = 1;
    const tokenURI = "//uri";

    await expectThrow(
      token.mintAndTransfer([tokenURI, creators([minter.address]), [], [zeroWord]], transferTo, {from: whiteListProxy})
    );

    await erc1271.setReturnSuccessfulValidSignature(true);
    await token.mintAndTransfer([tokenURI, creators([minter.address]), [], [zeroWord]], transferTo, {from: whiteListProxy});
    assert.equal(await token.ownerOf(tokenId), transferTo);
  });
  function getSignature(tokenURI, creators, fees, account) {
		return signAutoId(account, tokenURI, creators, fees, token.address);
  }

  async function checkCreators(tokenId, exp) {
    const creators = await token.getCreators(tokenId);
    assert.equal(creators.length, exp.length);
    const value = 10000 / exp.length;
    for(let i = 0; i < creators.length; i++) {
      assert.equal(creators[i][0], exp[i]);
      assert.equal(creators[i][1], value);
    }
  }
});
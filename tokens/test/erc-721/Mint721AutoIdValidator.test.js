const Mint721ValidatorTest = artifacts.require("Mint721ValidatorTest.sol");
const TestERC1271 = artifacts.require("TestERC1271.sol");
const ZERO = "0x0000000000000000000000000000000000000000";
const { expectThrow } = require("@daonomic/tests-common");
const { signAutoId } = require("../../../common/test/mint");

contract("Mint721Validator - AutoId", accounts => {
	let testing;
	let erc1271;
	let fees;

	beforeEach(async () => {
		testing = await Mint721ValidatorTest.new();
		await testing.__Mint721ValidatorTest_init();
		erc1271 = await TestERC1271.new();
		fees = [{ account: accounts[1], value: 1 }, { account: accounts[2], value: 100 }]
	});

	it("should validate if signer is correct", async () => {
		const creators = [{ account: accounts[1], value: 10000 }]
		const signature = await signAutoId(accounts[1], "testURI", creators, fees, testing.address);
		await testing.validateTest([0, "testURI", creators, fees, [signature], true], 0);
	});

	it("should work for some creators", async () => {
		const creators = [{ account: accounts[2], value: 5000 }, { account: accounts[1], value: 10000 }];
		const signature = await signAutoId(accounts[1], "testURI", creators, fees, testing.address);
		await testing.validateTest([0, "testURI", creators, fees, ["0x", signature], true], 1);
	});

	it("should work if fees list is empty", async () => {
		const creators = [{ account: accounts[1], value: 10000 }]
		const signature = await signAutoId(accounts[1], "testURI", creators, [], testing.address);
		await testing.validateTest([0, "testURI", creators, [], [signature], true], 0);
	});

	it("should fail if signer is incorrect", async () => {
		const creators = [{ account: accounts[1], value: 10000 }]
		const signature = await signAutoId(accounts[0], "testURI", creators, fees, testing.address);
		await expectThrow(
			testing.validateTest([0, "testURI", creators, fees, [signature], true], 0)
		);
	});

	it("should validate if signer is contract and 1271 passes", async () => {
		const creators = [{ account: erc1271.address, value: 10000 }]
		await expectThrow(
			testing.validateTest([0, "testURI", creators, fees, ["0x"], true], 0)
		);

		await erc1271.setReturnSuccessfulValidSignature(true);

		await testing.validateTest([0, "testURI", creators, fees, ["0x"], true], 0)
	});

});

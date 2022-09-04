Truffle verify cannot find module test

Steps to repro:

1. `yarn bootstrap`
2. `cd deploy`
3. `truffle migrate --network rinkeby --reset` (optional)
4. `truffle run verify MyERC721 --network rinkeby --debug`

See below

```
development
../.env.development.local false
../.env.development true
../.env.local false
../.env true
DEBUG logging is turned ON
Running truffle-plugin-verify v0.5.28
Retrieving network's network ID & chain ID
Verifying MyERC721
Reading artifact file at D:\Users\hdtas\Repos\Orderinbox\lerna-contracts-test\deploy\build\contracts\MyERC721.json
Reading artifact file at D:\Users\hdtas\Repos\Orderinbox\lerna-contracts-test\deploy\build\contracts\MyERC721.json
Verifying proxy implementation MyERC721 at 0xadabdbecefab506ebee6e3bf9ead8b1336d0765a
Retrieving constructor parameters from https://api-rinkeby.etherscan.io/api?apiKey=RN1TFIASJH9NMEXM254UQXP3AF3HIJ5GTW&module=account&action=txlist&address=0xadabdbecefab506ebee6e3bf9ead8b1336d0765a&page=1&sort=asc&offset=1
Constructor parameters retrieved: 0x
Cannot find module '@lerna-contracts-test/tokens/contracts/MyERC721.sol'
Require stack:
- C:\Users\hdtas\AppData\Roaming\npm\node_modules\truffle-plugin-verify\verify.js
- C:\Users\hdtas\AppData\Roaming\npm\node_modules\truffle\node_modules\original-require\index.js
- C:\Users\hdtas\AppData\Roaming\npm\node_modules\truffle\build\cli.bundled.js
Failed to verify 1 contract(s): MyERC721

```
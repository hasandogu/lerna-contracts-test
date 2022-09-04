Truffle verify cannot find module test

Steps to repro:

1. `lerna bootstrap`
2. `cd deploy`
3. `truffle migrate --network rinkeby --reset` (optional)
4. `truffle run verify MyERC721 --network rinkeby --debug`


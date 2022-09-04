// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "../../../contracts/erc-721/Mint721Validator.sol";

contract Mint721ValidatorTest is Mint721Validator {
    function __Mint721ValidatorTest_init() external initializer {
        __Mint721Validator_init_unchained(); 
    }

    function validateTest(LibERC721Mint.Mint721Data memory data, uint index) external view {
        validate(data.creators[index].account, LibERC721Mint.hash(data), data.signatures[index]);
    }
}

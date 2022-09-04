// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@orderinbox/interfaces/contracts/INFTTransferProxy.sol";

contract TransferProxyTest is INFTTransferProxy {

    function erc721safeTransferFrom(IERC721Upgradeable token, address from, address to, uint256 tokenId) override external {
        token.safeTransferFrom(from, to, tokenId);
    }

    function erc1155safeTransferFrom(IERC1155Upgradeable token, address from, address to, uint256 id, uint256 value, bytes calldata data) override external {
        token.safeTransferFrom(from, to, id, value, data);
    }
}

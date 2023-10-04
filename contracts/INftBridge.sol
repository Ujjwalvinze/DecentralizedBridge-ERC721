// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INftBridge is IERC721 {
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    function mintNft(address to, uint256 tokenId, uint256 breedNumber) external returns (uint256);

    function burnNft(address owner, uint256 tokenId) external;
}

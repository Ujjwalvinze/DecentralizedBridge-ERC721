// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OurNft is ERC721URIStorage, Ownable {
    uint256 private s_tokenCounter;
    string[3] private s_tokenUris;

    mapping(uint256 => Breed) private s_tokenIdToBreed;

    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    event Nft_Minted(address owner, uint256 tokenId, Breed dogBreed);
    event Nft_Burnt(address owner, uint256 tokenId, Breed dogBreed);

    constructor(string[3] memory tokenUris) ERC721("Our NFT", "ONFT") {
        s_tokenCounter = 0;
        s_tokenUris = tokenUris;
    }

    function mintNft(
        address to,
        uint256 tokenId,
        uint256 breedNumber
    ) public onlyOwner returns (uint256) {
        uint256 tokenIdToUse = tokenId;

        if (tokenId == 0) {
            tokenIdToUse = s_tokenCounter;
            s_tokenCounter++;
        }

        _safeMint(to, tokenIdToUse);
        _setTokenURI(tokenIdToUse, s_tokenUris[breedNumber]);

        s_tokenIdToBreed[tokenId] = Breed(breedNumber);

        emit Nft_Minted(to, tokenIdToUse, s_tokenIdToBreed[tokenId]);
        return s_tokenCounter;
    }

    function burnNft(address owner, uint256 tokenId) public onlyOwner {
        _burn(tokenId);
        emit Nft_Burnt(owner, tokenId, s_tokenIdToBreed[tokenId]);
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getTokenUris() public view returns (string[3] memory) {
        return s_tokenUris;
    }

    function getBreedFromTokenId(uint256 tokenId) public view returns (Breed) {
        return s_tokenIdToBreed[tokenId];
    }
}

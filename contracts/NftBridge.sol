// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./INftBridge.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error InvalidSignature(bytes32);

contract NftBridge is ReentrancyGuard, Ownable {
    INftBridge private s_NftToken;

    event TransferInitiated(address owner, uint256 tokenId, uint256 nonce, bytes signature);

    event TransferComplete(address owner, uint256 tokenId);

    constructor(address nftTokenAddress) {
        s_NftToken = INftBridge(nftTokenAddress);
    }

    function initiateTransfer(
        uint256 tokenId,
        uint256 nonce,
        bytes calldata signature
    ) public nonReentrant onlyOwner {
        s_NftToken.burnNft(msg.sender, tokenId);
        emit TransferInitiated(msg.sender, tokenId, nonce, signature); // add add amount symbol
    }

    function mintTransferredToken(
        uint256 breedNumber,
        address to,
        uint256 tokenId,
        uint256 nonce,
        bytes calldata signature
    ) public nonReentrant onlyOwner {
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, tokenId, nonce));
        bytes32 signedMessagehash = prefixed(messageHash);
        address toVerify = recoverSigner(signedMessagehash, signature);

        if (toVerify != to) revert InvalidSignature(signedMessagehash);

        s_NftToken.mintNft(to, tokenId, breedNumber);

        emit TransferComplete(msg.sender, tokenId);
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function recoverSigner(bytes32 message, bytes memory sig) internal pure returns (address) {
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (uint8, bytes32, bytes32) {
        require(sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }
}

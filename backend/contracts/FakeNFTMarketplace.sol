// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract FakeNFTMarketplace{

    mapping(uint256 => address) public tokens;
    uint256 nftPrice = 0.1 ether;
    // Purchase function----to purchase the NFT
    function purchase(uint256 _tokenId)payable external {
        require(msg.value >= nftPrice, "Insufficient amount of ether sent");
        tokens[_tokenId] = msg.sender;
    }

    // getPrice function---returns the price of NFT
    function getPrice() view external returns(uint256){
        return nftPrice;
    }
    // available function---checks the availablity of an nft returns a boolean value 
    function available(uint256 _tokenId) view external returns(bool){
        if(tokens[_tokenId]== address(0)){
            return true;
        }
        return false;
    }
}
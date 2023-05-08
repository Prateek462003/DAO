// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFakeNFTMarketplace{
    function purchase(uint256 _tokenId)payable external;    
    function getPrice() external view returns(uint256);
    function available(uint256 _tokenId) view external returns(bool);
}

interface ICryptoDevsNFT {

    function balanceOf(address owner) external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}                      

contract CryptoDevsDAO{
    
    
    struct Proposal{
        uint256 nftTokenId;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        mapping(uint256 => bool) voters;
    }   
    
    mapping(uint256 => Proposal) public proposals;
    
    uint256 public numProposals;

    IFakeNFTMarketplace nftMarketplace;
    ICryptoDevsNFT cryptoDevsNFT;
    
    enum Vote{
        Yes,
        No
    }

    constructor (address _nftMarketPlace, address _cryptoDevsNFT) payable {
        nftMarketplace = IFakeNFTMarketplace(_nftMarketPlace);
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
    }

    modifier nftHolderOnly(){
        require(cryptoDevsNFT.balanceOf(msg.sender) > 0, "Not an NFT Holder");
        _;
    }

    modifier activeProposal(uint256 proposalIndex){
        require(proposals[proposalIndex].deadline > block.timestamp, "DEADLINE EXCEEDED");
        _;
    }

    function createProposal(uint256 _nftTokenId) external nftHolderOnly returns(uint256){
        require(nftMarketplace.available(_nftTokenId), "NFT NOT FOR SALE");
        Proposal storage proposal = proposals[numProposals];
        proposal.nftTokenId = _nftTokenId;
        proposal.deadline =  block.timestamp + 5 minutes;
        numProposals++;
        return numProposals-1;
    }
    
    function voteOnProposal(uint256 proposalIndex, Vote vote) external nftHolderOnly activeProposal(proposalIndex) {
        Proposal storage proposal = proposals[proposalIndex];
        uint256 voterNFTbalance = cryptoDevsNFT.balanceOf(msg.sender);
        uint256 numVotes;
        yyyy
    }
}

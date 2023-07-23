// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;


contract Auction {
    address owner;

    struct Item {
        uint itemId;
        //IERC721 nft;
        uint tokenId;
        uint startPrice;
        uint currentPrice;
        address payable seller;
        bool sold;
    }

    // itemId -> Item
    mapping(uint => Item) public items;

    constructor() {
        owner = msg.sender;
    }
    
    //let anyone start an auction
    function startAuction () public {}

    //let anyone bid on items 
    function bid () public {

         
    }

    //let the program close the auction when time is up
    function endAuction () internal {}

    //let program transfer the nft to the buyer and $credit to the seller
    function saveTransfer () internal {}

}
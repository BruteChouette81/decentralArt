// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./Rnft.sol";
import "./credit.sol";

import "./dds.sol";


contract BuyingDDS is PoolOwnable {

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address seller;
        bool sold;
        bool prooved;
        uint numBlock;
        uint startingBlock;
    }

    event testEvent(
        bool test
    );

    DDS public ddsdb;
    credit public credits;

    

    constructor(DDS _addrDds, credit _addrCredit) {
        ddsdb = _addrDds;
        credits = _addrCredit;
    }

    function purchaseItem(uint _itemId, uint256 _numItem, string memory _key) external  {
        DDS.Item memory item = ddsdb.getItems(_itemId);
        emit testEvent(item.sold);
        uint256 itemCount = ddsdb.itemCount();
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        //require(msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
        require(!item.sold, "item already sold");
        require(credits.allowance(msg.sender, address(this)) >= item.price, "Need to approove!");
        // transfer credits to the contract and add the seller to the approval list
        ddsdb.setPurchased(address(item.seller), (_numItem + 1), _itemId);
        ddsdb.setInfos(_itemId, _key);

        //credits stay in contract until payed
        credits.transferFrom(msg.sender, address(this), item.price); //approve the contract
        
        item.sold = true;//setter
        item.startingBlock = block.number; //starting the countdown

        item.nft.approve(msg.sender, item.tokenId);
        item.nft.transferFrom(address(this), msg.sender, item.tokenId); //nft transfer 
       
        // emit Bought event
        ddsdb.triggerBought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function mintBuy(address buyer, uint _itemId, uint256 _numItem, string memory _key) external onlyPool()  {

        DDS.Item memory item = ddsdb.getItems(_itemId);
        uint256 itemCount = ddsdb.itemCount();
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        //require(msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
        require(!item.sold, "item already sold");
        //require(credits.allowance(msg.sender, address(this)) == item.price, "Need to approove!");
        // transfer credits to the contract and add the seller to the approval list
        ddsdb.setPurchased(address(item.seller), (_numItem + 1), _itemId);
        ddsdb.setInfos(_itemId, _key);

        //credits stay in contract until payed
        //credits already minted to the contract in oracle
       // credits.transferFrom(msg.sender, address(this), item.price); //approve the contract
        
        item.sold = true;
        item.startingBlock = block.number; //starting the countdown

        item.nft.approve(buyer, item.tokenId);
        item.nft.transferFrom(address(this), buyer, item.tokenId); //nft transfer 
       
        // emit Bought event
        ddsdb.triggerBought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

}

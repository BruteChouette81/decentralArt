// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Rnft.sol";
import "./credit.sol";

import "./dds.sol";
    
contract Prooving is PoolOwnable {
    //make another function to confirm with a cron job API that poll an api

    DDS public ddsdb;
    credit public credits;

    

    constructor(DDS _addrDds, credit _addrCredit) {
        ddsdb = _addrDds;
        credits = _addrCredit;
    }

    function submitProof (uint256 _id, string memory _proof) public  { //https://www.canadapost-postescanada.ca/cpc/en/personal/sending/letters-mail/registered-mail.page
        //_proof is the tracking code for internationnal USPS and Post canada
        DDS.Item memory item = ddsdb.getItems(ddsdb.getPurchased(msg.sender, _id)); //item 

        require(bytes(_proof).length == 13, "Need a Valid Tracking code"); //other requirement(poll an api to see if it exist)
        require(item.prooved == false, "Already prooved or pass Time out");

        ddsdb.setProofs(ddsdb.getPurchased(msg.sender, _id), _proof);

        bytes memory encoded_proof = bytes(_proof);

        credits.transfer(msg.sender, item.price); //pay seller

        item.prooved = true;

        ddsdb.triggerProoved(
            item.itemId,
            address(item.nft),
            item.tokenId,
            item.seller,
            keccak256(encoded_proof)
        );
    }

    function submitProofPool (address seller, uint256 _id, string memory _proof) public onlyPool() { //https://www.canadapost-postescanada.ca/cpc/en/personal/sending/letters-mail/registered-mail.page
        //_proof is the tracking code for internationnal USPS and Post canada
        DDS.Item memory item = ddsdb.getItems(ddsdb.getPurchased(seller, _id));

        require(bytes(_proof).length >= 13 && 16 >= bytes(_proof).length, "Need a Valid Tracking code"); //other requirement(poll an api to see if it exist)

        require(item.prooved == false, "Already prooved or pass Time out");

        ddsdb.setProofs(ddsdb.getPurchased(seller, _id), _proof);

        bytes memory encoded_proof = bytes(_proof);

        credits.transfer(seller, item.price); //pay seller

        item.prooved = true;

        ddsdb.triggerProoved(
                item.itemId,
                address(item.nft),
                item.tokenId,
                item.seller,
                keccak256(encoded_proof)
        );
    }

    function retrieveCredit(uint256 _itemId) public returns(uint) { //function to retrive cash if item not sent
        //5760 blocks by day
        DDS.Item memory item = ddsdb.getItems(_itemId);
        require(item.sold == true, "Already sold");
        require(item.prooved == false, "Item as been sent");
        require(item.nft.ownerOf(item.tokenId) == msg.sender || msg.sender == _pool, "You need to have this NFT");

        require((item.startingBlock + item.numBlock) >= block.number, "Need to wait until time is up!"); //if the delay is completed

        //if the delay is completed
        credits.transfer(msg.sender, item.price); //regive the $credit to the buyer
        return item.price;
    }
}
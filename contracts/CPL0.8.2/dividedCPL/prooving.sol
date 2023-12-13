// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
    
    
contract Prooving {
    //make another function to confirm with a cron job API that poll an api

    function submitProof (uint256 _id, string memory _proof) public  { //https://www.canadapost-postescanada.ca/cpc/en/personal/sending/letters-mail/registered-mail.page
        //_proof is the tracking code for internationnal USPS and Post canada
        Item storage item = items[purchased[msg.sender][_id]]; //item 

        require(bytes(_proof).length == 13, "Need a Valid Tracking code"); //other requirement(poll an api to see if it exist)
        require(item.prooved == false, "Already prooved or pass Time out");

        proofs[purchased[msg.sender][_id]] = _proof;

        bytes memory encoded_proof = bytes(_proof);

        credits.transfer(msg.sender, item.price); //pay seller

        item.prooved = true;

        emit Prooved(
            item.itemId,
            address(item.nft),
            item.tokenId,
            item.seller,
            keccak256(encoded_proof)
        );
    }

    function submitProofPool (address seller, uint256 _id, string memory _proof) public onlyPool() { //https://www.canadapost-postescanada.ca/cpc/en/personal/sending/letters-mail/registered-mail.page
        //_proof is the tracking code for internationnal USPS and Post canada
        Item storage item = items[purchased[seller][_id]]; //item 

        require(bytes(_proof).length >= 13 && 16 >= bytes(_proof).length, "Need a Valid Tracking code"); //other requirement(poll an api to see if it exist)

        require(item.prooved == false, "Already prooved or pass Time out");

        proofs[purchased[msg.sender][_id]] = _proof;

        bytes memory encoded_proof = bytes(_proof);

        credits.transfer(seller, item.price); //pay seller

        item.prooved = true;

        emit Prooved(
            item.itemId,
            address(item.nft),
            item.tokenId,
            item.seller,
            keccak256(encoded_proof)
        );
    }

    function retrieveCredit(uint256 _itemId) public returns(uint) { //function to retrive cash if item not sent
        //5760 blocks by day
        Item storage item = items[_itemId];
        require(item.sold == true, "Already sold");
        require(item.prooved == false, "Item as been sent");
        require(item.nft.ownerOf(item.tokenId) == msg.sender || msg.sender == _pool, "You need to have this NFT");

        require((item.startingBlock + item.numBlock) >= block.number, "Need to wait until time is up!"); //if the delay is completed

        //if the delay is completed
        credits.transfer(msg.sender, item.price); //regive the $credit to the buyer
        return item.price;
    }
}
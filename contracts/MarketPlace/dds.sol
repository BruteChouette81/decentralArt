// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "./Rnft.sol";
import "./credit.sol";


contract DDS is PoolOwnable {
    uint public itemCount; 
    credit public credits; //mainnet program: 0x6CFADe18df81Cd9C41950FBDAcc53047EdB2e565 //0xD475c58549D3a6ed2e90097BF3D631cf571Bdd86
    RealItem public realItems; // goerli: 0xbC1Fe9f6B298cCCd108604a0Cf140B2d277f624a

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




    // itemId -> Item
    mapping(uint => Item) public items;
    // seller -> [1: itemId, 2: itemId ...]
    mapping(address => mapping(uint256 => uint256)) public purchased;
    //itemId -> infos
    mapping(uint => string) internal infos;

    

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    event Deleted(
        uint itemId,
        address indexed nft,
        uint tokenId,
        address indexed seller
    );

    event Prooved(
        uint itemId,
        address indexed nft,
        uint tokenId,
        address indexed seller,
        string proof
    );

    constructor(credit _addrCredit, RealItem _addrRealItem) {
        credits = _addrCredit;
        realItems = _addrRealItem;
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    // Make item to offer on the marketplace
    function listItem(IERC721 _nft, uint _tokenId, uint _price, uint _numDays) public {
        require(_price > 0, "Price must be greater than zero");
        require(address(_nft) == address(realItems), "Need to be a Imperial Real Item");

        address ownerofTicket = _nft.ownerOf(_tokenId);
        require(ownerofTicket == msg.sender, "Need to be the owner of the Imperial Real in order to List the item");

        // increment itemCount
        itemCount ++;

        // transfer nft
        
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // add new item to items mapping
        items[itemCount] = Item (
            itemCount,
            _nft,
            _tokenId,
            _price,
            address(msg.sender),
            false,
            false,
            _numDays * 5760,
            0
        );
        // emit Offered event
        emit Offered(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );
    }

    function mintList(address account, string memory uri, uint _price, uint _numDays) public onlyPool() returns (uint) {
        require(_numDays > 0, "Days must be greater than zero");
        require(_price > 0, "Price must be greater than zero");
        // increment itemCount
        itemCount ++;

        // mint nft directly to the contract to avoid two transactions
        uint id = realItems.safeMint(address(this), uri);
        // add new item to items mapping
        items[itemCount] = Item (
            itemCount,
            realItems,
            id,
            _price,
            address(account),
            false,
            false,
            _numDays * 5760,
            0
        );
        // emit Offered event
        emit Offered(
            itemCount,
            address(realItems),
            id,
            _price,
            address(account)
        );

        return itemCount;
    }

    function multipleMintList(address account, string[] memory uris, uint[] memory _prices, uint[] memory _numDays) public onlyPool() returns (uint) {
        require(_numDays.length == _prices.length, "must be the same number of items");

        uint256 id2 = realItems._tokenIdCounter();
        uint id = realItems.multipleMint(address(this), uris);

        for (uint i = 0; i<_prices.length; i ++) {
            // increment itemCount
            itemCount ++;

            // mint nft directly to the contract to avoid two transactions
            
            // add new item to items mapping
            items[itemCount] = Item (
                itemCount,
                realItems,
                id2 + i, //(id - _prices.length + i + 1),
                _prices[i],
                address(account),
                false,
                false,
                _numDays[i] * 5760,
                0
            );
            // emit Offered event
            emit Offered(
                itemCount,
                address(realItems),
                id2 + i,//(id - _prices.length + i + 1),
                _prices[i],
                address(account)
            );
        }
        

        return itemCount;
    }

    function deleteItem(uint _itemId) public {
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(item.seller == msg.sender, "you need to be the owner of the item");
        require(!item.sold, "item already sold");

        item.sold = true;
        item.nft.approve(msg.sender, item.tokenId);
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        emit Deleted(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.seller

        );
    }

    function deleteItemPool(address _itemOwner, uint _itemId) public onlyPool {
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(item.seller == _itemOwner, "you need to be the owner of the item");
        require(!item.sold, "item already sold");

        item.sold = true;
        item.nft.approve(item.seller, item.tokenId);
        item.nft.transferFrom(address(this), item.seller, item.tokenId);

        emit Deleted(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.seller

        );
    }

    function getPurchased(address _seller, uint256 _id) public view returns( uint256 itemId) { //see item purchased that you need to provide 
        return purchased[_seller][_id];
    }

    function getClientInfos(uint _itemId, uint _orderId) public view returns (string memory _info){
        require(purchased[msg.sender][_orderId] == _itemId, "Need to be the seller of the item in order to get their DID");
        string memory info = infos[_itemId];
        return info;
    }
    function getClientInfosPool(uint _itemId) public onlyPool view returns (string memory _info){
        //require(purchased[msg.sender][_orderId] == _itemId, "Need to be the seller of the item in order to get their DID");
        string memory info = infos[_itemId];
        return info;
    }

    //make another function to confirm with a cron job API that poll an api

    function submitProof (uint256 _id, string memory _proof) public  { //https://www.canadapost-postescanada.ca/cpc/en/personal/sending/letters-mail/registered-mail.page
        //_proof is the tracking code for internationnal USPS and Post canada
        Item storage item = items[purchased[msg.sender][_id]]; //item 

        require(bytes(_proof).length == 13, "Need a Valid Tracking code"); //other requirement(poll an api to see if it exist)
        require(item.prooved == false, "Already prooved or pass Time out");

        credits.transfer(msg.sender, item.price); //pay seller

        item.prooved = true;

        emit Prooved(
            item.itemId,
            address(item.nft),
            item.tokenId,
            item.seller,
            _proof
        );
    }

    function submitProofPool (address seller, uint256 _id, string memory _proof) public onlyPool() { //https://www.canadapost-postescanada.ca/cpc/en/personal/sending/letters-mail/registered-mail.page
        //_proof is the tracking code for internationnal USPS and Post canada
        Item storage item = items[purchased[seller][_id]]; //item 

        require(bytes(_proof).length == 13, "Need a Valid Tracking code"); //other requirement(poll an api to see if it exist)
        require(item.prooved == false, "Already prooved or pass Time out");

        credits.transfer(seller, item.price); //pay seller

        item.prooved = true;

        emit Prooved(
            item.itemId,
            address(item.nft),
            item.tokenId,
            item.seller,
            _proof
        );
    }

    function retrieveCredit(uint256 _itemId) public returns(uint) { //function to retrive cash if item not sent
        //5760 blocks by day
        Item storage item = items[_itemId];
        require(item.sold == true, "Already sold");
        require(item.prooved == false, "Item as been sent");
        require(item.nft.ownerOf(item.tokenId) == msg.sender || msg.sender == _pool, "You need to have this NFT");

        require((item.startingBlock + item.numBlock) <= block.number, "Need to wait until time is up!"); //if the delay is completed

        //if the delay is completed
        credits.transfer(msg.sender, item.price); //regive the $credit to the buyer
        return item.price;
    }

    


    function purchaseItem(uint _itemId, uint256 _numItem, string memory _key) external  {
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        //require(msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
        require(!item.sold, "item already sold");
        require(credits.allowance(msg.sender, address(this)) == item.price, "Need to approove!");
        // transfer credits to the contract and add the seller to the approval list
        purchased[address(item.seller)][_numItem + 1] = _itemId;
        infos[_itemId] = _key;

        //credits stay in contract until payed
        credits.transferFrom(msg.sender, address(this), item.price); //approve the contract
        
        item.sold = true;
        item.startingBlock = block.number; //starting the countdown

        item.nft.approve(msg.sender, item.tokenId);
        item.nft.transferFrom(address(this), msg.sender, item.tokenId); //nft transfer 
       
        // emit Bought event
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function mintBuy(address buyer, uint _itemId, uint256 _numItem, string memory _key) external onlyPool()  {

        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        //require(msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
        require(!item.sold, "item already sold");
        //require(credits.allowance(msg.sender, address(this)) == item.price, "Need to approove!");
        // transfer credits to the contract and add the seller to the approval list
        purchased[address(item.seller)][_numItem + 1] = _itemId;
        infos[_itemId] = _key;

        //credits stay in contract until payed
        //credits already minted to the contract in oracle
       // credits.transferFrom(msg.sender, address(this), item.price); //approve the contract
        
        item.sold = true;
        item.startingBlock = block.number; //starting the countdown

        item.nft.approve(buyer, item.tokenId);
        item.nft.transferFrom(address(this), buyer, item.tokenId); //nft transfer 
       
        // emit Bought event
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            address(buyer)
        );
    }

}


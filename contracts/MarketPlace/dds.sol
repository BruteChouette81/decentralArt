// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "../myCrypto/token.sol";
import "./Rnft.sol";

contract Ownable { 
  // Variable that maintains 
  // owner address
  address private _owner;
  
  // Sets the original owner of 
  // contract when it is deployed
  constructor()
  {
    _owner = msg.sender;
  }
  
  // Publicly exposes who is the
  // owner of this contract
  function owner() public view returns(address) 
  {
    return _owner;
  }
  
  // onlyOwner modifier that validates only 
  // if caller of function is contract owner, 
  // otherwise not
  modifier onlyOwner() 
  {
    require(isOwner(),
    "Function accessible only by the owner !!");
    _;
  }
  
  // function for owners to verify their ownership. 
  // Returns true for owners otherwise false
  function isOwner() public view returns(bool) 
  {
    return msg.sender == _owner;
  }
}

contract PoolOwnable is Ownable {
    address private _pool;
  
  // Sets the original owner of 
  // contract when it is deployed

  modifier onlyPool() 
  {
    require(isPool(),
    "Function accessible only by the owner !!");
    _;
  }

  function isPool() public view returns(bool) 
  {
    return msg.sender == _pool;
  }

    function setPool(address pool) public onlyOwner {
        _pool = pool;
    }
}

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

    function retrieveCredit(uint256 _itemId) public { //function to retrive cash if item not sent
        //5760 blocks by day
        Item storage item = items[_itemId];
        require(item.sold == true, "need to be sold");
        require(item.prooved == false, "Item as been sent");
        require(item.nft.ownerOf(item.tokenId) == msg.sender, "You need to have this NFT");

        require((item.startingBlock + item.numBlock) <= block.number, "Need to wait until time is up!"); //if the delay is completed

        //if the delay is completed
        credits.transfer(msg.sender, item.price); //regive the $credit to the buyer
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

}


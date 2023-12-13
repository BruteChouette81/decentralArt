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
    //getter
    function getItems(uint _id) public view returns (Item memory) {
        return items[_id];
    }
    // seller -> [1: itemId, 2: itemId ...]
    mapping(address => mapping(uint256 => uint256)) public purchased;
    //setter
    function setPurchased(address _seller, uint256 _key, uint256 _itemId) public returns (bool) {
        purchased[address(_seller)][_key] = _itemId;
        return true;
    }
    //itemId -> infos
    mapping(uint => string) internal infos;
    //setter ==> get onlyBuying modifier
    function setInfos(uint _itemId, string memory _infos) public returns (bool) {
        infos[_itemId] = _infos;
        return true;
    }

    mapping(uint => string) internal proofs;

    

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
    //trigger ==> add modifier 
    function triggerBought(uint itemId, address nft, uint tokenId, uint price, address seller,address buyer) public {
        emit Bought(itemId,
        nft,
        tokenId,
        price,
        seller,
        buyer);
    }

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
        bytes32 proof
    );

    constructor(credit _addrCredit, RealItem _addrRealItem) {
        credits = _addrCredit;
        realItems = _addrRealItem;
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

    function getProof(uint _itemId) public onlyPool view returns (string memory _proof){
        string memory proof = proofs[_itemId];
        return proof;
    }

   
}

    


    


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "./Rnft.sol";
import "./credit.sol";

contract DDS is PoolOwnable {
    uint public itemCount; 
    //setter
    function incrementItemCount() public {
        itemCount++;
    }
    credit public credits; //mainnet program: 0x6CFADe18df81Cd9C41950FBDAcc53047EdB2e565 //0xD475c58549D3a6ed2e90097BF3D631cf571Bdd86
    RealItem public realItems; // goerli: 0xbC1Fe9f6B298cCCd108604a0Cf140B2d277f624a

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address seller;
        address buyer;
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
    //setter
    function setItems(Item memory _item) public onlyMinter() returns (bool) {
        items[itemCount] = _item;
        return true;
    }
    // seller -> [1: itemId, 2: itemId ...]
    mapping(address => mapping(uint256 => uint256)) public purchased;
    //getter
    function getPurchased(address _seller, uint256 _id) public view returns( uint256 itemId) { //see item purchased that you need to provide 
        return purchased[_seller][_id];
    }

    //setter
    function setPurchased(address _seller, uint256 _key, uint256 _itemId) public onlyBuyer() returns (bool) {
        purchased[address(_seller)][_key] = _itemId;
        return true;
    }
    //itemId -> infos
    mapping(uint => string) internal infos;
    //setter ==> get onlyBuying modifier
    function setInfos(uint _itemId, string memory _infos) public onlyBuyer() returns (bool) {
        infos[_itemId] = _infos;
        return true;
    }

    mapping(uint => string) internal proofs;
    //setter
    function setProofs(uint256 _key, string memory _proof) public onlyProover() returns (bool) {
        proofs[_key] = _proof;
        return true;
    }

    

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );
    //trigger
    function triggerOffered(uint itemId, address nft, uint tokenId, uint price, address seller) public {
        emit Offered(
        itemId,
        nft,
        tokenId,
        price,
        seller
    );
    }
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );
    //trigger ==> add modifier 
    function triggerBought(uint itemId, address nft, uint tokenId, uint price, address seller,address buyer) public onlyBuyer() {
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
    //trigger
    function triggerDeleted(uint itemId, address nft, uint tokenId, address seller) public onlyBuyer() {
        emit Deleted(itemId,
        nft,
        tokenId,
        seller);
    }

    event Prooved(
        uint itemId,
        address indexed nft,
        uint tokenId,
        address indexed seller,
        bytes32 proof
    );
    //trugger 
    function triggerProoved(uint itemId, address nft, uint tokenId, address seller, bytes32 proof) public onlyProover() {
        emit Prooved(itemId,
        nft,
        tokenId,
        seller,
        proof);
    }

    constructor(credit _addrCredit, RealItem _addrRealItem) {
        credits = _addrCredit;
        realItems = _addrRealItem;
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

    function getProofPool(uint _itemId) public onlyPool view returns (string memory _proof){
        string memory proof = proofs[_itemId];
        return proof;
    }
    function getProof(uint _itemId) public view returns (string memory _proof){
        Item memory item = items[_itemId];
        require(item.buyer == msg.sender, "Need to buy the Item to consult the proof");
        string memory proof = proofs[_itemId];
        return proof;
    }

   
}

    


    


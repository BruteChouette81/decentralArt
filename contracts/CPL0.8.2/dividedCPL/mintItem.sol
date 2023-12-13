// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract MintItem {

    
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
}
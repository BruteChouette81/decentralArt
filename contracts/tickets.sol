// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Tickets is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct Ticket {
        string ticketURL;
        uint256 ticketID;
    }

    // itemId -> Item
    mapping(uint => Ticket) private tickets;

    /*
    struct {
        id: token id,
        string memory link
    }

    map using token id
    */
    

    constructor() ERC721("Imperial Tickets", "IT") {}

    function safeMint(address to, string memory uri, string memory ticket) public { //let safe mint be public in order for anyone ot mint a new ticket
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tickets[tokenId] = Ticket (
            ticket,
            tokenId
        );
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function getMyTicket(uint256 tokenId) public view returns(string memory){
        //require being the owner of the item
        address ownerofTicket = super.ownerOf(tokenId);
        require(ownerofTicket == msg.sender, "Need to be the owner of the NFT in order to get the Ticket");
        Ticket storage ticket = tickets[tokenId];

        return ticket.ticketURL;
    }
}
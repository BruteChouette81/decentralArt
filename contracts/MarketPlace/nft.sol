// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

//import "https://github.com/0xcert/ethereum-erc721/src/contracts/tokens/nf-token-metadata.sol";
//import "https://github.com/0xcert/ethereum-erc721/src/contracts/ownership/ownable.sol";
/*
contract myNFT is NFTokenMetadata, Ownable {
  
 constructor() {
   nftName = "test NFT";
   nftSymbol = "TEST";
 }
  
 function mint(address _to, uint256 _tokenId, string calldata _uri) external onlyOwner {
   super._mint(_to, _tokenId);
   super._setTokenUri(_tokenId, _uri);
 }

 function multipleMint(address user, bytes32[] memory tokensURI) public returns (uint256){
        for (uint i = 0; i<tokensURI.length; i ++) {
            uint256 newItemId = _tokenIds.current();
            _mint(user, newItemId);
            _setTokenURI(newItemId, tokensURI[i]);

            _tokenIds.increment();
        }
        
        return _tokenIds.current();

    }
  
}
*/



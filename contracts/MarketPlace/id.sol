pragma solidity >=0.7.0 <0.9.0;

contract DiD {
    uint public idCount;

    struct Id {
        uint userId;
        uint key;
        string city;
        string state;
        string postalCode;
        string country;
        string street1;
        string phone;
        string email;
        string name;
        string lastname;


    }

    // itemId -> Item
    mapping(uint => Id) internal ids;

    function newId(uint id, uint _key, string memory _city, string memory _state, string memory _postalCode, string memory _country, string memory _street1, string memory _phone, string memory _email, string memory _name, string memory _lastname) public {
        idCount ++;
        ids[idCount] = Id ( 
            id,
            _key,
            _city,
            _state,
            _postalCode,
            _country,
            _street1,
            _phone,
            _email,
            _name,
            _lastname
            
        );
    }


    function getId(uint _id, uint _key, uint _idCount) view public returns (Id memory) {
        Id storage id = ids[_idCount];
        require(id.userId == _id, "not good id");
        require(id.key == _key, "not good key");
        return id;
    }
}
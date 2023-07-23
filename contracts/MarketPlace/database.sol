pragma solidity >=0.7.0 <0.9.0;

// compile with viaIR: true
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

    struct UserData {
        string username;
        string img;
        string backimg;
        bool custimg;

    }
    //same as DID, but with database include, so that we save on centralized-database space

    // itemId -> Item
    mapping(uint => Id) internal ids;

    mapping(uint => UserData) internal users;

    function newId(uint idendificator, uint _key, string memory _city, string memory _state, string memory _postalCode, string memory _country, string memory _street1, string memory _phone, string memory _email, string memory _name, string memory _lastname, string memory _username, string memory _img, string memory _backimg, bool _custimg) public {
        idCount ++;
        ids[idCount] = Id ( 
            idendificator,
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
        users[idCount] = UserData(
            _username,
            _img,
            _backimg,
            _custimg
        );
        
    }


    function getId(uint _id, uint _key, uint _idCount) view public returns (Id memory, UserData memory) {
        Id storage id = ids[_idCount];
        UserData storage user = users[_idCount];
        require(id.userId == _id, "not good id");
        require(id.key == _key, "not good key");
        return (id, user);
    }
}
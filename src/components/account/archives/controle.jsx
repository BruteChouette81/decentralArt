

/**
 * NFT listing 
 */

//const contractAddress = '0xD3afbEFD991776426Fb0e093b1d9e33E0BD5Cd71';
const list = async ( nftAddress, nftABI, tokenid, price, account, tag, name, description, image, signer) => {
    // price is in credit (5 decimals)
    try {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const nft = connectContract(nftAddress, nftABI, provider) //check if erc1155 for abi (response.contractType)
                const market = connectContract(MarketAddress, abi.abi, provider)
                console.log(nft)

                //make the market approve to get the token
                await(await nft.approve(MarketAddress, tokenid)).wait()
                //add pending screem
                
                //create a new item with a sell order
                await(await market.listItem(nft.address, tokenid, (price * 10000))).wait()
                const marketCountIndex = await market.itemCount()
                var data = {
                    body: {
                        address: account,
                        itemid: parseInt(marketCountIndex), //market item id
                        name: name, //get the name in the form
                        score: 0, //set score to zero
                        tag: tag, 
                        description: description,
                        image: image
                    }
                    
                }
    
                var url = "/listItem"
    
                API.post('serverv2', url, data).then((response) => {
                    console.log(response)
                    alert("token listed!")
                })
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const nft = getContract(nftAddress, nftABI, signer) //check if erc1155 for abi (response.contractType)
                const market = getContract(MarketAddress, abi.abi, signer)
                console.log(nft)

                //make the market approve to get the token
                await(await nft.approve(MarketAddress, tokenid)).wait()
                //add pending screem
                
                //create a new item with a sell order
                await(await market.listItem(nft.address, tokenid, (price* 10000))).wait()
                const marketCountIndex = await market.itemCount()
                var data = {
                    body: {
                        address: account,
                        itemid: parseInt(marketCountIndex), //market item id
                        name: name, //get the name in the form
                        score: 0, //set score to zero
                        tag: tag, 
                        description: description,
                        image: image
                    }
                    
                }
    
                var url = "/listItem"
    
                API.post('serverv2', url, data).then((response) => {
                    console.log(response)
                    alert("token listed!")
                })
            }
    
        }
        catch {
            alert("Unable to connect to: " + nftAddress + ". Please make sure you are the nft owner! Error code - 1")
        }
    
   

}

const listDDS = async (tokenid, price, account, name, description, image, tag, numDays, signer, setSellLoading) => { // already know what addess and abi are 
    // price is in credit (5 decimals)
    try {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const nft = connectContract(ImperialRealAddress, realabi.abi, provider) //check if erc1155 for abi (response.contractType)
                const DDS = connectContract(DDSAddress, DDSABI, provider)
                console.log(DDS)
                console.log(parseInt(tokenid))
                console.log(parseInt(price))
                console.log(parseInt(numDays))

                //make the market approve to get the token
                await(await nft.approve(DDSAddress, tokenid)).wait()
                //add pending screem
                
                //create a new item with a sell order
                await(await DDS.listItem(nft.address, parseInt(tokenid), parseInt(price * 100000), parseInt(numDays))).wait()
                const marketCountIndex = await DDS.itemCount()
                var data = {
                    body: {
                        address: account.toLowerCase(),
                        itemid: parseInt(marketCountIndex), //market item id
                        name: name, //get the name in the form
                        score: 0, //set score to zero
                        tag: tag, //"real" 
                        description: description,
                        image: image
                    }
                    
                }
    
                var url = "/listItem"
    
                API.post('serverv2', url, data).then((response) => {
                    console.log(response)
                    setSellLoading(false)
                    alert("token listed!")
                })
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const nft = getContract(ImperialRealAddress, realabi.abi, signer) //check if erc1155 for abi (response.contractType)
                const DDS = getContract(DDSAddress, DDSABI, signer)
                console.log(nft)

                //make the market approve to get the token
                await(await nft.approve(DDSAddress, tokenid)).wait()
                //add pending screem
                
                //create a new item with a sell order
                await(await DDS.listItem(nft.address, parseInt(tokenid), parseInt(price * 10000), parseInt(numDays))).wait() //IERC721 _nft, uint _tokenId, uint _price, uint _numDays
                const DDSCountIndex = await DDS.itemCount()
                var data = {
                    body: {
                        address: account.toLowerCase(),
                        itemid: parseInt(DDSCountIndex), //market item id
                        name: name, //get the name in the form
                        score: 0, //set score to zero
                        tag: tag, //"real" 
                        description: description,
                        image: image
                    }
                    
                }
    
                var url = "/listItem"
    
                API.post('serverv2', url, data).then((response) => {
                    console.log(response)
                    setSellLoading(false)
                    alert("token listed!")
                })
            }
    
        }
        catch(e) {
            console.log(e)
            setSellLoading(false)
            alert("Unable to connect to: " + DDSAddress + ". Please make sure you are the nft owner! Error code - 1")
        }
    
   

}

/**
 * NFT minting 
 */


const mintNFT = async (account, uri, signer) => {
    if (window.localStorage.getItem("usingMetamask") === "true") {
        let provider = await injected.getProvider()
        const nft = connectContract(NftAddress, erc721ABI.abi, provider)
        const id = await (await nft.mint(account, uri)).wait()
        console.log(id)
        const transac = await nft.ownerOf(parseInt(id))
        console.log(transac)
    } else {
        //const provider  = new ethers.providers.InfuraProvider("goerli")
        const nft = getContract(NftAddress, erc721ABI.abi, signer)
        const id = await (await nft.mint(account, uri)).wait()
        console.log(id)
        const transac = await nft.ownerOf(parseInt(id))
        console.log(transac)
    }
    
}

const mintTicket = async (account, uri, ticket, signer) => {
    if (window.localStorage.getItem("usingMetamask") === "true") {
        let provider = await injected.getProvider()
        const nft = connectContract(TicketAddress, TicketABI.abi, provider)
        const id = await nft.safeMint(account, uri, ticket)
        console.log(id)
        const transac = await nft.ownerOf(id)
        console.log(transac)
    } else {
        //const provider  = new ethers.providers.InfuraProvider("goerli")
        const nft = getContract(TicketAddress, TicketABI.abi, signer)
        const id = await nft.safeMint(account, uri, ticket)
        console.log(id)
        const transac = await nft.ownerOf(id)
        console.log(transac)
    }
}

const mintReal = async (account, uri, signer) => {
    if (window.localStorage.getItem("usingMetamask") === "true") {
        let provider = await injected.getProvider()
        const nft = connectContract(ImperialRealAddress, realabi.abi, provider)
        console.log(nft)
        console.log(uri)
        const id = await (await nft.safeMint(account, uri)).wait()
        console.log(id)
        alert("NFT successfully created. See your item in the Your NFTs section.")
    } else {
        //const provider  = new ethers.providers.InfuraProvider("goerli")
        const nft = getContract(ImperialRealAddress, realabi.abi, signer)
        const id = await (await nft.safeMint(account, uri)).wait()
        console.log(id)
        alert("NFT successfully created. See your item in the Your NFTs section.")
    }
}

const multipleMintReal =  async (account, uri, signer) => {
    if (window.localStorage.getItem("usingMetamask") === "true") {
        let provider = await injected.getProvider()
        const nft = connectContract(ImperialRealAddress, realabi.abi, provider)
        console.log(nft)
        console.log(uri)
        const id = await (await nft.multipleMint(account, uri)).wait()
        console.log(id)
        alert("NFT successfully created. See your item in the Your NFTs section.")
    } else {
        //const provider  = new ethers.providers.InfuraProvider("goerli")
        const nft = getContract(ImperialRealAddress, realabi.abi, signer)
        const id = await (await nft.multipleMint(account, uri)).wait()+
        console.log(id)
        alert("NFT successfully created. See your item in the Your NFTs section.")
    }
}

/**
 * NFT friends 
 */


function dealWithFriend(address, accepted, is_accepted) {
    console.log(address)
    console.log(accepted)
    console.log(is_accepted)
    
    var data = {
        body: {
            address: address.toLowerCase(),
            accepted: accepted.toLowerCase(),
            is_accepted: is_accepted
        }
        
    }

    var url = "/acceptFriend"

    API.post('serverv2', url, data).then((response) => {
        console.log(response)
    })
}
function Request(props) {
    const newDeal = () => {
        dealWithFriend(props.address, props.accepted, true)
    }

    const newDeny = () => {
        dealWithFriend(props.address, props.accepted, false)
    }
    return (<div> 
        <h6>Address: {props.accepted} </h6> <button onClick={newDeal} class="btn btn-success">Accept</button> <button onClick={newDeny} class="btn btn-danger">Deny</button>
    </div>)
}

function Friend(props) {
    /*
    <div class="container">
        <div class="row">
            <div class="col">
                {props.address}
            </div>
        </div>
    </div>
    */
    return (
        <div>
            <img id="friendimg" src={default_profile} alt="" />      <h6>address: <a href={`/Seller/${props.address}`}>{props.address}</a> </h6>
        </div>
        
    )
}
function ListOfFriends(props) {
    //const friendList = ["0xDBC05B1ECB4FDAEF943819C0B04E9EF6DF4BABD6","0x721B68FA152A930F3DF71F54AC1CE7ED3AC5F867","0xB3B66043A8F1E7F558BA5D7F46A26D1B41F5CA2A"]
    return(<div class="friendList">
                {props.friendList?.map(i => {
                return <Friend address={i} />
                })}
                {props.friendList?.length === 0 ? ( <p>You have no friend! Go request friendship to users in the market!</p> ) : ""}
            </div>     
    ) //
}

function ListOfRequests(props) {
    
    return(<div class="friendList">
                {props.request?.map(i => {
                    return <Request accepted={i} address={props.account} />
                })}
                {props.request?.length === 0 ? ( <p>You have no request!</p> ) : ""}
            </div>     
    ) //
}

function DisplayFriends(props) {
    return(
        <div class="friends">
            <h4>Friend List: </h4>
            <ListOfFriends friendList={props.friendList} />
            <br />
            <h4>Requests: </h4>
            <ListOfRequests request={props.request} account={props.account}/>
        </div>
    )
}

/**
 * Payment methods 
 */
 
function PaymentCard(props) {
    return (
        <div class="paymentcard">
            <div class="paymentinfo">
                <h5 id="cardnum" >Card Number: <strong>{props.card}</strong></h5>
                <p>expiration date: {props.date}</p>
                <br />
                <div class="separator">

                </div>
                <br />
                <button class="btn btn-danger">Delete</button>
            </div>
            

        </div>
    )
}

function ListPaymentMethod(props) {
    const paymentid = window.localStorage.getItem("paymentid")
    if (paymentid) {
        return (
            <div class="payList">
                {props.paymentMethod?.map(i => {
                    return <PaymentCard card={i[0]} date={i[1]} cvv={i[2]}/>
                })}
            </div>
        )
    }
    else {
        return (
            <div class="payList">
                <p>No payment</p>
            </div>
        )
    }
    
}


const handleMultipleMint = async () => {
    setCreateLoading(true)
    try {
        if (props.signer) {
            
            console.log(props.signer)
            await multipleMintReal(props.account, tokenuri, props.signer)
            setCreateLoading(false)
            alert("You can see your items in Your Art. You will receive a notification on what are the procedure concerning the Proof of Sending.")
            
        } else {
            await multipleMintReal(props.account, tokenuri, props.signer)
            setCreateLoading(false)
            alert("You can see your items in Your Art. You will receive a notification on what are the procedure concerning the Proof of Sending.")
        }

        } catch(e) {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                console.log(e)
                alert("You need ethereum gas fee to pay for item creation.")

                setCreateLoading(false)

                let provider = await injected.getProvider()
                const nft = connectContract(ImperialRealAddress, realabi.abi, provider)

                setNft(nft)

                const gasPrice = await nft.provider.getGasPrice();
                let gas = await nft.estimateGas.multipleMint(props.account, tokenuri)
                let price = gas * gasPrice


                //get the ether price and a little bit more than gaz price to be sure not to run out
                fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                    res.json().then(jsonres => {
                        let usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                        setUsdprice(usdPrice)
                        setReal(true)
                    })
                })
                
            } else {
                alert("You need ethereum gas fee to pay for item creation.")
                console.log(e)

                setCreateLoading(false)
                console.log(props.signer)
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const nft2 = getContract(ImperialRealAddress, realabi.abi, props.signer)
                console.log(nft2)
                setNft(nft2)

                const gasPrice = await nft2.provider.getGasPrice();
                let gas = await nft2.estimateGas.multipleMint(props.account, tokenuri)
                let price = gas * gasPrice


                //get the ether price and a little bit more than gaz price to be sure not to run out
                fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                    res.json().then(jsonres => {
                        let usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                        setUsdprice(usdPrice)
                        setReal(true)
                    })
                })
                
            }
        }
}


const createNft = async(event) => {
    event.preventDefault()
   if (nftname !== "" && description !== "" && image_file !== null) {


        async function postMetadataPinata() {

            let attributes = []
            if (numAttribute > 0) {
                for (let i=0; i < numAttribute; i++) {
                    attributes.push({"key": keys[i], "value": values[i]})
                }
                
            }

            const formData = new FormData();

            formData.append('file', image_file)
        
            if (numAttribute > 0) {
                let metadata = {
                    name: nftname,
                    keyvalues: { 
                      description: description,
                      
                    }
                };
                for (let i=0; i < numAttribute; i++) {
                    metadata.keyvalues.keys[i] = values[i]
                }
                
                formData.append('pinataMetadata', metadata);
            }
            else {
                const metadata = JSON.stringify({
                    name: nftname,
                    keyvalues: { 
                      description: description,
                    }
                   
                  });
                  formData.append('pinataMetadata', metadata);
            }
           

            
            
            const options = JSON.stringify({
              cidVersion: 0,
            })
            formData.append('pinataOptions', options);
        
            try{
                const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                    maxBodyLength: "Infinity",
                    headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    Authorization: key
                    }
                });
                console.log(res.data);

                return res.data

            } catch (error) {
              console.log(error);
            }
        };

        
        setCreateLoading(true)
        const res2data = await postMetadataPinata()
        console.log("https://ipfs.io/ipfs/" + res2data?.IpfsHash)

        let cid = res2data.IpfsHash

        const res = await axios.get("https://api.pinata.cloud/data/pinList?hashContains=" + cid ,{
        headers: {
                Authorization: key
                }
        })

        console.log(res)
            
        setTokenuri("https://ipfs.io/ipfs/" + cid)

        try {
                if (props.signer) {
                    await mintNFT(props.account, tokenuri, props.signer)
                    setCreateLoading(false)
                    alert("NFT successfully created. See your item in the Your NFTs section.")
                } else {
                    await mintNFT(props.account, tokenuri, "")
                    setCreateLoading(false)
                    alert("NFT successfully created. See your item in the Your NFTs section.")
                }
                
               
            } catch(e) {
                if (window.localStorage.getItem("usingMetamask") === "true") {
                    alert("You need ethereum gas fee to pay for item creation.")
                    setCreateLoading(false)

                    let provider = await injected.getProvider()
                    const nft = connectContract(NftAddress, erc721ABI.abi, provider)
                    
                    setNft(nft)

                    const gasPrice = await provider.getGasPrice();
                    let gas = await nft.estimateGas.mint(props.account, tokenuri)
                    let price = gas * gasPrice


                    //get the ether price and a little bit more than gaz price to be sure not to run out
                    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                        res.json().then(jsonres => {
                            let usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                            setUsdprice(usdPrice)
                            setReal(false)
                        })
                    })
                   
                } else {
                    alert("You need ethereum gas fee to pay for item creation.")
                    setCreateLoading(false)
                    //const provider  = new ethers.providers.InfuraProvider("goerli")
                    const nft = getContract(NftAddress, erc721ABI.abi, props.signer)
                    setNft(nft)

                    const gasPrice = await nft.provider.getGasPrice();
                    let gas = await nft.estimateGas.mint(props.account, tokenuri)
                    let price = gas * gasPrice


                    //get the ether price and a little bit more than gaz price to be sure not to run out
                    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                        res.json().then(jsonres => {
                            let usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                            setUsdprice(usdPrice)
                            setReal(false)
                        })
                    })
                }
            }
            
    }
    
   else {
       alert("Need to fill out the whole form!")
   }
}




function DisplayDiD() {
    let did;
    if (window.localStorage.getItem("usingMetamask") === "true") {

        did = window.localStorage.getItem("meta_did")
    }
    else {
        did = window.localStorage.getItem("did")
    }
    return (
        <div class="did">
            <h4>Decentralized Identification: </h4>
            <p>
                <a class="btn btn-info" data-bs-toggle="collapse" href="#collapseExample1" role="button" aria-expanded="false" aria-controls="collapseExample1">
                    Learn more about DiD
                </a>
            </p>
            <div class="collapse" id="collapseExample1">
                <div class="card card-body" style={{color: "black"}}>
                    DiD stands for Decentralized IDentification. All of your information are securly stored in a program in order for them to stay private and decentralized.
                </div>
            </div>
            <br />
            {did ? ( <div><button onClick={getdId} data-bs-toggle="modal" data-bs-target="#staticBackdrop3" class="btn btn-primary" >See ID</button> <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#staticBackdrop2" >Change ID</button></div> ) : (<button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#staticBackdrop2" >Add ID</button>) }
        </div>
    )
}

const getdId = async () => {
    if (window.localStorage.getItem("usingMetamask") === "true") {
        let did = window.localStorage.getItem("meta_did")
        let res1;
        if (password) {
            res1 = AES.decrypt(did, password)
        } else {
            res1 = AES.decrypt(did, props.password)
        }
        
        let res = JSON.parse(res1.toString(enc.Utf8));
        setCity(res.address.city)
        setCode(res.address.postCode)
        setCountry(res.address.countryCode)
        setEmail(res.email)
        setFname(res.first_name)
        setLname(res.last_name)
        setPhone(res.mobileNumber)
        setStreet(res.address.addressLine1)
        setState(res.address.state)
    } else {
        let did = window.localStorage.getItem("did")
        let res1 = AES.decrypt(did, props.signer.privateKey)
        let res = JSON.parse(res1.toString(enc.Utf8));
        setCity(res.address.city)
        setCode(res.address.postCode)
        setCountry(res.address.countryCode)
        setEmail(res.email)
        setFname(res.first_name)
        setLname(res.last_name)
        setPhone(res.mobileNumber)
        setStreet(res.address.addressLine1)
        setState(res.address.state)
    }
    
}

const writedId = async () => {
    alert("writting your DID")
    if (window.localStorage.getItem("usingMetamask") === "true") {
        setMetaPasswordSetting(true)
    }
    else {
        const data = {
            first_name: fname,
            last_name: lname,
            email: email,
            mobileNumber: phone, //"+19692154942"
            dob: "1994-11-26", // got to format well
            address: {
                addressLine1: street,
                city: city,
                state: state,
                postCode: code,
                countryCode: country
    }
        }

        let stringdata = JSON.stringify(data)
        //let bytedata = ethers.utils.toUtf8Bytes(stringdata)

        console.log(props.signer.privateKey)

        var encrypted = AES.encrypt(stringdata, props.signer.privateKey)
        //hash the data object and store it in user storage
        //ethers.utils.computeHmac("sha256", key, bytedata)
        
          
        window.localStorage.setItem("did", encrypted);
        alert("DID successfully written!")
    }

    
}

function HandleForm(props) {
    return (
        <div>
            <form onSubmit={props.handleList}>
                                        
                                        <h5>Name: {props.name}</h5> 
                                        <br />  
                                        <h5>Description: {props.description}</h5>     
                                        <br />
                                        <div class="form-floating">
                                                            <select onChange={onChangeTags} class="form-select" id="floatingSelect" aria-label="Floating label select example">
                                                                <option selected>Categorize your digital item </option>
                                                                <option value="1" >NFT</option>
                                                                <option value="2" >Tickets</option>
                                                                <option value="3" >Virtual Property</option>
                                                            </select>
                                                            <label for="floatingSelect">Tag</label>
                                        </div>
                                        <br />
                                        <label for="price" class="form-label">Price:</label><br />
                                        <div class="input-group mb-3">
                                            <input type="number" class="form-control" id="price" name="price" aria-describedby="basic-addon2" onChange={onPrice3Change} />
                                            <span class="input-group-text" id="basic-addon2">$CREDIT</span>
                                        </div>
                                        <input type="submit" class="btn btn-primary" value="Submit" />
                </form> 
        </div>
    )
}


function HandleRealForm(props) {
        
    return (
        <div> 
            <form onSubmit={props.handleRealList}>
                                        
                                        <h5>Name: {props.name}</h5> 
                                        <br />  
                                        <h5>Description: {props.description}</h5>     

                                        <br />
                                            <label for="days" class="form-label">Number of days for sending:</label><br />
                                            <a href="">More information on what is the number of days</a>
                                            <div class="input-group mb-3">
                                                <input type="number" class="form-control" id="days" name="days" aria-describedby="basic-addon2" onChange={onDay2Change} />
                                                <span class="input-group-text" id="basic-addon2">Days</span>
                                        </div>
                                        <br />

                                        <label for="price" class="form-label">Price:</label><br />
                                        <div class="input-group mb-3">
                                            <input type="number" class="form-control" id="price" name="price" aria-describedby="basic-addon2"  onChange={onPrice3Change} />
                                            <span class="input-group-text" id="basic-addon2">$CREDIT</span>
                                        </div>
                                        <br />

                                        <h3>Fees Calculator: </h3>
                                        <button class="btn btn-primary" onClick={calculateFeesSeller}>Calculate fees</button>
                                        <p><a href="#">Learn more about fees and why those are applied</a></p>
                                        <div class="Staking-Program">
                                            <p>Total fees: {fee} $</p>
                                            <p>Fee: {(timeToReinvest * 100).toLocaleString('en-US')} %</p>
                                            <h6>You will get: {(pricex3).toLocaleString('en-US')} $</h6>
                                            <br />
                                            <h6>Our Staking program: </h6>
                                            <p>Refund your fees in less then 3 months!</p>
                                            <p>3 Months: {pricex3 + pricex3 * 0.06} $</p>
                                            <p>6 Months: {pricex3 + pricex3 * 0.07} $</p>
                                            <p>9 Months: {pricex3 + pricex3 * 0.09} $</p>
                                            <p>12 Months: {pricex3 + pricex3 * 0.11} $</p>
                                        </div>
                                        <input type="submit" class="btn btn-primary" value="Submit" />
                </form>
        </div>
    )
}


/*
    const payGas = async () => {
        setLoading(true)
        //getdId()
        const gasPrice = await props.did.provider.getGasPrice();
        let gas = await props.did.estimateGas.newId(parseInt(window.localStorage.getItem("id")), parseInt(window.localStorage.getItem("id")), city, state, code, country, street, phone, email, fname, lname)
        let price = gas * gasPrice

        console.log(ethers.utils.formatEther(price))
        console.log(gasPrice)
        let usdPrice = 0
        //get the ether price and a little bit more than gaz price to be sure not to run out
        fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
            res.json().then(jsonres => {
                usdPrice = ethers.utils.formatEther(price) * jsonres.USD 
                console.log(usdPrice)                
            })
        })
        if (props.pay) {
            let mounthDate = props.pay[0][1].split("/")
            let paymentList = [props.pay[0][0], mounthDate[0], "20" + mounthDate[1], props.pay[0][2]]

            //let completed = false
            const completed = await getGasPriceUsd(usdPrice, props.did.signer.address, paymentList, city, state, code, country, street, phone, email, fname, lname) //"+" + phone
            if (completed) {
                await ( await props.did.newId(parseInt(window.localStorage.getItem("id")), parseInt(window.localStorage.getItem("id")), city, state, code, country, street, phone, email, fname, lname)).wait()
               
                alert("New Decentralized Identity. You are now free to use the F2C prrotocol to buy and sell Items!")
                setLoading(false)
                setPayingGas(false)
    
            }
            else {
                alert("something went wrong..." + completed)
                setLoading(false)
                setPayingGas(false)
            }
        } else {
            let mounthDate = eDate.split("/")
            let paymentList = [card, mounthDate[0], "20" + mounthDate[1], cvv]
    
            //let completed = false
            const completed = await getGasPriceUsd(usdPrice, props.did.signer.address, paymentList, city, state, code, country, street, phone, email, fname, lname) //"+" + phone
            if (completed) {
                await ( await props.did.newId(parseInt(window.localStorage.getItem("id")), parseInt(window.localStorage.getItem("id")), city, state, code, country, street, phone, email, fname, lname)).wait()
               
                alert("New Decentralized Identity. You are now free to use the F2C prrotocol to buy and sell Items!")
                setLoading(false)
                setPayingGas(false)
    
            }
            else {
                alert("something went wrong..." + completed)
                setLoading(false)
                setPayingGas(false)
            }
        }

       
    }
    

    const cancel = () => {
        setPayingGas(false)
    }

    const DisplayPayGas = () => {
        return (
            <div class="payGas">
            {loading ? (<div style={{paddingLeft: 25 + "%"}}><ReactLoading type="spin" color="#0000FF"
        height={200} width={200} /><h5>Transaction loading...</h5></div>) : (<div>
                <h4>F2C Checkout</h4>
                <p><a href="">Learn about F2C</a></p>
                <p>This Ethereum fee allow your data to be securly store in the BlockChain</p>
                <br />
                <h6>Payment method: <strong>{card}</strong></h6>
                <h5>Total USD price: 0.004$</h5>

                <button onClick={payGas} class="btn btn-primary">Approve</button> <button onClick={cancel} class="btn btn-danger">Cancel</button>
            </div>)}
            

        </div>
        )
    }
    */


    const handleList = async(e) => {
        e.preventDefault()
        try {
            if (props.signer) {
                if(props.abi === 'ERC721') {
                    list(props.address, erc721ABI.abi, props.tokenid, price3, props.account, tag, props.name, props.description, props.image, props.signer) //check for abi
                }
                else {
                    list(props.address, erc1155ABI, props.tokenid, price3, props.account, tag, props.name, props.description, props.image, props.signer) //check for abi
                }
                
            } else {
                if (props.abi === 'ERC721') {
                    list(props.address, erc721ABI.abi, props.tokenid, price3, props.account, tag, props.name, props.description, props.image, "") //check for abi

                } else {
                    list(props.address, erc1155ABI, props.tokenid, price3, props.account, tag, props.name, props.description, props.image, "") //check for abi
                }
                
            }
            
            alert("Success")

        } catch (error) {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const nft = connectContract(props.address, erc721ABI.abi, provider) //check if erc1155 for abi (response.contractType)
                const market = connectContract(MarketAddress, abi.abi, provider)
                console.log(nft)

                const gasPrice = await nft.provider.getGasPrice();
                let gas1 = await nft.estimateGas.approve(MarketAddress, props.tokenid)
                let price1 = gas1 * gasPrice
                let gas2 = await market.estimateGas.listItem(nft.address, props.tokenid, price3)
                let price4 = gas2 * gasPrice
                //get the ether price and a little bit more than gaz price to be sure not to run out
                fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                    res.json().then(jsonres => {
                        let usdPrice = (ethers.utils.formatEther(price1) * jsonres.USD) + (ethers.utils.formatEther(price4) * jsonres.USD)
                        setPrice2(usdPrice)
                    })
                })
                
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const nft = getContract(props.address, erc721ABI.abi, props.signer) //check if erc1155 for abi (response.contractType)
                const market = getContract(MarketAddress, abi.abi, props.signer)
                console.log(nft)

                const gasPrice = await nft.provider.getGasPrice();
                let gas1 = await nft.estimateGas.approve(MarketAddress, props.tokenid)
                let price1 = gas1 * gasPrice
                let gas2 = await market.estimateGas.listItem(nft.address, props.tokenid, price3)
                let price4 = gas2 * gasPrice
                //get the ether price and a little bit more than gaz price to be sure not to run out
                fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                    res.json().then(jsonres => {
                        let usdPrice = (ethers.utils.formatEther(price1) * jsonres.USD) + (ethers.utils.formatEther(price4) * jsonres.USD)
                        setPrice2(usdPrice)
                    })
                })
                
            }

        }
        
    }

    const handleRealList = async(e) => {
        e.preventDefault()
        try {
            setSellLoading(true)
            if (props.signer) {
                await listDDS(props.tokenid, price3, props.account, props.name, props.description, props.image, props.tag, day2, props.signer, setSellLoading) //check for abi
                //alert("Success")
            }
            else {
                await listDDS(props.tokenid, price3, props.account, props.name, props.description, props.image, props.tag, day2, "", setSellLoading) //check for abi
                //alert("Success")
            }
            
            

        } catch (error) {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const nft = connectContract(props.address, erc721ABI.abi, provider) //check if erc1155 for abi (response.contractType)
                const DDS = connectContract(DDSAddress, DDSABI, provider)
                console.log(nft)

                const gasPrice = await nft.provider.getGasPrice();
                let gas1 = await nft.estimateGas.approve(DDSAddress, props.tokenid)
                let price1 = gas1 * gasPrice
                let gas2 = await DDS.estimateGas.listItem(nft.address, props.tokenid, price3, day2) //&& day > 0
                let price2 = gas2 * gasPrice

                setSellLoading(false)
                //get the ether price and a little bit more than gaz price to be sure not to run out
                fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                    res.json().then(jsonres => {
                        let usdPrice = (ethers.utils.formatEther(price1) * jsonres.USD) + (ethers.utils.formatEther(price2) * jsonres.USD)
                        setReal(true)
                        setPrice2(usdPrice)
                    })
                })
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const nft = getContract(props.address, erc721ABI.abi, props.signer) //check if erc1155 for abi (response.contractType)
                const DDS = getContract(DDSAddress, DDSABI, props.signer)
                console.log(nft)


                const gasPrice = await nft.provider.getGasPrice();
                let gas1 = await nft.estimateGas.approve(DDSAddress, props.tokenid)
                let price1 = gas1 * gasPrice
                let gas2 = await DDS.estimateGas.listItem(nft.address, props.tokenid, price3, day2)
                let price2 = gas2 * gasPrice

                setSellLoading(false)
                //get the ether price and a little bit more than gaz price to be sure not to run out
                fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                    res.json().then(jsonres => {
                        let usdPrice = (ethers.utils.formatEther(price1) * jsonres.USD) + (ethers.utils.formatEther(price2) * jsonres.USD)
                        setReal(true)
                        setPrice2(usdPrice)
                    })
                })
            }

        }
        
    }

    const revealTicket = async () => {
        if (window.localStorage.getItem("usingMetamask") === "true") {
            let provider = await injected.getProvider()
            const nft = connectContract(TicketAddress, erc721ABI.abi, provider)
            const url = await nft.getMyTicket(props.tokenid)
            window.open(url, '_blank', 'width=300,height=500')

        } else {
            //const provider  = new ethers.providers.InfuraProvider("goerli")
            const nft = getContract(TicketAddress, erc721ABI.abi, props.signer)
            const url = await nft.getMyTicket(props.tokenid)
            window.open(url, '_blank', 'width=300,height=500')
        }
    }
    const cancelListing = () => {
        setListing(false)
        setUsdPrice2(0)
        setUsdPrice3(0)
    }

    const activateListing = () => {
        setListing(true)
        
    }


    const Listing = () => {
        if (props.address === ImperialRealAddress.toLowerCase()) {
            return (
                <div class="listing">
                   
                    <HandleRealForm handleRealList={handleRealList} name={props.name} description={props.description} tag={props.tag}/>
                    <br /> <br />
                    <button onClick={cancelListing} class="btn btn-danger">Cancel</button> 
                </div>
            )
        }
        else {
            return (
                <div class="listing">
                    <HandleForm handleList={handleList} name={props.name} description={props.description} /> 
                    <br /> <br />
                    <button onClick={cancelListing} class="btn btn-danger">Cancel</button> 
                </div>
            )
        }

        
    }

    const retrieve = async() => {
        for (let i=0; i<props.realPurchase.length; i++) {
            if(props.realPurchase[i][0] === props.tokenid) { //if we match nft token id
                try {
                    //gas price must be included in first transaction
                    await dds.retrieveCredit(parseInt(props.realPurchase[i][1]))
                } catch(e) {
                    console.log(e)
                    alert("Item is prooved ! It will arrive soon at your location !")
                }
                
                
            }
        }
    } 

   
    return (
        sellLoading ? (<div class="ynftcard" ><ReactLoading type={type} color={color}
        height={200} width={200} /><h5>Listing Item loading...</h5></div>) : real ? usdPrice2 > 0 ? (<PayGasList real={true} account={props.account} day={day2} total={usdPrice2} pay={props.pay} cancel={cancelListing} listItem={listDDS} did={props.did} nftAddress={props.address} tokenid={props.tokenid} name={props.name} description={props.description} image={props.image} tag={"real"} price={price3}/>) :
            listingItem === true ? (<Listing/>) : (<div class="ynftcard">
            
            {props.image?.includes("ipfs://") ? <img id='cardimg' src={"https://ipfs.io/ipfs/" + props.image?.split("//").pop()} alt="" /> : <img id='cardimg' src={props.image} alt="" />}
        
            <br />
            <br />
            <h4> Name:  <a href="">{props.name}</a></h4>
            <p>description: {props.description?.slice(0, 20)}...</p>
            <button type="button" onClick={activateListing} class="btn btn-secondary">Sell</button>
            {props.address === TicketAddress.toLowerCase() ? ( <button onClick={revealTicket} class="btn btn-success">Reveal Secret Ticket</button> ) : "" }
        </div>) : usdPrice2 > 0 && usdPrice3 === 0 ? (<PayGasList real={false} day={day2} account={props.account} total={usdPrice2} pay={props.pay} cancel={cancelListing} listItem={list} did={props.did} nftAddress={props.address} tokenid={props.tokenid} name={props.name} description={props.description} image={props.image} tag={tag} price={price3}/>) :
            usdPrice3 > 0 && usdPrice2 === 0 ? ( <PayGasRetrieve account={props.account} total={usdPrice3} pay={props.pay} cancel={cancelListing} dds={dds} did={props.did} itemId={gasItemId} />) : listingItem === true ? (<Listing  />) : (<div class="ynftcard">
            
            {props.image?.includes("ipfs://") ? <img id='cardimg' src={"https://ipfs.io/ipfs/" + props.image?.split("//").pop()} alt="" /> : <img id='cardimg' src={props.image} alt="" />}
        
            <br />
            <br />
            <h4> Name:  <a href="">{props.name}</a></h4>
            <p>description: {props.description?.slice(0, 20)}...</p>
            {props.level === 5 ? (<button type="button" onClick={activateListing} class="btn btn-secondary">Sell</button>) : ""}
            {props.address === TicketAddress.toLowerCase() ? ( <button onClick={revealTicket} class="btn btn-success">Reveal Secret Ticket</button> ) : "" }
            {props.address === ImperialRealAddress.toLowerCase() ? ( <button onClick={pollStatus} class="btn btn-primary"> Get status</button> ) : ""}
            {props.address === ImperialRealAddress.toLowerCase() ? status === "Not prooved" ? numdaysToRetrieve > 0 ? ( <h5 style={{color: "yellow"}}>Pending</h5> ) : ( <h5 style={{color: "red"}}>Not Prooved</h5> ) : ( <h5 style={{color: "green"}}>Prooved</h5> ) : ""}
            {props.address === ImperialRealAddress.toLowerCase() ? ( <button onClick={retrieve} class="btn btn-primary"> Retrieve $CREDITs</button> ) : ""}
            { props.address === ImperialRealAddress.toLowerCase() ? numdaysToRetrieve > 0 ? ( <h6>Item Prooved in {numdaysToRetrieve} days</h6> ) : ( <h6>Item Not prooved in time</h6> ) : ""  }
            {trackingCode ? ( <h5>Tracking Code: {trackingCode}</h5> ) : ""}
        </div>)
    )

    if (window.localStorage.getItem("usingMetamask") === "true") {
        let provider = await injected.getProvider()
        const nft = connectContract(item.nft, realabi.abi, provider)
        const buyer_address = await nft.ownerOf(item.tokenId)
        console.log(buyer_address)
        // go take hash form bucket file then, delete the file
        setS3Config("didtransfer", "public")
        const file = await Storage.get(`${buyer_address.toLowerCase()}.txt`)
        fetch(file).then((res) => res.text()).then((text) => {
            let res1 = AES.decrypt(text, key)
            const res = JSON.parse(res1.toString(enc.Utf8));
            console.log(res)
            setClientId(res)
            setGettingID(true)

        })
    } else {


        : (
            <div class="connect">
                {sellerExchange !== "" ? ( <div>
                <h2 style={{"color": "yellow"}} >{sellerExchange} Account currently connecting...</h2>
                <form onSubmit={saveApi}>
                    <input type="text" id="order" name="order" class="form-control" placeholder="API key" onChange={onApiChanged}/>
                    <br />
                    <input type="text" id="proof" name="proof" class="form-control" placeholder="API secret key" onChange={onSecChanged}/>
                    <br />
                    <input type="submit" class="btn btn-primary" value="Submit" />
                </form></div> ) : ( <div>
                <h2 style={{"color": "red"}} >No Account linked</h2>
                <p>Choose an account to link: </p>
                <br />
                <button class="btn btn-primary" style={{"width": 275 + "px"}} onClick={setExchangeKraken}> 
                    <div className="icon">
                        <img src="https://logos-world.net/wp-content/uploads/2021/02/Kraken-Logo.png" alt="icon" />
                    </div> <h4 style={{"float": "left"}}>Kraken</h4>
                </button>
                <br />
                <br />
                <button class="btn btn-primary" style={{"width": 275 + "px"}} onClick={setExchangeCryptocom} disabled> <div className="icon">
                        <img src="https://downloads.intercomcdn.com/i/o/25103/6b16e1e91ff7d2ef82b1e31b/Monaco-Logo_icon.png" alt="icon" />
                    </div> <h4 style={{"float": "left"}}>Crypto.com</h4></button>
                <br />
                <br /> 
                <button class="btn btn-primary" style={{"width": 275 + "px"}} onClick={setExchangeBitbuy} disabled><div className="icon">
                        <img src="https://3.bp.blogspot.com/-OusYdcMHqQM/W9cdzEbCXEI/AAAAAAAAFd4/wsS34ZLjcCgQk_EJKT2q-nhgzo_mCprWACLcBGAs/s320/bitbuy-logo-filled.png" alt="icon" />
                    </div> <h4 style={{"float": "left"}}>BitBuy.ca</h4></button>
                <br />
                <br />
                <p>Or select a specific retrieve address: </p>
                <form onSubmit={saveSellerRetrieveAddress}>
                    <input type="text" id="order" name="order" class="form-control" placeholder="Address: 0x0000..." onChange={onSellerRetrieveAddressChange}/>
                    <br />
                    <input type="submit" class="btn btn-primary" value="Submit" />
                </form>
                </div> )}
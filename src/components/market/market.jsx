import {useState, useEffect } from 'react';
import { useWeb3React } from "@web3-react/core"
import { ethers } from 'ethers';
import { API , Storage} from 'aws-amplify';
import injected from '../account/connector';
import default_profile from "./profile_pics/default_profile.png"

import './css/market.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import abi from '../../artifacts/contracts/market.sol/market.json'
import erc721ABI from '../../artifacts/contracts/nft.sol/nft.json'
import Credit from '../../artifacts/contracts/token.sol/credit.json';
import DiD from '../../artifacts/contracts/DiD.sol/DiD.json';
import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'
import AMMABI from '../../artifacts/contracts/AMM.sol/AMM.json'

import NftBox from './nfts';
import PayGasList from '../F2C/gas/payGasList';

const MarketAddress = '0x710005797eFf093Fa95Ce9a703Da9f0162A6916C'; // goerli new test contract
const DDSAddress = '0x1D1db5570832b24b91F4703A52f25D1422CA86de' // 0x2F810063f44244a2C3B2a874c0aED5C6c28D1D87, 0xd860F7aA2ACD3dc213D1b01e2cE0BC827Bd3be46
const CreditsAddress = "0xD475c58549D3a6ed2e90097BF3D631cf571Bdd86" //goerli test contract
const NftAddress = '0x3d275ed3B0B42a7A3fCAA33458C34C0b5dA8Cc3A'; // goerli new test contract
const DiDAddress = "0x6f1d3cd1894b3b7259f31537AFbb930bd15e0EB8" //goerli test contract 

const Credit_AMM = '0xB18A97e590F1d0C1e0B9A3c3803557aa230FD21c' //working with: 0x856b5ddDf0eCFf5368895e085d65179AA2Fcc4d9 credits contract

// two categories: bid and fix price. 
// each => one database
// each load separatly their components and have a different list fonction
// ui is different from purchase => bid and price => current price 
// include bid increment in info about the token 

//do NOT execute this code down in Ohio!


/*
              ._,.
           "..-..pf.
          -L   ..#'
        .+_L  ."]#
        ,'j' .+.j`                 -'.__..,.,p.
       _~ #..<..0.                 .J-.``..._f.
      .7..#_.. _f.                .....-..,`4'
      ;` ,#j.  T'      ..         ..J....,'.j`
     .` .."^.,-0.,,,,yMMMMM,.    ,-.J...+`.j@
    .'.`...' .yMMMMM0M@^=`""g.. .'..J..".'.jH
    j' .'1`  q'^)@@#"^".`"='BNg_...,]_)'...0-
   .T ...I. j"    .'..+,_.'3#MMM0MggCBf....F.
   j/.+'.{..+       `^~'-^~~""""'"""?'"``'1`
   .... .y.}                  `.._-:`_...jf
   g-.  .Lg'                 ..,..'-....,'.
  .'.   .Y^                  .....',].._f
  ......-f.                 .-,,.,.-:--&`
                            .`...'..`_J`
                            .~......'#'
  Ray Brunner               '..,,.,_]`     Sienar Fleet Systems' TIE/In
                            .L..`..``.     Space Superiority Starfighter (2)
*/


const connectContract = (address, abi, injected_prov) => { //for metamask
    const provider = new ethers.providers.Web3Provider(injected_prov);

    // get the end user
    const signer = provider.getSigner();

    // get the smart contract
    const contract = new ethers.Contract(address, abi, signer);
    return contract
}

const getContract = (address, abi, signer ) => { //for Imperial Account
    // get the end user
    //console.log(signer)
    // get the smart contract
    const contract = new ethers.Contract(address, abi, signer);
    return contract
}

const mintNFT = async (account) => {
    const nft = connectContract(NftAddress, erc721ABI.abi)
    const id = await nft.mint(account, "chad")
    console.log(id)
    const transac = await nft.ownerOf(id)
    console.log(transac)
}

//function to connect and get nft contract (form where you wether input the address and token id or let us scan your connected wallet)



const list = async (market, auction, nftAddress, nftABI, tokenid, price, account, type, tag, name, description, bidIncrement, startDate, endDate) => {
    // price is in credit (5 decimals)
    var data = {
        body: {
            address: nftAddress,
            tokenid: tokenid
        }
        
    }

    var url = "/metadata"

    API.post('serverv2', url, data).then(async(response) => {
        console.log(response)
        try {
            let provider = await injected.getProvider()
            const nft = connectContract(nftAddress, nftABI, provider) //check if erc1155 for abi (response.contractType) 
            //get contract for imperial
            console.log(nft)
            
    
            if (type === "fp") {
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
                        image: response.metadata.image
                    }
                    
                }
    
                var url = "/listItem"
    
                API.post('serverv2', url, data).then((response) => {
                    console.log(response)
                    alert("token listed!")
                })
            }
            else {
                 //make the market approve to get the token
                 await(await nft.approve(MarketAddress, tokenid)).wait()
                 //add pending screem
    
                 //set fonction to get start and end block
                 
                 //create a new item with a sell order
                 await(await auction.listItem(nft.address, tokenid, (price * 10000), startDate, endDate, bidIncrement )).wait()
                 const auctionCountIndex = await auction.itemCount()
    
                 //new database 
                 var data = {
                     body: {
                         address: account,
                         itemid: parseInt(auctionCountIndex),
                         name: "first" //get the name in the form
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
    })
    
   

}

function RenderImage(props) {
    const [image, setImage] = useState(""); //empty string representation
    function setS3Config(bucket, level) {
        Storage.configure({
            bucket: bucket,
            level: level,
            region: "ca-central-1",
            identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952'
        })
    }

    const getImage = async (address) => {
        setS3Config("clientbc6cabec04d84d318144798d9000b9b3205313-dev", "public")
        const file = await Storage.get(`${address}.png`) //add ".png"    `${address}.png` {download: true}
        setImage(file)
    }

    useEffect(() => {
        getImage(props.account?.toLowerCase())

    }, [])
    
    return (
        <img src={image} alt="" id='profilepic' /> 
    )
}



function Market() {
    const [market, setMarket] = useState();
    const [credits, setCredits] = useState();
    const [did, setDid] = useState()
    const [dds, setDds] = useState()
    const [amm, setAmm] = useState()
    const [userwallet, setUserwallet] = useState()
    const [pay, setPay] = useState()
    const [usdPrice2, setUsdPrice2] = useState(0)
    //const [account, setAccount] = useState("");
    const [address, setAddress] = useState("")
    const { active, account, activate } = useWeb3React()
    //const [connected, setConnected] = useState(false)
    const [items, setItems] = useState([])
    const [sorted, setSorted] = useState([]) // for activity
    const [realItems, setRealItems] = useState([])
    const [realSorted, setRealSorted] = useState()
    const [type, setType] = useState("fp")

    const [nftAddress, setNftAddress] = useState()
    const [tokenId, setTokenId] = useState()
    const [price, setPrice] = useState()
    const [tag, setTag] = useState("nft")
    const [description, setDescription] = useState("")

    const [sortedby, setSortedby] = useState('recently')
    const [haveItem, setHaveItem] = useState(false)

    //password getting 
    const [password, setPassword] = useState()
    const [getPassword, setGetPassword] = useState(true)

    const changePass = (event) => {
        setPassword(event.target.value)
    }
    
    const connectUsingPassword = (e) => {
        e.preventDefault()
        setGetPassword(false)
    }
    
    function GetPassword() {
        return ( <div class="getPassword">
            <form onSubmit={connectUsingPassword}> 
                <h3>Setup or enter your password</h3>
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label">Password</label>
                    <div class="col-sm-10">
                        <input type="password" class="form-control" id="inputPassword" onChange={changePass}/>
                    </div>
                </div>
                <br />
                <button type="submit" class="btn btn-primary mb-3">Connect</button>
            </form>
        </div> )
    }

    const updateItemOwn = () => {
        setHaveItem(true)
    }

    const [search, setSearch] = useState("")
    const [seaching, setSearching] = useState(false)

    const getPrivateKey = async(account) => { //function to get privatekey from aws dynamo server
        var data = {
            body: {
                address: account?.toLowerCase()
            }
            
        }

        var url = "/connection"

        const provider = new ethers.providers.InfuraProvider("goerli")
        API.post('serverv2', url, data).then((response) => {
            let userwallet = new ethers.Wallet(response.privatekey, provider)
            setAddress(userwallet.address)
            setUserwallet(userwallet)
            
            setPay(response.pay)
            let itemslist = getItems("true", userwallet)
            itemslist.then(res => {
                setItems(res[0])
                let newRes = res[0];
                //console.log(itemslist)
                console.log(items)

                let newitemslist = scoreQuickSort(newRes)
                setSorted(newitemslist.reverse())
                
                console.log(newitemslist)

                setRealItems(res[1])
                let newReal = res[1];
                //console.log(itemslist)
                console.log(realItems)

                let newreallist = scoreQuickSort(newReal)
                setRealSorted(newreallist)
                
                console.log(newitemslist)
            })
            
        })
    
    }

    const getAccount = async () => {
        await activate(injected)
        const [accountAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        console.log(account)
        setAddress(accountAddress)
        //setAccount(address)
        //setConnected(true)
    };
    //Sorted by
    const onChangeSortedActivity = () => {
        setSortedby('activity')
    }

    const onChangeSortedRecently = () => {
        setSortedby('recently')
    }

    const onChangeSortedAi = () => {
        setSortedby('Ai')
    }

    //change form
    const onChangeTags = (event) => {

        switch (event.target.value) {
            case "1": 
                setTag("nft")
                console.log("nft")
                break;
            case "2": 
                setTag("tickets")
                console.log("tickets")
                break;
            case "3":
                setTag("vp")
                console.log("vp")
                break;
            default:
                console.log("400: Bad request error code - 5")
                break;
        }
    }

    const onTypeChange = (event) => {
        console.log(event.target.value);
        setType(event.target.value)

    }

    const onAddrChange = (event) => {
        setNftAddress(event.target.value)
    }

    const onIdChange = (event) => {
        setTokenId(event.target.value)
    }

    const onBioChange = (event) => {
        setDescription(event.target.value)
    }

    const onPriceChange = (event) => {
        setPrice(event.target.value)
    }

    //search component
    const onChangeSearch = (event) => {
        setSearch(event.target.value)

        if (event.target.value === "") {
            setSearching(false)
        }
    }

    const handleSearch = (event) => {
        event.preventDefault()
        console.log(search)
        setSearching(true)
    }
    

    const configureMarket = async (haswallet, userwallet) => {
        if (haswallet === "true") {
            //const provider = new ethers.providers.InfuraProvider("goerli")
            console.log(userwallet)
            const marketContract = getContract(MarketAddress, abi.abi, userwallet)
            setMarket(marketContract)
            const creditsContract = getContract(CreditsAddress, Credit.abi, userwallet)
            setCredits(creditsContract)
            const didContract = getContract(DiDAddress, DiD.abi, userwallet)
            setDid(didContract)
            const DDSContract = getContract(DDSAddress, DDSABI.abi, userwallet)
            setDds(DDSContract)
            const AMMContract = getContract(Credit_AMM, AMMABI, userwallet)
            console.log(AMMContract)
            setAmm(AMMContract)
            return [marketContract, DDSContract]
        }

        else {
            let provider = await injected.getProvider()
            const marketContract = connectContract(MarketAddress, abi.abi, provider) //
            setMarket(marketContract)
            const creditsContract = connectContract(CreditsAddress, Credit.abi, provider)
            setCredits(creditsContract)
            const DDSContract = connectContract(DDSAddress, DDSABI.abi, provider)
            setDds(DDSContract)
            const AMMContract = connectContract(Credit_AMM, AMMABI, provider)
            setAmm(AMMContract)
            return [marketContract, DDSContract]
        }
    }

    const getItems = async (haswallet, wallet) => {
        const markets = await configureMarket(haswallet, wallet)
        console.log(markets)
        let market = markets[0]
        let ddsc = markets[1] //load both market
        let credits = await ddsc?.credits()
        console.log(credits)
        console.log(market)
        let itemsList = []
        

        
        const numItems = await market?.functions.itemCount()
        console.log(parseInt(numItems))
        //console.log("numitems: " + numItems)
    
        //get the 10 most recent sell order
        if (numItems >= 10) {
            for( let i = 1; i<11; i++) {
                
                const item = await market.items(i) // (numItems - i)
                if(item.sold) {
                    continue
                }
                /*
                */
        
                else {
                    itemsList.push(item)
                }
                
            }
            return itemsList
        }

        else {
            for( let i = 1; i<=numItems; i++) {
                let item = await market.functions.items(i)
                console.log(item)
                let newItem = {}

                if(item.sold) {
                    continue
                }
                else {
                    var data = {
                        body: {
                            address: item.seller.toLowerCase(),
                        }
                    }

                    var url = "/getItems"

                    //console.log(typeof(item))
                    //console.log(item)
                    
            
                    await API.post('serverv2', url, data).then((response) => {
                        for(let i=0; i<=response.ids.length; i++) { //loop trought every listed item of an owner 
                            if (response.ids[i] == item.itemId && response.tags[i] !== "real") { // once you got the item we want to display:
                                newItem.itemId = item.itemId
                                newItem.price = item.price
                                newItem.seller = item.seller
                                newItem.name = response.names[i] //get the corresponding name
                                newItem.score = response.scores[i] //get the corresponding score
                                newItem.tag = response.tags[i] //get the corresponding tag
                                newItem.description = response.descriptions[i]
                                newItem.image = response.image[i]
                            }
                        }
                    })

                    itemsList.push(newItem)
                    
                }
                
            }
            
            
        }
        let realList = []
        const numReal = await ddsc?.functions.itemCount()
        //console.log(parseInt(numItems))
        //console.log("numitems: " + numItems)
    
        //get the 10 most recent sell order
        if (numReal >= 10) {
            for( let i = 1; i<11; i++) {
                
                const item = await ddsc.items(i) // (numItems - i)
                if(item.sold) {
                    continue
                }
                /*
                */
        
                else {
                    realList.push(item)
                }
                
            }
            return realList
        }

        else {
            for( let i = 1; i<=numReal; i++) {
                let item = await ddsc.items(i)
                console.log(item)
                let newItem = {}

                if(item.sold) {
                    continue
                }

                else {
                    var data = {
                        body: {
                            address: item.seller.toLowerCase(),
                        }
                    }

                    var url = "/getItems"

                    //console.log(typeof(item))
                    //console.log(item)
            
                    await API.post('serverv2', url, data).then((response) => {
                        for(let i=0; i<=response.ids.length; i++) { //loop trought every listed item of an owner 
                            if (response.ids[i] == item.itemId) { // once you got the item we want to display:
                                newItem.itemId = item.itemId
                                newItem.tokenId = item.tokenId
                                newItem.price = item.price
                                newItem.seller = item.seller
                                newItem.name = response.names[i] //get the corresponding name
                                newItem.score = response.scores[i] //get the corresponding score
                                newItem.tag = response.tags[i] //get the corresponding tag
                                newItem.description = response.descriptions[i]
                                newItem.image = response.image[i]
                            }
                        }
                    })

                    realList.push(newItem)
                    
                }
                
            }
            
            
        }
        itemsList.push({
            itemId: 4,
            price: 5000,
            seller: "test",
            name: "Nature morte",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Luis_Egidio_Mel%C3%A9ndez_-_Still-Life_-_WGA14755.jpg/1920px-Luis_Egidio_Mel%C3%A9ndez_-_Still-Life_-_WGA14755.jpg",
            score: 3, 
            tag: "ticket",
            description: "Nature morte aux dorades et oranges"

        })
        itemsList.push({
            itemId: 5,
            price: 5000,
            seller: "test",
            name: "Impressionisme",
            image: "https://upload.wikimedia.org/wikipedia/commons/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg",
            score: 1, 
            tag: "nft",
            description: "Impression, Sunrise, an 1872 Claude Monet"

        })
        itemsList.push({
            itemId: 6,
            price: 5000,
            seller: "test",
            name: "Realism",
            image: "https://www.thoughtco.com/thmb/0NGAlnIQWFsY2MSAcpd5oKz4qnA=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/AutoretratobyJuanCarlosLiberti-Cropped-Getty104826680-59ac8aa5d088c00010a3e691.jpg",
            score: 6, 
            tag: "vp",
            description: "surrealism"

        })
        itemsList.push({
            itemId: 7,
            price: 5000,
            seller: "test",
            name: "Metaverse - house",
            image: "data:image/jpeg;base64,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",
            score: 6, 
            tag: "vp",
            description: "Amazing Metaverse house!"

        })




        realList.push({
            itemId: 8,
            price: 5000,
            seller: "0x4c62fc52d5ad4c8273feb97684ba612288ee9507",
            name: "Canadian Cap",
            image: "data:image/jpeg;base64,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",
            score: 2, 
            tag: "real",
            description: "1/1 Montreal Canadian cap! Delieverd in 3 days in Canada!"
        })
        
        return [itemsList, realList]
        
    
    }

    function scoreQuickSort(origArray) {
        if (origArray.length <= 1) {
            return origArray;
        } else {

            var left = [];
            var right = [];
            var newArray = [];
            var pivot = origArray.pop();
            var length = origArray.length;
            for (var i = 0; i < length; i++) {
                if (origArray[i][4] <= pivot[4]) {
                    left.push(origArray[i]);
                } else {
                    right.push(origArray[i]);
                }
            }

            return newArray.concat(scoreQuickSort(left), pivot, scoreQuickSort(right));
        }
    }

    /*
    itemlist: 
        [item, score ...],
        [],
        []
    
    */
    

    useEffect(() => {
        
        //mintNFT(account)
        if (window.localStorage.getItem("hasWallet") === "true" && window.localStorage.getItem("usingMetamask") !== "true") { //only have Imperial Account
            getPrivateKey(window.localStorage.getItem("walletAddress")) // if Imperial Account load account

            
        }
        else {
            getAccount()

            let itemslist = getItems(false, "")
            itemslist.then(res => {
                setItems(res[0])
                let newRes = res[0];
                
                //console.log(itemslist)
                
                console.log(res[0])

                let newitemslist = scoreQuickSort(newRes)
                setSorted(newitemslist.reverse())
                
                console.log(newitemslist)

                setRealItems(res[1])
                let newReal = res[1];
                console.log(itemslist)
                console.log(realItems)

                let newreallist = scoreQuickSort(newReal)
                setRealSorted(newreallist)
                
                console.log(newreallist)
                
                console.log(items)
            })
            
        }
        
        //mintNFT(account) mint test nft
    }, [])

    //store everyone's name of items they are selling in the user database so its easier to get their nfts

    //make function to get specific items to see in "your items" tab so using the database, we can get all of an item and display it in the tab 

    //{items.map((item) => (<NftBox key={parseInt(item.itemId)} myitem={false} id={parseInt(item.itemId)} name={item.name} price={parseInt(item.price)} seller={item.seller.slice(0,7) + "..."} market={market} credits={credits}/> ))}

    return(
        getPassword && active ? <GetPassword /> :
        <div class="market">
            <div class="account">
               {userwallet ? (<RenderImage account={userwallet?.address} />) :  active ? (<RenderImage account={account} />) : ( <img src={default_profile} alt="" id='profilepic' /> )} {userwallet ? (<h6 id='account'>account: {userwallet?.address.slice(0,10) + "..."}</h6>) : (<h6 id='account'>account: {account?.slice(0,10) + "..."}</h6>)}
               {userwallet ? (<p id='connected' style={{color: "green"}}>connected</p>) : active ? (<p id='connected' style={{color: "green"}}>connected</p>) : (<p id='connected' style={{color: "red"}}>disconnected</p>)}
               
            </div>              

            <div class="nft">
                <nav class="nav">
                    <ul class="nav nav-pills" id="myTab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="cnfts-tab" data-bs-toggle="tab" data-bs-target="#cnfts" type="button" role="tab" aria-controls="cnfts" aria-selected="true">Impressionisme</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="ticket-tab" data-bs-toggle="tab" data-bs-target="#ticket" type="button" role="tab" aria-controls="ticket" aria-selected="false">Nature Morte</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="vp-tab" data-bs-toggle="tab" data-bs-target="#vp" type="button" role="tab" aria-controls="vp" aria-selected="false">Realisme</button>
                        </li>
                       

                    </ul>
                    <form class="d-flex" onSubmit={handleSearch}>
                        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" onChange={onChangeSearch} />
                        <button class="btn btn-outline-success" type="submit">Search</button>
                    </form>
                   
                </nav>
                <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade show active" id="cnfts" role="tabpanel" aria-labelledby="cnfts-tab">
                            <br />
                            <div class="dropdown">
                                <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Sorted by
                                </button>
                                <ul class="dropdown-menu dropdown-menu-dark">
                                    <li><button class="dropdown-item" onClick={onChangeSortedActivity}>Trending</button></li>
                                    <li><button class="dropdown-item" onClick={onChangeSortedRecently}>Recently Posted</button></li>
                                    <li><button class="dropdown-item disabled" onClick={onChangeSortedAi}>Imperial-AI</button></li>
                                    <li><button class="dropdown-item disabled" onClick={onChangeSortedAi}>Prix</button></li>
                                    <li><button class="dropdown-item disabled" onClick={onChangeSortedAi}>Arcylique</button></li>
                                    <li><button class="dropdown-item disabled" onClick={onChangeSortedAi}>Huile</button></li>
                                    <li><button class="dropdown-item disabled" onClick={onChangeSortedAi}>Dimensions</button></li>
                                </ul>
                            </div>
                            <div class="communityNfts">
                                <div class="row">
                                    <div class="col">
                                        {sortedby==="activity" ? ( <p>activity</p> ) : ( <p>recently</p> )}
                                        {sortedby==="activity" ? seaching===false ? sorted.map((item) => 
                                            item.tag==="nft" ? (<NftBox key={item.itemId.toString()} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image} account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} pk={userwallet?.privateKey} password={password} amm={amm}/> ) : ""
                                        )  : sorted.map((item) => 
                                            item.name.includes(search)===true ? (<NftBox key={item.itemId.toString()} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image} account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} pk={userwallet?.privateKey} password={password} amm={amm}/> ) : ""
                                        ) : seaching===false ? items.map((item) => 
                                            item.tag==="nft" ? (<NftBox key={item.itemId.toString()} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image} account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} pk={userwallet?.privateKey} password={password} amm={amm}/> ) : ""
                                        )  : items.map((item) => 
                                            item.name.includes(search)===true ? (<NftBox key={item.itemId.toString()} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image} account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} pk={userwallet?.privateKey} password={password} amm={amm}/> ) : ""
                                        )}
                                        
                                       


                                    </div>
                                </div>
                                
                            
                            </div>
                        </div>
                        <div class="tab-pane fade" id="ticket" role="tabpanel" aria-labelledby="ticket-tab">
                            <br />
                            <div class="dropdown">
                                <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Sorted by
                                </button>
                                <ul class="dropdown-menu dropdown-menu-dark">
                                    <li><button class="dropdown-item" onClick={onChangeSortedActivity}>Trending</button></li>
                                    <li><button class="dropdown-item" onClick={onChangeSortedRecently}>Recently Posted</button></li>
                                    <li><button class="dropdown-item disabled" onClick={onChangeSortedAi}>Imperial-AI</button></li>
                                </ul>
                            </div>
                            <div class="communityNfts">
                                <div class="row">
                                    <div class="col">
                                    {sortedby==="activity" ? ( <p>recently</p> ) : ( <p>recently</p> )}
                                        {seaching===false ? items.map((item) => 
                                            item.tag==="ticket" ? (<NftBox key={item.itemId.toString()} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image} account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} pk={userwallet?.privateKey} password={password} amm={amm}/> ) : ""
                                        )  : items.map((item) => 
                                            item.name.includes(search)===true ? (<NftBox key={item.itemId.toString()} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image}  account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} pk={userwallet?.privateKey} password={password} amm={amm}/> ) : ""
                                        )}
                                        

                                    </div>
                                </div>
                                
                            
                            </div>
                        </div>
                        <div class="tab-pane fade" id="vp" role="tabpanel" aria-labelledby="vp-tab">
                            <br />
                            <div class="dropdown">
                                <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Sorted by
                                </button>
                                <ul class="dropdown-menu dropdown-menu-dark">
                                    <li><button class="dropdown-item" onClick={onChangeSortedActivity}>Trending</button></li>
                                    <li><button class="dropdown-item" onClick={onChangeSortedRecently}>Recently Posted</button></li>
                                    <li><button class="dropdown-item disabled" onClick={onChangeSortedAi}>Imperial-AI</button></li>
                                </ul>
                            </div>
                            <div class="communityNfts">
                                <div class="row">
                                    <div class="col">
                                    {sortedby==="activity" ? ( <p>activity</p> ) : ( <p>recently</p> )}
                                        {seaching===false ? realItems.map((item) => 
                                            (<NftBox key={(item.itemId).toString()} real={true} tokenId={item.tokenId} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image}  account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} dds={dds} pk={userwallet?.privateKey} password={password} amm={amm}/> )
                                        )  : realItems.map((item) => 
                                            item.name.includes(search)===true ? (<NftBox key={item.itemId.toString()} real={true} tokenId={item.tokenId} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image}  account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} dds={dds} pk={userwallet?.privateKey} password={password} amm={amm}/> ) : ""
                                        )}

                                    </div>
                                </div>
                                
                            
                            </div>
                        </div>
                        <div class="tab-pane fade" id="onfts" role="tabpanel" aria-labelledby="onfts-tab">
                                <div className='row'>
                                    {items.map((item) => 
                                            item.seller===account ? (<NftBox key={parseInt(item.itemId)} myitem={true} name={item.name} description={item.description} id={parseInt(item.itemId)} price={parseInt(item.price)} seller={item.seller.slice(0,7) + "..."} market={market} credits={credits} setHaveItem={setHaveItem}/> ) : "" 
                                    )}

                                    {haveItem===false ? ( <div><p>You are currenlty selling no items</p></div> ) : "" }
                                </div>

                        </div>
                        <div class="tab-pane fade" id="real" role="tabpanel" aria-labelledby="real-tab">
                            <br />
                            <div class="dropdown">
                                <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Sorted by
                                </button>
                                <ul class="dropdown-menu dropdown-menu-dark">
                                    <li><button class="dropdown-item" onClick={onChangeSortedActivity}>Trending</button></li>
                                    <li><button class="dropdown-item" onClick={onChangeSortedRecently}>Recently Posted</button></li>
                                    <li><button class="dropdown-item disabled" onClick={onChangeSortedAi}>Imperial-AI</button></li>
                                </ul>
                            </div>
                            <div class="communityNfts">
                                <div class="row">
                                    <div class="col">
                                    {sortedby==="activity" ? ( <p>activity</p> ) : ( <p>recently</p> )}
                                        {seaching===false ? realItems.map((item) => 
                                            item.tag==="real" ? (<NftBox key={(item.itemId + 99).toString()} real={true} tokenId={item.tokenId} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image}  account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} dds={dds} pk={userwallet?.privateKey} password={password} amm={amm}/> ) : ""
                                        )  : realItems.map((item) => 
                                            item.name.includes(search)===true ? (<NftBox key={item.itemId.toString()} real={true} tokenId={item.tokenId} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image}  account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} dds={dds} pk={userwallet?.privateKey} password={password} amm={amm}/> ) : ""
                                        )}
                                        
                                    </div>
                                </div>
                                
                            
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    )
}

export default Market;
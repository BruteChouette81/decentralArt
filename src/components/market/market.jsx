import {useState, useEffect } from 'react';
import { useWeb3React } from "@web3-react/core"
import { ethers } from 'ethers';
import { API , Storage} from 'aws-amplify';
import { AES, enc } from "crypto-js"
import ReactLoading from "react-loading";


import injected from '../account/connector';
import default_profile from "./profile_pics/default_profile.png"

import './css/market.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import abi from '../../artifacts/contracts/market.sol/market.json'
import erc721ABI from '../../artifacts/contracts/nft.sol/nft.json'
import Credit from '../../artifacts/contracts/token.sol/credit.json';
import DiD from '../../artifacts/contracts/DiD.sol/DiD.json';
import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'
import AMMABI from '../../artifacts/contracts/AM2.sol/AMM2.json'


import NftBox from './nfts';
import PayGasList from '../F2C/gas/payGasList';

const MarketAddress = '0x710005797eFf093Fa95Ce9a703Da9f0162A6916C'; // goerli new test contract
const DDSAddress = '0x0188EFFc74943b4F54833A14f58E632a3f920a56' // 0x2F810063f44244a2C3B2a874c0aED5C6c28D1D87, 0xd860F7aA2ACD3dc213D1b01e2cE0BC827Bd3be46
const CreditsAddress = "0xc183177E3207788ea9342255C8Fcb218763d46e2" //goerli test contract
const NftAddress = '0x3d275ed3B0B42a7A3fCAA33458C34C0b5dA8Cc3A'; // goerli new test contract
const DiDAddress = "0x6f1d3cd1894b3b7259f31537AFbb930bd15e0EB8" //goerli test contract 

const Credit_AMM = '0xB7657A02cc1c5FA9Bdf39701cc6B97547e4F283C' //working with: 0x856b5ddDf0eCFf5368895e085d65179AA2Fcc4d9 credits contract

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
    let passwordInp = ""
    const [getPassword, setGetPassword] = useState(true)

    const [numreal, setNumreal] = useState(0)
    const [numticks, setNumticks] = useState(0)

    const types = "spin"
    const color = "#0000FF"

    //loading
    const [stillLoading, setStillLoading] = useState(true)

    const changePass = (event) => {
        passwordInp = event.target.value;
    }
    
    const connectUsingPassword = (e) => {
        if (e) {e.preventDefault()}
        setPassword(passwordInp)
        let did = window.localStorage.getItem("did")
        let res1 = AES.decrypt(did, passwordInp) //props.signer.privateKey
        try {
                let res = JSON.parse(res1.toString(enc.Utf8));
                if (!res.email) {
                    alert("Vous devez créer une Identitée Décentralizée avant d'accèder à l'Atelier")
                    window.location.replace("/")
                }
                if (res.pk) {
                    window.sessionStorage.setItem("password", passwordInp)
                    getPrivateKey(window.localStorage.getItem("walletAddress"), res.pk)
                    setGetPassword(false)
                }
        } catch(e) {
                alert("Mauvais mot de passe!");
        }
        
    }
    
    function GetPassword() {
        return ( <div class="getPassword">
            <form onSubmit={connectUsingPassword}> 
                <h3>Entrez votre mot de passe</h3>
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

    const getPrivateKey = async(account, pk) => { //function to get privatekey from aws dynamo server
        var data = {
            body: {
                address: account?.toLowerCase()
            }
            
        }

        var url = "/connection"

        const provider = new ethers.providers.InfuraProvider("goerli")
        API.post('serverv2', url, data).then(async (response) => {
            let userwallet = new ethers.Wallet(pk, provider)
            setAddress(userwallet.address)
            setUserwallet(userwallet)
            
            setPay(response.pay)
            
            const markets = await configureMarket("true", userwallet)
            console.log(markets)
            //let market = markets[0]
            let ddsc = markets[1] //load both market
           
            const numReal = await ddsc?.functions.itemCount()
            setNumreal(numReal)
            //setNumticks((Math.floor(numReal/10) + 1))
            //{ Array.from({length: numticks }, (_, k) => k == numticks ? range(((k-1)*10), numreal, 1).map((j) => {(<NftBox id={j} real={true} dds={dds} isMarket={true} account={address} password={password} numreal={numreal}/> )}) : range(((k-1)*10), (k*10), 1).map((j) => {(<NftBox id={j} real={true} dds={dds} isMarket={true} account={address} password={password} numreal={numreal}/> )}) ) }
            console.log(parseInt(numReal))
            setStillLoading(false)
            /*
            let itemslist = getItems("true", userwallet)
            itemslist.then(res => {
                //setItems(res[0])
                //let newRes = res[0];
                //console.log(newRes)
                //console.log(itemslist)
                //console.log(items)

                //let newitemslist = scoreQuickSort(newRes)
                //setSorted(newitemslist.reverse())
                
                //console.log(newitemslist)

                //setRealItems(res)
                let newReal = res;
                //console.log(itemslist)
                console.log(realItems)

                let newreallist = scoreQuickSort(newReal)
                setRealSorted(newreallist)
                setStillLoading(false)

                
                //console.log(newitemslist)
            })*/
            
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
            const DDSContract = getContract(DDSAddress, DDSABI, userwallet)
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
            const DDSContract = connectContract(DDSAddress, DDSABI, provider)
            setDds(DDSContract)
            const AMMContract = connectContract(Credit_AMM, AMMABI, provider)
            setAmm(AMMContract)
            return [marketContract, DDSContract]
        }
    }

    const getItems = async (haswallet, wallet) => {
        const markets = await configureMarket(haswallet, wallet)
        console.log(markets)
        //let market = markets[0]
        let ddsc = markets[1] //load both market
        let credits = await ddsc?.credits()
        console.log(credits)
        //console.log(market)
        //let itemsList = []
        

       

        let realList = []
        const numReal = await ddsc?.functions.itemCount()
        setNumreal(numReal)
        console.log(parseInt(numReal))
        //console.log(parseInt(numItems))
        //console.log("numitems: " + numItems)
    
        //get the 10 most recent sell order
        

       
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
                            if (response.ids[i] == item.itemId - 1) { // once you got the item we want to display:
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
                    if (i === numReal) {
                        console.log(newItem)
                        realList.push(newItem)
                        setRealItems(realList)
                    }

                    
                    realList.push(newItem)
                    console.log(realList)

                    
                }
                //each five items, we push to items in order to load more smoothly
                if (Number.isInteger(i/2)) {
                    setRealItems(realList)
                }
                
            }

            console.log(realList)
            
            
            
        
        
        
        return realList
        
    
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
        if (window.localStorage.getItem("hasWallet") !== "true") {
            alert("Vous devez créer un compte avant d'accèder à l'Atelier")
            window.location.replace("/")
        }
        if (window.localStorage.getItem("hasWallet") === "true" && window.localStorage.getItem("usingMetamask") !== "true") { //only have Imperial Account
            //getPrivateKey(window.localStorage.getItem("walletAddress")) // if Imperial Account load account
            console.log("ok")
            if(window.sessionStorage.getItem("password")) {
                setGetPassword(false);
                passwordInp = window.sessionStorage.getItem("password");
                //setPassword(passwordInp)
                connectUsingPassword()
                //connection("true")


            }
            

            
        }
        else {
            /*
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
            */ 
           console.log("Not OK")
            
        }
        
        //mintNFT(account) mint test nft
    }, [])

    //store everyone's name of items they are selling in the user database so its easier to get their nfts

    //make function to get specific items to see in "your items" tab so using the database, we can get all of an item and display it in the tab 

    //{items.map((item) => (<NftBox key={parseInt(item.itemId)} myitem={false} id={parseInt(item.itemId)} name={item.name} price={parseInt(item.price)} seller={item.seller.slice(0,7) + "..."} market={market} credits={credits}/> ))}

    //{ Array.from({ length: numreal }, (_, k) => (<NftBox id={k} real={true} dds={dds} isMarket={true} account={address} password={password}/> )) }

    //muynft: { Array.from({ length: numreal }, (_, k) => (<NftBox id={k} real={true} haveItem={haveItem} mynft={true} dds={dds} isMarket={true} account={address} password={password}/> )) }
    /*
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
                                        
    {sortedby==="activity" ? ( <p>activity</p> ) : ( <p>recently</p> )}
                                        {seaching===false ? realItems.map((item) => 
                                            (<NftBox key={(item.itemId)?.toString()} real={true} tokenId={item.tokenId} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image}  account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} dds={dds} password={password} amm={amm}/> )
                                        )  : realItems.map((item) => 
                                            item.name.includes(search)===true ? (<NftBox key={item.itemId.toString()} real={true} tokenId={item.tokenId} myitem={false} id={parseInt(item.itemId)} name={item.name} description={item.description} price={parseInt(item.price)} seller={item.seller} image={item.image}  account={address} signer={userwallet} pay={pay} did={did} market={market} credits={credits} dds={dds} password={password} amm={amm}/> ) : ""
                                        )}*/

    //{ Array.from({ length: numreal }, (_, k) =>  k < numreal-15 || k === 21 ? "" : (<NftBox id={k} real={true} dds={dds} isMarket={true} account={address} password={password} numreal={numreal}/> )) }
    //const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

    const chunkGeneration = (max) => {
        //return number of chunk, chunk size
        const chunk_size = 5

        if (max > chunk_size) {
            let num_chunk = Math.floor(max/chunk_size)
            return [num_chunk, chunk_size]
        } else {
            return [1, max]
        }

    }

    function UListLoader(props) {
        let timeo = 2000;
        const based = 5; //minimum item loading
        const increasingby = 5; //number of more item being load each "load more "
        //let chunk_number = 0;

        const [chunk_number, setChunk_number] = useState(0);

        const loadmore = () => {
            setChunk_number(chunk_number+1)

        }

        
        //calculate chunk info
        useEffect(() => {
            console.log("reload")
            /*
            let chunks = chunkGeneration(parseInt(12))

            //console.log(chunks)
            let lastLength = 0;
            let exedent = 0;
            let numtime = 1;
            let fUlist = []
            const timedOutReload = () => {
                for (let i = 0; i<=chunks[1]; i++) {
                    fUlist.push(i + exedent)
                    console.log("t")
                    if (i == chunks[1] || fUlist.length > lastLength) {
                        setUlist(fUlist)
                        exedent += 6;
                        lastLength = fUlist.length;
                        if(numtime < chunks[0]) {
                            console.log("u")
                            setTimeout(timedOutReload, timeo)
                            numtime+=1;
                        } else (
                            console.log("done")
                        )
                         
                    }
                }
                //setUlist(fUlist)
            }
            timedOutReload()*/
            let numtime = 1;
            //let maxtime = 2;
            const timedOutReload = () => {
                setChunk_number(chunk_number+1)
                if(numtime > (numreal/increasingby)) {
                        console.log("reloading")
                        setTimeout(timedOutReload, timeo)
                        numtime+=1;
                } else {
                    console.log("done")
                }
            }
            setTimeout(timedOutReload, timeo);
        }, [])
        

        // Array.from({ length: based + (increasingby * chunk_number) }, (_, k) => k <=  based + (increasingby * (chunk_number-1)) ? "" : <p>{k}</p>)
        // (chunk_number-(i+1))
        return (
            <div>
            {Array.from({ length: based }, (_, k) => numreal > 0 ? (<NftBox id={k} catID={props.id} real={true} dds={dds} isMarket={true} account={address} password={password} numreal={numreal}/>) : "")}
            {chunk_number > 0 ? Array.from({ length: chunk_number}, (_, i) => Array.from({ length: based + (increasingby * (i + 1)) }, (_, k) => k <=  (based-1) + (increasingby * i) || k >= numreal ? "" : (<NftBox id={k} real={true} catID={props.id} dds={dds} isMarket={true} signer={userwallet} account={address} password={password} numreal={numreal}/>) )) : ""}
            <button onClick={loadmore} class="btn btn-primary btn-lg" style={{"float": "bottom"}}>{window.localStorage.getItem("language") == "en" ? "Load more!" : "En voir davantage!" }</button>
            </div>)
    }

    // { Array.from({ length: numreal }, (_, k) => numreal > 10 ? k < 10 ? (<NftBox id={k} real={true} displayItem={true} isMarket={true} dds={dds}/> ) : "" : (<NftBox id={k} real={true} dds={dds} isMarket={true} account={address} password={password} numreal={numreal}/> )) }
    //my items: { Array.from({ length: numreal }, (_, k) => k < numreal-15 || k === 21 ? "" : (<NftBox id={k} real={true} haveItem={haveItem} mynft={true} dds={dds} isMarket={true} account={address} password={password}/> )) }
    //<UListLoader id={0}/> 
    //<UListLoader id={1}/> 
    //<NftBox id={14} real={true} catID={1} haveItem={haveItem} mynft={true} dds={dds} isMarket={true} account={address} password={password}/>
    //{ Array.from({ length: 15 }, (_, k) => numreal > 0 ? k!=14 ? "" : (<NftBox id={14} real={true} catID={0} haveItem={haveItem} mynft={true} dds={dds} isMarket={true} displayItem={false} account={address} password={password}/> ) : "") }
    return(
        getPassword ? <GetPassword /> : 
        <div class="market">
            <div class="account">
               {userwallet ? (<RenderImage account={userwallet?.address} />) :  active ? (<RenderImage account={account} />) : ( <img src={default_profile} alt="" id='profilepic' /> )} {userwallet ? (<h6 id='account'>{window.localStorage.getItem("language") == "en" ? "account" : "compte" }: {userwallet?.address.slice(0,10) + "..."}</h6>) : (<h6 id='account'>account: {account?.slice(0,10) + "..."}</h6>)}
               {userwallet ? (<p id='connected' style={{color: "green"}}>connected</p>) : active ? (<p id='connected' style={{color: "green"}}>{window.localStorage.getItem("language") == "en" ? "connected" : "connecté" }</p>) : (<p id='connected' style={{color: "red"}}>disconnected</p>)}
               
            </div>              
            {!userwallet ? (<div style={{paddingLeft: 40 + "%"}}><ReactLoading type={types} color={color}
            height={200} width={200} /><h5>Connecting Account...</h5></div>) :
            (<div class="nft">
                <nav class="nav">
                    <ul class="nav nav-pills" id="myTab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="cnfts-tab" data-bs-toggle="tab" data-bs-target="#cnfts" type="button" role="tab" aria-controls="cnfts" aria-selected="true">{window.localStorage.getItem("language") == "en" ? "Art of the artist" : "Toile de l'artiste" }</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="ticket-tab" data-bs-toggle="tab" data-bs-target="#ticket" type="button" role="tab" aria-controls="ticket" aria-selected="false">{window.localStorage.getItem("language") == "en" ? "Canadian master" : "Maitre canadien" }</button>
                        </li>
                       
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="onfts-tab" data-bs-toggle="tab" data-bs-target="#onfts" type="button" role="tab" aria-controls="onfts" aria-selected="false">{window.localStorage.getItem("language") == "en" ? "My Items" : "Mes Items" }</button>
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
                                        
                                   
                                        
                                    <UListLoader id={0}/> 
                                   

                                    


                                    </div>
                                </div>
                                {stillLoading ? (<div style={{paddingLeft: 40 + "%"}}><ReactLoading type={types} color={color}
                                    height={200} width={200} /><h5>Still loading items...</h5></div>) : ""
                                }
                                
                            
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
                                    
                                    <UListLoader id={1}/> 
                                    </div>
                                </div>
                                {stillLoading ? (<div style={{paddingLeft: 40 + "%"}}><ReactLoading type={types} color={color}
                                    height={200} width={200} /><h5>Still loading items...</h5></div>) : ""
                                }
                            
                            </div>
                        </div>
                        
                        <div class="tab-pane fade" id="onfts" role="tabpanel" aria-labelledby="onfts-tab">
                                <div className='row'>
                                    <div class="col">
                                    
                                    </div>
                                    

                                    {haveItem===false ? ( <div><p>Vous ne vendez pas d'item.</p></div> ) : "" }
                                </div>
                                {stillLoading ? (<div style={{paddingLeft: 40 + "%"}}><ReactLoading type={types} color={color}
                                    height={200} width={200} /><h5>Still loading items...</h5></div>) : ""
                                }

                        </div>
                       
                    </div>
            </div>)}
        </div>
    )
}

export default Market;
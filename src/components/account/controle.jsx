import "./css/profile.css"
import "./css/controle.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js';
import {useState, useEffect } from 'react';
import { ethers } from "ethers";
import { AES, enc, SHA256, HmacSHA512 } from "crypto-js"
import { stringify } from "urlencode"
import { API, Storage } from 'aws-amplify';
import {ConnectorController, DAppProvider, useLogs} from '@usedapp/core'

import ReactLoading from "react-loading";
import PayGas from "../F2C/gas/payGas";

import * as IPFS from 'ipfs-core';  //IPSF to list nft metadata
import axios from "axios";

import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";

import erc721ABI from '../../artifacts/contracts/nft.sol/nft.json'
import erc1155ABI from '../../artifacts/contracts/nft.sol/erc1155.json'
import realabi from '../../artifacts/contracts/Real.sol/Real.json'
import Credit from '../../artifacts/contracts/token.sol/credit.json';
import abi from '../../artifacts/contracts/market.sol/market.json'
import TicketABI from '../../artifacts/contracts/ticket.sol/ticket.json'
import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'

import default_profile from "./profile_pics/default_profile.png"
import getGasPriceUsd from "../F2C/gazapi";
import injected from "./connector";
import PayGasList from "../F2C/gas/payGasList";
import PayGasRetrieve from "../F2C/gas/payGasRetrieve";
import PayGasSubmit from "../F2C/gas/payGasSubmit";
/*
API Key: 681fa3fe8fcbfe2992fe
API Secret: 718da1ac14dfcf25c336bfea241e38563e5f2c9cc8bd77bcde1a5968ad8ebf6a
JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmNjhjNmRmZi1mOGRmLTQzNzUtYjA5Ny1mMTNmNDk0OTk3ODIiLCJlbWFpbCI6ImhiYXJpbDFAaWNsb3VkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2ODFmYTNmZThmY2JmZTI5OTJmZSIsInNjb3BlZEtleVNlY3JldCI6IjcxOGRhMWFjMTRkZmNmMjVjMzM2YmZlYTI0MWUzODU2M2U1ZjJjOWNjOGJkNzdiY2RlMWE1OTY4YWQ4ZWJmNmEiLCJpYXQiOjE2ODUyODk0NDZ9.dheuwiicVcI3mM7yMo9voga4Bis7nDu7g5TJocC_xkc

*/
const secret = "718da1ac14dfcf25c336bfea241e38563e5f2c9cc8bd77bcde1a5968ad8ebf6a"
const apikey = "681fa3fe8fcbfe2992fe"
const key = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmNjhjNmRmZi1mOGRmLTQzNzUtYjA5Ny1mMTNmNDk0OTk3ODIiLCJlbWFpbCI6ImhiYXJpbDFAaWNsb3VkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI2ODFmYTNmZThmY2JmZTI5OTJmZSIsInNjb3BlZEtleVNlY3JldCI6IjcxOGRhMWFjMTRkZmNmMjVjMzM2YmZlYTI0MWUzODU2M2U1ZjJjOWNjOGJkNzdiY2RlMWE1OTY4YWQ4ZWJmNmEiLCJpYXQiOjE2ODUyODk0NDZ9.dheuwiicVcI3mM7yMo9voga4Bis7nDu7g5TJocC_xkc"
const MarketAddress = '0x710005797eFf093Fa95Ce9a703Da9f0162A6916C'; //goerli test contract for listing from account
const DDSAddress = '0x1D1db5570832b24b91F4703A52f25D1422CA86de' //gas contract: 0x14b92ddc0e26C0Cf0E7b17Fe742361B8cd1D95e1, Real: 0x1D1db5570832b24b91F4703A52f25D1422CA86de
const NftAddress = '0x3d275ed3B0B42a7A3fCAA33458C34C0b5dA8Cc3A';
const TicketAddress = '0x6CFADe18df81Cd9C41950FBDAcc53047EdB2e565' //goerli test contract
const ImperialRealAddress = '0xbC1Fe9f6B298cCCd108604a0Cf140B2d277f624a'


const getMessageSignatureKraken = (path, request, secret, nonce) => {
           
    //get signature api using crypto-js library: https://www.npmjs.com/package/crypto-js
    let postdata = stringify(request)
    const hashDigest = SHA256(nonce + postdata);
    const hmac_digest = enc.Base64.stringify(HmacSHA512(path + hashDigest,  enc.Base64.parse(secret)));        
    return hmac_digest;
};

//https://github.com/nothingisdead/npm-kraken-api
async function getAddress (key, secret) {
    let headers = {}

    let data = {
        "nonce": (new Date()).getTime().toString(),
        "asset": "USDT",
        "method": "Ethereum"
    }

    headers['API-Key'] = key;
    headers['API-Sign'] = getMessageSignatureKraken("/0/private/DepositAddresses", data, secret, data["nonce"]);
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    console.log(headers)

    let config = {"headers": headers}
    /*

    let response_kraken = await fetch("https://api.kraken.com/0/private/DepositAddresses", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: headers,
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "strict-origin-when-cross-origin", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      })
    */
    let response_kraken = await axios.post("https://api.kraken.com/0/private/DepositAddresses", data, config)

    console.log(response_kraken.result[0].address)
    return response_kraken.result[0].address

    //req = requests.post((api_url + uri_path), headers=headers, data=data)
}

async function retrieveMoney(key, secret, amount, price) {

    let headers = {}

    let data = {
        "nonce": (new Date()).getTime().toString(),
        "ordertype": "limit",
        "type": "sell",
        "volume": amount,
        "pair": "USDCCAD",
        "price": price
    }

    headers['API-Key'] = key;
    headers['API-Sign'] = getMessageSignatureKraken("/0/private/AddOrder", data, secret, data["nonce"]);
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    console.log(headers)

    let config = {"headers": headers}
    /*

    let response_kraken = await fetch("https://api.kraken.com/0/private/DepositAddresses", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: headers,
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "strict-origin-when-cross-origin", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      })
    */
    let response_kraken = await axios.post("https://api.kraken.com/0/private/AddOrder", data, config)


}

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
                const DDS = connectContract(DDSAddress, DDSABI.abi, provider)
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
                const DDS = getContract(DDSAddress, DDSABI.abi, signer)
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


function DisplayNoToken() {
    return(
        <div className="notoken">
            <h2>Unlock the Control Panel by becoming an holder!</h2>
        </div>
    )
}
function DisplayInfo(props) {
    return(
        <div class="info">
            <h4 style={{padding: 10 + "px"}}>Personnal Info:</h4>
            <p style={{color: 'white'}}>information about transactions of your $CREDIT</p>
            <table class="table table-dark">
                <thead>
                    <tr class="table-dark">
                        <th class="table-dark" scope="col">Info</th>
                        <th class="table-dark" scope="col">User</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="table-dark">
                        <th class="table-dark" scope="row">Transaction</th>
                        <td class="table-dark"> 0 {props.numtrans}</td>                         
                    </tr>
                    <tr class="table-dark">
                        <th class="table-dark" scope="row">Holder since</th>
                        <td class="table-dark">{props.numdays} days</td>                         
                    </tr>
                    <tr class="table-dark">
                        <th class="table-dark" scope="row">Profit/loss</th>
                        <td class="table-dark" style={{color: props.color}}> 0 {props.profit} % (<a href='#'>see charts</a>)</td>                         
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
function DisplayActions(props) {
	const [numtrans, setNumtrans] = useState();
    const [profit, setProfit] = useState();
    const [numdays, setNumdays] = useState(0);
    const [price, setPrice] = useState([]);
    const [colors, setColors] = useState("green");
    const [date, setDate] = useState([]);

    const [card, setCard] = useState("");
    const [eDate, setEdate] = useState("")
    const [cvv, setCvv] = useState("");
    const [account, setAccount] = useState("")

    const [fname, setFname] = useState("")
    const [lname, setLname] = useState("")
    const [country, setCountry] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [street, setStreet] = useState("")
    const [code, setCode] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")

    const [payingGas, setPayingGas] = useState(false)
    const [loading, setLoading] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [sellLoading, setSellLoading] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [metaPasswordSetting, setMetaPasswordSetting] = useState(false)
    const [password, setPassword] = useState()

    const [usdprice, setUsdprice] = useState(0)
    const [tokenuri, setTokenuri] = useState()
    const [nft, setNft] = useState()
    const [metadata, setMetadata] = useState()

    const [tag, setTag] = useState("nft")
    const [price2, setPrice2] = useState(0)
    const [nftname, setNftname] = useState("")
    const [description, setDescription] = useState("")
    const [real, setReal] = useState(false)
    const [image_file, setImage] = useState(null);
    const [images, setImages] = useState(null);
    const [day, setDay] = useState(0) ///////chnage
    let day2 = 0;
    let price3 = 0;
    const [fee, setFee] = useState(0)
    const [pricex3, setPricex3] = useState(0)
    const [timeToReinvest, setTimeToReinvest] = useState(0)

    const [tickets, setTickets] = useState(null);

    const [numAttribute, setNumAttribute] = useState(0)
    const [values, setValues] = useState([])
    const [keys, setKeys] = useState([])

    const [ynft, setYnft] = useState()
    const [dds, setDds] = useState()
    const [gasItemId, setGasItemId] = useState()

    const [proof, setProof] = useState("")
    const [orderID, setOrderID] = useState(0)
    const [proofPrice, setProofPrice] = useState(0)

    const [sellerExchange, setSellerExchange] = useState("")
    const [sellerApi, setSellerApi] = useState("")
    const [sellerSec, setSellerSec] = useState("")

    const [sellerRetrieveAddress, setSellerRetrieveAddress] = useState("")

    const [step, setStep] = useState("Transaction")
    const type = "spin"
    const color = "#0000FF"

    const dates = [];

    //helper fonction to handle minting multiple item
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

    const setExchangeKraken = () => {
        setSellerExchange("kraken")
    }
    const setExchangeCryptocom = () => {
        setSellerExchange("crypto.com")
    }
    const setExchangeBitbuy = () => {
        setSellerExchange("bitbuy")
    }
    const onApiChanged = (event) => {
        setSellerApi(event.target.value)
    }
    const onSecChanged = (event) => {
        setSellerSec(event.target.value)
    }
    const saveApi = async (e) => {
        e.preventDefault()

        if (window.localStorage.getItem("usingMetamask") === "true") {
            let did = window.localStorage.getItem("meta_did")
            let res1;
            if (password) {
                res1 = AES.decrypt(did, password)
            } else {
                res1 = AES.decrypt(did, props.password)
            }
            
            let res = JSON.parse(res1.toString(enc.Utf8));
            res.api = sellerApi
            res.sec = sellerSec
            console.log(res)

            let stringdata = JSON.stringify(res)
            //let bytedata = ethers.utils.toUtf8Bytes(stringdata
            var encrypted;
            if (password) {
                encrypted = AES.encrypt(stringdata, password)
            } else {
                encrypted = AES.encrypt(stringdata, props.password)
            }
            //hash the data object and store it in user storage
            //ethers.utils.computeHmac("sha256", key, bytedata)
            
            
            window.localStorage.setItem("meta_did", encrypted);

            try {
                const sellerAddress = await getAddress(sellerApi, sellerSec)

                window.localStorage.setItem("MoneyAddress", sellerAddress.toLowerCase())
                alert("Successfully connected account !")
            } catch(e) {
                alert("Failed to connect you account...")
            }

            
            
        } else {
            let did = window.localStorage.getItem("did")
            let res1 = AES.decrypt(did, props.signer.privateKey)
            let res = JSON.parse(res1.toString(enc.Utf8));
            res.api = sellerApi
            res.sec = sellerSec

            let stringdata = JSON.stringify(res)
            //let bytedata = ethers.utils.toUtf8Bytes(stringdata
           
            encrypted = AES.encrypt(stringdata, props.signer.privateKey)
            window.localStorage.setItem("did", encrypted);

            try {
                const sellerAddress = await getAddress(sellerApi, sellerSec)

                window.localStorage.setItem("MoneyAddress", sellerAddress.toLowerCase())
                alert("Successfully connected account !")
            } catch(e) {
                alert("Failed to connect you account...")
            }

            
        }
    }

    const onSellerRetrieveAddressChange = (event) => {
        setSellerRetrieveAddress(event.target.value)
    }

    const saveSellerRetrieveAddress = (e) => {
        e.preventDefault()
        //check if valid address 
        window.localStorage.setItem("MoneyAddress", sellerRetrieveAddress.toLowerCase())

    }

    const onFnameChanged = (event) => {
        setFname(event.target.value)
    }
    const onLnameChanged = (event) => {
        setLname(event.target.value)
    }
    const onCountryChanged = (event) => {
        setCountry(event.target.value)
    }
    const onCityChanged = (event) => {
        setCity(event.target.value)
    }
    const onStateChanged = (event) => {
        setState(event.target.value)
    }
    const onStreetChanged = (event) => {
        setStreet(event.target.value)
    }
    const onCodeChanged = (event) => {
        setCode(event.target.value)
    }
    const onEmailChanged = (event) => {
        setEmail(event.target.value)
    }
    const onPhoneChanged = (event) => {
        setPhone(event.target.value)
    }

    const onCardChanged = (event) => {
        setCard(event.target.value)
    }

    const onDateChanged = (event) => {
        setEdate(event.target.value)
    }

    const onCvvChanged = (event) => {
        setCvv(event.target.value)
    }
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

    const onAddedAttribute = () => {
        setNumAttribute(numAttribute+1)
    }
    const onRemoveAttribute = (event) => {
        setNumAttribute(numAttribute-1)
        const oldValues = values
        oldValues.splice(parseInt(event.target.id), 1)
        setValues(oldValues)
        const oldKeys = keys
        oldKeys.splice(parseInt(event.target.id), 1)
        setKeys(oldKeys)
    }

    const onAddedValue = (event) => {
        const oldValues = values
        oldValues[parseInt(event.target.id)] = event.target.value
        setValues(oldValues)
        console.log(oldValues)
    }
    const onAddedKey = (event) => {
        const oldKeys = keys
        oldKeys[parseInt(event.target.id)] = event.target.value
        setKeys(oldKeys)
        console.log(oldKeys)
        console.log(event)
    }

    const changePass = (event) => {
        setPassword(event.target.value)
    }

    const connectUsingPassword = (e) => {
        e.preventDefault()
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
        //let bytedata = ethers.utils.toUtf8Bytes(stringdata
        console.log(stringdata)
        console.log(password)
        var encrypted = AES.encrypt(stringdata, password)
        //hash the data object and store it in user storage
        //ethers.utils.computeHmac("sha256", key, bytedata)
        
          
        window.localStorage.setItem("meta_did", encrypted);
        alert("DID successfully written!")
        setMetaPasswordSetting(false)
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
    //payment architecture: 
    /*[
        ["card", "date", "cvv"], //each list is a payment method
        [],
        []
    ]
    */

    const onProofChanged = (event) => {
        setProof(event.target.value)
    }

    const onOrderIDChanged = (event) => {
        setOrderID(event.target.value)
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

    const cancelPayGas = () => {
        setUsdprice(0)
    }
    const createReal = async(event) => {
        event.preventDefault();
        if (nftname !== ""  && description !== "" && image_file !== null && tag !== "") {
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
                          tag: tag,
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
                          tag: tag,
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

            let cid = res2data.IpfsHash
            if (event.nativeEvent.submitter.value === "add") {
                setCreateLoading(false)
                if (tokenuri) {
                    let tokensuris = tokenuri;
                    tokensuris.push("https://ipfs.io/ipfs/" + cid)
                    setTokenuri(tokensuris)
                } else {
                    setTokenuri(["https://ipfs.io/ipfs/" + cid])
                }
                
                
            } else {
                setTokenuri("https://ipfs.io/ipfs/" + cid)
                console.log("https://ipfs.io/ipfs/" + cid)
                try {
                    if (props.signer) {
                        
                        console.log(props.signer)
                        await mintReal(props.account, "https://ipfs.io/ipfs/" + cid, props.signer)
                        setCreateLoading(false)
                        alert("You can see your items in Your Art. You will receive a notification on what are the procedure concerning the Proof of Sending.")
                        
                    } else {
                        await mintReal(props.account, "https://ipfs.io/ipfs/" + cid, "")
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
                            let gas = await nft.estimateGas.safeMint(props.account, "https://ipfs.io/ipfs/" + cid)
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
                            let gas = await nft2.estimateGas.safeMint(props.account, "https://ipfs.io/ipfs/" + cid)
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
            
        }
        else {
            alert("Need to fill our the whole form!")
        }
    }

    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let reader = new FileReader();
            reader.onload = (e) => {
                setImages(e.target.result)
            };
            reader.readAsDataURL(event.target.files[0]);
            setImage(event.target.files[0])
        }
    }

    const onTicketChange = (event) => {
        setTickets(event.target.files[0])
    }
    const onDayChange = async(event) => {
        setDay(event.target.value)
        //console.log(event.target.value)
    }

    const onDay2Change = (event) => {
        day2 = event.target.value
    }
    const onPrice3Change = (event) => {
        price3 = event.target.value
    }

    const calculateFeesSeller = () => {
        setFee(price3 * 0.055 + 2)
        //amountCrypto =(Fiat - (Fiat x 5.5% + 0.5) => banxa is 1.5% to 0% => https://banxa.com/cronos/#:~:text=On%20ramp%2C%20Off%20ramp%2C%20NFT%20Checkout%20Banxa%20fees,%28for%20the%20end%20user%29%20for%20the%20first%20month
        setPricex3(price3 - (price3 * 0.055 + 2)) //2 is the max in cad
        
        //calculate Stake or Go system ==> tips: always stay in the same big position
        //minimum 3 mounths for recover (6%, we give equivalent (5.5 to 1.5))
        //6 months: 13% we give 3% - 6%
        //9 months:  20% we give 6% - 9%
        //12 months: 27% we give 7% - 10%
        //24 months: 55% we give 20%

        setTimeToReinvest((price3 * 0.055 + 2) / price3)
    }

    const onPriceChange = async(event) => {
        setPrice2(event.target.value)
    }
    const onNameChange = (event) => {
        setNftname(event.target.value)
    }
    const onDescriptionChange = (event) => {
        setDescription(event.target.value)
    }

    const onSelectedReal = (event) => {
        setReal(true)
    }
    const onSelectedNFT = (event) => {
        setReal(false)
    }

    function DisplayCreate() {
        return (
            <div class="create" >
                <h3>Create an Item representing your product:</h3> <br />
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop5">Create form</button>
                <br />
                <br />
                <h5>Items ready to be publish: {tokenuri ? tokenuri?.length : "0"}</h5>
                {tokenuri?.length > 0 ?<button class="btn btn-warning">Publish all my items !</button> : ""}
                <p>For more informations, contact our team</p>
               
                
            </div>
        )
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

    //account, did, pay, RealPurchase 
    function YnftCard(props) {
        const [listingItem, setListing] = useState(false)
        const [usdPrice2, setUsdPrice2] = useState(0)
        const [usdPrice3, setUsdPrice3] = useState(0)


        const [status, setStatus] = useState("Not prooved")
        const [trackingCode, setTrackingCode] = useState()
        const [numdaysToRetrieve, setNumdaysToRetrieve] = useState()
        

        const pollStatus = async() => {
            console.log(props.realPurchase.length)
            
            //first get itemID using database
                //first option get the address of the owner before ( buyer => contract => seller)
                //second option get a map in users database of real item purchase => get it in props

            //second, get item by itemID
            

            let topic = '0xd5374e02ff747047919675d27896da7d71e6f114f88ad9f715f0b4475dc69cda'
              
            
            //third if prooved == true get event with moralis or uselogs
            for (let i=0; i<props.realPurchase.length; i++) {
                console.log(props.realPurchase[i][0])
                console.log(props.tokenid)
                if(props.realPurchase[i][0] == props.tokenid) { //if we match nft address
                    const item = await dds.items(parseInt(props.realPurchase[i][1]))
                    const blocknumber = await dds.provider.getBlock()
                    console.log(parseInt(item.numBlock))
                    console.log(parseInt(item.startingBlock))
                    setNumdaysToRetrieve(parseFloat((parseInt(item.startingBlock) + parseInt(item.numBlock) - parseInt(blocknumber.number) ) / 5760).toFixed(3))
                    if (item.prooved === true) {
                        setStatus("prooved")

                        var data = {
                            body: {
                                topic: topic
                            }
                            
                        }
                
                        var url = "/getproofdata"
                
                        API.post('serverv2', url, data).then((response) => {
                            if (response.result) {
                                for(let i=0; i<response.result.length; i++) {
                                    if (response.result[i].data.itemId == props.realPurchase[i][1]) {
                                        setTrackingCode(response.result[i].data.proof)
                                    }
                                } 
                            }

                        })


                        /*

                        //'https://deep-index.moralis.io/api/v2/{dds.address.toLowerCase()}/events?chain=eth&topic={topic}'
                        const web3ApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImUxYTlmOGQ4LWYwNGUtNGY5Yi1hYjBkLWEwNTZlZTc5NzNjNSIsIm9yZ0lkIjoiMjI3NTYzIiwidXNlcklkIjoiMjI4MDc5IiwidHlwZUlkIjoiNzFhYWJmNjEtMzNjMi00MjMxLTgwMzAtOGQxZDA0OWMzMmVkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODg1NzkyMDQsImV4cCI6NDg0NDMzOTIwNH0.nBgu238SNYZ3XvLwpKkTIoM6qZ5ZLj4LtomEr03tHro"
                        const options = {
                          method: 'POST',
                          headers: {
                            accept: 'application/json',
                            'X-API-Key': web3ApiKey
                          },
                          body: '{"anonymous":false,"inputs":[{"indexed":false,"name":"itemId","type":"uint256","internal_type":"uint256"},{"indexed":true,"name":"nft","type":"address","internal_type":"address"},{"indexed":false,"name":"tokenId","type":"uint256","internal_type":"uint256"},{"indexed":true,"name":"seller","type":"address","internal_type":"address"},{"indexed":false,"name":"proof","type":"string","internal_type":"string"}],"name":"Prooved","type":"event"}' //JSON.stringify(ProovedAbi)
                        };
                        
                        
                        fetch('https://deep-index.moralis.io/api/v2/0x1d1db5570832b24b91f4703a52f25d1422ca86de/events?chain=goerli&topic=0xd5374e02ff747047919675d27896da7d71e6f114f88ad9f715f0b4475dc69cda', options) //chain to arbitrum
                          .then((res) => res.json())
                          .then((data) => {
                            console.log(data) //get the proof
                            //setTrackingCode(log.data.proof)
                          })

                        */

                    }
                }
            }
            //return logs
        }

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
                    const DDS = connectContract(DDSAddress, DDSABI.abi, provider)
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
                    const DDS = getContract(DDSAddress, DDSABI.abi, props.signer)
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
    }

    function CusNftCard(props) {
        
        return (
            <div>
                <p>preview:</p>
                <div class="ynftcard">
                <img id='cardimg' src={props.image} alt="" />
               
                <br />
                <br />
                <h4> Name:  <a href="">{props.name}</a></h4>
                <p>Description: {props.description}</p>
                <p>Price: {props.price}</p>
                <button type="button" class="btn btn-secondary">Sell</button> 
            </div>
            </div>
            
        )
    }

    function ListYnftCard(props) {
        return (
            <div class="CardList">
                <div class="row">
                    <div class="col">
                        {props.ynft?.map(i => {
                         return <YnftCard name={i?.name} abi={i?.contractType} description={i.metadata?.description} image={i.metadata?.image} tag ={i.metadata?.tag} signer={props.signer} level={props.level} address={i?.tokenAddress} tokenid={i?.tokenId} account={props.account} did={props.did} pay={props.pay} realPurchase={props.realPurchase} />
                        })}
                    </div>
                </div>
               
            </div>
        )
    }

    

    function DisplayYnft () {
        //const [ynft, setYnft] = useState()
        const loadNft = async() => {
            //get nft using moralis
            
            /*
            let data = {
                body: {
                    address: "0x7675CF4abb1A19F7Bd5Ed23d132F9dFfA0C9587D"
                }
            }
            let url ="/nftbyaddress"
            API.post('server', url, data).then((response) => {
                console.log(response[0])
                //setYnft(response)
            })

             let nftlist = {
                name: "Marco final boss",
                tokenAddress: "0xbC1Fe9f6B298cCCd108604a0Cf140B2d277f624a",
                tokenId: 12, //put to int
                metadata: {
                    description: "Marco le boss",
                    tag: "Imperssionisme",
                    image: "https://ipfs.io/ipfs/QmSytTBU74r5HRxAsm2GiqsQyXDccq4Ng7YSSvstSbyipN"
                }
            }
            */

            
            const web3ApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImUxYTlmOGQ4LWYwNGUtNGY5Yi1hYjBkLWEwNTZlZTc5NzNjNSIsIm9yZ0lkIjoiMjI3NTYzIiwidXNlcklkIjoiMjI4MDc5IiwidHlwZUlkIjoiNzFhYWJmNjEtMzNjMi00MjMxLTgwMzAtOGQxZDA0OWMzMmVkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODg1NzkyMDQsImV4cCI6NDg0NDMzOTIwNH0.nBgu238SNYZ3XvLwpKkTIoM6qZ5ZLj4LtomEr03tHro"
            const options = {
              method: 'GET',
              headers: {
                accept: 'application/json',
                'X-API-Key': web3ApiKey
              }
            };
            let address = '0x4c62fc52d5ad4c8273feb97684ba612288ee9507'
            let nftlist = []
            
            fetch('https://deep-index.moralis.io/api/v2/'+ address + '/nft?chain=goerli&format=decimal&media_items=false', options) //chain to arbitrum
              .then((res) => res.json())
              .then((data) => {
                console.log(data.result)
                for (let i=0; i<data?.result.length; i++) {
                    let metadata = data.result[i].token_uri

                    console.log("CID: " + metadata?.replace("https://ipfs.moralis.io:2053/ipfs/", "") )

                    //'https://api.pinata.cloud/data/pinList?status=pinned&pinSizeMin=100' \--header 'Authorization: Bearer PINATA JWT'

                    const options2 = {
                        method: 'GET',
                        headers: {
                          accept: 'application/json',
                          Authorization: key
                        }
                    };
          
                    fetch('https://api.pinata.cloud/data/pinList?status=pinned&hashContains=' + metadata?.replace("https://ipfs.moralis.io:2053/ipfs/", ""), options2).then((res2) => res2.json()
                    ).then((data2) => {
                        
                        console.log(data2?.rows[0])
                        if (ynft) {
                            let ynftlist = ynft;

                            setYnft(ynftlist)
                            console.log(ynftlist)
                        }
                        
                        nftlist.push({
                            name: data2?.rows[0]?.metadata.name,
                            tokenAddress: data.result[i].token_address,
                            tokenId: data.result[i].token_id, //put to int
                            metadata: {
                                description: data2?.rows[0]?.metadata.keyvalues?.description,
                                tag: data2?.rows[0]?.metadata.keyvalues?.tag,
                                image: metadata
                            }
                        })
                    })
                }
                return nftlist
                
            }).then((ynftlist) => {
            
                console.log(ynftlist)
                setYnft(ynftlist)
                
            })
            .catch((error)=>console.log(error));

           

            //load DDS contract 
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const contract = connectContract(DDSAddress, DDSABI.abi, provider)
                setDds(contract)
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const contract = getContract(DDSAddress, DDSABI.abi, props.signer)
                setDds(contract)
            }
           
        }

        return (
            <div class="ynft">
                <h1>See your orders!</h1>
                <br />
                <ListYnftCard ynft={ynft} level={props.level} signer={props.signer} account={props.account} did={props.did} pay={props.pay} realPurchase={props.realPurchase}/>

                <button class="btn btn-primary" onClick={loadNft}>Scan your account!</button>
            </div>
        )
    }

    function setS3Config(bucket, level) {
        Storage.configure({
            bucket: bucket,
            level: level,
            region: "ca-central-1",
            identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952'
        })
    }

    const GetClient = (props) => { //account, did

        const [numItems, setNumItems] = useState(0)
        const [orderIds, setOrderIds] = useState([])

        const OrderToComplete = (props) => {
            const [gettingID, setGettingID] = useState(false)
            const [clientId, setClientId] = useState([])

            const getClientInfo = async() => {
                console.log("activated")
                let key = await dds.getClientInfos(props.orderid - 1, props.orderid) //itemID, order ID or let keyid = ... keyid[0], keyid[1], keyid[0]
                console.log(key)
                const item = await dds?.items(props.orderid - 1)
                console.log(item.nft)
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
                    const nft = getContract(item.nft, realabi.abi, props.signer)

                    const buyer_address = await nft.ownerOf(item.tokenId)
                    console.log(buyer_address)
                    // go take hash form bucket file then, delete the file
                    setS3Config("didtransfer", "public")
                    const file = await Storage.get(`${buyer_address.toLowerCase()}.txt`)
                    fetch(file).then((res) => res.text()).then((text) => {
                        console.log(text)
                        let res1 = AES.decrypt(text, key)
                        const res = JSON.parse(res1.toString(enc.Utf8));
                        setClientId(res)
                        setGettingID(true)

                    })
                }
                
                
                
            }
            const cancel = () => {
                setGettingID(false)
            }
            return ( //res.city, res.state, res.postalCode, res.country, res.street1
                gettingID ? ( <div class="ordercard" >
                    <h6>Name: {clientId.first_name}</h6>
                    <h6>Last Name: {clientId.last_name}</h6>
                    <h6>Country: {clientId.address.countryCode}</h6>
                    <h6>State: {clientId.address.state}</h6>
                    <h6>City: {clientId.address.city}</h6>
                    <h6>Street: {clientId.address.addressLine1}</h6>
                    <h6>Postal Code: {clientId.address.postCode}</h6>
                    <button class="btn btn-danger" onClick={cancel}>Cancel</button>

                </div> ) : (
                <div class="ordercard" >
                    <h6>Item Name: {props.name}</h6>
                    <h6>Order ID: {props.orderid}</h6>
                    <br />
                    <br />
                    <button class="btn btn-primary" onClick={getClientInfo} >Get Client Information</button>
                </div>)
            )
        }



        const loadDDS = async() => {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const contract = connectContract(DDSAddress, DDSABI.abi, provider)
                setDds(contract)
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const contract = getContract(DDSAddress, DDSABI.abi, props.signer)
                setDds(contract)
            }
        }
        
        const getNumItems = async () => {
            var data = {
                body: {
                    address: props.address?.toLowerCase(),
                }
            }

            var url = "/getItems"

            //console.log(typeof(item))
            //console.log(item)
            let numItem = 0
            let orderIdToComplete = []
            let names = []
            API.post('serverv2', url, data).then(async (response) => {
                console.log(response)
                    for(let i=0; i<=response.ids?.length; i++) { //loop trought every listed item of an owner 
                        if (response.tags[i] === "real") { // once you got the item we want to display:
                            numItem ++
                            console.log(dds)
                            const item = await dds?.items(parseInt(response.ids[i])) //get the DDS item
                            if (item?.sold === true && item?.prooved === false) {
                                orderIdToComplete.push(parseInt(item.itemId) + 1) //orderID
                                names.push(response.names[i])
                            }
                        }
                    }
            })
            if (names.length > 0) {
                setOrderIds([[names, orderIdToComplete]])
            }
            setNumItems(numItem)

           
            
            /*
            const response = await API.post('server', url, data)

            for(let i=0; i<=response.ids?.length; i++) { //loop trought every listed item of an owner 
                if (response.tags[i] === "real") { // once you got the item we want to display:
                   numItem ++
                   const item = await dds.items(parseInt(response.ids[i])) //get the DDS item
                   if (item.sold === true && item.prooved === false) {
                       orderIdToComplete.push(parseInt(item.itemId) + 1) //orderID
                       names.push(response.names[i])
                   }
                }
            }
            */


           

            
        }
        //getNumItems()
        
        useEffect(() => {
            if (props.level === 5) {
                getNumItems()
            }
           
            
        }, [setOrderIds, setNumItems])
    
    

        return (
            <div>
                <h4>You have listed {numItems} Real Items </h4>
                <h4>You need to confirm {orderIds?.lenght > 0 ? orderIds[0]?.length : orderIds?.length} purchase</h4>
                <h5>Order Ids of command to verify: {orderIds.map(ids => ( <OrderToComplete name={ids[0]} orderid={ids[1]} did={props.did}/> ))}</h5>
            </div>
        )
    }

    const cancelProofPay = () => {
        setProofPrice(0)
    }
    const handleProof = async(e) => {
        e.preventDefault()
        //load DDS contract 
        console.log(dds)
        setSubmitLoading(true)
        try {
            await dds.submitProof(orderID, proof)
            alert("successfully submited proof!")
            setSubmitLoading(false)
        } catch (error) {
            alert("Need gas to complete transaction!")
            setSubmitLoading(false)
            const gasPrice = await dds.provider.getGasPrice();
                        
            let gas2 = await dds.estimateGas.submitProof(orderID, proof)
            let price2 = gas2 * gasPrice
            //get the ether price and a little bit more than gaz price to be sure not to run out
            fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=5c62b32f93bf731a5eae052066e37683cdee22fd71f3f4e2b987d495113f8534").then(res => {
                            res.json().then(jsonres => {
                                let usdPrice = ethers.utils.formatEther(price2) * jsonres.USD
                                setProofPrice(usdPrice)
                            })
            })
            
        }
        
    }

    const saveId = async(event) => {
        event.preventDefault()
        //create a user ID. For now it will be IdCount
        const id = parseInt( await props.did.idCount()) + 1
        let key = Math.floor(Math.random() * 10000001); //0-10,000,000
        window.localStorage.setItem("key", key)
        window.localStorage.setItem("id", parseInt(id))
        //console.log(parseInt(id), 1, city, state, code, country, street, phone, email, fname, lname)
        //params: uint id, uint _key, string memory _city, string memory _state, string memory _postalCode, string memory _country, string memory _street1, string memory _phone, string memory _email, string memory _name, string memory _lastname
        if (city !== "" && state !== "" && code !== "" && country !== "" && street !== "" && phone !== "" && email !== "" && fname !== "" && lname !== "") {
            writedId()  
        }
        else {
            alert("Information of DiD not well written... Try again...")
        }
        
        
        
    }

    const savePay = (event) => {
        event.preventDefault()
        console.log(card.length)
        const paymentid = window.localStorage.getItem("paymentid")
        if (card !== "" && eDate !== "" && cvv !== "" && card.length === 16 && eDate.length === 5 && cvv.length === 3) { //requirement
            if (paymentid) {
                let intpaymentids = parseInt(paymentid)
                window.localStorage.setItem("paymentid", intpaymentids+1)
                const url = '/uploadFile';
                var config = {
                    body: {
                        account: props.account?.toLowerCase(),
                        pay: [card, eDate, cvv],
                        is_cust: false
                    }
                };
                API.put('serverv2', url, config).then((response) => {
                    console.log(response);
                    alert("successfully added new payment method")
                });
            }
            else {
                window.localStorage.setItem("paymentid", 0)
                const url = '/uploadFile';
                var config = {
                    body: {
                        account: props.account?.toLowerCase(),
                        pay: [card, eDate, cvv],
                        is_cust: false
                    }
                };
                API.put('server', url, config).then((response) => {
                    console.log(response);
                });
            }
        }
        else {
            alert("All field are required... Please ensure you have written the good information.")
        }
    }

    function SellerSetup(props) {
        //const Kraken_api_url = "https://api.kraken.com"
        const test_key = 'oLEJjXuRZZmg9Pqi7oWZJq/FHIWCHl/9btxVjZbnLaWjP8eCZi0idogH'
        const test_secret_key = 'ePVA44NYZbEu2L1uzPhVRQw82UoxWG/S5cQFXirCbpKsM6MqBzEZRDpwF94NQvIUEqGV9JuZA7dMPNU8AbnwMQ=='

        async function retrieveMoneyHelper(amount) {
            //amount is calculated in USDC
            //function to get the amount of ETH based on the amount of usdc(credits)
            //always the same high and low price to save memory and inpermanent loss
            // pricex96 = BigInt(Math.floor(Math.sqrt(price) * 2 ** 96))
            window.location.replace("https://www.layerswap.io/app?from=arbitrum_mainnet&to=kraken&lockFrom=arbitrum_mainnet&lockTo=kraken&amount=300&asset=usdc")
            //const price_high = 0
            //const price = 1910
            //const x = amount * price
            //const liquidity = x * Math.sqrt(price) * Math.sqrt(price_high) / (Math.sqrt(price_high) - Math.sqrt(price))
            //await props.amm.retrieveSeller(amount, liquidity, 0) //not obligated: https://ethereum.stackexchange.com/questions/138055/what-is-sqrtpricelimitx96-for-in-uniswap
            //const res = await retrieveMoney()
            //https://www.layerswap.io/app?from=&to=&lockFrom=&lockTo=
        }
        


        return ( 
            <div class="sellersetup">
                <h2>Seller Dashboard</h2>
                <h5>Withdraw address connected: <strong>{window.localStorage.getItem("MoneyAddress")}</strong></h5>
                
                <button class="btn btn-primary" onClick={retrieveMoneyHelper}>Cash out full account</button>
            </div> 
        )
    }

    const getPrice10Days = () => {
        let url = '/historicalPrice';
        var pPrice = []

        let date0 = new Date();
        dates.push(date0.getDate())
        let date1 = new Date(date0)
        for (let i = 0; i < 9; i++) {
            date1.setDate(date1.getDate() - 1)
            dates.push(date1.getDate())
        }
        setDate(dates.reverse())

        API.get('serverv2', url).then((response) => {

            for (let i=0; i < 10; i++) {
                //console.log(response.data.hprice[i] * props.balance)
                pPrice.push((response?.data?.hprice[i] * props.balance))
            }
            //console.log(pPrice)
            setPrice(pPrice.reverse())

        });
    }
    
    const getTimeInvest = async() => {
        let url = '/timeInvest';
        //const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        //console.log(account)
        let data = {
            body: {
                address: "0x51F29a5c52EAbFCcc5231954Ad154bf19d4BFD5b", //account,
                tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7" //contractAddress
            }
            
        }

        API.post('serverv2', url, data).then((response) => {
            //console.log(response.data.profit)
            var date1 = new Date(response.timeInvest)
            var date2 = new Date()

            //calculate time difference  
            var time_difference = date2.getTime() - date1.getTime();
            //calculate days difference by dividing total milliseconds in a day
            var days_difference = time_difference / (1000 * 60 * 60 * 24);
            setNumdays(parseInt(days_difference))
            setNumtrans(response.numTrans)
            setProfit(response.profit)
            if (response.profit < 0) {
                setColors("red")
            }

        });
    }
    const data = {
		labels: date, //['6/12/22', '6/13/22', '6/14/22', '6/15/22', '6/16/22', '6/17/22', '6/18/22', '6/19/22', '6/20/22', '6/21/22'],
		datasets:[
			{
				label: 'Price',
				data: price,
			}
		]

	}
    useEffect(() => {
        if (props.balance > 0) { // >
            //getPrice10Days()
            //getTimeInvest()
        }
        const loadDDS = async() => {
            if (window.localStorage.getItem("usingMetamask") === "true") {
                let provider = await injected.getProvider()
                const contract = connectContract(DDSAddress, DDSABI.abi, provider)
                setDds(contract)
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const contract = getContract(DDSAddress, DDSABI.abi, props.signer)
                setDds(contract)
            }
        }
        loadDDS()

        
        console.log(props)

    }, [])

    if (props.balance === 0) { // >
    
        //<button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseInfo" aria-expanded="false" aria-controls="collapseInfo"> Info </button>
        return(
            <div class="control-panel">
                <ul class="nav nav-pills" id="pills-tab" role="tablist">
    
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="pills-info-tab" data-bs-toggle="pill" data-bs-target="#pill-info" type="button" role="tab" aria-controls="pill-info" aria-selected="true">Info</button>
                    </li>

                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-pay-tab" data-bs-toggle="pill" data-bs-target="#pill-pay" type="button" role="tab" aria-controls="pill-pay" aria-selected="false">Decentralized ID</button>
                    </li>
                    { props.level != 5 ? "" : 
                    (<li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-create-tab" data-bs-toggle="pill" data-bs-target="#pill-create" type="button" role="tab" aria-controls="pill-create" aria-selected="false">Create !</button>
                    </li>)
    }
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-ynft-tab" data-bs-toggle="pill" data-bs-target="#pill-ynft" type="button" role="tab" aria-controls="pill-ynft" aria-selected="false">Your Art</button>
                    </li>
                    { props.level != 5 ? "" : 
                    (<li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-pos-tab" data-bs-toggle="pill" data-bs-target="#pill-pos" type="button" role="tab" aria-controls="pill-pos" aria-selected="false">Proof of Sending</button>
                    </li>)
                    }
                    { props.level != 5 ? "" : 
                    (<li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-seller-tab" data-bs-toggle="pill" data-bs-target="#pill-seller" type="button" role="tab" aria-controls="pill-seller" aria-selected="false">Seller money</button>
                    </li>)
    }
                            
                </ul>
                <div class="tab-content" id="pills-tabContent">
                    <div class="tab-pane fade show active" id="pill-info" role="tabpanel" aria-labelledby="pills-info-tab">
                        <DisplayInfo numtrans={numtrans} numdays={numdays} profit={profit} color={colors}/>
                    </div>
                    <div class="tab-pane fade" id="pill-pay" role="tabpanel" aria-labelledby="pills-pay-tab">
                    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" style={{color:"black"}}>
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="staticBackdropLabel">New Payment Method</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>You can always delete any payment method ( <a href=""> see our security policy</a>) </p>
                                <form onSubmit={savePay}>
                                    <input type="text" id="card" name="card" class="form-control" placeholder="Card Number" onChange={onCardChanged}/>
                                    <br />
                                    <input type="text" id="date" name="date" class="form-control" placeholder="expiration date" onChange={onDateChanged}/>
                                    <br />
                                    <input type="text" id="cvv" name="cvv" class="form-control" placeholder="cvv" onChange={onCvvChanged}/>
                                    <br />
                                    <input type="submit" class="btn btn-primary" value="Submit" />
                                </form>
                                </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal fade" id="staticBackdrop2" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdrop2Label" aria-hidden="true" style={{color:"black"}}>
                        <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="staticBackdropLabel">New Decentralized Identification</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>You can always delete any DiD ( <a href=""> see our security policy</a>) </p>
                                <form onSubmit={saveId}>
                                    <input type="text" id="fname" name="fname" class="form-control" placeholder="First Name : Thomas" onChange={onFnameChanged}/>
                                    <br />
                                    <input type="text" id="lname" name="lname" class="form-control" placeholder="Last Name : Berthiaume " onChange={onLnameChanged}/>
                                    <br />
                                    <input type="text" id="country" name="country" class="form-control" placeholder="country : US " onChange={onCountryChanged}/>
                                    <br />
                                    <input type="text" id="state" name="state" class="form-control" placeholder="state : NY" onChange={onCityChanged}/>
                                    <br />
                                    <input type="text" id="city" name="city" class="form-control" placeholder="city : New York City" onChange={onStateChanged}/>
                                    <br />
                                    <input type="text" id="street" name="street" class="form-control" placeholder="street address : 1 example road" onChange={onStreetChanged}/>
                                    <br />
                                    <input type="text" id="code" name="code" class="form-control" placeholder="Postal code : 000 000" onChange={onCodeChanged}/>
                                    <br />
                                    <input type="text" id="phone" name="phone" class="form-control" placeholder="Phone : 14188889065" onChange={onPhoneChanged}/>
                                    <br />
                                    <input type="text" id="email" name="email" class="form-control" placeholder="Email : thom@example.com" onChange={onEmailChanged}/>
                                    <br />
                                    <input type="submit" class="btn btn-primary" value="Submit" />
                                </form>
                                </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal fade" id="staticBackdrop3" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdrop3Label" aria-hidden="true" style={{color:"black"}}>
                        <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="staticBackdropLabel">Your Id</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>You can always delete or change your decentralized Identification ( <a href=""> see our security policy</a>) </p>
                                
                                <h4>Name: <strong>{fname}</strong></h4> <br />
                                <h4>Last Name: <strong>{lname}</strong></h4> <br />
                                <h4>Email: <strong>{email}</strong></h4> <br />
                                <h4>Phone: <strong>{phone}</strong></h4> <br />
                                <h4>Address:</h4>
                                <h6>Country: <strong>{country}</strong></h6>
                                <h6>State: <strong>{state}</strong></h6>
                                <h6>City: <strong>{city}</strong></h6>
                                <h6>Street: <strong>{street}</strong></h6>
                                <h6>Postal code: <strong>{code}</strong></h6>
                               
                                </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>{metaPasswordSetting ? <GetPassword /> :  <DisplayDiD />} </div>
                        
                    </div>
                   
                    <div class="tab-pane fade" id="pill-create" role="tabpanel" aria-labelledby="pills-create-tab">
                        <h1>create!</h1>
                        <div class="modal fade" id="staticBackdrop5" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdrop5Label" aria-hidden="true" style={{color:"black"}}>
                        <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="staticBackdrop5Label">New custom Item creation</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                            <form class="test1" onSubmit={createReal}>
                                                
                                                <div class="mb-3">
                                                    <label for="formFile" class="form-label">Image of the Item</label>
                                                    <input class="form-control" type="file" accept='image/png, image/jpeg' id="formFile" onChange={onImageChange}/>
                                                </div>
                                                <br />
                                                <input class="form-control" type="text" placeholder="Name" onChange={onNameChange}/>    
                                                <br />  
                                                <input class="form-control" type="text" placeholder="Description" onChange={onDescriptionChange}/>    
                                                <br />
                                                <div class="form-floating">
                                                    <select onChange={onChangeTags} class="form-select" id="floatingSelect" aria-label="Floating label select example">
                                                        <option selected>Categorize your digital item </option>
                                                        <option value="1" >Imperssionisme</option>
                                                        <option value="2" >Nature Morte</option>
                                                        <option value="3" >Realisme</option>
                                                    </select>
                                                    <label for="floatingSelect">Tag</label>
                                                </div>
                                                <br />
                                                <div>
                                                    <input type="button" class="btn btn-secondary" value="Add attribute" onClick={onAddedAttribute}/><br />
                                                    <br />
                                                    <br />
                                                    <p>
                                                        <a class="btn btn-info" data-bs-toggle="collapse" href="#collapseExample2" role="button" aria-expanded="false" aria-controls="collapseExample2">
                                                            Learn more about attributes
                                                        </a>
                                                    </p>
                                                    <div class="collapse" id="collapseExample2">
                                                        <div class="card card-body" style={{color: "black"}}>
                                                            An attribute is caracteristic of an NFT. It can be used in games or in virtual properties ( such as: number of room in a house, etc...)
                                                        </div>
                                                    </div>
                                                    
                                                    <br /> <br />
                                                    {Array(numAttribute).fill(true).map((_, i) =><div key={i}> <input class="form-control" id={i} type="text" onChange={onAddedKey} placeholder={`key ${i}`}/> <input class="form-control" type="text" id={i} onChange={onAddedValue} placeholder={`value ${i}`}/> <br /> <input type="button" class="btn btn-danger" value="Remove" onClick={onRemoveAttribute}/> <br /> <br /></div>)}
                                                </div>
                                                <input type="submit" class="btn btn-primary" value="Submit" /> <input type="submit" class="btn btn-warning" value="add" />
                                                
                                </form>
                                <br />
                                <br />
                                <p>What does it look like ?</p>
                                <CusNftCard image={images} name={nftname} description={description} price={price2}/>
                                </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {createLoading ? ((<div style={{paddingLeft: 25 + "%"}}><ReactLoading type={type} color={color}
        height={200} width={200} /><h5>{step} loading...</h5></div>)) : usdprice > 0 ? (<PayGas account={props.account} total={usdprice} nft={nft} metadata={metadata} pk={props.signer.privateKey} cancel={cancelPayGas} tokenuri={tokenuri} /> ) : (<DisplayCreate />)  }
                        
                    </div>
                    <div class="tab-pane fade" id="pill-ynft" role="tabpanel" aria-labelledby="pills-ynft-tab">
                        <DisplayYnft />
                    </div>
                    <div class="tab-pane fade" id="pill-pos" role="tabpanel" aria-labelledby="pills-pos-tab">
                        <div class="pos">
                            {submitLoading ? (<div style={{paddingLeft: 25 + "%"}}><ReactLoading type={type} color={color}
        height={200} width={200} /><h5>{step} loading...</h5></div>) : (
                            <div>
                                <GetClient address={props.account} did={props.did} level={props.level}/>
                                <div class="submitPos">
                                    <h4>Proof submition:</h4>
                                    <form onSubmit={handleProof}>
                                        <input type="text" id="order" name="order" class="form-control" placeholder="0" onChange={onOrderIDChanged}/>
                                        <br />
                                        <input type="text" id="proof" name="proof" class="form-control" placeholder="QQ XXX XXX XXX QQ" onChange={onProofChanged}/>
                                        <br />
                                        <input type="submit" class="btn btn-primary" value="Submit" />
                                    </form>
                            
                                </div>
                                    {proofPrice > 0 ? <PayGasSubmit account={props.account} total={proofPrice} pay={props.pay} cancel={cancelProofPay} dds={dds} did={props.did} orderID={orderID} proof={proof}/> : "" }
                            </div> ) }
                        </div>
                        
                    </div>
                    <div class="tab-pane fade" id="pill-seller" role="tabpanel" aria-labelledby="pills-seller-tab">
                        <div class="pos">
                            {window.localStorage.getItem("MoneyAddress") ? ( <div> <SellerSetup /> </div> ) : (
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
                            </div>)}
                        </div>
                    </div>
                </div>
            </div>
            );
    }

    else {
        return (
            <div>
                <DisplayNoToken />
            </div>
        )
    }
	
	
}

export default DisplayActions;
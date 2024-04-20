import "./css/profile.css"
import "./css/controle.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js';
import {useState, useEffect } from 'react';
import { ethers } from "ethers";
import { AES, enc, SHA256, HmacSHA512 } from "crypto-js"
import { stringify } from "urlencode"
import { API, Storage } from 'aws-amplify';

import ReactLoading from "react-loading";
import PayGas from "../F2C/gas/payGas";

import axios from "axios";

import erc721ABI from '../../artifacts/contracts/nft.sol/nft.json'
import erc1155ABI from '../../artifacts/contracts/nft.sol/erc1155.json'
import realabi from '../../artifacts/contracts/Real.sol/Real.json'
import abi from '../../artifacts/contracts/market.sol/market.json'
import TicketABI from '../../artifacts/contracts/ticket.sol/ticket.json'
import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'

import default_profile from "./profile_pics/default_profile.png"
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
const DDSAddress = '0x0c50409C167e974e4283F23f10BB21d16BE956A9' //gas contract: 0x14b92ddc0e26C0Cf0E7b17Fe742361B8cd1D95e1, Real: 0x1D1db5570832b24b91F4703A52f25D1422CA86de
const NftAddress = '0x3d275ed3B0B42a7A3fCAA33458C34C0b5dA8Cc3A';
const TicketAddress = '0x42F1c1E4c3b3287d727C15cf7034a26d3E23a7E4' //goerli test contract
const ImperialRealAddress = "0xbC1Fe9f6B298cCCd108604a0Cf140B2d277f624a"

/**
 * Kraken management: moove to oracle 
 */

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



/**
 * connecting to contracts
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
    const [itemPrice, setItemPrice] = useState(0)
    const [itemFee, setItemFee] = useState(0)
    const [itemDays, setItemDays] = useState(0)
    const [tags, setTags] = useState([])
    const [itemLink, setItemLink] = useState([])
    //const [price2, setPrice2] = useState(0)
    const [nftnames, setNftnames] = useState([])
    const [descriptions, setDescriptions] = useState([])
    const [itemPrices, setItemPrices] = useState([])
    const [itemsDays, setItemsDays] = useState([])
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
        window.localStorage.setItem("MoneyAddress", sellerRetrieveAddress) //.toLowerCase()

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

    

    const cancelPayGas = () => {
        setUsdprice(0)
    }
    const createReal = async(event) => {
        event.preventDefault();
        if (nftname !== ""  && description !== "" && image_file !== null && tag !== "" && itemDays !== 0 && itemPrice !== 0) {
            //function to poat item to ipfs
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
                    let names2 = nftnames;
                    names2.push(nftname)
                    setNftnames(names2)
                    let tags2 = tags;
                    tags2.push(tag)
                    setTags(tags2)
                    let descriptions2 = descriptions;
                    descriptions2.push(description)
                    setDescriptions(descriptions2)
                    let itemsprices2 = itemPrices;
                    itemsprices2.push(itemPrice - itemFee)
                    setItemPrices(itemsprices2)
                    let itemsdays2 = itemsDays;
                    itemsdays2.push(itemDays)
                    setItemsDays(itemsdays2)
                } else {
                    setTokenuri(["https://ipfs.io/ipfs/" + cid])
                    setNftnames([nftname])
                    setTags([tag])
                    setDescriptions([description])
                    setItemPrices([itemPrice])
                    setItemsDays([itemDays])
                }
                
                
            } else {
                setTokenuri("https://ipfs.io/ipfs/" + cid)
                console.log("https://ipfs.io/ipfs/" + cid)
                //mint using oracle
                try {
                        
                        console.log(itemPrice - itemFee)
                        //await mintReal(props.account, "https://ipfs.io/ipfs/" + cid, props.signer)
                        var data = {
                            body: {
                                address: props.signer.address,
                                uri: "https://ipfs.io/ipfs/" + cid,
                                MaxPrice: (itemPrice - itemFee).toFixed(2), //Minimum price for item without fees
                                numDays: parseInt(itemDays)
                            }
                            
                        }

                        console.log(data)
            
                        var url = "/oracleMint"
                            
                        
                        API.post('serverv2', url, data).then((response) => {
                            console.log(parseInt(response.hex))
                            if (response.status === 10) {
                                alert("Error code 10, Mint error")
                            } else {
                                var data = {
                                    body: {
                                        address: props.signer.address.toLowerCase(),
                                        itemid: parseInt(response.hex), //market item id
                                        name: nftname, //get the name in the form
                                        score: 0, //set score to zero
                                        tag: tag, //"real" 
                                        description: description,
                                        image: "https://ipfs.io/ipfs/" + cid
                                    }
                                    
                                }
                    
                                var url = "/listItem"
                    
                                API.post('serverv2', url, data).then((response) => {
                                    console.log(response)
                                    setCreateLoading(false)
                                    alert("Your Item is Created and Listed")
                                    setItemLink(["/item/" +  data.body.itemid])
                                })
                            }
                            
                           
                        }).catch((e) => {
                            setCreateLoading(false)
                            alert("Error while creating the Item... check console for more. Error code: 10")
                            console.log(e)
                        })

            } catch(e) {
                setCreateLoading(false)
                alert("Unable to create, check console for more informations");
                console.log(e)
            }
            
        }
    }
        else {
            alert("Need to fill our the whole form!")
        }
    }

    async function multipleMint() {
        try {        
            console.log(props.signer)
            //await mintReal(props.account, "https://ipfs.io/ipfs/" + cid, props.signer)
            //console.log(tokenuri)
            //console.log(itemPrices)
            //console.log(itemsDays)
            var data = {
                body: {
                    address: props.signer.address,
                    uri: tokenuri,
                    MaxPrice: itemPrices,
                    numDays: itemsDays
                }
                
            }

            var url = "/oracleMultiMint"

            const numItemBefore = await dds?.functions.itemCount()
            //console.log(parseInt(numItemBefore) + tokenuri?.length)
            //console.log(tokenuri?.length)
            
            API.post('serverv2', url, data).then((response) => {
                console.log(response)
                if (response.status === 20) {
                    alert("Error status: 20")
                } else {
                    for(let i=0; i<tokenuri?.length; i++) {
                        var data = {
                            body: {
                                address: props.signer.address.toLowerCase(),
                                itemid: (parseInt(numItemBefore) + i + 1), // (parseInt(response) - tokenuri?.length + i + 1), //market item id
                                name: nftnames[i], //get the name in the form
                                score: 0, //set score to zero
                                tag: tags[i], //"real" 
                                description: descriptions[i],
                                image: tokenuri[i]
                            }
                            
                        }
            
                        var url = "/listItem"
                        API.post('serverv2', url, data).then((response) => {
                            console.log(response)
                            let itemlink2 = itemLink;
                            itemlink2.push("/item/" +  data.body.itemid)
                            setItemLink(itemlink2)
                            
                        })

                    }
                    setCreateLoading(false)
                    alert("Your Item is Created and Listed")
                }

                
            }).catch((e) => {
                alert("Error while Multi-creation. Error code 20")
                console.log(e)
            } )
            

        } catch(e) {
            alert("Unable to create, check console for more informations");
            console.log(e)
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
    const onItemPriceChange = (event) => {
        setItemPrice(event.target.value)
        //fee policy: 2.9% + 0.6$ + 4$(blockchain fee)
        let quickFee = (event.target.value * 0.029 + 4.6)
        setItemFee(quickFee);
    }
    const onItemDaysChange = (event) => {
        setItemDays(event.target.value)
    }

    function DisplayCreate() {
        return (
            <div class="create" >
                <h3>Create an Item representing your product:</h3> <br />
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop5">Create form</button>
                <br />
                <br />
                <h5>Items ready to be publish: {tokenuri ? tokenuri?.length : "0"}</h5>
                {tokenuri?.length > 0 ?<button onClick={multipleMint} class="btn btn-warning">Publish all my items !</button> : ""}
                <h5>Links: </h5>
                {itemLink?.length > 0 ? itemLink.map((item) => (<div><a href={item}> atelierdesimon.net{item}</a>                 <div class="fb-share-button" data-href={"https://atelierdesimon.net" + item} data-layout="" data-size=""><a target="_blank" href={"https://www.facebook.com/sharer/sharer.php?u=https://atelierdesimon.net" + item} class="fb-xfbml-parse-ignore">Share !</a></div>
</div>))  : ( <p>No Links</p> )}
                <p>For more informations, contact our team</p>
                <div id="fb-root">
                <script async defer crossorigin="anonymous" src="https://connect.facebook.net/fr_CA/sdk.js#xfbml=1&version=v17.0&appId=282027027782089&autoLogAppEvents=1" nonce="wycPHG6a"></script>
                </div>
               
                
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
        let res1 = AES.decrypt(did, props.password)
        let res = JSON.parse(res1.toString(enc.Utf8));
        return (
            <div class="did">
                <h4>Identitée Décentralisée: </h4>
                <p>
                    <a class="btn btn-info" data-bs-toggle="collapse" href="#collapseExample1" role="button" aria-expanded="false" aria-controls="collapseExample1">
                        En savoir plus
                    </a>
                </p>
                <div class="collapse" id="collapseExample1">
                    <div class="card card-body" style={{color: "black"}}>
                        La technologie DiD (Decentralized IDentification) a été developper par Imperial Technologies. Le DiD permet de garder vos informations personnelles de façon à ce qu'elles ne puissent pas être compromise.
                    </div>
                </div>
                <br />
                {res.email ? ( <div><button onClick={getdId} data-bs-toggle="modal" data-bs-target="#staticBackdrop3" class="btn btn-primary" >Voir mon ID</button> <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#staticBackdrop2" >Changer mon ID</button></div> ) : (<button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#staticBackdrop2" >Créer mon ID</button>) }
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
            let res1 = AES.decrypt(did, props.password)
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
            console.log(props.signer)
            const data = {
                Waddress: props.signer.address,
                pk: props.signer.privateKey,
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
    
            console.log(props)
    
            var encrypted = AES.encrypt(stringdata, props.password)
            //hash the data object and store it in user storage
            //ethers.utils.computeHmac("sha256", key, bytedata)
            
              
            window.localStorage.setItem("did", encrypted);
            alert("DID successfully written!")
        }

        
    }

    

   

    

    //account, did, pay, RealPurchase 
    function YnftCard(props) {
        const [listingItem, setListing] = useState(false)
        const [usdPrice2, setUsdPrice2] = useState(0)
        const [usdPrice3, setUsdPrice3] = useState(0)


        const [status, setStatus] = useState("Not prooved")
        const [refundLoading, setRefundLoading ] = useState(false)
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

       

        const retrieve = async() => {
            //console.log(props.realPurchase[0][0])
            //console.log(props.tokenid)
            setRefundLoading(true)
            for (let i=0; i<props.realPurchase.length; i++) {
                if(props.realPurchase[i][0] == props.tokenid) { //if we match nft token id
                    console.log("accessed")
                    try {
                        //gas price must be included in first transaction
                        //await dds.retrieveCredit()
                        
                            //await dds.submitProof(orderID, proof)
                            //let item = await dds.items(orderID-1);
                            //console.log(parseFloat()
                            
                            let data = {
                                body: {
                                    id: parseInt(props.realPurchase[i][1]),
                                    email: window.localStorage.getItem("MoneyAddress")
                                }
                            
                            }
                
                            var url = "/get-refund"
                        
                            API.post('serverv2', url, data).then((response) => {
                                console.log(response)
                                if(response.status === 30) {
                                    alert("Item is prooved ! It will arrive soon at your location !")
                                    setRefundLoading(false)
                                } else {
                                    alert("successfully refunded at your withdraw address! You will receive a Payout soon!")
                                    setRefundLoading(false)
                                }
                                
                            }).catch((e) => {
                                console.log(e)
                            })
                            
                        
                    } catch(e) {
                        console.log(e)
                        alert("Item is prooved ! It will arrive soon at your location !")
                    }
                    
                    
                }
            }
        } 


        

       
        return (
           <div class="ynftcard">
                
                {props.image?.includes("ipfs://") ? <img id='cardimg' src={"https://ipfs.io/ipfs/" + props.image?.split("//").pop()} alt="" /> : <img id='cardimg' src={props.image} alt="" />}
            
                <br />
                <br />
                <h4> Nom:  <a href="">{props.name}</a></h4>
                <p>description: {props.description?.slice(0, 20)}...</p>
                {props.address === ImperialRealAddress.toLowerCase() ? ( <button onClick={pollStatus} class="btn btn-primary">Rafraîchir le status</button> ) : ""}
                {props.address === ImperialRealAddress.toLowerCase() ? status === "Not prooved" ? numdaysToRetrieve > 0 ? ( <h5 style={{color: "yellow"}}>En cours d'envoie</h5> ) : ( <h5 style={{color: "red"}}>Item non prouvé</h5> ) : ( <h5 style={{color: "green"}}>Item envoyé!</h5> ) : ""}
                {props.address === ImperialRealAddress.toLowerCase() ? refundLoading ? (<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>) : ( <button onClick={retrieve} class="btn btn-primary">Remboursement</button> ) : ""}
                { props.address === ImperialRealAddress.toLowerCase() ? numdaysToRetrieve > 0 ? ( <h6>L'item sera envoyé dans {numdaysToRetrieve} jours</h6> ) : ( <h6>L'item n'a pas été envoyé dans le délais</h6> ) : ""  }
                {trackingCode ? ( <h5>Tracking Code: <a href="https://www.canadapost-postescanada.ca/track-reperage/en#/home">{trackingCode}</a></h5> ) : ""}
            </div>
        )
    }

    function YnftCard2(props) {
        const [listingItem, setListing] = useState(false)
        const [usdPrice2, setUsdPrice2] = useState(0)
        const [usdPrice3, setUsdPrice3] = useState(0)

        const [importantInfo, setImportantInfo] = useState()


        const [status, setStatus] = useState("Not prooved")
        const [refundLoading, setRefundLoading ] = useState(false)
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

       

        const retrieve = async() => {
            //console.log(props.realPurchase[0][0])
            //console.log(props.tokenid)
            setRefundLoading(true)
            for (let i=0; i<props.realPurchase.length; i++) {
                if(props.realPurchase[i][0] == props.tokenid) { //if we match nft token id
                    console.log("accessed")
                    try {
                        //gas price must be included in first transaction
                        //await dds.retrieveCredit()
                        
                            //await dds.submitProof(orderID, proof)
                            //let item = await dds.items(orderID-1);
                            //console.log(parseFloat()
                            
                            let data = {
                                body: {
                                    id: parseInt(props.realPurchase[i][1]),
                                    email: window.localStorage.getItem("MoneyAddress")
                                }
                            
                            }
                
                            var url = "/get-refund"
                        
                            API.post('serverv2', url, data).then((response) => {
                                console.log(response)
                                if(response.status === 30) {
                                    alert("Item is prooved ! It will arrive soon at your location !")
                                    setRefundLoading(false)
                                } else {
                                    alert("successfully refunded at your withdraw address! You will receive a Payout soon!")
                                    setRefundLoading(false)
                                }
                                
                            }).catch((e) => {
                                console.log(e)
                            })
                            
                        
                    } catch(e) {
                        console.log(e)
                        alert("Item is prooved ! It will arrive soon at your location !")
                    }
                    
                    
                }
            }
        } 

        useEffect(() => {
            const options2 = {
                method: 'GET',
                headers: {
                accept: 'application/json',
                Authorization: key
                }
            };

            async function getData() {
                fetch('https://api.pinata.cloud/data/pinList?status=pinned&hashContains=' + props?.ynft, options2).then((res2) => res2.json()
                ).then((data2) => {
                    //tokenAddress: data.result[i].token_address,
                    //tokenId: data.result[i].token_id, //put to int
                    
                    console.log(data2?.rows[0])
                    
                    //let ynftlist = ynft;

                    //console.log(ynftlist)
                    
                    
                    setImportantInfo({
                        name: data2?.rows[0]?.metadata.name,
                        
                        metadata: {
                            description: data2?.rows[0]?.metadata.keyvalues?.description,
                            tag: data2?.rows[0]?.metadata.keyvalues?.tag,
                            image: "https://ipfs.moralis.io:2053/ipfs/" + props?.ynft
                        }
                    })
                }).catch((error) => {
                    console.log(error)
                })
            }
            getData();
            /**/
            //console.log(props)
            //console.log(props?.ynft)
        })


        

       
        return (
           <div class="ynftcard">
                
                <img id='cardimg' src={importantInfo?.metadata?.image} alt="" />
            
                <br />
                <br />
                <h4> Nom:  <a href="">{importantInfo?.name}</a></h4>
                <p>description: {importantInfo?.metadata.description?.slice(0, 20)}...</p>
                <button onClick={pollStatus} class="btn btn-primary">Rafraîchir le status</button>
                { status === "Not prooved" ? numdaysToRetrieve > 0 ? ( <h5 style={{color: "yellow"}}>En cours d'envoie</h5> ) : ( <h5 style={{color: "red"}}>Item non prouvé</h5> ) : ( <h5 style={{color: "green"}}>Item envoyé!</h5> )}
                { refundLoading ? (<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>) : ( <button onClick={retrieve} class="btn btn-primary">Remboursement</button> )}
                { numdaysToRetrieve > 0 ? ( <h6>L'item sera envoyé dans {numdaysToRetrieve} jours</h6> ) : ( <h6>L'item n'a pas été envoyé dans le délais</h6> )  }
                {trackingCode ? ( <h5>Tracking Code: <a href="https://www.canadapost-postescanada.ca/track-reperage/en#/home">{trackingCode}</a></h5> ) : ""}
            </div>
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
        let j = 0;
        //return <YnftCard name={i?.name} abi={i?.contractType} description={i.metadata?.description} image={i.metadata?.image} tag ={i.metadata?.tag} signer={props.signer} level={props.level} address={i?.tokenAddress} tokenid={i?.tokenId} account={props.account} did={props.did} pay={props.pay} realPurchase={props.realPurchase} />
        return (
            <div class="CardList">
                <div class="row">
                    <div class="col">
                        {props.ynft?.map(i => {
                            if (j < 5) {
                                j++
                                return <YnftCard2 ynft={i[0]} tokenid={i[1]} level={props.level} account={props.account} realPurchase={props.realPurchase}/> 
                            }
                            
                        })}
                    </div>
                </div>
               
            </div>
        )
    }

    const loadNft2 = async () => {
        window.location.replace("/myItems")
        /*
        const web3ApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImUxYTlmOGQ4LWYwNGUtNGY5Yi1hYjBkLWEwNTZlZTc5NzNjNSIsIm9yZ0lkIjoiMjI3NTYzIiwidXNlcklkIjoiMjI4MDc5IiwidHlwZUlkIjoiNzFhYWJmNjEtMzNjMi00MjMxLTgwMzAtOGQxZDA0OWMzMmVkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODg1NzkyMDQsImV4cCI6NDg0NDMzOTIwNH0.nBgu238SNYZ3XvLwpKkTIoM6qZ5ZLj4LtomEr03tHro"
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'X-API-Key': web3ApiKey
          }
        };
        let address = props.account
        let nftlist = []
       
        
        fetch('https://deep-index.moralis.io/api/v2/'+ address + '/nft?chain=goerli&format=decimal&media_items=false', options) //chain to arbitrum
          .then((res) => res.json())
          .then((data) => {
            console.log(data.result)
            for (let i=0; i<data?.result.length; i++) {
                if (data.result[i].token_address == ImperialRealAddress.toLowerCase()){
                    let metadata = data.result[i].token_uri
                    

                    console.log("CID: " + metadata?.replace("https://ipfs.moralis.io:2053/ipfs/", "") )

                    //'https://api.pinata.cloud/data/pinList?status=pinned&pinSizeMin=100' \--header 'Authorization: Bearer PINATA JWT'

                    nftlist.push([metadata?.replace("https://ipfs.moralis.io:2053/ipfs/", ""), data.result[i].token_id]) // cid
                }
            }
        
            //return nftlist
            
        }).then(() => {
            setYnft(nftlist)
            console.log(nftlist)
        })
        .catch((error)=>console.log(error));
        */
    }

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
        let address = props.account
        let nftlist = []
       
        
        fetch('https://deep-index.moralis.io/api/v2/'+ address + '/nft?chain=sepolia&format=decimal&media_items=false', options) //chain to arbitrum
          .then((res) => res.json())
          .then((data) => {
            console.log(data.result)
            if (!ynft) {
            for (let i=0; i<data?.result.length; i++) {
                if (data.result[i].token_address == ImperialRealAddress.toLowerCase()){
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
                        
                        //let ynftlist = ynft;

                        setYnft(nftlist)
                        //console.log(ynftlist)
                        
                        
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
            }
            
        } else {
                let ynftlist = ynft;

                setYnft(ynftlist)
                console.log(ynftlist)
            }
            //return nftlist
            
        })
        .catch((error)=>console.log(error));

        /* if (ynft) {
                            let ynftlist = ynft;

                            setYnft(ynftlist)
                            console.log(ynftlist)
                        }
        .then((ynftlist) => {
        
            console.log(ynftlist)
            setYnft(ynftlist)
            
        }) 
        .then(() => {
            if (!pushed) {
                //AutoRefresh(3000)
                console.log(ynft)
                pushed = true;
            }
            
        })
        */

        

       

        //load DDS contract 
        if (window.localStorage.getItem("usingMetamask") === "true") {
            let provider = await injected.getProvider()
            const contract = connectContract(DDSAddress, DDSABI, provider)
            setDds(contract)
        } else {
            //const provider  = new ethers.providers.InfuraProvider("goerli")
            const contract = getContract(DDSAddress, DDSABI, props.signer)
            setDds(contract)
        }
       
    }

    function DisplayYnft () {
        /*
        let pushed = false;
        function AutoRefresh( t ) {
            setTimeout(loadUpdate, t);
            console.log(ynft)
        }
        //const [ynft, setYnft] = useState()
        const loadUpdate = async() => {
            let ynftlist = ynft;

            setYnft(ynftlist)
            console.log(ynftlist)
        }*/

        //useEffect(async() => {setTimeout(loadNft, 3000)})
        

        return (
            <div class="ynft">
                <h1 style={{"color": "black"}}>Voir vos achats!</h1>
                <br />
                {ynft ? <ListYnftCard ynft={ynft} level={props.level} signer={props.signer} account={props.account} did={props.did} pay={props.pay} realPurchase={props.realPurchase}/> : ""}
                

                <button class="btn btn-primary" onClick={loadNft}>Scanner le compte</button>
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
                //console.log(key)
                const item = await dds?.items(props.orderid - 1)
                //console.log(item.tokenId)
                
                const nft = getContract(item.nft, realabi, props.signer)
                //console.log(nft)

                const buyer_address = await nft.ownerOf(parseInt(item.tokenId))
               //console.log(buyer_address)
                // go take hash form bucket file then, delete the file
                setS3Config("didtransfer", "public")
                const file = await Storage.get(`${props.signer.address.toLowerCase()}/${buyer_address.toLowerCase()}.txt`)
                fetch(file).then((res) => res.text()).then((text) => {
                        //console.log(text)
                        let res1 = AES.decrypt(text, key)
                        const res = JSON.parse(res1.toString(enc.Utf8));
                        setClientId(res)
                        setGettingID(true)

                }).catch((e) => {
                    console.log(e)
                })
                
                
                
                
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
                const contract = connectContract(DDSAddress, DDSABI, provider)
                setDds(contract)
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const contract = getContract(DDSAddress, DDSABI, props.signer)
                setDds(contract)
            }
        }
        
        const getNumItems = async () => {
            console.log(props.address?.toLowerCase())
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
                        //console.log(response.ids[i])
                        if(response.ids[i] >= 0) {
                            numItem++

                            //console.log(dds)
                            const item = await dds?.items(parseInt(response.ids[i]) + 1) //get the DDS item
                            console.log(item)
                            //console.log(item)
                            if (item?.sold === true && item?.prooved === false) {
                                orderIdToComplete.push(parseInt(item.itemId) + 1) //orderID
                                names.push(response.names[i])
                            }
                        }
                    }
                    if (names.length > 0) {
                        let item = []
                        for (let i=0; i<names.length; i++) {
                            item[i] = {name: names[i], orderId: orderIdToComplete[i]}
                        }
                        setOrderIds(item)
                    }
                    setNumItems(numItem)
                    console.log(numItem)
            }).catch((e) => {
                console.log(e)
            }) 
               
            
            

           
            
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
                <h5>Order Ids of command to verify: {orderIds.map(ids => ( <OrderToComplete name={ids.name} signer={props.signer} orderid={ids.orderId} did={props.did}/> ))}</h5>
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
            //await dds.submitProof(orderID, proof)
            let item = await dds.items(orderID-1);
            //console.log((item.price/100000 * 1.36).toFixed(2).toString())
            //let key = AES.encrypt(props.pk, props.signer.publicKey)

            //let digest = ethers.utils.hashMessage(proof) //digest the encoded key

            let sig1 = await props.signer.signMessage(proof) //create signature 1 for address
                        
                        //let pubkey = new ethers.utils.SigningKey(props.signer.privateKey)
                       
                        //let sig2 = pubkey.signDigest(digest) //create signature 2 for public key
            
            let data = {
                body: {
                    address: props.signer.address,
                    amount: (((item.price/100000) / (1 - 0.029) + 4.6) - (((item.price/100000) / (1 - 0.029) + 4.6)*0.15)).toFixed(2).toString(), //(item.price/100000 * 1.36).toFixed(2).toString()
                    email: window.localStorage.getItem("MoneyAddress"),
                    id: orderID,
                    proof: proof,
                    signature1: sig1
                }
            
            }
            //console.log(data)

            var url = "/get-payed"
        
            API.post('serverv2', url, data).then((response) => {
                console.log(response)
                if (response.status === 40) {
                    alert("Error while submitting proof. Error code 40")
                } else {
                    alert("successfully submited proof!")
                    setSubmitLoading(false)
                }
            }).catch((e) => {
                alert("Error while submitting proof. Error code 40")
                console.log(e)
            })
            
        } catch (error) {
            alert("Unable to submit Proof");
            setSubmitLoading(false)
            
        }
        
    }

    const saveId = async(event) => {
        event.preventDefault()
        //create a user ID. For now it will be IdCount
        //const id = parseInt( await props.did.idCount()) + 1
        //let key = Math.floor(Math.random() * 10000001); //0-10,000,000
        //window.localStorage.setItem("key", key)
        //window.localStorage.setItem("id", parseInt(id))
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
            //window.location.replace("https://www.layerswap.io/app?from=arbitrum_mainnet&to=kraken&lockFrom=arbitrum_mainnet&lockTo=kraken&amount=300&asset=usdc")
            //const price_high = 0
            //const price = 1910
            //const x = amount * price
            //const liquidity = x * Math.sqrt(price) * Math.sqrt(price_high) / (Math.sqrt(price_high) - Math.sqrt(price))
            //await props.amm.retrieveSeller(amount, liquidity, 0) //not obligated: https://ethereum.stackexchange.com/questions/138055/what-is-sqrtpricelimitx96-for-in-uniswap
            //const res = await retrieveMoney()
            //https://www.layerswap.io/app?from=&to=&lockFrom=&lockTo=
            // <button class="btn btn-primary" onClick={retrieveMoneyHelper}>Cash out full account</button>
        }
        


        return ( 
            <div class="sellersetup">
                {props.level==5 ?(<h2>Seller Dashboard</h2>) : (<h2>Refund Dashboard</h2>)}
                {window.localStorage.getItem("MoneyAddress") ? (<h5>Withdraw email address connected: <strong>{window.localStorage.getItem("MoneyAddress")}</strong></h5>) : ( <h5>No connected address... please, connect one in order to get payed! </h5> )}
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
                const contract = connectContract(DDSAddress, DDSABI, provider)
                setDds(contract)
            } else {
                //const provider  = new ethers.providers.InfuraProvider("goerli")
                const contract = getContract(DDSAddress, DDSABI, props.signer)
                setDds(contract)
            }
        }
        loadDDS()

        
        console.log(props)

    }, [])
    /* <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="pills-info-tab" data-bs-toggle="pill" data-bs-target="#pill-info" type="button" role="tab" aria-controls="pill-info" aria-selected="true">Info</button>
                    </li> */

    if (props.balance === 0) { // >
    
        //<button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseInfo" aria-expanded="false" aria-controls="collapseInfo"> Info </button>
        return(
            <div class="control-panel">
                <ul class="nav nav-pills" id="pills-tab" role="tablist">
    
                    

                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="pills-pay-tab" data-bs-toggle="pill" data-bs-target="#pill-pay" type="button" role="tab" aria-controls="pill-pay" aria-selected="true">Identitée Décentralisée</button>
                    </li>
                    { props.level != 5 ? "" : 
                    (<li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-create-tab" data-bs-toggle="pill" data-bs-target="#pill-create" type="button" role="tab" aria-controls="pill-create" aria-selected="false">Create !</button>
                    </li>)
    }            { props.level == 5 ?
                    (<li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-ynft-tab" data-bs-toggle="pill" data-bs-target="#pill-ynft" type="button" role="tab" aria-controls="pill-ynft" aria-selected="false" onClick={loadNft2}>Votre panier</button>
                    </li>) : ""}
                    { props.level != 5 ?
                    (<li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-seller-tab" data-bs-toggle="pill" data-bs-target="#pill-seller" type="button" role="tab" aria-controls="pill-seller" aria-selected="false">Remboursement</button>
                    </li>) : ""}
                    { props.level != 5 ? "" : 
                    (<li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-pos-tab" data-bs-toggle="pill" data-bs-target="#pill-pos" type="button" role="tab" aria-controls="pill-pos" aria-selected="false">Proof of Sending</button>
                    </li>)
                    }
                    { props.level != 5 ? "" : 
                    (<li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-seller-tab" data-bs-toggle="pill" data-bs-target="#pill-seller" type="button" role="tab" aria-controls="pill-seller" aria-selected="false">Seller money</button>
                    </li>)
    }               { props.level != 5 ? "" : 
                        (<li class="nav-item" role="presentation">
                            <button class="nav-link" id="pills-pos-tab" data-bs-toggle="pill" data-bs-target="#pill-pos" type="button" role="tab" aria-controls="pill-pos" aria-selected="false" disabled>Social Connection</button>
                        </li>)
                    } 
                     { props.level != 5 ? "" : 
                    (<li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-pos-tab" data-bs-toggle="pill" data-bs-target="#pill-pos" type="button" role="tab" aria-controls="pill-pos" aria-selected="false" disabled>Staking</button>
                    </li>)
                    } { props.level == 5 ? "" : 
                    (<li class="nav-item" role="presentation">
                        <button class="nav-link" id="pills-partner-tab" data-bs-toggle="pill" data-bs-target="#pill-partner" type="button" role="tab" aria-controls="pill-partner" aria-selected="false" disabled>Devenir vendeur</button>
                    </li>)
                }
                            
                </ul>
                <div class="tab-content" id="pills-tabContent">
                    <div class="tab-pane fade " id="pill-info" role="tabpanel" aria-labelledby="pills-info-tab">
                        <DisplayInfo numtrans={numtrans} numdays={numdays} profit={profit} color={colors}/>
                    </div>
                    <div class="tab-pane fade show active" id="pill-pay" role="tabpanel" aria-labelledby="pills-pay-tab">
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
                                                <input class="form-control" type="number" placeholder="Price of the Item (in $)" onChange={onItemPriceChange}/>    
                                                <br />
                                                <p>*Price in Canadian Dollars (CAD)</p>
                                                <p>Total Fee: {parseFloat(itemFee).toFixed(2)} $ or {parseFloat(itemFee/itemPrice*100).toFixed(2)}%</p>
                                                <p>Total received: {itemPrice - itemFee} $</p>
                                                <p>Staking Program: 3-9 months to <strong>refund</strong> your fees and even make a profit using our staking program!</p>
                                                <br />
                                                <input class="form-control" type="number" placeholder="Number of day to send the Item" onChange={onItemDaysChange}/>    
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
                                <CusNftCard image={images} name={nftname} description={description} price={itemPrice}/>
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
                    <div class="tab-pane fade" id="pill-partner" role="tabpanel" aria-labelledby="pills-partner-tab"> 
                        <div class="create" >
                            <h3>Apply to our partnership program in order to become a seller !</h3>
                            <p>Becoming a partner is 100% free and offer more than competitives advantages such as: very low fee (0% in certain cases), access to an "UnHackable" market, access to our sellers tools and much more! </p>
                            <h4>Contact: <strong>thomasberthiaume183@gmail.com</strong> for applications or questions.</h4>
                        </div>
                    </div>

                    <div class="tab-pane fade" id="pill-ynft" role="tabpanel" aria-labelledby="pills-ynft-tab">
                        <DisplayYnft />
                    </div>
                    <div class="tab-pane fade" id="pill-pos" role="tabpanel" aria-labelledby="pills-pos-tab">
                        <div class="pos">
                            {submitLoading ? (<div style={{paddingLeft: 25 + "%"}}><ReactLoading type={type} color={color}
        height={200} width={200} /><h5>{step} loading...</h5></div>) : (
                            <div>
                                <GetClient address={props.account} signer={props.signer} did={props.did} level={props.level}/>
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
                             <div> <SellerSetup level={props.level}/> 
                             <form onSubmit={saveSellerRetrieveAddress}>
                                <input type="text" id="order" name="order" class="form-control" placeholder="john@example.com" onChange={onSellerRetrieveAddressChange}/>
                                <br />
                                <input type="submit" class="btn btn-primary" value="Submit" />
                            </form>
                             
                             </div> 
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
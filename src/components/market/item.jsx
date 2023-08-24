import { useParams } from 'react-router-dom'
import {useState, useEffect } from 'react';
import { useWeb3React } from "@web3-react/core"
import { ethers } from 'ethers';
import { API , Storage} from 'aws-amplify';
import { AES, enc } from "crypto-js"

import injected from '../account/connector';

import abi from '../../artifacts/contracts/market.sol/market.json'
import erc721ABI from '../../artifacts/contracts/nft.sol/nft.json'
import Credit from '../../artifacts/contracts/token.sol/credit.json';
import DiD from '../../artifacts/contracts/DiD.sol/DiD.json';
import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'
import AMMABI from '../../artifacts/contracts/AMM.sol/AMM.json'

import NftBox from './nfts';

const MarketAddress = '0x710005797eFf093Fa95Ce9a703Da9f0162A6916C'; // goerli new test contract
const DDSAddress = '0x15399E8a3EA9781EAA3bb1e6375AA51320D12Aea' // 0x2F810063f44244a2C3B2a874c0aED5C6c28D1D87, 0xd860F7aA2ACD3dc213D1b01e2cE0BC827Bd3be46
const CreditsAddress = "0xD475c58549D3a6ed2e90097BF3D631cf571Bdd86" //goerli test contract
const NftAddress = '0x3d275ed3B0B42a7A3fCAA33458C34C0b5dA8Cc3A'; // goerli new test contract
const DiDAddress = "0x6f1d3cd1894b3b7259f31537AFbb930bd15e0EB8" //goerli test contract 

const Credit_AMM = '0xB18A97e590F1d0C1e0B9A3c3803557aa230FD21c' //working with: 0x856b5ddDf0eCFf5368895e085d65179AA2Fcc4d9 credits contract


//market helper functions
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

function Item() {
    const { id } = useParams();

    const [credits, setCredits] = useState();
    const [dds, setDds] = useState()
    const [amm, setAmm] = useState()
    const [userwallet, setUserwallet] = useState()
    //const [account, setAccount] = useState("");
    const [address, setAddress] = useState("")
    const { active, account, activate } = useWeb3React()
    //const [connected, setConnected] = useState(false)
    const [realItems, setRealItems] = useState()

    //password getting 
    const [password, setPassword] = useState()
    let passwordInp = ""
    const [getPassword, setGetPassword] = useState(true)

    const changePass = (event) => {
        passwordInp = event.target.value;
    }
    
    const connectUsingPassword = (e) => {
        e.preventDefault()
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
                    getPrivateKey(window.localStorage.getItem("walletAddress"), res.pk)
                    setGetPassword(false)
                }
        } catch(e) {
                alert("wrong password");
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

    const getPrivateKey = async(account, pk) => { //function to get privatekey from aws dynamo server
        var data = {
            body: {
                address: account?.toLowerCase()
            }
        }

        var url = "/connection"

        const provider = new ethers.providers.InfuraProvider("goerli")
        API.post('serverv2', url, data).then((response) => {
            let userwallet = new ethers.Wallet(pk, provider)
            setAddress(userwallet.address)
            setUserwallet(userwallet)
            
            let itemslist = getItems("true", userwallet)
            itemslist.then(res => {
                setRealItems(res)
                console.log(res)
            })
            
        })
    
    }

    const configureMarket = async (haswallet, userwallet) => {
        if (haswallet === "true") {
            //const provider = new ethers.providers.InfuraProvider("goerli")
            console.log(userwallet)
            const creditsContract = getContract(CreditsAddress, Credit.abi, userwallet)
            setCredits(creditsContract)
            const DDSContract = getContract(DDSAddress, DDSABI, userwallet)
            setDds(DDSContract)
            const AMMContract = getContract(Credit_AMM, AMMABI, userwallet)
            console.log(AMMContract)
            setAmm(AMMContract)
            return DDSContract
        }

        else {
            let provider = await injected.getProvider()
            const creditsContract = connectContract(CreditsAddress, Credit.abi, provider)
            setCredits(creditsContract)
            const DDSContract = connectContract(DDSAddress, DDSABI, provider)
            setDds(DDSContract)
            const AMMContract = connectContract(Credit_AMM, AMMABI, provider)
            setAmm(AMMContract)
            return DDSContract
        }
    }

    const getItems = async (haswallet, wallet) => {
        const ddsc = await configureMarket(haswallet, wallet)
    
        let credits = await ddsc?.credits()
        console.log(credits)        
        //only real items

        let item = await ddsc.items(parseInt(id) + 1)
        console.log(item)
        let newItem = {}

        if(item.sold) {
            alert("item already sold, redirecting to market!")
            window.location.replace("/market")
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

            
        }
        
        return newItem
        
    
    }

    useEffect(() => {
        
        //mintNFT(account)
        
        //getPrivateKey(window.localStorage.getItem("walletAddress")) // if Imperial Account load account
        if (window.localStorage.getItem("hasWallet") !== "true") {
            alert("Vous devez créer un compte avant d'accèder à l'Atelier")
            window.location.replace("/")
        }
        console.log("OK")

        
        
        //mintNFT(account) mint test nft
    }, [])
    return (
        getPassword ? <GetPassword /> :
        <div class="item">
            <h2>Id: {id}</h2>
            <div class="row">
                <div class="col">
                <NftBox key={(realItems?.itemId)?.toString()} real={true} tokenId={realItems?.tokenId} myitem={false} id={parseInt(realItems?.itemId)} name={realItems?.name} description={realItems?.description} price={parseInt(realItems?.price)} seller={realItems?.seller} image={realItems?.image}  account={address} signer={userwallet} credits={credits} dds={dds} password={password} amm={amm}/> 
                </div>
            </div>
            
        </div>
    )
}


export default Item;
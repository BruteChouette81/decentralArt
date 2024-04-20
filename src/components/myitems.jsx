import "./account/css/controle.css";
import {web3ApiKeyMoralis} from '../apikeyStorer.js'
import {pinatakey} from '../apikeyStorer.js'

import {useState, useEffect } from 'react';

import {ethers} from 'ethers'
import { API } from 'aws-amplify';
import { AES, enc } from "crypto-js"

import DDSABI from '../artifacts/contracts/DDS.sol/DDS.json'

const key = pinatakey
const ImperialRealAddress = "0xbC1Fe9f6B298cCCd108604a0Cf140B2d277f624a"
const DDSADDr = '0x0c50409C167e974e4283F23f10BB21d16BE956A9';

const getContract = (signer, abi, address) => {
    // get the end user
    console.log(signer)
    // get the smart contract
    const contract = new ethers.Contract(address, abi, signer);
    return contract
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

    const [availableRefund, setAvailableRefund] = useState()

    const [notDone, setNotDone] = useState(true);
    

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
                const item = await props.dds.items(parseInt(props.realPurchase[i][1]))
                console.log(item)
                const blocknumber = await props.dds.provider.getBlock()
                console.log(parseInt(item.numBlock))
                console.log(parseInt(item.startingBlock))
                setNumdaysToRetrieve(parseFloat((parseInt(item.startingBlock) + parseInt(item.numBlock) - parseInt(blocknumber.number) ) / 5760).toFixed(3))
                if (parseFloat((parseInt(item.startingBlock) + parseInt(item.numBlock) - parseInt(blocknumber.number) ) / 5760) <= 0) {
                    setAvailableRefund(true)
                }
                if (item.prooved === true) {
                    setStatus("prooved")

                    //new way: 
                    const track_contract = await props.dds.getProof(parseInt(props.realPurchase[i][1]));
                    setTrackingCode(track_contract)

                    /*var data = {
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

                    })*/


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
                if ( !window.localStorage.getItem("MoneyAddress")) {
                    alert("Vous devez ajouter une addresse e-mail pour votre remboursement dans votre compte!")
                } else {
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
                        //console.log(data)
            
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

                setNotDone(false)
            }).catch((error) => {
                console.log(error)
            })
        }
        if (notDone) {
            getData();
        }
        
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
            { status === "Not prooved" ? numdaysToRetrieve > 0 ? ( <h5 style={{color: "yellow"}}>En cours d'envoie</h5> ) :  availableRefund ? ( <h5 style={{color: "red"}}>Item non prouvé</h5> ) : "" : ( <h5 style={{color: "green"}}>Item envoyé!</h5> )}
            { refundLoading ? (<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>) : availableRefund ? ( <button onClick={retrieve} class="btn btn-primary">Remboursement</button> ) : ""}
            { numdaysToRetrieve > 0 ? ( <h6>L'item sera envoyé dans {numdaysToRetrieve} jours</h6> ) : availableRefund ? ( <h6>L'item n'a pas été envoyé dans le délais</h6> ) : "" }
            {trackingCode ? ( <h5>Tracking Code: <a href="https://www.canadapost-postescanada.ca/track-reperage/en#/home">{trackingCode}</a></h5> ) : ""}
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
                            return <YnftCard2 ynft={i[0]} tokenid={i[1]} level={props.level} account={props.account} dds={props.dds} realPurchase={props.realPurchase}/> 
                        }
                        
                    })}
                </div>
            </div>
           
        </div>
    )
}

function DisplayYnft () {
    const [ynft, setYnft] = useState()
    const [realPurchase, setRealPurchase] = useState()
    const [signer, setSigner] = useState()
    const [dds, setDds] = useState()

    const loadNftServer = async () => {
        let nftlist = []
        let address = window.localStorage.getItem("walletAddress");
        const options = {
            body: {
                address: address
            }
        }
        API.post('serverv2', "/nftbyaddress", options).then((res) => {
            console.log(res.result)
            for (let i=0; i<res?.result.length; i++) {
                if (res.result[i].token_address == ImperialRealAddress.toLowerCase()){
                    let metadata = res.result[i].token_uri
                    
    
                    console.log("CID: " + metadata?.replace("https://ipfs.moralis.io:2053/ipfs/", "") )
    
                    //'https://api.pinata.cloud/data/pinList?status=pinned&pinSizeMin=100' \--header 'Authorization: Bearer PINATA JWT'
    
                    nftlist.push([metadata?.replace("https://ipfs.moralis.io:2053/ipfs/", ""), res.result[i].token_id]) // cid
                }
            }

        }).then(() => {
            setYnft(nftlist)
        });
    }

    const loadNft2 = async () => {
        const web3ApiKey = web3ApiKeyMoralis
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'X-API-Key': web3ApiKey
          }
        };
        let address = window.localStorage.getItem("walletAddress");
        console.log(address)
        let nftlist = []
       
        
        fetch('https://deep-index.moralis.io/api/v2/'+ address + '/nft?chain=sepolia&format=decimal&media_items=false', options) //chain to arbitrum
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
    }

    const getPrivateKey = async(account, privatekey) => { //function to get privatekey from aws dynamo server
        var data = {
            body: {
                address: account?.toLowerCase()
            }
        }

        var url = "/connection"

        const provider = new ethers.providers.InfuraProvider("sepolia")
        //const binanceProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/")

        API.post('serverv2', url, data).then(async (response) => {
            setRealPurchase(response.realPurchase)
            //change user privatekey to the json
            let userwallet = new ethers.Wallet(privatekey, provider) //response.privatekey
            console.log(userwallet)
            //let userwallet = new ethers.Wallet.fromEncryptedJson(response.privatekey, password))
            setSigner(userwallet)

            let DDSContract = getContract(userwallet, DDSABI, DDSADDr)
            setDds(DDSContract)
           
        }).then(() => {
            //loadNft2()
            loadNftServer()
        })
    }

    async function loadAccount() {
        if (window.sessionStorage.getItem("password")) {
            let did = window.localStorage.getItem("did")
            let res1 = AES.decrypt(did, window.sessionStorage.getItem("password")) //props.signer.privateKey
            try {
                let res = JSON.parse(res1.toString(enc.Utf8));
                if (res.pk) {
                    await getPrivateKey(window.localStorage.getItem("walletAddress"), res.pk)
    
                } else {
                    alert("Mauvais mot de passe")
                }
                } catch(e) {
                    alert("Mauvais mot de passe");
                }
        } else {
            alert("session expirée... reconnectez-vous!")
            window.location.replace("/imperial")
        }
       
    } 
    

    useEffect(() => {
        loadAccount()
    }, [])
    

    return (
        <div class="ynft">
            <h1 style={{"color": "black"}}>Vos achats:</h1>
            <br />
            {ynft ? <ListYnftCard ynft={ynft} level={0} signer={signer} account={signer?.address} dds={dds} realPurchase={realPurchase}/> : ""}
            

        </div>
    )
}

export default DisplayYnft;
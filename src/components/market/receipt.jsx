import { useEffect, useState } from "react";

import {ethers} from 'ethers'

import transakSDK from '@transak/transak-sdk';

import placeOrder from "../F2C/testapi";

import PayItems from "../F2C/items/PayItems";

import injected from "../account/connector.js"

import ReactLoading from "react-loading";

import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'
const DDSGasContract = '0x14b92ddc0e26C0Cf0E7b17Fe742361B8cd1D95e1'

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


function Receipt (props) {
    const [fees, setFees] = useState()
    const [loadF2C, setLoadF2C] = useState(false)
    const type = "spin"
    const color = "#0000FF"

    const loadOrder = async() => {
        console.log(props.account)
        if (props.account) {
            if (window.localStorage.getItem("meta_did") || window.localStorage.getItem("did")) {
                setLoadF2C(true)
                
                //let mounthDate = props.pay[1].split("/")
                //let paymentList = [props.pay[0], "20" + mounthDate[0], mounthDate[1], props.pay[2]]
                //let id, key, city, state, code, country, street, phone, email, fname, lname = await props.did.getId(parseInt(window.localStorage.getItem("id")), parseInt(window.localStorage.getItem("key")), parseInt(window.localStorage.getItem("id")))
                //placeOrder(props.total, props.account, true, ip, props.pay, city, state, code, country, street, phone, email, fname, lname) //custom payment method 
            }
            else {
                let transak = new transakSDK({
                    apiKey: '402124e0-53a6-4806-bf0a-d9861d86f29b', // (Required)
                    environment: 'STAGING', // (Required)
                    fiatCurrency: 'CAD',
                    walletAddress: props.account.toString(),
                    fiatAmount: (props.total/10000  * 1.36 + fees)
                    // .....
                    // For the full list of customisation options check the link above
                });
                transak.init();

                // To get all the events
                transak.on(transak.ALL_EVENTS, (data) => {
                    console.log(data);
                });

                // This will trigger when the user closed the widget
                transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, (orderData) => {
                    transak.close();
                });

                // This will trigger when the user marks payment is made
                transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
                    console.log(orderData);
                    transak.close();
                });

                //let _ = ""
                //const ordering = placeOrder(10, props.account, false, _, _, _, _, _, _, _, _, _, _) //no custom payment method
                //console.log(ordering)
            }
        } else {
            alert("F2C converter not supported on Metamask. Login with Imperial Account to access this functionnality")
        }
        
        
    }

    const calculateGasFees = async() => {

            const gasPrice = await props.contract.provider.getGasPrice();
            console.log(parseFloat(ethers.utils.formatEther(gasPrice)))
            
            let price = props.subtotal
            let gas = await props.contract.estimateGas.approve(props.seller, price) //()
            console.log(parseInt(price))
            console.log(props)

            if (props.dds) { //real item
                if (window.localStorage.getItem("usingMetamask") === "false") {
                    const gasdds = getContract(DDSGasContract, DDSABI.abi, props.signer)
                    let gas2 = await gasdds.estimateGas.purchaseItem(1, 1, props.pk)

                    console.log(gas2)
                    return[(gas * gasPrice),  (gas2 * gasPrice)]
                }
                else {
                    let provider = await injected.getProvider()
                    const gasdds = connectContract(DDSGasContract, DDSABI.abi, provider)

                    let gas2 = await gasdds.estimateGas.purchaseItem(1, 1, "")
                    console.log(gas2)
                    return[(gas * gasPrice),  (gas2 * gasPrice)]
                }
                
            }
            else {
                let gas2 = await props.market.estimateGas.purchaseItem(props.id)
                return [(gas * gasPrice),  (gas2 * gasPrice)]
            }

        
        
        
    }

    useEffect(() => {
        calculateGasFees().then((fee) => {
            console.log(fee[1])
            setFees((ethers.utils.formatEther(fee[0])  * 2440.40) + (ethers.utils.formatEther(fee[1])  * 2440.40)) //credit price: 31400700
            
        })
        
    })
    //{props.quebec ? <div> <h6>GST: 1,500 $CREDIT (2,5$ at 5%) </h6> <h6>QST: 3,000 $CREDIT (5$ at 10%)</h6> </div> : <h6 class="tax">Tax: 3,000 $CREDITs ({props.taxprice}$ at {props.tax}%)</h6> } <a href="" class="link link-primary">taxes policies ({props.state})</a>
    return (
        <div>
            { loadF2C === false ?
            (<div className="receipt">
            {props.buyloading ? (<div class="ynftcard" ><ReactLoading type={type} color={color}
            height={200} width={200} /><h5>Buying Item loading...</h5></div>) : (
                <div>
            <img id='itemimg' src={props.image} alt="" />
            <br />
            <br />
            <h4>subtotal: {window.localStorage.getItem("currency") === "CAD" ? (props.subtotal/10000 * 1.36) : (props.subtotal/10000)}  {window.localStorage.getItem("currency")}</h4>
            <h6>Gas Fee: {parseFloat(fees)} {window.localStorage.getItem("currency")}</h6>
            
            <h5> Total: {window.localStorage.getItem("currency") === "CAD" ? (props.total/10000 * 1.36) : (props.total/10000)} {window.localStorage.getItem("currency")}</h5>
            <button onClick={props.purchase} type="button" class="btn btn-secondary" id="buy">Buy</button>
            <button onClick={loadOrder} type="button" class="btn btn-primary" id="buy">F2C</button>
            <br />
            <br />
            <button onClick={props.cancel} type="button" class="btn btn-danger">Cancel</button></div> )} </div>) : (<PayItems pk={props.pk} total={props.total} fees={fees} account={props.account} purchase={props.purchase} amm={props.amm} cancel={props.cancel}/>)}

        </div>
        
        
    )
    
}

export default Receipt;


/*
<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{color:"black"}}>
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel" >billing informations</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        
                    <div class="modal-body">
                        <h6 class="subtotal">test</h6>
                        
                        

                        <a href="" class="link link-primary">taxes policies ({props.state})</a>
                        <h5 class="total"> test </h5>
                        <button type="button" class="btn btn-primary" onClick={props.purchase}>buy</button>
                    </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

*/
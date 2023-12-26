import { useEffect, useState } from "react";
import {CLIENT_ID} from '../../apikeyStorer.js'
import "./css/nftbox.css"

import {ethers} from 'ethers'

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import transakSDK from '@transak/transak-sdk';

import placeOrder from "../F2C/testapi";

import PayItems from "../F2C/items/PayItems";

import injected from "../account/connector.js"

import ReactLoading from "react-loading";

import DDSABI from '../../artifacts/contracts/DDS.sol/DDS.json'
import { API } from "aws-amplify";

import lock from "./css/png-lock-picture-2-lock-png-400.png"
import cpl from "./css/fontbolt.png"

const DDSGasContract = '0x14b92ddc0e26C0Cf0E7b17Fe742361B8cd1D95e1'


let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

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
    //const [fees, setFees] = useState()
    const [paypalLoading, setPaypalLoading] = useState(false)
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
                    fiatAmount: (props.total/100000  * 1.36)
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
    

    

   
    //{props.quebec ? <div> <h6>GST: 1,500 $CREDIT (2,5$ at 5%) </h6> <h6>QST: 3,000 $CREDIT (5$ at 10%)</h6> </div> : <h6 class="tax">Tax: 3,000 $CREDITs ({props.taxprice}$ at {props.tax}%)</h6> } <a href="" class="link link-primary">taxes policies ({props.state})</a>
    //sandbox ID: ""
    return (
        <div>
            { loadF2C === false ?
            (<div className="receipt">
            {paypalLoading ? (<div ><ReactLoading type={type} color={color}
            height={200} width={200} /><h5>{window.localStorage.getItem("language") == "en" ? "Processing payment..." : "Transaction en cours..." }</h5></div>) : (
                <div>
            <img id='itemimg2' src={props.image} alt="" />
            <br />
            <br />
            <p>{window.localStorage.getItem("language") == "en" ? "Questions ? contact us at thomasberthiaume183@gmail.com" : "Des questions ? contacter nous à thomasberthiaume183@gmail.com" }</p>
            <h4>Subtotal: {window.localStorage.getItem("currency") === "CAD" ? USDollar.format((props.subtotal/100000) / (1 - 0.029) + 4.6) : USDollar.format((props.subtotal/100000) / (1 - 0.029) + 4.6)}  {window.localStorage.getItem("currency")}</h4>
            
            
            <h5> Total: {window.localStorage.getItem("currency") === "CAD" ? USDollar.format((props.total/100000) / (1 - 0.029) + 4.6) : USDollar.format((props.total/100000) / (1 - 0.029) + 4.6)} {window.localStorage.getItem("currency")}</h5>
            <p>{window.localStorage.getItem("language") == "en" ? "Transactions may take up to 2 minutes. Please, wait until the confirm message to quit the page!" : "Les transactions peuvent prendre jusqu'à 2 minutes. S'il vous plaît, attendez le message de confirmation pour quitter la page !"}</p>
            <br /><br />
            <PayPalScriptProvider options={{ clientId: CLIENT_ID, currency: "CAD" }}>
                <PayPalButtons
                    createOrder={async () => {
                        
                        let dataoptions = {
                            body: {
                                amount: parseFloat((props.total/100000) / (1 - 0.029) + 4.6).toFixed(2).toString()
                            }
                        }
                        return API.post('serverv2', "/create-paypal-order", dataoptions).then((order) => order.id);
                    }}
                    onApprove={async (data) => {
                        setPaypalLoading(true)
                        
                        let dataoptions = {
                            body: {
                                orderID: data.orderID,
                                address: props.account,
                                amount: parseFloat((props.total/100000) / (1 - 0.029) + 4.6).toFixed(2),
                                itemId: parseInt(props.id), 
                                key: props.pk, //is password
                                buying: true
                            }
                        }
                        return API.post('serverv2', "/capture-paypal-order", dataoptions).then((orderData) => {
                            console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
                            if (orderData.status === 50) {
                                alert("Error while buying. Error code: 50")
                            } else {
                                const transaction = orderData.purchase_units[0].payments.captures[0];
                                console.log(transaction)
                                props.purchase().then((result) => {
                                    setPaypalLoading(false)
                                    alert(`Transaction completé! Merci de faire affaire avec nous ! État de la transaction: ${transaction.status}`);
                                })
                                
                            }

                            //props.purchase()
                        }).catch((e) => {
                            alert("Error while buying. Error code: 50")
                            setPaypalLoading(false)
                            console.log(e)
                        });
                    }}
                />
            </PayPalScriptProvider>
            <button type="button" class="btn btn-default" id="buy" disabled> <img src={lock} id="lock-img" />Crypto Payment</button>

            
            <br />
            <br />
            <p>Powered by <img src={cpl} id="cpl-img" alt="" /></p>
            <button onClick={props.cancel} type="button" class="btn btn-danger">Cancel</button></div> )} </div>) : (<PayItems pk={props.pk} total={props.total} account={props.account} purchase={props.purchase} amm={props.amm} cancel={props.cancel}/>)}

        </div>
        
        
    )
    
}

export default Receipt;

//<button onClick={props.purchase} type="button" class="btn btn-secondary" id="buy">Buy</button>
//<button onClick={loadOrder} type="button" class="btn btn-primary" id="buy">F2C</button>
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
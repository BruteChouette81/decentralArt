
import './payitems.css'

import { useState } from 'react';

import placeOrder from '../testapi';
import getGasPriceUsd from '../testapi';
import ReactLoading from "react-loading";

import transakSDK from '@transak/transak-sdk';

import { AES, enc } from "crypto-js"

function PaymentCard(props) {
    return (
        <div class="paymentcard">
            <h6>Card Number: <strong>{props.card}</strong></h6>
            <p>expiration date: {props.date}</p>
            <br />
                <div class="separator">

                </div>
            <br />
            <button id={props.pay} onClick={props.loadCard} class="btn btn-primary">Select</button>
        </div>
    )
}
//params needed: DiD, payment method, purchase method
function PayItems(props) {
    const [paymentMethod, setPaymentMethod] = useState(["none"])
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState("Transaction")
    const type = "spin"
    const color = "#0000FF"

    const loadCard = (i) => {
        setPaymentMethod(i.target.id.split(","))
    }

    const checkout = async () => {
        setLoading(true)
        console.log(props.pk)
        let res;
        try {
            let did = window.localStorage.getItem("did")
            let res1 = AES.decrypt(did, props.pk)
            res = JSON.parse(res1.toString(enc.Utf8));

        } catch {
            let did = window.localStorage.getItem("meta_did")
            let res1 = AES.decrypt(did, props.pk)
            res = JSON.parse(res1.toString(enc.Utf8));

        }
        
        let transak = new transakSDK({
            apiKey: '402124e0-53a6-4806-bf0a-d9861d86f29b', // (Required)
            environment: 'STAGING', // (Required)
            fiatCurrency: window.localStorage.getItem("currency"),
            cryptoCurrencyCode: 'USDC',
            network: 'arbitrum',
            walletAddress: props.account.toString(),
            fiatAmount: 100, //+ props.fees (props.total/10000 * 1.36)
            userData: {
                first_name: res.first_name,
                last_name: res.last_name,
                email: res.email,
                mobileNumber: res.mobileNumber, //"+19692154942"
                dob: "1994-11-26", // got to format well
                address: {
                    addressLine1: res.address.addressLine1,
                    city: res.address.city,
                    state: res.address.state,
                    postCode: res.address.postCode,
                    countryCode: res.address.countryCode
        }
            }
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
            alert("You must complete the Transaction to buy the item!")
            setLoading(false)
        });

        // This will trigger when the user marks payment is made
        transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, async (orderData) => {
            console.log(orderData);
            transak.close();


            await props.amm.paySeller(props.total) //get right total
            await props.purchase() 
            setLoading(false)
            alert("Successfully bought the Item !")
        });
    }
    return (
        <div class="payItem">
            {loading ? (<div style={{paddingLeft: 25 + "%"}}><ReactLoading type={type} color={color}
        height={200} width={200} /><h5>{step} loading...</h5></div>) : (<div>
                <h4>F2C Checkout</h4>
                <p>
                    <a class="btn btn-info" data-bs-toggle="collapse" href="#collapseExample2" role="button" aria-expanded="false" aria-controls="collapseExample2">
                        Learn more about F2C
                    </a>
                </p>
                <div class="collapse" id="collapseExample2">
                    <div class="card card-body" style={{color: "black"}}>
                        F2C stands for Fiat-to-Crypto. In fact, this protocol is allowing users with no $credits nor Ethereum to interact with the Imperial decentralized ecosystem.
                    </div>
                </div>
                <br />
                
                <h6>Currency selecting: <strong>{window.localStorage.getItem("currency")}</strong></h6>
                <h5>Total {window.localStorage.getItem("currency")} price: {window.localStorage.getItem("currency") === "CAD" ? (props.total/10000 * 1.36) : (props.total/10000)} </h5>

                <button onClick={checkout} class="btn btn-primary">Authorize Transaction</button> <button onClick={props.cancel} class="btn btn-danger">Cancel</button>
            </div>)}
            

        </div>
    )
}

export default PayItems;
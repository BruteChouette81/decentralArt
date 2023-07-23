import './payGas.css'

import { useState } from 'react';

import getGasPriceUsd from '../testapi';
import ReactLoading from "react-loading";

import transakSDK from '@transak/transak-sdk';

import { AES, enc } from "crypto-js"

function PaymentCard(props) {
    return (
        <div class="paymentcard">
            <h6>Card Number: <strong>{props.card}</strong></h6>
            <p>expiration date: {props.date}</p>
            <button id={props.pay} onClick={props.loadCard} class="btn btn-primary">Select</button>
        </div>
    )
}
//params needed: NFT, payment method, NFT contract, pay
function PayGas(props) {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState("Transaction")
    const type = "spin"
    const color = "#0000FF"


    const checkout = async () => {
        setLoading(true)
        console.log(props.pk)
        
        let res1 = AES.decrypt(window.localStorage.getItem("did"), props.pk)


        let res = JSON.parse(res1.toString(enc.Utf8));
        //console.log(res)
        //let completed = false
        let transak = new transakSDK({
            apiKey: '402124e0-53a6-4806-bf0a-d9861d86f29b', // (Required)
            environment: 'STAGING', // (Required)
            fiatCurrency: window.localStorage.getItem("currency"),
            walletAddress: props.account.toString(),
            fiatAmount: (props.total *10000 * 1.36), //+ props.fees
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
            if (props.nft.address === "0xbC1Fe9f6B298cCCd108604a0Cf140B2d277f624a") { //if real i8tem, 
                const id = await (await props.nft.safeMint(props.account, props.tokenuri)).wait() // safeMint
                console.log(id)
                alert("NFT successfully created. See your item in the Your NFTs section.")
                setLoading(false)
                props.cancel()
            } else {
                const id = await (await props.nft.mint(props.account, props.tokenuri)).wait() // safeMint
                console.log(id)
                alert("NFT successfully created. See your item in the Your NFTs section.")
                setLoading(false)
                props.cancel()
            }
            
        });
    }
    return (
        <div class="payGas">
            {loading ? (<div style={{paddingLeft: 25 + "%"}}><ReactLoading type={type} color={color}
        height={200} width={200} /><h5>{step} loading...</h5></div>) : (<div>
                <h4>F2C Checkout</h4>
                <h6>NFT creation</h6>
                <h6>CID: {props.metadata}</h6>
                <h5>Total {window.localStorage.getItem("currency")} price: {window.localStorage.getItem("currency") === "CAD" ? (props.total/10000 * 1.36) : (props.total/10000)} </h5>

                <button onClick={checkout} class="btn btn-primary">Authorize Transaction</button> <button onClick={props.cancel} class="btn btn-danger">Cancel</button>
            </div>)}
            

        </div>
    )
}

export default PayGas;
import './payGas.css'

import { useState } from 'react';

import getGasPriceUsd from '../testapi';
import ReactLoading from "react-loading";



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
function PayGasRetrieve(props) {
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
        let mounthDate = paymentMethod[1].split("/")
        let paymentList = [paymentMethod[0], mounthDate[0], "20" + mounthDate[1], paymentMethod[2]] //id, key, city, state, code, country, street, phone, email, fname, lname
        let res = await props.did.getId(parseInt(window.localStorage.getItem("id")), parseInt(window.localStorage.getItem("key")), parseInt(window.localStorage.getItem("id")))
        //console.log(res)
        //let completed = false
        let completed = await getGasPriceUsd(props.total, props.account, true, paymentList, res.city, res.state, res.postalCode, res.country, res.street1, res.phone, res.email, res.name, res.lastname) //custom payment method 
        if (completed) {
            props.dds.retrieveCredit(props.itemId)
            alert("NFT successfully created. See your item in the Your NFTs section.")
            setLoading(false)
            props.cancel()
        }
        else {
            alert("Error completing the transaction... retry")
            setLoading(false)
            
        }
    }
    return (
        <div class="payGas">
        {loading ? (<div style={{paddingLeft: 25 + "%"}}><ReactLoading type={type} color={color}
    height={200} width={200} /><h5>{step} loading...</h5></div>) : (<div>
            <h4>F2C Checkout</h4>
            <p><a href="">Learn about F2C</a></p>
            <h6>Select your payment method (Debit Card only):</h6>
            <div class="payList">
                {props.pay?.map(i => 
                    (<div >
                        <PaymentCard card={i[0]} date={i[1]} pay={i} loadCard={loadCard}/>
                        <br />
                    </div>)
                )}
            </div>
            <h6>Real Item Retrieving</h6>
            <h6>Currently selecting: <strong>{paymentMethod[0]}</strong></h6>
            <h5>Total USD price: {props.total}$</h5>

            <button onClick={checkout} class="btn btn-primary">Checkout</button> <button onClick={props.cancel} class="btn btn-danger">Cancel</button>
        </div>)}
        

    </div>)
}

export default PayGasRetrieve;
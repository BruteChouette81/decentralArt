

//server to manage payments 
const express        = require('express');
//const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
//const e = require('express');

const app = express();
app.use(bodyParser.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    next()
});

app.listen(8000, () => {  console.log('payment_gateway.js on localhost:8000');});

app.get("/test", (req, res)=> {
    console.log("Connected to server")
    res.send("OK")
})

// ------VISA-------

//we will use visa direct transfer fund api for buying and visa direct wallet api for payouts


//vdp: desktop/vdpplayground java -jar vdpplayground.jar load: test_project1.json
//api key: 4WT8MR0BNQKND61UL0Z621OxSHr3caFHlErBX4PQtOs5t4ymo
// secret: Apd6GB#cfZ@3iM#$QL7R-sHyPAzxxcBCMNZ#D8YX
//https://sandbox.api.visa.com/vdp/helloworld?apiKey=4WT8MR0BNQKND61UL0Z621OxSHr3caFHlErBX4PQtOs5t4ymo
//acquirer bin for transaction to merchant

//payer: https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pullfundstransactions ==> claim: https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pushfundstransactions to cpl bank account (magic) ==> 
// make a transfer (payout) to merchant bank ==> https://sandbox.api.visa.com/visapayouts/v3/payouts 
// or make payouts all the way (the two options) ==> no but dont need to push
app.post("/visaBuy", (req, res)=> {
    //pull funds from payers account
    const params = { //basic params
        "amount": "100.00", //string amount of transaction
        "localTransactionDateTime": "2023-05-05T12:00:00", //time of transaction
        "cardAcceptor": {
            "address": {
                "country": "CA",
                "addressLine": "100 test street",
                "zipCode": "G0S2C0",
                "state": "QC"
            },
            "idCode": "ABCD1234ABCD123", //id of the originator (must be unique)
            "name": "Visa Inc. USA-Foster City", //aquirer name
            "terminalId": "ABCD1234" //check 
        },
        "visaMerchantIdentifier": "73625198",
        "merchantCategoryCode": 0, //check
        "retrievalReferenceNumber": "330000560021",

        "acquirerCountryCode": "124", //canada
        "acquiringBin": "454038", //originator bin
        "senderCurrencyCode": "CAD",
        "cavv": "0700100038238906000013405823891061668252", //check for cvv
        "systemsTraceAuditNumber": "452011",
        "businessApplicationId": "PP", //what we want
        "senderPrimaryAccountNumber": "4060320000000127", //pan
        "senderCardExpiryDate": "2023-10", 
        }
    res.send("OK")
})

//------MASTER------
//master card will operate using A2A commerce api 
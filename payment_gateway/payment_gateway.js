

//server to manage payments 
const express        = require('express');
//const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const e = require('express');
const { default: axios } = require('axios');
var randomstring = require('randomstring');
var crypto = require('crypto')
var fs = require('fs');

var https = require('https');



//const e = require('express');

const app = express();
app.use(bodyParser.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    next()
});
days_by_mounth = [31,29,31,30,31,30,31,31,30,31,30,31];



app.listen(8000, () => {  console.log('payment_gateway.js on localhost:8000');});

app.get("/test", (req, res)=> {
    console.log("Connected to server")
    res.send("OK")
})

// ------VISA-------

//we will use visa direct transfer fund api for buying and visa direct wallet api for payouts

// PullPayment =====> originator (instant) ======> exchange =====> stable-back lending ====> exchange =====> originator =======> payout to account (wyre transfer or directly from exchange)


//vdp: desktop/vdpplayground java -jar vdpplayground.jar load: test_project1.json
//api key: 4WT8MR0BNQKND61UL0Z621OxSHr3caFHlErBX4PQtOs5t4ymo
// secret: Apd6GB#cfZ@3iM#$QL7R-sHyPAzxxcBCMNZ#D8YX
//https://sandbox.api.visa.com/vdp/helloworld?apiKey=4WT8MR0BNQKND61UL0Z621OxSHr3caFHlErBX4PQtOs5t4ymo
//acquirer bin for transaction to merchant

//payer: https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pullfundstransactions ==> claim: https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pushfundstransactions to cpl bank account (magic) ==> 
// make a transfer (payout) to merchant bank ==> https://sandbox.api.visa.com/visapayouts/v3/payouts 
// or make payouts all the way (the two options) ==> no but dont need to push
//vdp:
/*{
  "amount": 100,
  "localTransactionDateTime": "2024-02-04T12:00:00",
  "cardAcceptor": {
    "address": {
      "country": "USA",
      "zipCode": "94404",
      "state": "CA",
      "addressLine": "100 test street"
    },
    "idCode": "VMT200911086070",
    "name": "Acceptor 1",
    "terminalId": "365529"
  },
  "acquirerCountryCode": 840,
  "retrievalReferenceNumber": "330000550000",
  "acquiringBin": 408999,
  "senderCurrencyCode": "USD",
  "addressVerificationData": {
    "street": "123 test street",
    "postalCode": "51111"
  },
  "systemsTraceAuditNumber": 451000,
  "messageReasonCode": 1,
  "businessApplicationId": "AA",
  "senderPrimaryAccountNumber": "4957030005123304",
  "visaMerchantIdentifier": "73625198",
  "merchantCategoryCode": 6012,
  "senderCardExpiryDate": "2020-03"
}
res: {
"transactionIdentifier": 205491647114882,
"actionCode": "00", //approoved
"approvalCode": "98765X",
"responseCode": "V",
"transmissionDateTime": "2024-01-31T22:47:35.000Z",
"cpsAuthorizationCharacteristicsIndicator": "3333"
} */

//become an licensed visa aquirer 

function x_pay_token(resourcePath , queryParams , postBody) {
	var timestamp = Math.floor(Date.now() / 1000);
	var sharedSecret = "Apd6GB#cfZ@3iM#$QL7R-sHyPAzxxcBCMNZ#D8YX";
	var preHashString = timestamp + resourcePath + queryParams + postBody;
	var hashString = crypto.createHmac('SHA256', sharedSecret).update(preHashString).digest('hex');
	var preHashString2 = resourcePath + queryParams + postBody;
	var hashString2 = crypto.createHmac('SHA256', sharedSecret).update(preHashString2).digest('hex');
	var xPayToken = 'xv2:' + timestamp + ':' + hashString;
	return xPayToken;	
};

app.get("/testvisaPullpp", (req, res) => {
  let strDay = ""
  let strMounth = ""
  var d = new Date();
  let day = d.getDate()
  let mounth = d.getMonth()
    let julianDay = 0;
    for (let i =0; i<days_by_mounth.length; i++) {
      if(i>(mounth-1)) {
        break
      } else {
        julianDay+= days_by_mounth[i];
      }
    }
    julianDay += day;
    //julianDay = ("000" + julianDay).slice(-3)
    julianDay+=4000
    
    retrievalReferenceNumber = julianDay + d.getHours().toString() + "451000"
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      "key": fs.readFileSync('./key_1208f273-3f1c-412d-8d7b-82849a02716a.pem'),
      "cert": fs.readFileSync("./cert.pem"),
      "ca": fs.readFileSync("./DigiCertGlobalRootCA.cer"),
      
    });

    //format mounth
    if(mounth < 10) {
      strMounth = "0" + (mounth +1).toString()
    } else {
      strMounth = (mounth +1).toString()
    }
     
  //format day
  if (day < 10) {
    strDay = "0" + day.toString()
    } else {
      strDay = day.toString()
    }

    
    const params = {
    //"ca": fs.readFileSync('./VDPCA-SBX.pem'),
    httpsAgent: httpsAgent,
    headers: {
    'content-type': 'application/json',
    'accept': 'application/json',
    'Authorization' : 'Basic ' + new Buffer.from('B6LIG9GE2WNWGBFEM62H21Y58dhJjZVvFgh1Cwcut3hxT9B5w:XSKjs0V44JeJj').toString('base64')
    },
    body:{
      "amount": 100,
      "localTransactionDateTime": "2024-" + strMounth + "-"+ strDay + "T12:00:00",
      "cardAcceptor": {
        "address": {
          "country": "USA",
          "zipCode": "94404",
          "state": "CA",
          "addressLine": "100 test street"
        },
        "idCode": "VMT200911086070",
        "name": "Acceptor 1",
        "terminalId": "365529"
      },
      "acquirerCountryCode": 840,
      "retrievalReferenceNumber": "330000550000",
      "acquiringBin": 408999,
      "senderCurrencyCode": "USD",
      "addressVerificationData": {
        "street": "123 test street",
        "postalCode": "51111"
      },
      "systemsTraceAuditNumber": 451000,
      "messageReasonCode": 1,
      "businessApplicationId": "AA",
      "senderPrimaryAccountNumber": "4957030005123304",
      "visaMerchantIdentifier": "73625198",
      "merchantCategoryCode": 6012,
      "senderCardExpiryDate": "2020-03"
    }}
    //let xpayToken = x_pay_token("pullfundstransactions", "apiKey=4WT8MR0BNQKND61UL0Z621OxSHr3caFHlErBX4PQtOs5t4ymo", params["body"])
    //params["headers"]["x-pay-token"] = xpayToken;
    
    //let xpayToken = x_pay_token("pullfundstransactions", "apiKey=4WT8MR0BNQKND61UL0Z621OxSHr3caFHlErBX4PQtOs5t4ymo", params["body"])
    //params["headers"]["x-pay-token"] = xpayToken;
    axios.post("https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pullfundstransactions", params["body"], {"headers": {'content-type': 'application/json',
    'accept': 'application/json',
    'Authorization' : 'Basic ' + new Buffer.from('B6LIG9GE2WNWGBFEM62H21Y58dhJjZVvFgh1Cwcut3hxT9B5w:XSKjs0V44JeJj').toString('base64')},"httpsAgent": httpsAgent} ).then((res2) => {
      console.log(res2.data)
      res.send("Transaction completed: transaction id: " + res2.data.transactionIdentifier)
      //res.send("OK")
    }).catch((e)=> {
      console.log(e)
      res.send("error")
    })
})

app.post("/visaPullpp", (req, res)=> { //visa pull funds peer to peer 
    //pull funds from payers account
    var d = new Date();
    let day = d.getDate()
    let mounth = d.getMonth()
    let julianDay = 0;
    for (let i =0; i<days_by_mounth.length; i++) {
      if(i>(mounth-1)) {
        break
      } else {
        julianDay+= days_by_mounth[i];
      }
    }
    julianDay += day;
    //julianDay = ("000" + julianDay).slice(-3)
    julianDay+=4000
    
    retrievalReferenceNumber = julianDay + d.getHours().toString() + req.body.traceAuditNumber

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      "key": fs.readFileSync('./key_1208f273-3f1c-412d-8d7b-82849a02716a.pem'),
      "cert": fs.readFileSync("./cert.pem"),
      "ca": fs.readFileSync("./DigiCertGlobalRootCA.cer"),
      
    });

    //format mounth
    if(mounth < 10) {
      strMounth = "0" + (mounth +1).toString()
    } else {
      strMounth = (mounth +1).toString()
    }
     
  //format day
  if (day < 10) {
    strDay = "0" + day.toString()
    } else {
      strDay = day.toString()
    }

    const params = {"headers": {'content-type': 'application/json',
    'accept': 'application/json',
    },
    "body":{ //basic params
        "amount": req.body.amount, //string amount of transaction
        "localTransactionDateTime": "2024-" + strMounth + "-"+ strDay + "T12:00:00", //time of transaction
        "cardAcceptor": {
            "address": {
                "country": req.body.country, //"CA",
                "addressLine": req.body.street, //"100 test street",
                "zipCode": req.body.zipcode, //"G0S2C0",
                "state": req.body.state //"QC"
            },
            "idCode": "ABCD1234ABCD123", //id of the originator (must be unique)
            "name": "Visa Inc. USA-Foster City", //aquirer name
            "terminalId": "ABCD1234" //check 
        },
        "visaMerchantIdentifier": "73625198", //check
        "merchantCategoryCode": 0, //check
        "retrievalReferenceNumber": retrievalReferenceNumber,//"330000560021", //check

        "acquirerCountryCode": "124", //canada
        "acquiringBin": "454038", //originator bin
        "senderCurrencyCode": "CAD",
        "cavv": "0700100038238906000013405823891061668252", //check for cvv
        "systemsTraceAuditNumber": req.body.traceAuditNumber, //"452011",
        "businessApplicationId": "PP", //what we want
        "senderPrimaryAccountNumber": req.body.pan,//"4060320000000127", //pan
        "senderCardExpiryDate": req.body.edate, //"2024-10", 
        "addressVerificationData": {
          "street": "123 test street",
          "postalCode": "51111"
          },
        "messageReasonCode": 1
        }}
    //let xpayToken = x_pay_token("/visadirect/fundstransfer/v1/pullfundstransactions", "apiKey=4WT8MR0BNQKND61UL0Z621OxSHr3caFHlErBX4PQtOs5t4ymo", params["body"])
    //params["headers"]["x-pay-token"] = xpayToken;
    axios.post("https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pullfundstransactions", params["body"], {"headers": {'content-type': 'application/json',
    'accept': 'application/json',
    'Authorization' : 'Basic ' + new Buffer.from('B6LIG9GE2WNWGBFEM62H21Y58dhJjZVvFgh1Cwcut3hxT9B5w:XSKjs0V44JeJj').toString('base64')},"httpsAgent": httpsAgent}).then((res2) => {
      console.log(res2.data.transactionIdentifier) //store this somewhere
      res.send("OK")
    }).catch((e)=> {
      res.send("error")
    })
    
    
})
/*curl -X POST --header "Content-Type: application/json" --data "{\"transactionId\":\"233735912367491\"}" localhost:8000/getStatusTransaction */
app.post("/getStatusTransaction", (req, res)=> { 
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    "key": fs.readFileSync('./key_1208f273-3f1c-412d-8d7b-82849a02716a.pem'),
    "cert": fs.readFileSync("./cert.pem"),
    "ca": fs.readFileSync("./DigiCertGlobalRootCA.cer"),
    
  });
  //to status to get: the pull status and the push status (and the contract execution on the BChain)
  console.log("https://sandbox.api.visa.com/visadirect/v1/transactionquery?acquiringBIN=408999&transactionIdentifier=" + req.body.transactionId)
  
  axios.get("https://sandbox.api.visa.com/visadirect/v1/transactionquery?acquiringBIN=408999&transactionIdentifier=" + req.body.transactionId, {"headers": {'content-type': 'application/json',
  'accept': 'application/json',
  'Authorization' : 'Basic ' + new Buffer.from('B6LIG9GE2WNWGBFEM62H21Y58dhJjZVvFgh1Cwcut3hxT9B5w:XSKjs0V44JeJj').toString('base64')},"httpsAgent": httpsAgent}).then((res2)=> {
    console.log(res2.data)
    res.json(res2.data)
  }).catch((e)=> {
    res.send("error")
  })
  
})

app.post("/deposit2Exchange", (req, res)=> {
  axios.get("https://api.paytrie.com/quotes").then((res2) => {
    params={
      "quoteId": res2.id,
      "gasId": res2.gasId,
      "email": "", //our email
      "wallet": "", //our wallet
      "leftSideLabel": "CAD",
      "leftSideValue": req.amount,
      "rightSideLabel": "USDC",
  
    }
    axios.post("https://api.paytrie.com/transactions", params, {"headers": {"x-api-key": ""}}).then((res) => {
      //wallet.earn(req.USDCamount)
    }) //this need to be validated on the paytrie account
  })
  
}) //deposit money to exchange convert it and start earning

app.post("/withdrawFromExchange") //remove it from earning and convert it back and withdraw using wire or interac

app.post("/visaPushpp", (req, res)=>{ //push funds to person

})

app.post("/walletPayout", (req, res) => { //may be replace by interact transfer depending on fees
  var d = new Date();
  let day = d.getDate()
  let mounth = d.getMonth()
  let julianDay = 0;
  for (let i =0; i<days_by_mounth.length; i++) {
    if(i>(mounth-1)) {
      break
    } else {
      julianDay+= days_by_mounth[i];
    }
  }
  julianDay += day;
  //julianDay = ("000" + julianDay).slice(-3)
  julianDay+=4000
  
  retrievalReferenceNumber = julianDay + d.getHours().toString() + req.body.traceAuditNumber
  params = {
    "body": {
      
        "recipientDetail": {
          "firstName": req.body.firstname,
          "lastName": req.body.lastname,
          "address": {
            "country": "124",
            "city": "Quebec",
            "postalCode": req.body.postalCode,
            "addressLine1": req.body.address,
            "state": req.body.province
          },
          "contactEmail": req.body.email,
          "type": "C", //I individu, C company
          "payoutMethod": "B",
          
          "bank": {
            "branchCode": req.body.branchCode,
            "bankCode": req.body.bankcode,
            "bankCodeType": req.body.bankcodeType,
            "accountNumberType": "DEFAULT",
            "accountName": req.body.accountName,
            "countryCode": "124",
            "accountType": req.body.accountType, //check iso code
            "bankName": req.body.bankName,
            "accountNumber": req.body.accountNumber,
            "BIC": req.body.bic,
            "currencyCode": "124"
          },
          
          "identificationList": [ //check
            {
              "idType": "D",
              "idNumber": "123334",
              "idIssueCountry": "124"
            }
          ],
          
          "contactNumber": req.body.phone,
          "additionalData": [ //check
            {
              "name": "TAX_REF",
              "value": "ASR"
            }
          ]
        },
        "senderDetail": { //same as originator
          "address": {
            "country": "840",
            "city": "Mumbai",
            "postalCode": "100",
            "addressLine1": "address line 1",
            "addressLine2": "address line 2",
            "state": "Mahrashtra"
          },
          "contactEmail": "def@visa.com",
          "beneficiaryRelationship": "business partner",
          "dateOfBirth": "1990-09-11",
          "sourceOfFunds": "02",
          "type": "I",
          "senderReferenceNumber": "4304630005267011",
          "cityOfBirth": "Austin",
          "identificationList": [
            {
              "idType": "D",
              "idNumber": "123334",
              "idIssueCountry": "840"
            }
          ],
          "countryOfBirth": "840",
          "name": "John Smith",
          "contactNumber": "120345678",
          "additionalData": [
            {
              "name": "TAX_REF",
              "value": "ASR"
            }
          ],
          "sourceOfIncome": "business"
        },
        "originatorDetail": {
          "paymentFacilitator": {
            "country": "124",
            "name": "CPL tech",
            "id": "123476876"
          },
          "bankId": "320007",
          "originatorName": "Visa Inc. GER",
          "address": {
            "country": "840",
            "postalCode": "12346",
            "state": "TX",
            "addressLine": "123 St."
          },
          "originatorBIC": "CTBAAU2S",
          "merchantCategoryCode": "6012",
          "bankBIC": "CTBAAU2S",
          "originatorId": "77770"
        },
        "transactionDetail": {
          "systemTraceAuditNumber": req.body.traceAuditNumber,
          "localTransactionDateTime": "2024-" + mounth + "-"+ day + "T12:00:00",
          "businessApplicationId": "FD",
          "statementNarrative": "advance payment",
          "purposeOfPayment": "ANN",
          "transactionAmount": req.body.amount,
          "transactionCurrencyCode": "124",
          "additionalData": [
            {
              "name": "TAX_REF",
              "value": "ASR"
            }
          ],
          "retrievalReferenceNumber": retrievalReferenceNumber,
          "endToEndId": "ABCD-1234-fab-578",
          "clientReferenceId": "3187351823",
          "payoutSpeed": "standard"
        }
    }
  }

  axios.post("https://sandbox.api.visa.com/visapayouts/v2/payouts?apikey=4WT8MR0BNQKND61UL0Z621OxSHr3caFHlErBX4PQtOs5t4ymo", params).then((res)=> {
    console.log(res)
  })

})

//buy now pay later 
//buy now pay later (short term loan) can be 1: controlled using smart contract (so, more margin) and 2: generate intrest using BNPL pool (stable-back pool)
// once connected with visa/mastercard, it will automatically take the money from credit or debit account or with crypto (lower intrest)
// can generate instant interest cause money return to pool

//------MASTER------
//master card will operate using A2A commerce api 
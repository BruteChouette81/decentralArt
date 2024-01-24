

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


//vdp: desktop/vdpplayground java -jar vdpplayground.jar load: test_project1,json
//api key: 4WT8MR0BNQKND61UL0Z621OxSHr3caFHlErBX4PQtOs5t4ymo
// secret: Apd6GB#cfZ@3iM#$QL7R-sHyPAzxxcBCMNZ#D8YX
//https://sandbox.api.visa.com/vdp/helloworld?apiKey=4WT8MR0BNQKND61UL0Z621OxSHr3caFHlErBX4PQtOs5t4ymo
app.post("/visaBuy", (req, res)=> {
    res.send("OK")
})

//------MASTER------
//master card will operate using A2A commerce api 
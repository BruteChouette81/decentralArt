
/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const { ethers } = require("ethers")
const fetch = require("node-fetch");
const e = require('express');

const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient()
let tablename = "cpl-database-dev"; //wallet storage

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// plugin for eth account (do verification on our side)
const getContract = (signer, abi, address) => {
  // get the end user
  console.log(signer)
  // get the smart contract
  const contract = new ethers.Contract(address, abi, signer);
  return contract
}

//const ddsAddress = "0xcAd1B86F5022A138053577ae03Ab773Ee770ec21";
const creditAddress = "0xc183177E3207788ea9342255C8Fcb218763d46e2"
const ddsABI = [
	{
		"inputs": [
			{
				"internalType": "contract credit",
				"name": "_addrCredit",
				"type": "address"
			},
			{
				"internalType": "contract RealItem",
				"name": "_addrRealItem",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "itemId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "nft",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "Bought",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "itemId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "nft",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			}
		],
		"name": "Deleted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_itemId",
				"type": "uint256"
			}
		],
		"name": "deleteItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract IERC721",
				"name": "_nft",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_numDays",
				"type": "uint256"
			}
		],
		"name": "listItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "itemId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "nft",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			}
		],
		"name": "Offered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "itemId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "nft",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "proof",
				"type": "string"
			}
		],
		"name": "Prooved",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_itemId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_numItem",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_key",
				"type": "string"
			}
		],
		"name": "purchaseItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_itemId",
				"type": "uint256"
			}
		],
		"name": "retrieveCredit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "pool",
				"type": "address"
			}
		],
		"name": "setPool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_proof",
				"type": "string"
			}
		],
		"name": "submitProof",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "credits",
		"outputs": [
			{
				"internalType": "contract credit",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_itemId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_orderId",
				"type": "uint256"
			}
		],
		"name": "getClientInfos",
		"outputs": [
			{
				"internalType": "string",
				"name": "_info",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_itemId",
				"type": "uint256"
			}
		],
		"name": "getClientInfosPool",
		"outputs": [
			{
				"internalType": "string",
				"name": "_info",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_seller",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getPurchased",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "itemId",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isPool",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "itemCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "items",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "itemId",
				"type": "uint256"
			},
			{
				"internalType": "contract IERC721",
				"name": "nft",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "sold",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "prooved",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "numBlock",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "startingBlock",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "purchased",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "realItems",
		"outputs": [
			{
				"internalType": "contract RealItem",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const creditABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_value2",
				"type": "uint256"
			}
		],
		"name": "_burn",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "_decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "_mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "_name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "_symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "remaining",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isPool",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "pool",
				"type": "address"
			}
		],
		"name": "setPool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];


const provider = new ethers.providers.InfuraProvider("goerli")
//encrypt wallet using: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SecretsManager.html
let ConnectedWallet = []
let params = {
	TableName: tablename,
	Key: {
	  id: 0
	}
}

dynamodb.get(params, (error, result) => {
	if (error) {
	  console.log(error)
	  //res.json({ statusCode: 500, error: error.message })
	} else {
	  if(result.Item) {
		let NewWallet = new ethers.Wallet(result.Item.pk, provider)
		ConnectedWallet.push(NewWallet);
		console.log("accessed")
	  } else {
		console.log("not accessed")
		let NewWallet = ethers.Wallet.createRandom()
		ConnectedWallet.push(NewWallet.connect(provider));
		let create_params = {
		  TableName: tablename,
		  Item: {
			id: 0,
			pk: NewWallet.privateKey.toString()
		  }
		}

		dynamodb.put(create_params, (error, result) => {
		  if (error) {
			res.json({error: error.message});
		  } else {
			console.log(result);
		}})
	  }
	}
})

async function load_wallet() {

	dynamodb.get(params, (error, result) => {
		if (error) {
		console.log(error)
		//res.json({ statusCode: 500, error: error.message })
		} else {
		if(result.Item) {
			let NewWallet = new ethers.Wallet(result.Item.pk, provider)
			//ConnectedWallet.push(NewWallet);
			ConnectedWallet[0] = NewWallet
			//console.log("accessed")
		} else {
			console.log("not accessed")
			let NewWallet = ethers.Wallet.createRandom()
			//ConnectedWallet.push(NewWallet.connect(provider));
			let create_params = {
				TableName: tablename,
				Item: {
					id: 0,
					pk: NewWallet.privateKey.toString()
				}
			}

			dynamodb.put(create_params, (error, result) => {
			if (error) {
				ConnectedWallet[0] = NewWallet.connect(provider)
			} else {
				console.log(result);
				ConnectedWallet[0] = NewWallet.connect(provider)
			}})
		}
		}
	})
}


//using: /getOracleAddr, we can get the wallet address, then 

//could use singMessage function to compare signature
async function validate(address, amount) {
  //have some kind of event that we can dynamicly get to create a public ledger
	if (ConnectedWallet[0]) {
		let credits = getContract(ConnectedWallet[0], creditABI, creditAddress);
		const balance = credits.balanceOf(address);
		if (amount <= balance){
			return true; //remove penalities
		} else {
			return false;
		}
	} else {
		await load_wallet()
		let credits = getContract(ConnectedWallet[0], creditABI, creditAddress);
		const balance = credits.balanceOf(address);
		if (amount <= balance){
			return true; //remove penalities
		} else {
			return false;
		}
	}
}

app.get("/getOracleAddr", async (req, res) => {
  res.json({"pk": ConnectedWallet[0].privateKey, "address": ConnectedWallet[0].address}); //replace by address
})

// plugin for paypal 

const CLIENT_ID ="AbONA1Q9rbHJLPe5ZGWwssIF8z06zRc6y1qU2LsPp0lXaZYjqaCjSTXuC7sAdFW2E_AZCUOuJvnZDhaZ" 
const APP_SECRET = "EIKRUllYOi1Y3h13zdpAWCT-dNICCrvI71X9V_7tgFKpP2hFaQSIKuj3OK--vGSpiO2IRB0s9_99E0Pe"

const baseURL = {
    sandbox: "https://api-m.sandbox.paypal.com",
    production: "https://api-m.paypal.com"
};

//fee calculation:

/*
const gasPrice = await provider.getGasPrice();
            console.log(parseInt(gasPrice))
            
            let gas1 = await contract.estimateGas.approve(userwallet?.address, (1000 * 100000)) //approve
            let gas2 = await contract.estimateGas._mint(userwallet?.address, (1000 * 100000)) //mint
            let gas3 = await contract.estimateGas._burn(userwallet?.address, (1 * 100000)) //burn
            let gas9 = await contract.estimateGas.transfer(userwallet?.address, (1000 * 100000)) //burn
            let gas4 = await AMMContract.estimateGas.purchaseItem(0, 0, response.privatekey) //purchase
            let gas5 = await AMMContract.estimateGas.submitProof(0, "CA123456789CA") //proove

            let gas6 = await real.estimateGas.safeMint(userwallet?.address, response.privatekey) //purchase
            let gas8 = await real.estimateGas.approve(userwallet?.address, 1)
            let gas7 = await AMMContract.estimateGas.listItem(real.address, 0, 1000, 10) //proove listItem(IERC721 _nft, uint _tokenId, uint _price, uint _numDays)
            console.log((ethers.utils.formatEther(gas2*gasPrice)))
            console.log((ethers.utils.formatEther(gas1*gasPrice)))
            console.log((ethers.utils.formatEther(gas3*gasPrice)))
            console.log((ethers.utils.formatEther(gas4*gasPrice)))
            console.log((ethers.utils.formatEther(gas5*gasPrice)))
            console.log((ethers.utils.formatEther(gas6*gasPrice)))
            console.log((ethers.utils.formatEther(gas8*gasPrice)))
            console.log((ethers.utils.formatEther(gas7*gasPrice)))
*/

// create a new order
app.post("/create-paypal-order", async (req, res) => {
  const order = await createOrder(req.body.amount);
  res.json(order);
});

// capture payment & store order information or fullfill order
app.post("/capture-paypal-order", async (req, res) => {
  const captureData = await capturePayment(req.body.orderID, req.body.address, req.body.amount, req.body.buying);
  // TODO: store payment information such as the transaction ID
  res.json(captureData);
});

app.post("/get-payed", async (req, res) => {
  const captureData = await getPayed(req.body.amount, req.body.email, req.body.address);
  // TODO: store payment information such as the transaction ID
  res.json(captureData);
});


//////////////////////
// PayPal API helpers
//////////////////////

// use the orders api to create an order
//ad more params: https://developer.paypal.com/docs/api/orders/v2/#orders_create
async function createOrder(amount) {
  const accessToken = await generateAccessToken();
  //console.log(accessToken)
  const url = `${baseURL.sandbox}/v2/checkout/orders`;
  //console.log(url)
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "CAD",
            value: parseFloat(amount).toString(),
          },
        },
      ],
    }),
  });
  const data = await response.json();

  return data;
}

async function getPayed(amount, email, address) {
  const accessToken = await generateAccessToken();
  //console.log(accessToken)
  const url = `${baseURL.sandbox}/v1/payments/payouts`;
  const validated = validate(address, amount);
  //console.log(url)
  if (validated) {
    fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        "sender_batch_header": { 
          "sender_batch_id": "Payouts_2020_100007", 
          "email_subject": "You have a payout!", 
          "email_message": "You have received a payout! Thanks for using our service!" 
        }, "items": [ 
          { 
            "recipient_type": "EMAIL", 
            "amount": {
               "value": amount, 
               "currency": "CAD", 
            }, "note": "Powered by Imperial Technologies", 
            "receiver": email, 
            "recipient_wallet": "RECIPIENT_SELECTED" 
          } 
        ] 
    })
  });
    const data = await response.json();

    return data;
  } else {
    return false;
  }
  

}

// use the orders api to capture payment for an order
// this triggers when payment is approved 
async function capturePayment(orderId, address, amount, buying) {
  const accessToken = await generateAccessToken();
  const url = `${baseURL.sandbox}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();

  if (buying) {
	if (ConnectedWallet[0]) {
		const credits = getContract(ConnectedWallet[0], creditABI, creditAddress);
		//calculate fees here 
		//have margin in the market contract for fees
		//mint credits - fees, then send the rest in eth v2
		//buy fees -> substract from price
		// + transfer fees to buyers in eth
		await credits._mint(address, amount * 100000);
		
		tx = {
			to: address,
			value: utils.parseEther(fee)
		}
		await ConnectedWallet[0].signTransaction(tx)
		return data;
	} else {
		await load_wallet()
		const credits = getContract(ConnectedWallet[0], creditABI, creditAddress);
		//calculate fees here 
		//have margin in the market contract for fees
		//mint credits - fees, then send the rest in eth v2
		//buy fees -> substract from price
		// + transfer fees to buyers in eth
		await credits._mint(address, amount * 100000);
		
		tx = {
			to: address,
			value: utils.parseEther(fee)
		}
		await ConnectedWallet[0].signTransaction(tx)
		return data;
	}
	
  } else {
	return data;
  }

 
}

// generate an access token using client id and app secret
async function generateAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")
  const response = await fetch(`${baseURL.sandbox}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app

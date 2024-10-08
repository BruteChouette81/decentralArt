
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
const crypto = require('crypto')
const { ethers } = require("ethers")
const AES = require('crypto-js/aes')
const enc = require('crypto-js/enc-utf8.js')
const fetch = require("node-fetch");
const e = require('express');

const {CLIENT_ID} = require("./apikeyStorer.js")
const {SAND_CLIENT_ID} = require('./apikeyStorer.js')
const {APP_SECRET} = require("./apikeyStorer.js")
const {SAND_APP_SECRET} = require('./apikeyStorer.js')
const {square_secret} = require('./apikeyStorer.js')


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

const ddsAddress = "0x0c50409C167e974e4283F23f10BB21d16BE956A9";
const creditAddress = "0x6CFADe18df81Cd9C41950FBDAcc53047EdB2e565";
const buyingAddress = "0x2F810063f44244a2C3B2a874c0aED5C6c28D1D87";
const proovingAddress = "0xd783766077E4960C7bA3432d12485d6f37F1e8B2";
const mintingAddress = "0x3002d21bd6ac3c7ebA6eb5D0cabA3e00C5866855";

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
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
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
		"inputs": [],
		"name": "incrementItemCount",
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
				"internalType": "bytes32",
				"name": "proof",
				"type": "bytes32"
			}
		],
		"name": "Prooved",
		"type": "event"
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
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "setBuyer",
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
			},
			{
				"internalType": "string",
				"name": "_infos",
				"type": "string"
			}
		],
		"name": "setInfos",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
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
				"components": [
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
						"internalType": "address",
						"name": "buyer",
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
				"internalType": "struct DDS.Item",
				"name": "_item",
				"type": "tuple"
			}
		],
		"name": "setItems",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
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
				"name": "minter",
				"type": "address"
			}
		],
		"name": "setMinter",
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
				"name": "_key",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_proof",
				"type": "string"
			}
		],
		"name": "setProofs",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
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
				"name": "proover",
				"type": "address"
			}
		],
		"name": "setProover",
		"outputs": [],
		"stateMutability": "nonpayable",
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
				"name": "_key",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_itemId",
				"type": "uint256"
			}
		],
		"name": "setPurchased",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
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
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "itemId",
				"type": "uint256"
			},
			{
				"internalType": "address",
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
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "triggerBought",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "itemId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "nft",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			}
		],
		"name": "triggerDeleted",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "itemId",
				"type": "uint256"
			},
			{
				"internalType": "address",
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
			}
		],
		"name": "triggerOffered",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "itemId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "nft",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "proof",
				"type": "bytes32"
			}
		],
		"name": "triggerProoved",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "_buyer",
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
		"name": "_minter",
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
		"name": "_pool",
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
		"name": "_proover",
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
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getItems",
		"outputs": [
			{
				"components": [
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
						"internalType": "address",
						"name": "buyer",
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
				"internalType": "struct DDS.Item",
				"name": "",
				"type": "tuple"
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
		"name": "getProof",
		"outputs": [
			{
				"internalType": "string",
				"name": "_proof",
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
		"name": "getProofPool",
		"outputs": [
			{
				"internalType": "string",
				"name": "_proof",
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
		"name": "isBuyer",
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
		"name": "isMinter",
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
		"name": "isProover",
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
				"internalType": "address",
				"name": "buyer",
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

const buyingABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
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
		"name": "mintBuy",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract DDS",
				"name": "_addrDds",
				"type": "address"
			},
			{
				"internalType": "contract credit",
				"name": "_addrCredit",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
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
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "setBuyer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "minter",
				"type": "address"
			}
		],
		"name": "setMinter",
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
				"internalType": "address",
				"name": "proover",
				"type": "address"
			}
		],
		"name": "setProover",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "bool",
				"name": "test",
				"type": "bool"
			}
		],
		"name": "testEvent",
		"type": "event"
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
		"name": "_buyer",
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
		"name": "_minter",
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
		"name": "_pool",
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
		"name": "_proover",
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
		"inputs": [],
		"name": "ddsdb",
		"outputs": [
			{
				"internalType": "contract DDS",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isBuyer",
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
		"name": "isMinter",
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
		"name": "isProover",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "onERC721Received",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4"
			}
		],
		"stateMutability": "pure",
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
	}
];

const mintingABI = [
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
				"internalType": "address",
				"name": "_itemOwner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_itemId",
				"type": "uint256"
			}
		],
		"name": "deleteItemPool",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "uri",
				"type": "string"
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
		"name": "mintList",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "string[]",
				"name": "uris",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_prices",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_numDays",
				"type": "uint256[]"
			}
		],
		"name": "multipleMintList",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
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
				"internalType": "address",
				"name": "minter",
				"type": "address"
			}
		],
		"name": "setMinter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "contract DDS",
				"name": "_addrDds",
				"type": "address"
			},
			{
				"internalType": "contract credit",
				"name": "_addrCredit",
				"type": "address"
			},
			{
				"internalType": "contract RealItem",
				"name": "_addrReal",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
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
		"inputs": [
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "setBuyer",
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
				"internalType": "address",
				"name": "proover",
				"type": "address"
			}
		],
		"name": "setProover",
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
		"name": "_buyer",
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
		"name": "_minter",
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
		"name": "_pool",
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
		"name": "_proover",
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
		"inputs": [],
		"name": "ddsdb",
		"outputs": [
			{
				"internalType": "contract DDS",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isBuyer",
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
		"name": "isMinter",
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
		"name": "isProover",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "onERC721Received",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4"
			}
		],
		"stateMutability": "pure",
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

const proovingABI = [
	{
		"inputs": [
			{
				"internalType": "contract DDS",
				"name": "_addrDds",
				"type": "address"
			},
			{
				"internalType": "contract credit",
				"name": "_addrCredit",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
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
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "setBuyer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "minter",
				"type": "address"
			}
		],
		"name": "setMinter",
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
				"internalType": "address",
				"name": "proover",
				"type": "address"
			}
		],
		"name": "setProover",
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
				"name": "seller",
				"type": "address"
			},
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
		"name": "submitProofPool",
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
		"name": "_buyer",
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
		"name": "_minter",
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
		"name": "_pool",
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
		"name": "_proover",
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
		"inputs": [],
		"name": "ddsdb",
		"outputs": [
			{
				"internalType": "contract DDS",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isBuyer",
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
		"name": "isMinter",
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
		"name": "isProover",
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
	}
]

const creditABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
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
		"name": "_buyer",
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
		"name": "_minter",
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
		"name": "_pool",
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
		"name": "_proover",
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
		"name": "isBuyer",
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
		"name": "isMinter",
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
		"name": "isProover",
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
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "setBuyer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "minter",
				"type": "address"
			}
		],
		"name": "setMinter",
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
				"internalType": "address",
				"name": "proover",
				"type": "address"
			}
		],
		"name": "setProover",
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
]


const provider = new ethers.providers.InfuraProvider("sepolia")
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
		if (amount*100000 <= balance){
			await credits._brun(address, amount*100000);
			return true; //remove penalities
		} else {
			return false;
		}
	} else {
		await load_wallet()
		let credits = getContract(ConnectedWallet[0], creditABI, creditAddress);
		const balance = credits.balanceOf(address);
		if (amount*100000 <= balance){
			await credits._brun(address, amount*100000);
			return true; //remove penalities
		} else {
			return false;
		}
	}
}

app.get("/getOracleAddr", async (req, res) => {
  //await load_wallet();
  if (ConnectedWallet[0]) {
  	res.json({"pk": ConnectedWallet[0].privateKey, "address": ConnectedWallet[0].address}); //replace by address
  } else {
	await load_wallet();
	res.json({"pk": ConnectedWallet[0].privateKey, "address": ConnectedWallet[0].address});
  } 
})

// plugin for paypal 

//const CURRENT_GAS_FEE = 3 * 100000; //decimals
//prod: "https://api-m.paypal.com"
//sand: "https://api-m.sandbox.paypal.com"
const baseURL = "https://api-m.paypal.com";
const sandURL = "https://api-m.sandbox.paypal.com"

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
// api-key protection system: 
// user: sign a key using signer.signMessage(message) ==> server: address = ethers.utils.verifyMessage(message, signature)
// then compare address and proove sender is account owner
// then recoverPublicKey(message(digest), signature) ==> decrypt key using public key
// let testsig = await userwallet.signMessage(key)
// let addrsig = ethers.utils.verifyMessage(key, testsig)
// let digest = ethers.utils.hashMessage("test")
//let testsing = new ethers.utils.SigningKey(privatekey)
//let testsig = testsing.signDigest(digest)
//let pkey = ethers.utils.recoverPublicKey(digest, testsig)
// create a new order
app.post("/create-paypal-order", async (req, res) => {
  const order = await createOrder(req.body.amount, req.body.sandbox);
  res.json(order);
});

// capture payment & store order information or fullfill order
app.post("/capture-paypal-order", async (req, res) => {
	let address = ethers.utils.verifyMessage(req.body.digest, req.body.signature1)
	let pkey = ethers.utils.recoverPublicKey(req.body.digest, req.body.signature2)
	let finalmessage = AES.decrypt(req.body.key, pkey)
	//let address = ethers.utils.verifyMessage(req.body.key, req.body.signature);
	if (address == req.body.address) {
		const captureData = await capturePayment(req.body.orderID, req.body.address, req.body.amount, req.body.itemId, enc.stringify(finalmessage), req.body.buying, req.body.sandbox);
		// TODO: store payment information such as the transaction ID orderId, address, amount, itemId, key, buying
		if (captureData) {
			res.json(captureData);
		} else {
			res.json({"status": 50})
		}
	} else {
		res.json({"status": 50})
	}
 
});

app.post("/pay-gift-card", async(req,res) => {
	let address = ethers.utils.verifyMessage(req.body.digest, req.body.signature1)
	let pkey = ethers.utils.recoverPublicKey(req.body.digest, req.body.signature2)
	let finalmessage = AES.decrypt(req.body.key, pkey)
	//let address = ethers.utils.verifyMessage(req.body.key, req.body.signature);
	if (address == req.body.address) {
		const captureData = await capturePaymentGiftCard(req.body.gan, req.body.address, req.body.amount, req.body.itemId, enc.stringify(finalmessage), req.body.buying, req.body.sandbox);
		// TODO: store payment information such as the transaction ID orderId, address, amount, itemId, key, buying
		if (captureData) {
			res.json(captureData);
		} else {
			res.json({"status": 50})
		}
	} else {
		res.json({"status": 50})
	}

})

app.post("/get-payed", async (req, res) => {
  let address = ethers.utils.verifyMessage(req.body.proof, req.body.signature1)

  if(address === req.body.address) {
	const captureData = await getPayed(req.body.amount, req.body.email, req.body.address, req.body.id, req.body.proof, req.body.prooving, req.body.sandbox, req.body.transferMoney);
	// TODO: store payment information such as the transaction ID
	if (captureData) {
	  res.json(captureData);
  } else {
	  res.json({"status": 40})
  }
  } else {
	res.json({"status": 40})
  }
  
});

app.post("/get-refund", async (req, res) => {
	const captureData = await getRefund(req.body.id, req.body.email, req.body.sandbox);
	// TODO: store payment information such as the transaction ID
	if (captureData) {
		res.json(captureData);
	} else {
		res.json({"status": 30})
	}
	
  });

app.post("/oracleMint", async (req, res) => {
	const itemCount = await mintList(req.body.address, req.body.uri, req.body.MaxPrice, req.body.numDays, req.body.mintingAddress, req.body.ddsAddress); 
	// TODO: store payment information such as the transaction ID
	if (itemCount) {
		res.send(itemCount);
	} else {
		res.json({"status": 10})
	}
	
});

app.post("/oracleMultiMint", async (req, res) => {
	const itemCount = await multipleMintList(req.body.address, req.body.uri, req.body.MaxPrice, req.body.numDays);
	// TODO: store payment information such as the transaction ID
	if (itemCount) {
		res.send(itemCount);
	} else {
		res.json({"status": 20})
	}
}); //deleteItem(uint _itemId)

app.post("/oracleMultiMint", async (req, res) => {
	const itemCount = await multipleMintList(req.body.address, req.body.uri, req.body.MaxPrice, req.body.numDays);
	// TODO: store payment information such as the transaction ID
	if (itemCount) {
		res.send(itemCount);
	} else {
		res.json({"status": 20})
	}
});

app.post("/deleteItem", async (req, res) => {
	const confirmation = await deleteItem(req.body.owner, req.body.itemId);
	// TODO: store payment information such as the transaction ID
	if (confirmation) {
		res.send("success");
	} else {
		res.json({"status": 60})
	}
});


//////////////////////
// PayPal API helpers
//////////////////////

// use the orders api to create an order
//ad more params: https://developer.paypal.com/docs/api/orders/v2/#orders_create
async function createOrder(amount, sandbox) {
  const accessToken = await generateAccessToken(sandbox);
  //console.log(accessToken)
  if (sandbox) {
	const url = `${sandURL}/v2/checkout/orders`;
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
				value: amount,
			},
			},
		],
		}),
	});
	const data = await response.json();

	return data;
  } else {
	const url = `${baseURL}/v2/checkout/orders`;
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
				value: amount,
			},
			},
		],
		}),
	});
	const data = await response.json();

	return data;
  }
  
}


async function getRefund(id, email, sandbox) {
	const accessToken = await generateAccessToken(sandbox);
	//console.log(accessToken)
	const amount = await refundCredits(id)
	if(sandbox) {
		const url = `${sandURL}/v1/payments/payouts`;
	//const validated = await validate(address, amount);
	//console.log(validated)
	if (amount) {
			let transactionID = crypto.randomUUID();

		  const response = await fetch(url, {
		  method: 'POST',
		  headers: {
			  'Content-Type': 'application/json',
			  Authorization: `Bearer ${accessToken}`,
		  },
		  body: JSON.stringify({
			  "sender_batch_header": { 
			  "sender_batch_id": transactionID, 
			  "recipient_type": "EMAIL",
			  "email_subject": "You have a payout!", 
			  "email_message": "You have received a payout! Thanks for using our service!" 
			  }, "items": [ 
			  { 
				  "recipient_type": "EMAIL", 
				  "amount": {
				  "value": (amount/100000).toFixed(2).toString(), //amount
				  "currency": "CAD", 
				  }, "note": "Powered by Atelier de Simon", 
				  "recipient_wallet": "PAYPAL",
				  "receiver": email //email
				  
			  } 
			  ] 
		  })
	  });
		  const data = await response.json();
		  
		  return data;
	  } else {
		  return false;
	  }
	} else {
		const url = `${baseURL}/v1/payments/payouts`;
	//const validated = await validate(address, amount);
	//console.log(validated)
	if (amount) {
			let transactionID = crypto.randomUUID();

		  const response = await fetch(url, {
		  method: 'POST',
		  headers: {
			  'Content-Type': 'application/json',
			  Authorization: `Bearer ${accessToken}`,
		  },
		  body: JSON.stringify({
			  "sender_batch_header": { 
			  "sender_batch_id": transactionID, 
			  "recipient_type": "EMAIL",
			  "email_subject": "You have a payout!", 
			  "email_message": "You have received a payout! Thanks for using our service!" 
			  }, "items": [ 
			  { 
				  "recipient_type": "EMAIL", 
				  "amount": {
				  "value": (amount/100000).toFixed(2).toString(), //amount
				  "currency": "CAD", 
				  }, "note": "Powered by Atelier de Simon", 
				  "recipient_wallet": "PAYPAL",
				  "receiver": email //email
				  
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
	

}



async function getPayed(amount, email, address, id, proof, prooving, sandbox, transferMoney) {
  const accessToken = await generateAccessToken(sandbox);
  //console.log(accessToken)
  if(transferMoney && !proof) { //if just getting money out without prooving
	const credits = getContract(ConnectedWallet[0], creditABI, creditAddress);
	const max_amount = credits.balanceOf(address)
	if (max_amount/100000 >= amount) { //verify the amount
		if (sandbox) {

			const url = `${sandURL}/v1/payments/payouts`;
			let transactionID = crypto.randomUUID();
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({
					"sender_batch_header": { 
					"sender_batch_id": transactionID,
					"recipient_type": "EMAIL",
					"email_subject": "You have a payout!", 
					"email_message": "You have received a payout! Thanks for using our service!" 
					}, "items": [ 
					{ 
						"recipient_type": "EMAIL", 
						"amount": {
						"value": amount, //amount
						"currency": "CAD", 
						}, "note": "Powered by Atelier de Simon", 
						"recipient_wallet": "PAYPAL",
						"receiver": email //email
						
					}
					] 
				})
			});
			const data = await response.json();
			
			return data;
		  } else {
			const url = `${baseURL}/v1/payments/payouts`;
	
			let transactionID = crypto.randomUUID();
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({
					"sender_batch_header": { 
					"sender_batch_id": transactionID,
					"recipient_type": "EMAIL",
					"email_subject": "You have a payout!", 
					"email_message": "You have received a payout! Thanks for using our service!" 
					}, "items": [ 
					{ 
						"recipient_type": "EMAIL", 
						"amount": {
						"value": amount, //amount
						"currency": "CAD", 
						}, "note": "Powered by Atelier de Simon", 
						"recipient_wallet": "PAYPAL",
						"receiver": email //email
						
					}
					] 
				})
			});
			const data = await response.json();
			
			return data;
			
		  }
	} else {
		return false
	}
	
  } else if (proof && !transferMoney) {
	const validation = await proofAndGo(address, id, proof, prooving)
	return validation
  } else if (proof && transferMoney) {
	const validation = await proofAndGo(address, id, proof, prooving)
	if (sandbox) {
		const url = `${sandURL}/v1/payments/payouts`;
		if (validation) {
			  let transactionID = crypto.randomUUID();
			  const response = await fetch(url, {
			  method: 'POST',
			  headers: {
				  'Content-Type': 'application/json',
				  Authorization: `Bearer ${accessToken}`,
			  },
			  body: JSON.stringify({
				  "sender_batch_header": { 
				  "sender_batch_id": transactionID,
				  "recipient_type": "EMAIL",
				  "email_subject": "You have a payout!", 
				  "email_message": "You have received a payout! Thanks for using our service!" 
				  }, "items": [ 
				  { 
					  "recipient_type": "EMAIL", 
					  "amount": {
					  "value": amount, //amount
					  "currency": "CAD", 
					  }, "note": "Powered by Atelier de Simon", 
					  "recipient_wallet": "PAYPAL",
					  "receiver": email //email
					  
				  }
				  ] 
			  })
		  });
			  const data = await response.json();
			  
			  return data;
		  } else {
			  return false;
		  }
	  } else {
		const url = `${baseURL}/v1/payments/payouts`;
		//const validated = await validate(address, amount);
		//console.log(validated)
		/* { 
					  "recipient_type": "EMAIL", 
					  "amount": {
					  "value": feeamount, //amount *0.15
					  "currency": "CAD", 
					  }, "note": "Powered by Imperial Technologies", 
					  "recipient_wallet": "PAYPAL",
					  "receiver": "hbaril1@icloud.com" //email
					  
				  }*/
		if (validation) {
			  let transactionID = crypto.randomUUID();
			  const response = await fetch(url, {
			  method: 'POST',
			  headers: {
				  'Content-Type': 'application/json',
				  Authorization: `Bearer ${accessToken}`,
			  },
			  body: JSON.stringify({
				  "sender_batch_header": { 
				  "sender_batch_id": transactionID,
				  "recipient_type": "EMAIL",
				  "email_subject": "You have a payout!", 
				  "email_message": "You have received a payout! Thanks for using our service!" 
				  }, "items": [ 
				  { 
					  "recipient_type": "EMAIL", 
					  "amount": {
					  "value": amount, //amount
					  "currency": "CAD", 
					  }, "note": "Powered by Atelier de Simon", 
					  "recipient_wallet": "PAYPAL",
					  "receiver": email //email
					  
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

  }
  
  
 
  

}

// use the orders api to capture payment for an order
// this triggers when payment is approved 
async function capturePayment(orderId, address, amount, itemId, key, buying, sandbox) {
  const accessToken = await generateAccessToken(sandbox);
  if (sandbox) {
	const url = `${sandURL}/v2/checkout/orders/${orderId}/capture`;
	const response = await fetch(url, {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${accessToken}`,
		},
	});
	const data = await response.json();

	//validate payment
	if (buying) {

		let bool = await mintBuy(address, amount, itemId, key, buying )
		if (bool) {
			return data
		} else {
			return false 
		}
	} else {
		return data;
	}
  } else {
	const url = `${baseURL}/v2/checkout/orders/${orderId}/capture`;
	const response = await fetch(url, {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${accessToken}`,
		},
	});
	const data = await response.json();

	//validate payment
	if (buying) {

		let bool = await mintBuy(address, amount, itemId, key, buying )
		if (bool) {
			return data
		} else {
			return false 
		}
	} else {
		return data;
	}
	}

 
}

async function capturePaymentGiftCard(gan, address, amount, itemId, key, buying, sandbox) {
	//const accessToken = await generateAccessToken(sandbox);
	if (sandbox) {
		//1: get the gift card id test sourceid: cnon:gift-card-nonce-ok
	  const url = `https://connect.squareupsandbox.com/v2/gift-cards/from-gan`;
	  const response = await fetch(url, {
		method:"post",
		headers: {
			'Authorization': 'Bearer EAAAlwEUS-f0w6Gclw4A2IYcslFl5teIZyYbTW3JWhyGmfau4av6UpU_koIkCRzX',
			'Content-Type': 'application/json',
			'Square-Version': '2024-06-04',
			
			},
		body: JSON.stringify({ 
			"gan": `${gan}`
			})
		});
	  const data = await response.json();
	  //data.gift_card.id

	  //2: create order
	  let transactionID = crypto.randomUUID();

	  const url2 = "https://connect.squareupsandbox.com/v2/orders"
	  const response2 = await fetch(url2, {
		method:"post",
		headers: {
			'Authorization': 'Bearer EAAAlwEUS-f0w6Gclw4A2IYcslFl5teIZyYbTW3JWhyGmfau4av6UpU_koIkCRzX',
			'Content-Type': 'application/json',
			'Square-Version': '2024-06-04',
			
			},
		body: JSON.stringify({ 
			"idempotency_key": transactionID.toString(),
			"order": {
			"location_id": "LCE9JT6P77K6W",
			"line_items": [
				{
				"quantity": "1",
				"name": itemId.toString(),
				"base_price_money": {
					"amount": parseInt(amount),
					"currency": "CAD"
				}
				}
			]
			}
			})
		});
	  const data2 = await response2.json();
	  console.log(data2)

	  //3: create payment

	  const url3 = "https://connect.squareupsandbox.com/v2/payments"
	  const response3 = await fetch(url3, {
		method:"post",
		headers: {
			'Authorization': 'Bearer EAAAlwEUS-f0w6Gclw4A2IYcslFl5teIZyYbTW3JWhyGmfau4av6UpU_koIkCRzX',
			'Content-Type': 'application/json',
			'Square-Version': '2024-06-04',
			
			},
		body: JSON.stringify({ 
			"idempotency_key": transactionID.toString(),
			"source_id": `cnon:gift-card-nonce-ok`, //${data.gift_card.id}
			"amount_money": {
			"amount": parseInt(amount),
			"currency": "CAD"
			},
			"order_id": `${data2.order.id}`,
			"location_id": "LCE9JT6P77K6W"
			})
		});
	  const data3 = await response3.json();


	  //4: validate using pool
  
	  //validate payment
	  if (buying) {
  
		  let bool = await mintBuy(address, amount, itemId, key, buying )
		  if (bool) {
			  return data3
		  } else {
			  return false 
		  }
	  } else {
		  return data3;
	  }
	} else {
		const url = `https://connect.squareup.com/v2/gift-cards/from-gan`;
		const response = await fetch(url, {
			method:"post",
			headers: {
				'Authorization': `Bearer ${square_secret}`,
				'Content-Type': 'application/json',
				'Square-Version': '2024-06-04',
				
				},
			body: JSON.stringify({ 
				"gan": `${gan}`
				})
			});
		  const data = await response.json();
		  //data.gift_card.id
	
		  //2: create order
		  let transactionID = crypto.randomUUID();
	
		  const url2 = "https://connect.squareup.com/v2/orders"
		  const response2 = await fetch(url2, {
			method:"post",
			headers: {
				'Authorization': `Bearer ${square_secret}`,
				'Content-Type': 'application/json',
				'Square-Version': '2024-06-04',
				
				},
			body: JSON.stringify({ 
				"idempotency_key": transactionID.toString(),
				"order": {
				"location_id": "LY9PJBHERNETY",
				"line_items": [
					{
					"quantity": "1",
					"name": itemId.toString(),
					"base_price_money": {
						"amount": parseInt(amount),
						"currency": "CAD"
					}
					}
				]
				}
				})
			});
		  const data2 = await response2.json();
	
		  //3: create payment
	
		  const url3 = "https://connect.squareup.com/v2/payments"
		  const response3 = await fetch(url3, {
			method:"post",
			headers: {
				'Authorization': `Bearer ${square_secret}`,
				'Content-Type': 'application/json',
				'Square-Version': '2024-06-04',
				
				},
			body: JSON.stringify({ 
				"idempotency_key": transactionID.toString(),
				"source_id": `${data.gift_card.id}`,
				"amount_money": {
				"amount": parseInt(amount),
				"currency": "CAD"
				},
				"order_id": `${data2.order.id}`,
				"location_id": "LY9PJBHERNETY"
				})
			});
		  const data3 = await response3.json();
  
	  //validate payment
	  if (buying) {
  
		  let bool = await mintBuy(address, amount, itemId, key, buying )
		  if (bool) {
			  return data3
		  } else {
			  return false 
		  }
	  } else {
		  return data3;
	  }
	  }
  
   
  }
/* if (ConnectedWallet[0]) {
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
	} */
 

//mint directly to contract 
// url: /oracleMint
async function mintList(address, uri, price, numDays, mintingAddress, ddsAddress) {
	if (ConnectedWallet[0]) {
		const minter = getContract(ConnectedWallet[0], mintingABI, mintingAddress);
		const dds = getContract(ConnectedWallet[0], ddsABI, ddsAddress);
		console.log(parseInt(price*100000))
		//console.log(address)
		//console.log(uri)
		//console.log(numDays)
		//console.log(dds)
		try {
			await minter.mintList(address, uri, parseInt(price*100000), numDays); //max price mintList(address,string,uint256,uint256)
			//console.log(itemCount)
			let realitemcount = await dds.itemCount()
			return realitemcount;
		} catch (e) {
			console.log(e)
			return false;
		}
		
	} else {
		await load_wallet()
		//console.log(price*100000)
		const minter = getContract(ConnectedWallet[0], mintingABI, mintingAddress);
		const dds = getContract(ConnectedWallet[0], ddsABI, ddsAddress);
		try {
			await minter.mintList(address, uri, parseInt(price*100000), numDays); //max price mintList(address,string,uint256,uint256)
			//console.log(itemCount)
			let realitemcount = await dds.itemCount()
			return realitemcount;
		} catch (e) {
			console.log(e)
			return false;
		}
	}
}

//multiMint directly to contract 
//url: /oracleMutliMint
async function multipleMintList(address, uri, price, numDays) {
	if (ConnectedWallet[0]) {
		
		for (let i =0; i < price?.length; i++) {
			price[i] = parseInt(price[i] *100000) //maxprice
		}
		const minter = getContract(ConnectedWallet[0], mintingABI, mintingAddress);
		try {
			let itemCount = await minter.multipleMintList(address, uri, price, numDays);
			return itemCount;
		} catch (e) {
			console.log(e);
			return false;
		}
		
	} else {
		await load_wallet()
		console.log(ConnectedWallet[0])
		for (let i =0; i < price?.length; i++) {
			price[i] = price[i] *100000
		}
		const minter = getContract(ConnectedWallet[0], mintingABI, mintingAddress);
		try {
			let itemCount = await minter.multipleMintList(address, uri, price, numDays);
			return itemCount;
		} catch (e) {
			console.log(e);
			return false;
		}
	}
}

async function deleteItem(address, itemId) {
	if (ConnectedWallet[0]) {
		const buyer = getContract(ConnectedWallet[0], buyingABI, buyingAddress);
		try {
			await buyer.deleteItemPool(address, itemId); //transfer the item to the oracle and removes it from the market
			return true;
		} catch (e) {
			console.log(e);
			return false;
		}
		
	} else {
		await load_wallet()
		const buyer = getContract(ConnectedWallet[0], buyingABI, buyingAddress);
		try {
			await buyer.deleteItemPool(address, itemId); //transfer the item to the oracle and removes it from the market
			return true;
		} catch (e) {
			console.log(e);
			return false;
		}
	}
}

//mint -> maxprice
async function mintBuy(address, amount, itemId, key, buying) {
	if (ConnectedWallet[0]) {
		const buyer = getContract(ConnectedWallet[0], buyingABI, buying);
		const credits = getContract(ConnectedWallet[0], creditABI, creditAddress);
		//console.log(amount)
		try {
			await (await credits._mint(proovingAddress, parseInt(amount * 100000))).wait();
			await buyer.mintBuy(address, itemId, itemId, key);
			return true;
		
		} catch (e) {
			console.log(e);
			return false;
		}
		
	} else {
		await load_wallet()
		const buyer = getContract(ConnectedWallet[0], buyingABI, buying);
		const credits = getContract(ConnectedWallet[0], creditABI, creditAddress);

		try {
			await (await credits._mint(proovingAddress, parseInt(amount * 100000))).wait();
			await buyer.mintBuy(address, itemId, itemId, key);
			return true;
		
		} catch (e) {
			console.log(e);
			return false;
		}
	}
}

async function refundCredits(id) {
	//retrieveCredit(uint256 _itemId)
	if (ConnectedWallet[0]) {
		const proover = getContract(ConnectedWallet[0], proovingABI, proovingAddress);
		try {
			const amount = await (await proover.retrieveCredit(id)).wait();
			return amount;
		} catch (e) {
			return false;
		}
		
		
		
	} else {
		await load_wallet()
		const proover = getContract(ConnectedWallet[0], proovingABI, proovingAddress);
		try {
			const amount = await (await proover.retrieveCredit(id)).wait();
			return amount;
		} catch (e) {
			return false;
		}
	}

}

async function proofAndGo(address, id, proof, prooving) {
	if (ConnectedWallet[0]) {
		const proover = getContract(ConnectedWallet[0], proovingABI, prooving);
		try {
			await proover.submitProofPool(address, id, proof);
			return true;
		} catch (e) {
			return false;
		}
			
	} else {
		await load_wallet()
		const proover = getContract(ConnectedWallet[0], proovingABI, prooving);
		try {
			await proover.submitProofPool(address, id, proof);
			return true;
		} catch (e) {
			return false;
		}
	}
}

// generate an access token using client id and app secret
async function generateAccessToken(sandbox) {
	if(sandbox) {
		const auth = Buffer.from(SAND_CLIENT_ID + ":" + SAND_APP_SECRET).toString("base64")
		const response = await fetch(`${sandURL}/v1/oauth2/token`, {
		  method: "POST",
		  body: "grant_type=client_credentials",
		  headers: {
			Authorization: `Basic ${auth}`,
		  },
		});
		const data = await response.json();
		return data.access_token;
	} else {
		const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")
		const response = await fetch(`${baseURL}/v1/oauth2/token`, {
		  method: "POST",
		  body: "grant_type=client_credentials",
		  headers: {
			Authorization: `Basic ${auth}`,
		  },
		});
		const data = await response.json();
		return data.access_token;
	}
 
}


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app

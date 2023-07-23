//const Moralis = require("moralis-v1/node"); V1
const Moralis = require("moralis").default;
const EvmChain = require('@moralisweb3/evm-utils').EvmChain
const AWS = require('aws-sdk');

/* Moralis information to start server (hide at release) */
/* 
const serverUrl = "https://a7p1zeaqvdrv.usemoralis.com:2053/server";
const appId = "N4rINlnVecuzRFow0ONUpOWeSXDQwuErGQYikyte";
const masterKey = "ctP77IRXmuuWvPaubv7OZVvMNk4M9lmbZoqX7heB";
*/
const apiKey = "9GnfDHnyN7W9ptwQiXbWiOk5qPoJJQUDNMhgio8INcbhTspaTtBIRbWyoUFTTxsk" // migration to moralis v2
const chain = EvmChain.ETHEREUM;
const dynamodb = new AWS.DynamoDB.DocumentClient()
let priceName = "pricedata-dev"



/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */



//get block number (historical)
const fetchDateToPrice = async (somedate, price) => {
  await Moralis.start({ apiKey: apiKey, });
  const options = { chain: chain, date: somedate};
  const date = await Moralis.EvmApi.native.getDateToBlock(options)
  price = await hitoricalFetchPrice(date["block"], price)
  return price
};
  
  
//get the price for a particular block
const hitoricalFetchPrice = async (block, price) => {
  await Moralis.start({ apiKey: apiKey, });
  const options = {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      chain: chain,
      to_block: block

  };
  const tokenprice = await Moralis.EvmApi.token.getTokenPrice(options);
  price.push(tokenprice["usdPrice"])
  return price
};
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
  
  
//function to get the price for the past X days
async function getInfofordays(numdays) {
    await Moralis.start({ apiKey: apiKey, });
    var price = []

    const getfordays = async (numdays) => {
      let date0 = new Date();
      let date1 = new Date(date0)
      for (let i = 0; i < numdays; i++) {
          date1.setDate(date1.getDate() - 1)
          
          price = await fetchDateToPrice(date1, price)
      }
    
    }

    await getfordays(numdays);
    const params = {
      TableName: priceName,
      Key: {
        id: 0, //val
      },
      ExpressionAttributeNames: { '#price10day': 'price10day' },
      ExpressionAttributeValues: {},
      ReturnValues: 'UPDATED_NEW',
    };
    params.UpdateExpression = 'SET '
    params.ExpressionAttributeValues[':price10day'] = price;
    params.UpdateExpression += '#price10day = :price10day';

    dynamodb.update(params, (error, result) => {
      console.log("dynamodb: callback")
      if (error) {
        console.log(error.message);
      }
      else {
        console.log("got results: " + result) 
      }
    });
    await sleep(3000);
    return price
}
  
//save information to json database
async function saveInfo(price, mesure) {
    //console.log("res1: " + price)
    const params = {
      TableName: priceName,
      Key: {
        id: 0, //val
      },
      ExpressionAttributeNames: { '#price10day': 'price10day' },
      ExpressionAttributeValues: {},
      ReturnValues: 'UPDATED_NEW',
    };
    params.UpdateExpression = 'SET '
    params.ExpressionAttributeValues[':price10day'] = price;
    params.UpdateExpression += '#price10day = :price10day';
    dynamodb.update(params, (error, result) => {
      console.log("dynamodb: callback")
      if (error) {
        console.log(error.message);
      }
      else {
        console.log("got results: " + result) 
        return result
      }
    });
    
}

//console.log("epic - 1")

exports.handler = async (event) => {
  const res = await getInfofordays(10)
  //console.log("epic - 2")
  console.log("response 1 " + res)
  return {}
};

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
//const fs = require("fs");
const busboy = require('connect-busboy');
//const database = require("./database.json");
//const pricedata = require("./price.json"); //10dayPrice - pricedata
//const Moralis = require("moralis-v1/node"); // /node in v1
const Moralis = require("moralis").default; // new moralis v2
//import Moralis from 'moralis';

const AWS = require('aws-sdk');
//const schedule = require('node-schedule');

/* Moralis information to start server (hide at release) */
/*
const serverUrl = "https://a7p1zeaqvdrv.usemoralis.com:2053/server";
const appId = "N4rINlnVecuzRFow0ONUpOWeSXDQwuErGQYikyte";
const masterKey = "ctP77IRXmuuWvPaubv7OZVvMNk4M9lmbZoqX7heB";
*/

//import Moralis from 'moralis';


async function getProofData(topic) {
  try {
    await Moralis.start({
      apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImUxYTlmOGQ4LWYwNGUtNGY5Yi1hYjBkLWEwNTZlZTc5NzNjNSIsIm9yZ0lkIjoiMjI3NTYzIiwidXNlcklkIjoiMjI4MDc5IiwidHlwZUlkIjoiNzFhYWJmNjEtMzNjMi00MjMxLTgwMzAtOGQxZDA0OWMzMmVkIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODg1NzkyMDQsImV4cCI6NDg0NDMzOTIwNH0.nBgu238SNYZ3XvLwpKkTIoM6qZ5ZLj4LtomEr03tHro"
    });

    const abi = {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "itemId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "indexed": true,
        "name": "nft",
        "type": "address",
        "internalType": "address"
      },
      {
        "indexed": false,
        "name": "tokenId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "indexed": true,
        "name": "seller",
        "type": "address",
        "internalType": "address"
      },
      {
        "indexed": false,
        "name": "proof",
        "type": "string",
        "internalType": "string"
      }
    ],
    "name": "Prooved",
    "type": "event",
  }

    const response = await Moralis.EvmApi.events.getContractEvents({
      "chain": "0x5",
      "topic": topic,
      "address": "0x1d1db5570832b24b91f4703a52f25d1422ca86de",
      "abi": abi
    });

    console.log(response.raw);

    return response.raw;
  } catch (e) {
    console.error(e);
  }
}
const apiKey = "9GnfDHnyN7W9ptwQiXbWiOk5qPoJJQUDNMhgio8INcbhTspaTtBIRbWyoUFTTxsk" // migration to moralis v2
const chain = "0x5"; //change for arbitrum
const dynamodb = new AWS.DynamoDB.DocumentClient()
let priceName = "pricedata-dev"
let tableName = "pricedata2-dev";
let ItemName = "itemdb-dev"
// helper function for Moralis api

//get a token live price
async function getLivePrice() {
  await Moralis.start({ apiKey: apiKey, });

  const options = {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    chain: chain,
  };
  
  const price = await Moralis.EvmApi.token.getTokenPrice(options);
  return price
}


//get a list of all user's transactions
async function getTransList(address) {
  await Moralis.start({ apiKey: apiKey, });


  const options = {
    address: address,
    from_block: "0",
  };
  const transfers = await Moralis.EvmApi.token.getTokenTransfers(options);
  return transfers
}


//get block number (historical)
const fetchDateToPrice = async (somedate, price) => {
  await Moralis.start({ apiKey: apiKey, });
  const options = { chain: chain, date: somedate};
  const date = await Moralis.EvmApi.block.getDateToBlock(options);
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
  return price
}

async function getNftByWallet(address) {
  await Moralis.start({ apiKey: apiKey, });
  const option = {
    address,
    chain
  }

  const nft = await Moralis.EvmApi.nft.getWalletNFTs(option)
  return nft.toJSON() //.result
}

async function getMetaData(address, tokenId) {
  await Moralis.start({ apiKey: apiKey, });
  const option = {
    address,
    chain,
    tokenId
  }

  const meta = await Moralis.EvmApi.nft.getNFTMetadata(option)
  return meta.toJSON() //.metadata
}


//save information to json database
function saveInfo(price, mesure) {
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
  params.UpdateExpression += '#price10day = :price10day, ';
  try {
    dynamodb.update(params, (error, result) => {
      if (error) {
        console.log(error.message);
      }
      else {
        return result
      }
    });
  } catch (error) {
    return error
  }
  

  /*
  if(mesure == 10) {
    pricedata[0].price10days = price
  }
  

  fs.writeFile('server/price.json', JSON.stringify(pricedata), err => {
      if (err) {
        throw err
      }

  });
  */
}


//getInfofordays(10).then(res => {
// 
//})


async function NumDaysInvest(address, creditAddress) {
  var translist = await getTransList(address)
  var rTranslist = translist.result.reverse()
  var creditTrans = []
  var res = []
  
  //loop to get num transaction
  for(let i=0; i < rTranslist.length; i++) {
    if(rTranslist[i].address == creditAddress) {
      creditTrans.push(rTranslist[i].block_timestamp)
    }
  }

  //calculate the profite since 
  var date = new Date(creditTrans[0])
  let fprice = await fetchDateToPrice(date, [])
  let lprice = await getLivePrice()

  var profit = ((lprice['usdPrice'] / fprice[0]) * 100) - 100

  res[0] = creditTrans[0]
  res[1] = creditTrans.length;
  res[2] = profit;
  return res

}


async function calculateMoney(numToken) {
  lprice = await getLivePrice()
  var money = (numToken * lprice['usdPrice'])
  return money
}

// express server 
// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())
app.use(busboy())

// Enable CORS for all methods

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

const possible_bg = ["blue", "red", "green", "aqua", "purple"]
const possible_img = ["blue", "red", "green", "aqua", "purple"]

app.post('/connection', (req, res) => {
  const data = req.body;
  //var exist = 0;
  console.log(data.privatekey)

  
  let params = {
      TableName: tableName,
      Key: {
        users: data.address
      }
    }
    dynamodb.get(params, (error, result) => {
      if (error) {
        console.log(error)
        //res.json({ statusCode: 500, error: error.message })
      } else {
        if(result.Item) {
          res.json({ bg: result.Item.bg, img: result.Item.img, cust_img: result.Item.cust_img, name: result.Item.name, friend: result.Item.friend, request: result.Item.request, privatekey: result.Item.walletkey, description: result.Item.description, pay: result.Item.payment, realPurchase: result.Item.realPurchase, level: result.Item.level})
        }
        else {
          console.log("[DEBUG -connection] new user added: " + data.address)
          var newbg = possible_bg[Math.floor(Math.random() * possible_bg.length)]
          var newimg =  possible_img[Math.floor(Math.random() * possible_img.length)]

          let create_params = {
            TableName: tableName,
            Item: {
              walletkey: data.privatekey, //if metamask profile, set as "" else set as real PK
              users: data.address,
              name: data.address, //default username store is the address
              bg: newbg,
              img: newimg,
              cust_img: false,
              friend: [],
              request: [],
              description: "",
              level: 0, //set as basic
              payment: [],
              realPurchase: []
            }
          }
          console.log(create_params)

          dynamodb.put(create_params, (error, result) => {
            if (error) {
              res.json({error: error.message});
            } else {
              console.log(result)
              res.json({bg: newbg, img: newimg, cust_img: false, name: data.address});
          }})
        }

        
        

      }
    })



    
  /*
  for (let i = 0; i < database.length; i++) {
    if(database[i].address == data.address) {
      console.log("[DEBUG -connection] already a user...")
      var bg = database[i].bg
      var img = database[i].img
      var cust_img = database[i].cust_img

      res.json({bg: bg, img: img, cust_img: cust_img});
      exist = 1;
      break;
    }
  }
  

  if(exist == 0){
    
  

    
    let newuser = {
      address: data.address,
      bg: newbg,
      img: newimg,
      cust_img: false
    }
    database.push(newuser);

    fs.writeFile('amplify/backend/functions/mylambda/src/database.json', JSON.stringify(database), err => {
        if (err) {
          throw err
        }

    });

    console.log(newuser)
    
        
    //res.json({bg: newbg, img: newimg, cust_img: false});
    */
    
});


app.put("/uploadFile", (req, res) => {
  
  if (req.body.is_cust) {
    const params = {
      TableName: tableName,
      Key: {
        users: req.body.account
      }
    }

    dynamodb.get(params, (error, result) => {
      if (error) {
        console.log(error)
        //res.json({ statusCode: 500, error: error.message })
      } else {
        //see if the user already have a custom image
        if (result.Item.cust_img != true) {
          //if no cust_img, set the property to true 
          const params = {
            TableName: tableName,
            Key: {
              users: req.body.account
            },
            //ExpressionAttributeNames: { '#cust_img': 'cust_img' },
            ExpressionAttributeValues: {},
            ReturnValues: 'UPDATED_NEW',
          };
          params.UpdateExpression = 'SET '
          params.ExpressionAttributeValues[':cust_img'] = true;
          params.UpdateExpression += 'cust_img = :cust_img';
          dynamodb.update(params, (error, result) => {
            if (error) {
              console.log(error.message);
            }
          });
        }
        else {
          console.log("already a custom image")
        }
        

      }
    })
    
  }
  //set background
  if (req.body.background) {
    if (req.body.background != "") {
      const backparams = {
          TableName: tableName,
          Key: {
            users: req.body.account,
          },
          //ExpressionAttributeNames: { '#bg': 'bg' },
          ExpressionAttributeValues: {},
          ReturnValues: 'UPDATED_NEW',
      };
      backparams.UpdateExpression = 'SET '
      backparams.ExpressionAttributeValues[':bg'] = req.body.background;
      backparams.UpdateExpression += 'bg = :bg'

      dynamodb.update(backparams, (error, result) => {
          if (error) {
            console.log(error.message);
            res.json({error: error.message, params: backparams})
          }
          else {
            res.send("done")
          }
      });
      
    }
  }
  //update the name of an account
  if (req.body.name) {
    if (req.body.name != "") {
      const nameparams = {
        TableName: tableName,
        Key: {
          users: req.body.account,
        },
        ExpressionAttributeNames: { '#nm': 'name' },
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW',
    };
    nameparams.UpdateExpression = 'SET '
    nameparams.ExpressionAttributeValues[':name'] = req.body.name;
    nameparams.UpdateExpression += '#nm = :name'

    dynamodb.update(nameparams, (error, result) => {
        if (error) {
          console.log(error.message);
          res.json({error: error.message, params: nameparams})
        }
        else {
          res.send("done")
        }
    });
     
    }
  
  }

  if (req.body.description) {
    if (req.body.description != "") {
      const nameparams = {
        TableName: tableName,
        Key: {
          users: req.body.account,
        },
        ExpressionAttributeNames: { '#ds': 'description' },
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW',
      };
      nameparams.UpdateExpression = 'SET '
      nameparams.ExpressionAttributeValues[':description'] = req.body.description;
      nameparams.UpdateExpression += '#ds = :description'

      dynamodb.update(nameparams, (error, result) => {
          if (error) {
            console.log(error.message);
            res.json({error: error.message, params: nameparams})
          }
          else {
            res.send("done")
          }
      });
     
    }
  }
  if (req.body.level) {
    if (req.body.level != "") {
      const nameparams = {
        TableName: tableName,
        Key: {
          users: req.body.account,
        },
        ExpressionAttributeNames: { '#lv': 'level' },  //0: basic, 1: premium, 2: expert, 3: verify
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW',
      };
      nameparams.UpdateExpression = 'SET '
      nameparams.ExpressionAttributeValues[':level'] = req.body.level;
      nameparams.UpdateExpression += '#lv = :level'

      dynamodb.update(nameparams, (error, result) => {
          if (error) {
            console.log(error.message);
            res.json({error: error.message, params: nameparams})
          }
          else {
            res.send("done")
          }
      });
     
    }
  }

  if (req.body.pay) {
    if (req.body.pay != []) { //["card", "date", "cvv"]
      const params = {
        TableName: tableName,
        Key: {
          users: req.body.account
        }
      }
  
      dynamodb.get(params, (error, result) => { //get payment method
        if (error) {
          console.log(error)
          //res.json({ statusCode: 500, error: error.message })
        } else {
          if(result.Item.payment) {
            let newPay = []
            newPay = result.Item.payment // new payment
            newPay.push(req.body.pay)
            const payparams = {
              TableName: tableName,
              Key: {
                users: req.body.account,
              },
              ExpressionAttributeNames: { '#py': 'payment' },
              ExpressionAttributeValues: {},
              ReturnValues: 'UPDATED_NEW',
            };
            payparams.UpdateExpression = 'SET '
            payparams.ExpressionAttributeValues[':payment'] = newPay;
            payparams.UpdateExpression += '#py = :payment'

            dynamodb.update(payparams, (error, result) => {
                if (error) {
                  console.log(error.message);
                  res.json({error: error.message, params: payparams})
                }
                else {
                  res.send("done")
                }
            });
          }
          else{
            let newPay = [req.body.pay]
            const payparams = {
              TableName: tableName,
              Key: {
                users: req.body.account,
              },
              ExpressionAttributeNames: { '#py': 'payment' },
              ExpressionAttributeValues: {},
              ReturnValues: 'UPDATED_NEW',
            };
            payparams.UpdateExpression = 'SET '
            payparams.ExpressionAttributeValues[':payment'] = newPay;
            payparams.UpdateExpression += '#py = :payment'

            dynamodb.update(payparams, (error, result) => {
                if (error) {
                  console.log(error.message);
                  res.json({error: error.message, params: payparams})
                }
                else {
                  res.send("done")
                }
            });
          }
          
        }
      })
     
    }
  }
  if (req.body.realPurchase) {
    if (req.body.realPurchase != []) { //["NFTaddress", itemID]
      const params = {
        TableName: tableName,
        Key: {
          users: req.body.account
        }
      }
  
      dynamodb.get(params, (error, result) => { //get payment method
        if (error) {
          console.log(error)
          //res.json({ statusCode: 500, error: error.message })
        } else {
          if(result.Item.realPurchase) {
            let newReal = []
            newReal = result.Item.realPurchase // new payment
            newReal.push(req.body.realPurchase)
            const payparams = {
              TableName: tableName,
              Key: {
                users: req.body.account,
              },
              ExpressionAttributeNames: { '#rp': 'realPurchase' },
              ExpressionAttributeValues: {},
              ReturnValues: 'UPDATED_NEW',
            };
            payparams.UpdateExpression = 'SET '
            payparams.ExpressionAttributeValues[':realPurchase'] = newReal;
            payparams.UpdateExpression += '#rp = :realPurchase'

            dynamodb.update(payparams, (error, result) => {
                if (error) {
                  console.log(error.message);
                  res.json({error: error.message, params: payparams})
                }
                else {
                  res.send("done")
                }
            });
          }
          else{
            let newReal = [req.body.realPurchase]
            const payparams = {
              TableName: tableName,
              Key: {
                users: req.body.account,
              },
              ExpressionAttributeNames: { '#rp': 'realPurchase' },
              ExpressionAttributeValues: {},
              ReturnValues: 'UPDATED_NEW',
            };
            payparams.UpdateExpression = 'SET '
            payparams.ExpressionAttributeValues[':realPurchase'] = newReal;
            payparams.UpdateExpression += '#rp = :realPurchase'

            dynamodb.update(payparams, (error, result) => {
                if (error) {
                  console.log(error.message);
                  res.json({error: error.message, params: payparams})
                }
                else {
                  res.send("done")
                }
            });
          }
          
        }
      })
     
    }
  }
  
  
})

app.get("/livePrice", (req, res) => {
  getLivePrice().then( lprice => {
    res.json({lprice: lprice['usdPrice']})
  })
  
})


app.get("/historicalPrice", (req, res) => {
  let params = {
    TableName: priceName,
    Key: {
      id: 0
    }
  }
  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
      res.json({ hprice: result.Item.price10day }) //.10dayPrice
    }
  });
  
});

app.post("/liveMoney", (req, res) => {
  calculateMoney(req.body.numToken).then( money => {
    res.json({ money: money });
  }
  )
});

app.post("/timeInvest", (req, res) => {
  console.log(req.body)
  const data = req.body

  NumDaysInvest(data.address, data.tokenAddress).then( results => {
    res.json({ timeInvest: results[0], numTrans: results[1], profit: results[2]})
  })
  
})

//listing an item using the api
//params: address, itemid, name

//address: {
//  itemid: [] //all items that an account has listed
//  name: [] //all names corresponding for each new listed item
//}



app.post("/listItem", (req, res) => {
  let params = {
    TableName: ItemName,
    Key: {
      address: req.body.address
    }
  }

  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
      if(result.Item) {
        let newItem = []
        newItem = result.Item.itemid // new id
        newItem.push(req.body.itemid)
        let newName = []
        newName = result.Item.name // new name
        newName.push(req.body.name)
        let newScore = []
        newScore = result.Item.score //new score
        newScore.push(req.body.score)
        let newTag = []
        newTag = result.Item.tag //new tag for item
        newTag.push(req.body.tag)
        let newDescription = []
        newDescription = result.Item.description //new description for item
        newDescription.push(req.body.description)
        let newImage = []
        newImage = result.Item.images //new image for item
        newImage.push(req.body.image)
        
        const newItems_params = {
          TableName: ItemName,
          Key: {
            address: req.body.address,
          },
          ExpressionAttributeNames: { '#nm': 'name' },
          ExpressionAttributeValues: {},
          ReturnValues: 'UPDATED_NEW',
        };
        newItems_params.UpdateExpression = 'SET '
        newItems_params.ExpressionAttributeValues[':itemid'] = newItem;
        newItems_params.UpdateExpression += 'itemid = :itemid, '
        newItems_params.ExpressionAttributeValues[':name'] = newName;
        newItems_params.UpdateExpression += '#nm = :name, '
        newItems_params.ExpressionAttributeValues[':score'] = newScore;
        newItems_params.UpdateExpression += 'score = :score, '
        newItems_params.ExpressionAttributeValues[':tag'] = newTag;
        newItems_params.UpdateExpression += 'tag = :tag, '
        newItems_params.ExpressionAttributeValues[':description'] = newDescription;
        newItems_params.UpdateExpression += 'description = :description, '
        newItems_params.ExpressionAttributeValues[':images'] = newImage;
        newItems_params.UpdateExpression += 'images = :images'

        dynamodb.update(newItems_params, (error, result) => {
            if (error) {
              console.log(error.message);
              res.json({error: error.message, params: newItems_params})
            }
            else {
              res.send("success")
            }
        });
      }
      else {
        //if no items are listed yet, create the first
        let list_params = {
          TableName: ItemName,
          Item: {
            address: req.body.address,
            itemid: [req.body.itemid], //list of item ids
            name: [req.body.name], //list of names
            score: [req.body.score],  //list of score for different item id 
            tag: [req.body.tag],
            description: [req.body.description],
            images: [req.body.image]
          }
        }
      
        dynamodb.put(list_params, (error, result) => {
          if (error) {
            res.json({error: error.message});
          } else {
            res.json({itemid: result});
        }})
      }
    }
  });
  
})

app.post("/getItems", (req, res) => {
  let params = {
    TableName: ItemName,
    Key: {
      address: req.body.address
    }
  }
  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
      if(result.Item) {
        res.json({ ids: result.Item.itemid, names: result.Item.name, scores: result.Item.score, tags: result.Item.tag, descriptions: result.Item.description, image: result.Item.images}) //multiple itemids
      }
      else{
        res.send("bruh")
      }
    }
  });
})

app.post("/updateScore", (req, res) => {
  let params = {
    TableName: ItemName,
    Key: {
      address: req.body.address
    }
  }

  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
        const itemId = result.Item.itemid
        const oldScore = result.Item.score //list of all scores
        var newScore = oldScore //copy that list

        for (var i = 0; i < itemId.length; i++) { //loop over itemId
          if(req.body.itemid === itemId[i]) {
            newScore[i] = (oldScore[i] + 1) //add one to the partiular score
          }
        }
        

        const newItems_params = {
          TableName: ItemName,
          Key: {
            address: req.body.address,
          },
          ExpressionAttributeNames: { '#sc': 'score' },
          ExpressionAttributeValues: {},
          ReturnValues: 'UPDATED_NEW',
        };
        newItems_params.UpdateExpression = 'SET '
        newItems_params.ExpressionAttributeValues[':score'] = newScore;
        newItems_params.UpdateExpression += '#sc = :score'

        dynamodb.update(newItems_params, (error, result) => {
            if (error) {
              console.log(error.message);
              res.json({error: error.message, params: newItems_params})
            }
            else {
              res.send("success")
            }
        });
      }
  })
})


//request the friendship of another acount
//params: requested, sender
app.post("/requestFriend", (req, res) => {
  let params = {
    TableName: tableName,
    Key: {
      users: req.body.requested
    }
  }
  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
      let alreadyRequested = false
      let newarray = []
      newarray = result.Item.request
      console.log(newarray)
      for (let i=0; i<=newarray.length; i++){
        if (newarray[i] === req.body.sender) {
          alreadyRequested = true;
        }
      }
      if (alreadyRequested) {
        res.send("already requested")
      }
      else {
        newarray.push(req.body.sender)
        console.log(newarray)
  
        let postparams = { //load the database of the dude you want to be friend with
          TableName: tableName,
          Key: {
            users: req.body.requested,
          },
          ExpressionAttributeNames: { '#rq': 'request' },
          ExpressionAttributeValues: {},
          ReturnValues: 'UPDATED_NEW',
        };
        postparams.UpdateExpression = 'SET '
        postparams.ExpressionAttributeValues[':request'] = newarray;
        postparams.UpdateExpression += '#rq = :request'
  
        dynamodb.update(postparams, (error, result) => {
          if (error) {
            console.log(error.message);
            res.json({error: error.message, params: postparams})
          }
          else {
            res.send("success")
          }
        });
      }
     
    }
  })
})

//accept a friend request
//params: address, accepted, is_accepeted
app.post("/acceptFriend", (req, res) => {
  //first get old request list and delete the accepted
  //second, if the accepted is really accepted, add him to the address friend list
  //else, return 
  //once the accepted is on the address friend list, 
  //update the accepted friend list so they create a friendship
  let params = {
    TableName: tableName,
    Key: {
      users: req.body.address
    }
  }
  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
        let oldFriendList = []
        oldFriendList = result.Item.friend
        let oldRequestList = []
        oldRequestList = result.Item.request
        let newRequestList = []
        newRequestList = oldRequestList.filter(e => e !== req.body.accepted) //remove the guy who is accepted
        let postparams = { //load the database of the dude you want to be friend with
          TableName: tableName,
          Key: {
            users: req.body.address,
          },
          ExpressionAttributeNames: { '#rq': 'request' },
          ExpressionAttributeValues: {},
          ReturnValues: 'UPDATED_NEW',
        };
        postparams.UpdateExpression = 'SET '
        postparams.ExpressionAttributeValues[':request'] = newRequestList; //remove your address from there
        postparams.UpdateExpression += '#rq = :request'
  
        dynamodb.update(postparams, (error, result) => {
          if (error) {
            console.log(error.message);
            res.json({error: error.message, params: postparams})
          }
          else {
            //if the accepeted is successfully removed, add him to your friend list
            if (req.body.is_accepted) {
              
              oldFriendList.push(req.body.accepted) //add the guy who is accepted

              let friendparams = { //load the database of the dude you want to be friend with
                TableName: tableName,
                Key: {
                  users: req.body.address,
                },
                ExpressionAttributeNames: { '#fr': 'friend' },
                ExpressionAttributeValues: {},
                ReturnValues: 'UPDATED_NEW',
              };
              friendparams.UpdateExpression = 'SET '
              friendparams.ExpressionAttributeValues[':friend'] = oldFriendList;
              friendparams.UpdateExpression += '#fr = :friend'

              dynamodb.update(friendparams, (error, result) => {
                if (error) {
                  console.log(error.message);
                  res.json({error: error.message, params: friendparams})
                }
                else {
                  //update the friend list for the guy who is accepted
                  let params2 = {
                    TableName: tableName,
                    Key: {
                      users: req.body.accepted
                    }
                  }
                  dynamodb.get(params2, (error, result) => {
                    if (error) {
                      res.json({ statusCode: 500, error: error.message });
                    } else {
                      let oldFriendList2 = []
                      oldFriendList2 = result.Item.friend
                      oldFriendList2.push(req.body.address) //add the guy who is accepting 

                      let friendparams2 = { //load the database of the dude you want to be friend with
                        TableName: tableName,
                        Key: {
                          users: req.body.accepted,
                        },
                        ExpressionAttributeNames: { '#fr': 'friend' },
                        ExpressionAttributeValues: {},
                        ReturnValues: 'UPDATED_NEW',
                      };
                      friendparams2.UpdateExpression = 'SET '
                      friendparams2.ExpressionAttributeValues[':friend'] = oldFriendList2;
                      friendparams2.UpdateExpression += '#fr = :friend'

                      dynamodb.update(friendparams2, (error, result) => {
                        if (error) {
                          console.log(error.message);
                          res.json({error: error.message, params: friendparams2})
                        }
                        else {
                          res.send("New Friendship!")
                        }
                      })
                    }

                  })
                }
              })
            }
            else {
              res.send("successfully deleted")
            }
          }
        });

    } 

  })
  

})

//delete a friend
//params: address, unwanted
app.post("/manageFriend", (req, res) => {
  let params = {
    TableName: tableName,
    Key: {
      users: req.body.address
    }
  }

  dynamodb.get(params, (error, result) => {
    if (error) {
      res.json({ statusCode: 500, error: error.message });
    } else {
      let oldFriendList = []
      oldFriendList = result.Item.friend
      oldFriendList.filter(e => e !== req.body.unwanted) //remove the unwanted friend

      let friendparams = { //load the database of the dude you want to be friend with
        TableName: tableName,
        Key: {
          users: req.body.address,
        },
        ExpressionAttributeNames: { '#fr': 'friend' },
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW',
      };
      friendparams.UpdateExpression = 'SET '
      friendparams.ExpressionAttributeValues[':friend'] = oldFriendList;
      friendparams.UpdateExpression += '#fr = :friend'

      dynamodb.update(friendparams, (error, result) => {
        if (error) {
          console.log(error.message);
          res.json({error: error.message, params: friendparams})
        }
        else {
          res.send("successfully deleted unwanted friend.")
        }
      })
    }
  })

})

//handler to get metadata of a listed nft
app.post("/metadata", async(req, res) => {
  try {
    const meta = await getMetaData(req.body.address, req.body.tokenid)
    res.json(meta)

  } catch(error) {
    console.log(error)
    res.send("error code - 332")
  }
  
})

//handler to get all nfts from a user
app.post("/nftbyaddress", async(req, res) => {
  try {
    console.log(req.body.address)
    const meta = await getNftByWallet(req.body.address)
    res.json(meta) //result.metadata

  } catch(error) {
    console.log(error)
    res.send("error code - 332")
  }
  
})

app.post("/getproofdata", async(req, res) => {
  try {
    console.log(req.body.topic)
    const response = await getProofData(req.body.topic)
    res.json(response) //result.metadata

  } catch(error) {
    console.log(error)
    res.send("error code - 332")
  }
  
})

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;


import './css/nftbox.css'
import {useState, useEffect } from 'react';
import { API, Storage } from 'aws-amplify';
import Receipt from './receipt';
const MarketAddress = '0x710005797eFf093Fa95Ce9a703Da9f0162A6916C'; // goerli new test contract
const marketdds = '0x1D1db5570832b24b91F4703A52f25D1422CA86de'
// make myitem parameters and modify the card to dislay a delete button

const TicketAddress = '0x6CFADe18df81Cd9C41950FBDAcc53047EdB2e565'

const tags = ["nft", "tickets"];

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function NftBox (props) {
    //see in bigger using modal
   
    const [id, setId] = useState()
    const [market, setMarket] = useState()
    const [credits, setCredits] = useState()
    const [amm, setAmm] = useState()
    const [dds, setDds] = useState()
    const [seller, setSeller] = useState()
    const [price, setPrice] = useState(0)
    const [total, setTotal] = useState(0)
    const [state, setState] = useState("ontario")
    const [quebec, setQuebec] = useState(false)
    const [tax, setTax] = useState(0)
    const [taxprice, setTaxprice] = useState(0.0)
    const [account, setAccount] = useState()
    const [pay, setPay] = useState()
    const [did, setDid] =useState()
    const [image, setImage] = useState()
    const [tokenId, setTokenId] = useState()
    const [signer, setSigner] = useState()
    const [currency, setCurrency] = useState()
    const [pk, setPk] = useState()
    const [buyloading, setBuyloading] = useState(false)
    const [itemSold, setItemSold] = useState(false)
    const [marketLoaded, setMarketLoaded] = useState(false)
    const [marketLoadedItem, setMarketLoadedItem] = useState({})
    const [notload, setNotload] = useState(false)
    

    const [purchasing, setPurchasing] = useState(false)

    const cancelPurchase = () => {
        setPurchasing(false)
    }


    const getItem = async () => {
        //const ddsc = await configureMarket(haswallet, wallet)
    
        //let credits = await ddsc?.credits()
        //console.log(credits)        
        //only real items

        let item = await props.dds.items(parseInt(props.id + 1))
        console.log(item)
        let newItem = {}

        if(item.sold) {
            console.log("SOLD")
            setItemSold(true)
            //alert("item already sold, redirecting to market!")
            //window.location.replace("/market")
        }

        else {
            //props.setnumloaded((props.numloaded + 1))
            var data = {
                body: {
                    address: item.seller.toLowerCase(),
                }
            }

            var url = "/getItems"

            //console.log(typeof(item))
            //console.log(item)
            
            await API.post('serverv2', url, data).then((response) => {
                for(let i=0; i<=response.ids.length; i++) { //loop trought every listed item of an owner 
                    if (response.ids[i] == item.itemId - 1) { // once you got the item we want to display:
                                newItem.itemId = item.itemId
                                newItem.tokenId = item.tokenId
                                newItem.price = item.price
                                newItem.seller = item.seller
                                newItem.name = response.names[i] //get the corresponding name
                                newItem.score = response.scores[i] //get the corresponding score
                                newItem.tag = response.tags[i] //get the corresponding tag
                                newItem.description = response.descriptions[i]
                                newItem.image = response.image[i]
                    }
                }
            })

            
        }
        
        return newItem
    
    }

    const deleteItems = async () => {
         //connect to market inside the function to save time 
        //const marketContract = connectContract(MarketAddress, abi.abi)
        try {
            var config = {
                body: {
                    owner: seller,
                    itemId: id
                }
            };
            var url = "/deleteItem"

            API.post('serverv2', url, config).then((response) => {
                console.log(response)
                if (response.status === 60) {
                    alert("Unable to delete Item (" + id + "). Error code - 60")
                } else {
                    alert("Item: " + id + " has been sucessfully deleted!")
                }
            }).catch((e) => {
                alert("Unable to delete Item (" + id + "). Error code - 60")
                console.log(e)
            })

            
        }
        catch(error) {
            alert("Unable to delete Item (" + id + "). Error code - 60")
            console.log(error)
        }
    }

    const updateScore = () => {
        var data = {
            body: {
                address: seller.toLowerCase(),
                itemid: id, //market item id
            }
            
        }

        var url = "/updateScore"

        API.post('serverv2', url, data).then((response) => {
            console.log(response)
        })
    }

    const calculateTax = () => {
        updateScore() //update score on click once you visit an item
        const quebectax = 0.15;
        const ontariotax = 0.13;
        const usatax = 0.1;
        let totalPrice;
        switch (state) {
            case "quebec":
                totalPrice = price + (price * quebectax)
                setTotal(totalPrice)
                setQuebec(true)
                break;
            case "ontario":
                let totalPrice = price + (price * ontariotax)
                setTax(ontariotax * 100)
                setTaxprice(50 * ontariotax)
                setTotal(totalPrice)
                setPurchasing(true)

                break;
            case "usa":
                totalPrice = price + (price * usatax)
                setTax(usatax * 100)
                setTaxprice(50 * usatax)
                setTotal(totalPrice)
                break;
            default:
                console.log("Bad request: 400 . Error code - 4")
                break;
        }


        return totalPrice;
    }

    const purchase = async () => {
        try {
            await(await amm.paySeller((price * 100000))).wait()
            await(await credits.approve(MarketAddress, (price * 100000))).wait() //give the contract the right of paying the seller
            //IF THIS STEP IS NOT COMPLETE: THROW ERROR *10 000

            // TRANSFER DIRECTLY INTO A SPECIAL WALLET FOR TAXES
    
            await (await market.purchaseItem(id)).wait() //actual purchase/transfer of the nft
            alert("Sucessfully bought NFT n." + id + " . Congrats :)")
        } catch (error){
            alert("Unable to connect properly with the blockchain. Make sure your account is connected. Error code - 2")
            console.log(error)
            console.log(seller)
        }
    
    }

    function setS3Config(bucket, level) {
        Storage.configure({
            bucket: bucket,
            level: level,
            region: "ca-central-1",
            identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952'
        })
    }


    const realPurchase = async () => {
        try {
            //setBuyloading(true)
            const url = '/uploadFile';
            var config = {
                body: {
                    account: account.toLowerCase(),
                    realPurchase: [parseInt(tokenId), id]

                }
            };
            setS3Config("didtransfer", "public");

            API.put('serverv2', url, config).then((response) => {
                console.log(response)
                Storage.put(`${seller.toLowerCase()}/${account.toLowerCase()}.txt`, window.localStorage.getItem("did")).then((results) => { // add ".png"
                    console.log(results)
                    setBuyloading(false)
                });

                
            })

            //alert("Sucessfully bought NFT n." + id + " . Congrats :)")
        } catch (error){
            //setBuyloading(false)
            alert("Unable to connect properly with the blockchain. Make sure your account is connected. Error code - 2")
            console.log(error)
            console.log(seller)
        }
    }

    useEffect(() => {
        if (props.myitem) {
            setId(props.id)
            setMarket(props.market)
            setSeller(props.seller)
            props.setHaveItem(true)
        }
        else {
            if(props.isMarket) {
                setMarketLoaded(true)
                setId(props.id + 1)
                console.log(props.id)
                if (!props.displayItem) {
                    setPk(props.password)
                    setAccount(props.account)
                }
                
                const newItem = getItem()
                newItem.then((res) => {
                    if (res.tag === tags[props.catID]) {
                        setTokenId(res.tokenId)
                        console.log(id)
                        console.log(parseInt(res.tokenId))
                        setSeller(res.seller)
                        setPrice(res.price)
                        setImage(res.image)
                        setMarketLoadedItem(res)
                    } else {
                        setNotload(true)
                    }
                    
                })
            }

            else {
                
                setId(props.id)
                setPrice(props.price) /// (1 - 0.029) + 4.6*100000
                console.log(props.price)
                setSeller(props.seller)
                setTokenId(props.tokenId)
                setMarket(props.market)
                setCredits(props.credits)
                setDds(props.dds)
                setPurchasing(false)
                setAccount(props.account)
                setPay(props.pay)
                setDid(props.did)
                setImage(props.image)
                setSigner(props.signer)
                setCurrency(window.localStorage.getItem("currency"))
                if (props.pk) {
                    setPk(props.pk)
                }
                else {
                    //console.log(props.password)
                    setPk(props.password)
                }
                
                setAmm(props.amm)
            }
                
            /*if (props.real) {} else {
                setId(props.id)
                setPrice(props.price)
                setSeller(props.seller)
                setMarket(props.market)
                setCredits(props.credits)
                setPurchasing(false)
                setAccount(props.account)
                setPay(props.pay)
                setDid(props.did)
                setImage(props.image)
                setSigner(props.signer)
                setCurrency(window.localStorage.getItem("currency"))
                setPk(props.pk)
                setAmm(props.amm)

            }*/
            
            

        }
    }, []) //setId

    if(props.myitem) {
        return(
            <div class="nftbox">
                <img id='itemimg' src={props.image} alt="" />
                <h4><a href="">{props.name}</a></h4>
                <h6>current bid: {props.price/100000} $CREDITS</h6>
                <p>seller: <a href="#">{props.seller.slice(0,7) + "..."}</a></p>
                <p>description: {props.description}</p>
                <button onClick={deleteItems} type="button" class="btn btn-secondary">Delete</button>
    
            </div>
        )

    }
    //<!--  -->
    else {
        return(
            notload ? "" : 
            <div>
                { purchasing ? props.real ? (
                    <Receipt quebec={quebec} state={state} subtotal={price} total={price} taxprice={taxprice} tax={tax} seller={seller} image={image} account={account} contract={credits} dds={dds} amm={amm} signer={signer} id={id} pay={pay} did={did} pk={pk} purchase={realPurchase} cancel={cancelPurchase} buyloading={buyloading} />
                ) : ( <Receipt quebec={quebec} state={state} subtotal={price} total={price} taxprice={taxprice} tax={tax} seller={seller} image={image} account={account} contract={credits} market={market} amm={amm} signer={signer} id={id} pay={pay} did={did} pk={pk} purchase={purchase} cancel={cancelPurchase} /> ) : 
                itemSold ? "" :  marketLoaded ? props.mynft ? marketLoadedItem?.seller === account ? (<div class="nftbox">
                <a href={marketLoadedItem?.image}><img id='itemimg' src={marketLoadedItem?.image} alt="" /></a>
                <h4><a href="">{marketLoadedItem?.name}</a></h4>
                <h4>ID: {id}</h4>
                <h6>current Price: {currency == "CAD" ? USDollar.format((marketLoadedItem?.price/100000) / (1 - 0.029) + 4.6) : USDollar.format((marketLoadedItem?.price/100000) / (1 - 0.029) + 4.6) } {currency}</h6>
                
                <p>description: {marketLoadedItem?.description}</p>
                <button onClick={deleteItems} type="button" class="btn btn-secondary">Delete</button>
    
            </div>) : "":(<div class="col">
                <div class="nftbox">
                <a href={marketLoadedItem?.image}><img id='itemimg' src={marketLoadedItem?.image} alt="" /></a>
                    <br />
                    <br />
                    <h4><a href={"/item/" + (id - 1)}>{marketLoadedItem?.name}</a></h4>
                    
                    <h6>current Price: {currency == "CAD" ? USDollar.format((marketLoadedItem?.price/100000) / (1 - 0.029) + 4.6) : USDollar.format((marketLoadedItem?.price/100000) / (1 - 0.029) + 4.6) } {currency}</h6>
                    <p>seller: <a href={`/Seller/${marketLoadedItem?.seller}`} >{marketLoadedItem?.seller?.slice(0,7) + "..."}</a></p>
                    
                    <p>description: {marketLoadedItem?.description}</p>
                    
                    {props.displayItem ? window.localStorage.getItem("hasWallet") ? (<button onClick={()=>{window.location.replace("/item/" + (id - 1))}} type="button" class="btn btn-secondary" >Purchase</button>) : (<button onClick={()=>{alert("Vous devez créer votre compte afin de pouvoir acheter un item!")}} type="button" class="btn btn-secondary" >Purchase</button>) : props.numreal == id ? (<button onClick={()=>{window.location.replace("/item/" + (id - 1))}} type="button" class="btn btn-secondary" >Purchase</button>) : (<button onClick={calculateTax} type="button" class="btn btn-secondary">Purchase</button>)}
                    

                </div>
            </div>) : (
                    <div class="col">
                        <div class="nftbox">
                        <a href={image}><img id='itemimg' src={image} alt="" /></a>
                            <br />
                            <br />
                            <h4><a href={"/item/" + (props.id -1)}>{props.name}</a></h4>
                            <h6>current Price: {currency == "CAD" ? USDollar.format((props.price/100000) / (1 - 0.029) + 4.6) : USDollar.format((props.price/100000) / (1 - 0.029) + 4.6) } {currency}</h6>
                            <p>seller: <a href={`/Seller/${seller}`} >{props.seller?.slice(0,7) + "..."}</a></p>
                            <p>description: {props.description}</p>
                            {props.displayItem ? (<button onClick={()=>{alert("Vous devez créer votre compte afin de pouvoir acheter un item!")}} type="button" class="btn btn-secondary" >Purchase</button>) : (<button onClick={calculateTax} type="button" class="btn btn-secondary">Purchase</button>)}
                            
        
                        </div>
                    </div>
                    
                )
                }
            </div>
           
        ) //onClick={purchase} onClick={calculateTax("quebec", price)} onClick={calculateTax}
    }
   
}

export default NftBox;


/*
  

                                const subtotal = exampleModal.querySelector('.subtotal')
                                subtotal.textContent = `Subtotal: ${price} $CREDITs (50$)`

                                const tax = exampleModal.querySelector('.tax')
                                tax.textContent = `Tax: 3,000 $CREDIT (${50 * ontariotax} $ at ${ontariotax * 100} %)`

                                const total = exampleModal.querySelector('.total')
                                total.textContent = `Total: ${totalPrice} (${50 + 50 * ontariotax}$)`
                })
*/
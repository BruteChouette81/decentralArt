const calculateGasFees = async() => {

    const gasPrice = await props.contract.provider.getGasPrice();
    console.log(parseFloat(ethers.utils.formatEther(gasPrice)))
    
    let price = props.subtotal
    let gas = await props.contract.estimateGas.approve(props.seller, price) //()
    console.log(parseInt(price))
    console.log(props)

    if (props.dds) { //real item
        if (window.localStorage.getItem("usingMetamask") === "false") {
            const gasdds = getContract(DDSGasContract, DDSABI, props.signer)
            let gas2 = await gasdds.estimateGas.purchaseItem(1, 1, props.pk)

            console.log(gas2)
            return[(gas * gasPrice),  (gas2 * gasPrice)]
        }
        else {
            let provider = await injected.getProvider()
            const gasdds = connectContract(DDSGasContract, DDSABI.abi, provider)

            let gas2 = await gasdds.estimateGas.purchaseItem(1, 1, "")
            console.log(gas2)
            return[(gas * gasPrice),  (gas2 * gasPrice)]
        }
        
    }
    else {
        let gas2 = await props.market.estimateGas.purchaseItem(props.id)
        return [(gas * gasPrice),  (gas2 * gasPrice)]
    }




}

useEffect(() => {
    calculateGasFees().then((fee) => {
        console.log(fee[1])
        setFees((ethers.utils.formatEther(fee[0])  * 2440.40) + (ethers.utils.formatEther(fee[1])  * 2440.40)) //credit price: 31400700
        
    })
    
})

const realPurchase = async () => {
    try {
        setBuyloading(true)
        const url = '/uploadFile';
        var config = {
            body: {
                account: account.toLowerCase(),
                realPurchase: [parseInt(props.tokenId), id]

            }
        };
        setS3Config("didtransfer", "public")

        //await(await amm.paySeller((price))).wait()

        await(await credits.approve(marketdds, (price))).wait() //give the contract the right of paying the seller
        console.log("approved: + "+ (price) )
        //IF THIS STEP IS NOT COMPLETE: THROW ERROR

        // TRANSFER DIRECTLY INTO A SPECIAL WALLET FOR TAXES

        await (await dds.purchaseItem(id, id, pk)).wait() //actual purchase/transfer of the nft //pk

        API.put('serverv2', url, config).then((response) => {
            console.log(response)
            Storage.put(`${seller.toLowerCase()}/${account.toLowerCase()}.txt`, window.localStorage.getItem("did")).then((results) => { // add ".png"
                console.log(results)
                setBuyloading(false)
            });

            
        })

        alert("Sucessfully bought NFT n." + id + " . Congrats :)")
    } catch (error){
        setBuyloading(false)
        alert("Unable to connect properly with the blockchain. Make sure your account is connected. Error code - 2")
        console.log(error)
        console.log(seller)
    }
}

//<h6>Gas Fee: {parseFloat(fees)} {window.localStorage.getItem("currency")}</h6>
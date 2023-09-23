import { useEffect, useState } from "react";
import {ethers} from 'ethers'
import { API, Storage } from 'aws-amplify';
import { AES, enc } from "crypto-js"

import default_profile from "../profile_pics/default_profile.png"
import ReactLoading from "react-loading";


import Credit from '../../../artifacts/contracts/credits2.sol/credits2.json';
import DiD from '../../../artifacts/contracts/DiD.sol/DiD.json';
import AMMABI from '../../../artifacts/contracts/AMM.sol/AMM.json'
import DDSABI from '../../../artifacts/contracts/DDS.sol/DDS.json'
import realabi from '../../../artifacts/contracts/Real.sol/Real.json'

import "../css/profile.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'

import DisplayActions from '../controle';
import Settings from '../setting';

const contractAddress = '0xc183177E3207788ea9342255C8Fcb218763d46e2';
const DiDAddress = "0x6f1d3cd1894b3b7259f31537AFbb930bd15e0EB8"; //goerli

const Credit_AMM = '0xcAd1B86F5022A138053577ae03Ab773Ee770ec21'; //'0xB18A97e590F1d0C1e0B9A3c3803557aa230FD21c'
const DDSADDr = '0xabF75FC997bdF082D1d22E5Da6701C56e8A356D2';
const ImperialRealAddress = '0xbC1Fe9f6B298cCCd108604a0Cf140B2d277f624a'

const getContract = (signer, abi, address) => {
    // get the end user
    console.log(signer)
    // get the smart contract
    const contract = new ethers.Contract(address, abi, signer);
    return contract
}

const getBalance = async(account, setBalance, currency, credits) => {
    const userbalance = await credits.balanceOf(account)

    if (currency === "CAD") {
        setBalance(parseInt(userbalance) * 1.36);
    }
    else {
        setBalance(parseInt(userbalance));
    }
    
    /*
    let url = "/liveMoney"
    let data = {
        body: {
            numToken: parseInt(userbalance)
        }
        
            
    }

    API.post('server', url, data).then((response) => {
            var usdMoney = response.money
    })

    setMoney(parseInt(userbalance * 0.00005))
    */
}

function ShowAccount(props) {

    if (window.screen.width > 900) {
        return (
            <div>
                <h5>Numéro de compte: <strong>{props.account}</strong> {props.level === 0 ? (<span class="badge bg-secondary"><a href={`/subs/${props.account}`}>Basic</a> </span>) : props.level === 1 ? (<span class="badge bg-info"><a href={`/subs/${props.account}`}>Premium</a></span>) : props.level === 2 ? (<span class="badge bg-warning">Expert</span>) : props.level === 3 ? (<span class="badge bg-success">Verified</span>) : props.level === 5 ? (<span class="badge bg-light text-dark">Owner</span>) : ""}</h5>
                {props.fullname ? <div><h5>Nom Complet: <strong>{props.fullname}</strong></h5>
                <h5>Email: <strong>{props.email}</strong></h5></div> : <h5>Afin de terminé la creation de votre compte, veillez vous créer une Identitée Décentralizée dans la section plus bas ayant ce même nom!</h5>}
            </div>
        )
    }

    else {
        return (
            <div>
                <h5>Numéro de compte: <strong>{props.account?.slice(0,10)}...</strong> {props.level === 0 ? (<span class="badge bg-secondary"><a href={`/subs/${props.account}`}>Basic</a> </span>) : props.level === 1 ? (<span class="badge bg-info"><a href={`/subs/${props.account}`}>Premium</a></span>) : props.level === 2 ? (<span class="badge bg-warning">Expert</span>) : props.level === 3 ? (<span class="badge bg-success">Verified</span>) : props.level === 5 ? (<span class="badge bg-light text-dark">Owner</span>) : ""} </h5>
                <h5>Nom Complet: <strong>{props.fullname}</strong></h5>
                <h5>Email: <strong>{props.email}</strong></h5>
            </div>
        )
    }

    


};
function ShowBalance(props) {

    const [balance, setBalance] = useState(0);
    const [currency, setCurrency] = useState("No currency selected");

    const loadMarket = () => {
        window.location.replace("/market")
    }

    const onCurrencyChangeCAD = () => {
        window.localStorage.setItem("currency", "CAD")
        setCurrency("CAD")
    }

    const onCurrencyChangeCREDIT = () => {
        window.localStorage.setItem("currency", "$CREDITS")
        setCurrency("$CREDITS")
    }

    useEffect(() => {
        setCurrency(window.localStorage.getItem("currency"))
    })
    /*
    const getBalance = async () => {
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        const balance = await contract.balanceOf(account);
        setBalance(parseInt(balance));
        let url = "/live_money"
        let data = {
            numToken: parseInt(balance)
        }

        axios.post(url, data).then((response) => {
            var usdMoney = response.data.money
            setMoney(parseFloat(usdMoney))
        })

    }
    */
    return ( //, ({money / 100000} $ USD)
        <div> 
            <h5>Your Balance: <strong>{(balance / 100000).toLocaleString('en-US')} {currency} </strong> <a style={{float: "right"}} class="btn btn-link" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" >
                                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                                    </svg>
                                </a> <div class="dropdown" style={{float: "right"}}><button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"> Currency</button>
                                <ul class="dropdown-menu dropdown-menu-dark">
                                    <li><button class="dropdown-item" onClick={onCurrencyChangeCREDIT}>$CREDITS</button></li>
                                    <li><button class="dropdown-item"  onClick={onCurrencyChangeCAD}>CAD</button></li>
                                    <li><button class="dropdown-item disabled" >BTC</button></li>
                                    <li><button class="dropdown-item disabled" >USD</button></li>
                                    <li><button class="dropdown-item disabled" >ETH</button></li>
                                </ul>
                            </div> 
                            <br />
                            <br />
                            <div class="collapse" id="collapseExample">
                                <div class="card card-body" style={{color: "black"}}>
                                    
                                    You can select the currency you want to buy things in and get payed in!
                                </div>
                            </div>
            </h5>
            <button onClick={() => {getBalance(props.account, setBalance, currency, props.credits)}} class="btn btn-primary" id='profile-info-balance'>Reload balance</button>
            <br />
            <br />
            <button onClick={loadMarket} class="btn btn-primary" id='profile-info-balance'>Connect market - New! </button>
        </div>
    )
};

function ShowMarket(props) {
    const loadMarket = () => {
        if (props.email) {
            window.location.replace("/market")
        } else {
            alert("Vous devez créer une Identité Decentralizée afin de poursuivre vers l'Atelier!")
        }
        
    }
    return ( <div>
        <button onClick={loadMarket} class="btn btn-primary" id='profile-info-balance'>Accèdez à l'Atelier!</button>
    </div> )
}

function ShowUsername(props) {
    //function to get the custom username from the database
    return ( <div>
                <h5>Connected as: {props.name}</h5>
            </div>
     )
}

function ShowDescription(props) {
    return (
        <div>
            <h5>Bio: {props.description}</h5>
        </div>
    )
}


function ImperialProfile() {
    const [credit, setCredit] = useState()
    const [tether, setTether] = useState()
    const [did, setDid] = useState()
    const [amm, setAmm] = useState()
    //const [address, setAddress] = useState()
    const [privatekey, setPrivatekey] = useState()
    const [ needPassword, setNeedPassword ] = useState(true)
    const [ profileLoading, setProfileLoading ] = useState(true)
    const [password, setPassword] = useState("")
    let passwordInp = ""


    const [back, setBack] = useState('white')
    const [img, setImg] = useState('white')
    const [custimg, setCustimg] = useState(false)
    const [balance, setBalance] = useState(0);
    const [money, setMoney] = useState(0)
    const [image, setImage] = useState("")
    const [name, setName] = useState("")
    const [request, setRequest] = useState()
    const [friendList, setFriendList] = useState()
    const [description, setDescription] = useState()
    const [pay, setPay] = useState()
    const [realPurchase, setRealPurchase] = useState()
    const [level, setLevel] = useState(0)
    const [signer, setSigner] = useState()

    const [firstConnect, setFirstConnect] = useState(false)
    const [fullname, setFullname] = useState("")
    const [email, setEmail] = useState("")
    const [fname, setFname] = useState("")
    const [lname, setLname] = useState("")
    const [country, setCountry] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [street, setStreet] = useState("")
    const [code, setCode] = useState("")
    const [phone, setPhone] = useState("")

    const type = "spin"
    const color = "#0000FF"

    const onFnameChanged = (event) => {
        setFname(event.target.value)
    }
    const onLnameChanged = (event) => {
        setLname(event.target.value)
    }
    const onCountryChanged = (event) => {
        setCountry(event.target.value)
    }
    const onCityChanged = (event) => {
        setCity(event.target.value)
    }
    const onStateChanged = (event) => {
        setState(event.target.value)
    }
    const onStreetChanged = (event) => {
        setStreet(event.target.value)
    }
    const onCodeChanged = (event) => {
        setCode(event.target.value)
    }
    const onEmailChanged = (event) => {
        setEmail(event.target.value)
    }
    const onPhoneChanged = (event) => {
        setPhone(event.target.value)
    }

    const changePass = (event) => {
        //setPassword(event.target.value)
        passwordInp = event.target.value;
    }

    const connectUsingPassword = async (e) => {
        e.preventDefault()
        
        console.log(passwordInp)
        setPassword(passwordInp)
        const hasWallet = window.localStorage.getItem("hasWallet")
        //setAddress(window.localStorage.getItem("walletAddress"))
        await connection(hasWallet);
    }

    function GetPassword() {
        return ( <div class="getPassword">
            <form onSubmit={connectUsingPassword}> 
            {window.localStorage.getItem("hasWallet") ? (<h3>Entrez votre Mot de Passe</h3>) : ( <div>Entrez un nouveau Mot de Passe<h3></h3>
                <p>IMPORTANT: lorseque vous entrez votre mot de passe: vous ne pouvez le changer sans perdre votre compte !</p></div> )}
                
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Password</label>
                    <div class="col-sm-10">
                        <input type="password" class="form-control" id="inputPassword" onChange={changePass}/>
                    </div>
                </div>
                <br />
                <button type="submit" class="btn btn-primary mb-3">Connect</button>
            </form>
        </div> )
    }

    const writedId = async () => {
        alert("writting your DID")
        if (window.localStorage.getItem("usingMetamask") === "true") {
            alert("error")
        }
        else {
            const NewWallet = ethers.Wallet.createRandom()
            const provider = new ethers.providers.InfuraProvider("goerli")
            let newConnectedWallet = NewWallet.connect(provider)
            console.log(newConnectedWallet.privateKey)
            writePrivateKey(newConnectedWallet.address, newConnectedWallet.privateKey) //writting pk to did
            window.localStorage.setItem("hasWallet", true)
            window.localStorage.setItem("walletAddress", newConnectedWallet.address)
            setFullname(fname + " " + lname)

            //console.log(props.signer)
            const data = {
                address: newConnectedWallet.address,
                pk: newConnectedWallet.privateKey,
                first_name: fname,
                last_name: lname,
                email: email,
                mobileNumber: phone, //"+19692154942"
                dob: "1994-11-26", // got to format well
                address: {
                    addressLine1: street,
                    city: city,
                    state: state,
                    postCode: code,
                    countryCode: country
                }
            }
            console.log(data)
    
            let stringdata = JSON.stringify(data)
            //let bytedata = ethers.utils.toUtf8Bytes(stringdata)
    
            //console.log(props)
            console.log(password)
            var encrypted = AES.encrypt(stringdata, password)
            //hash the data object and store it in user storage
            //ethers.utils.computeHmac("sha256", key, bytedata)
            
              
            window.localStorage.setItem("did", encrypted);
            alert("DID successfully written! Account successfully created!")
        }

        
    }

    const saveId = async(event) => {
        event.preventDefault()
        //create a user ID. For now it will be IdCount
        //const id = parseInt( await props.did.idCount()) + 1
        //let key = Math.floor(Math.random() * 10000001); //0-10,000,000
        //window.localStorage.setItem("key", key)
        //window.localStorage.setItem("id", parseInt(id))
        //console.log(parseInt(id), 1, city, state, code, country, street, phone, email, fname, lname)
        //params: uint id, uint _key, string memory _city, string memory _state, string memory _postalCode, string memory _country, string memory _street1, string memory _phone, string memory _email, string memory _name, string memory _lastname
        if (city !== "" && state !== "" && code !== "" && country !== "" && street !== "" && phone !== "" && email !== "" && fname !== "" && lname !== "") {
            writedId()  
        }
        else {
            alert("Information of DiD not well written... Try again...")
        }
        
        
        
    }

    function BuildDid() {
        return (
            <div class="DidBuilding">
            <p>You can always delete any DiD ( <a href=""> see our security policy</a>) </p>
                                <form onSubmit={saveId}>
                                <input type="text" id="fname" name="fname" class="form-control" placeholder="First Name : Thomas" onChange={onFnameChanged}/>
                                    <br />
                                    <input type="text" id="lname" name="lname" class="form-control" placeholder="Last Name : Berthiaume " onChange={onLnameChanged}/>
                                    <br />
                                    <input type="text" id="country" name="country" class="form-control" placeholder="country : US " onChange={onCountryChanged}/>
                                    <br />
                                    <input type="text" id="state" name="state" class="form-control" placeholder="state : NY" onChange={onCityChanged}/>
                                    <br />
                                    <input type="text" id="city" name="city" class="form-control" placeholder="city : New York City" onChange={onStateChanged}/>
                                    <br />
                                    <input type="text" id="street" name="street" class="form-control" placeholder="street address : 1 example road" onChange={onStreetChanged}/>
                                    <br />
                                    <input type="text" id="code" name="code" class="form-control" placeholder="Postal code : 000 000" onChange={onCodeChanged}/>
                                    <br />
                                    <input type="text" id="phone" name="phone" class="form-control" placeholder="Phone : 14188889065" onChange={onPhoneChanged}/>
                                    <br />
                                    <input type="text" id="email" name="email" class="form-control" placeholder="Email : thom@example.com" onChange={onEmailChanged}/>
                                    <br />
                                    <input type="submit" class="btn btn-primary" value="Submit" />
                                </form>
          </div>)
    }
    
    function setS3Config(bucket, level) {
        Storage.configure({
            bucket: bucket,
            level: level,
            region: "ca-central-1",
            identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952'
        })
    }

    const getImage = async () => {
        setS3Config("clientbc6cabec04d84d318144798d9000b9b3205313-dev", "public")
        const file = await Storage.get(`${signer?.address.toLowerCase()}.png`) //add ".png"    `${address}.png` {download: true}
        setImage(file)
    }

    const writePrivateKey = (account, privatekey) => { //function to write a privatekey to aws dynamo server
        //console.log(privatekey)
        const did_data = {
            address: account,
            pk: privatekey.toString()
        }

        let stringdata = JSON.stringify(did_data)
        var encrypted = AES.encrypt(stringdata, password)
        window.localStorage.setItem("did", encrypted);


        var data = {
            body: {
                address: account.toLowerCase(),
                privatekey: "" //set did to "" for new accounts
            }
        }
        setPrivatekey(privatekey)

        var url = "/connection"
        const provider = new ethers.providers.InfuraProvider("goerli")

        API.post('serverv2', url, data).then(async (response) => {
            console.log(response)
            setBack(response.bg);
            setImg(response.img);
            setCustimg(response.cust_img);
            setName(response.name)
            setRequest(response.request)
            setFriendList(response.friend)
            setDescription(response.description)
            setPay(response.pay)
            setRealPurchase(response.realPurchase)
            setLevel(response.level)
    
            //change user privatekey to the json
            let userwallet = new ethers.Wallet(privatekey, provider) //response.privatekey
            console.log(userwallet)
            //let userwallet = new ethers.Wallet.fromEncryptedJson(response.privatekey, password)

            let contract = getContract(userwallet, Credit, contractAddress)
            

            setSigner(userwallet)
            //getBalance(account, setBalance, setMoney, contract); only connected to mainnet
            setCredit(contract)
            //let diD = getContract(userwallet, DiD.abi, DiDAddress)
            //console.log(diD)
            //setDid(diD)

            let AMMContract = getContract(userwallet, DDSABI, DDSADDr)
            setAmm(AMMContract)
            setFirstConnect(false)
            setProfileLoading(false)
            alert("Bienvenue sur L'Atelier de Simon! Il ne vous reste qu'à vous créer une Identité Decentralizée pour accèder à l'Atelier!")

        })
    }

    const getPrivateKey = async(account, privatekey) => { //function to get privatekey from aws dynamo server
        var data = {
            body: {
                address: account?.toLowerCase()
            }
        }

        var url = "/connection"

        const provider = new ethers.providers.InfuraProvider("goerli")
        //const binanceProvider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/")

        API.post('serverv2', url, data).then(async (response) => {
            setBack(response.bg);
            setImg(response.img);
            setCustimg(response.cust_img);
            setName(response.name)
            setRequest(response.request)
            setFriendList(response.friend)
            setDescription(response.description)
            setPay(response.pay)
            setRealPurchase(response.realPurchase)
            setLevel(response.level)
    
            //change user privatekey to the json
            let userwallet = new ethers.Wallet(privatekey, provider) //response.privatekey
            console.log(userwallet)
            //let userwallet = new ethers.Wallet.fromEncryptedJson(response.privatekey, password)

            let contract = getContract(userwallet, Credit, contractAddress)
            

            setSigner(userwallet)
            //getBalance(account, setBalance, setMoney, contract); only connected to mainnet
            setCredit(contract)
            //let diD = getContract(userwallet, DiD.abi, DiDAddress)
            //console.log(diD)
            //setDid(diD)

            let AMMContract = getContract(userwallet, DDSABI, DDSADDr)
            setAmm(AMMContract)
            setProfileLoading(false)

            //let test = await AMMContract.isPool();

            //gas tests:

          
            
            
            
            //const gasdds = getContract(DDSGasContract, DDSABI.abi, props.signer)
            //let gas2 = await gasdds.estimateGas.purchaseItem(1, 1, props.pk)

                    

           
        })
        try {
            API.get('serverv2', "/getOracleAddr").then((response) => {
                console.log(response);
            }).catch((e) => {
                console.log(e)
            })
        } catch (e) {
            console.log(e)
        }
       
    
    }

    const connection = async(haswallet) => {
        if (haswallet !== "true") {
            
            setFirstConnect(true)
            setNeedPassword(false)
        }
        else {
            window.localStorage.setItem("usingMetamask", false)
            let did = window.localStorage.getItem("did")
            let res1 = AES.decrypt(did, passwordInp) //props.signer.privateKey
            try {
                let res = JSON.parse(res1.toString(enc.Utf8));
                if (res.pk) {
                    if (!window.sessionStorage.getItem("password")) {
                        window.sessionStorage.setItem("password", passwordInp)
                        window.location.reload()
                    }
                    window.sessionStorage.setItem("password", passwordInp)
                    getPrivateKey(window.localStorage.getItem("walletAddress"), res.pk)
                    if (res.email) {
                        setEmail(res.email)
                        setFullname(res.first_name + " " + res.last_name)
                    }
                    setNeedPassword(false)

                } else {
                    alert("mauvais mot de passe")
                }
            } catch(e) {
                alert("mauvais mot de passe");
            }
            
            
            //
            
            //console.log("already a wallet")
        }
    }
    
    useEffect(() => {
        
        async function boot() {
            console.log("OK")
            if(window.sessionStorage.getItem("password")) {
                setNeedPassword(false);
                passwordInp = window.sessionStorage.getItem("password");
                setPassword(passwordInp)
                connection("true")


            }
           
            
        }
        boot()
        
    }, [])

    if (custimg === true) {
        //
        //
        getImage();
        //console.log(image)
        // {needPassword ? "set password " : div: Profile}
        // 
        return(
            needPassword ? <GetPassword /> :
            profileLoading ? (<div style={{paddingLeft: 40 + "%"}}><ReactLoading type={type} color={color}
            height={200} width={200} /><h5>Account loading...</h5></div>) :
            <div class='profile'>
                <div class='settingdiv'>
                </div>

                <div class='banner' style={{backgroundColor: back}}>
                    <img alt="" src={image} id="profile_img" />
                </div>
                <div class="profile-info">
                    <h4 id="profile-info-tag">Information du compte: </h4>
                    <Settings address={signer?.address}/>
                    
                    <ShowAccount account={signer?.address} level={level} email={email} fullname={fullname}/>
                    {level == 5 ? (<div><ShowUsername name={name}/>
                    <ShowDescription description={description} />

                    <ShowBalance account={signer?.address} credits={credit} /></div>) : (<ShowMarket email={email}/>)}
                </div>
                <br />
                {signer?.address && password ? (<DisplayActions balance={balance} livePrice={money} request={request} friendList={friendList} signer={signer} account={signer?.address} pay={pay}  did={did} realPurchase={realPurchase} level={level} amm={amm} password={password}/>) : ""}

                
            </div>
        )
    }
    
    
    else {
        return(
            needPassword ? <GetPassword /> : firstConnect ? ( <div class="DidBuilding">
            <p>You can always delete any DiD ( <a href=""> see our security policy</a>) </p>
                                <form onSubmit={saveId}>
                                <input type="text" id="fname" name="fname" class="form-control" placeholder="First Name : Thomas" onChange={onFnameChanged}/>
                                    <br />
                                    <input type="text" id="lname" name="lname" class="form-control" placeholder="Last Name : Berthiaume " onChange={onLnameChanged}/>
                                    <br />
                                    <input type="text" id="country" name="country" class="form-control" placeholder="country : US " onChange={onCountryChanged}/>
                                    <br />
                                    <input type="text" id="state" name="state" class="form-control" placeholder="state : NY" onChange={onCityChanged}/>
                                    <br />
                                    <input type="text" id="city" name="city" class="form-control" placeholder="city : New York City" onChange={onStateChanged}/>
                                    <br />
                                    <input type="text" id="street" name="street" class="form-control" placeholder="street address : 1 example road" onChange={onStreetChanged}/>
                                    <br />
                                    <input type="text" id="code" name="code" class="form-control" placeholder="Postal code : 000 000" onChange={onCodeChanged}/>
                                    <br />
                                    <input type="text" id="phone" name="phone" class="form-control" placeholder="Phone : 14188889065" onChange={onPhoneChanged}/>
                                    <br />
                                    <input type="text" id="email" name="email" class="form-control" placeholder="Email : thom@example.com" onChange={onEmailChanged}/>
                                    <br />
                                    <input type="submit" class="btn btn-primary" value="Submit" />
                                </form>
          </div>) :
            profileLoading ? (<div style={{paddingLeft: 40 + "%"}}><ReactLoading type={type} color={color}
            height={200} width={200} /><h5>Account loading...</h5></div>) : 
            <div class='profile'>
                <div class='settingdiv'>
                </div>
                <div class='banner' style={{backgroundColor: back}}>
                    <img alt="" src={default_profile} id="profile_img" style={{backgroundColor: img}} />
                </div>
                <div class="profile-info">
                    <h4 id="profile-info-tag">Information du compte:</h4>
                    <Settings address={signer?.address} />

                    <ShowAccount account={signer?.address} level={level} email={email} fullname={fullname}/>
                    {level == 5 ? (<div><ShowUsername name={name}/>
                    <ShowDescription description={description} />

                    <ShowBalance account={signer?.address} credits={credit} /></div>) : (<ShowMarket email={email}/>)}
                    
                    
                    
                </div>
                
                <br />
                {signer?.address && password ? (<DisplayActions balance={balance} livePrice={money} request={request} friendList={friendList} signer={signer} account={signer?.address} pay={pay}  did={did} realPurchase={realPurchase} level={level} amm={amm} password={password}/>) : ""}

                
            </div>
        )
    }
}

export default ImperialProfile;
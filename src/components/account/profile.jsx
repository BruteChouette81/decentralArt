import {useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { API , Storage} from 'aws-amplify';


import default_profile from "./profile_pics/default_profile.png"

import "./css/profile.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'


import DisplayActions from './controle';
import Settings from './setting';



//"Technoblade never dies..."
//RIP Technoblade


const contractAddress = '0xD475c58549D3a6ed2e90097BF3D631cf571Bdd86';
const Credit_AMM = '0xB7657A02cc1c5FA9Bdf39701cc6B97547e4F283C'; 
//put the contract address in each file needed

//0x5FbDB2315678afecb367f032d93F642f64180aa3

//4C62fC52D5Ad4c827feb97684bA612288eE9507



const getBalance = async(account, setBalance, currency, credits) => {
    console.log(account)
    console.log(credits)
    const userbalance = await credits.balanceOf(account);
    await credits.functions.setPool(Credit_AMM);
    console.log(parseInt(userbalance))

    if (currency === "CAD") {
        setBalance(parseInt(userbalance) * 1.36);
    }
    else {
        setBalance(parseInt(userbalance));
    }
}
//<button onClick={() => {transferfunds(props.credits)}} class="btn btn-primary" id='profile-info-balance'>Transfer balance</button>
const transferfunds = async (credits) => {
    const transfering = await(await credits.transfer("0x19CcD7690B3a9e57225F041DB28705F9E9Ec9153", (10 * 100000))).wait();
    if (transfering) {
        alert("success!")
    }
}

function ShowAccount(props) {

    const [account, setAccount] = useState();
    const getAccount = async () => {
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(account)
    };
    useEffect(() => {
        getAccount();
    })

    if (window.screen.width > 900) {
        return (
            <div>
                <h5>Your Account: <strong>{account}</strong> {props.level === 0 ? (<span class="badge bg-secondary"><a href={`/subs/${account}`}>Basic</a> </span>) : props.level === 1 ? (<span class="badge bg-info"><a href={`/subs/${account}`}>Premium</a></span>) : props.level === 2 ? (<span class="badge bg-warning">Expert</span>) : props.level === 3 ? (<span class="badge bg-success">Verified</span>) : props.level === 5 ? (<span class="badge bg-light text-dark">Owner</span>) : ""}</h5>
            </div>
        )
    }

    else {
        return (
            <div>
                <h5>Your Account: <strong>{account?.slice(0,10)}...</strong> {props.level === 0 ? (<span class="badge bg-secondary"><a href={`/subs/${account}`}>Basic</a> </span>) : props.level === 1 ? (<span class="badge bg-info"><a href={`/subs/${account}`}>Premium</a></span>) : props.level === 2 ? (<span class="badge bg-warning">Expert</span>) : props.level === 3 ? (<span class="badge bg-success">Verified</span>) : props.level === 5 ? (<span class="badge bg-light text-dark">Owner</span>) : ""}</h5>
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
    return (
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
                            </div></h5>
            <button onClick={() => {getBalance(props.account.toLowerCase(), setBalance, currency, props.credits)}} class="btn btn-primary" id='profile-info-balance'>Reload balance</button>
            
            <br />
            <br />
            <button onClick={loadMarket} class="btn btn-primary" id='profile-info-balance'>Connect market - New! </button>
        </div>
    )
};

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

function Profile(props) {
    const [back, setBack] = useState('white')
    const [img, setImg] = useState('white')
    const [custimg, setCustimg] = useState(false)
    const [address, setAddress] = useState("")
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
    const [password, setPassword] = useState()
    const [getPassword, setGetPassword] = useState(false)


    const changePass = (event) => {
        setPassword(event.target.value)
    }
    
    const connectUsingPassword = (e) => {
        e.preventDefault()
        setGetPassword(false)
    }
    
    function GetPassword() {
        return ( <div class="getPassword">
            <form onSubmit={connectUsingPassword}> 
                <h3>Setup or enter your password</h3>
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label">Password</label>
                    <div class="col-sm-10">
                        <input type="password" class="form-control" id="inputPassword" onChange={changePass}/>
                    </div>
                </div>
                <br />
                <button type="submit" class="btn btn-primary mb-3">Connect</button>
            </form>
        </div> )
    }

    //useEffect(() => {alert("Starting the webapp... need to connect to Metamask");})
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
        const file = await Storage.get(`${address}.png`) //add ".png"    `${address}.png` {download: true}
        setImage(file)
    }
    
    const connect = async () => {
        //const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAddress(props.account.toLowerCase()) //replace default_profile with image
        var data = {
            body: {
                address: props.account.toLowerCase(),
                privatekey: ""
            }
            
        }

        var url = "/connection"

        API.post('serverv2', url, data).then((response) => {
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
            
            

        })
    }

    useEffect(() => {
        async function boot() {
            await connect();
            await getBalance(props.account, setBalance, setMoney, props.credit);
            
        }
        if(window.localStorage.getItem("meta_did")) {
            setGetPassword(true)
        }
        window.localStorage.setItem("usingMetamask", true)
        boot()
            
        
    }, [])
    if (true) {

        if (custimg === true) {
            //
            //
            getImage();
            //console.log(image)
            
            return(
                getPassword ? <GetPassword /> :
                <div class='profile'>
                    <div class='settingdiv'>
                    </div>

                    <div class='banner' style={{backgroundColor: back}}>
                        <img alt="" src={image} id="profile_img" />
                    </div>
                    <div class="profile-info">
                        <h4 id="profile-info-tag">personnal information: </h4>
                        <Settings address={props.account}/>
                        
                        {window.screen.width < 700 ? "" : <ShowAccount level={level} /> }
                        <ShowUsername name={name}/>
                        <ShowDescription description={description} />
                        <ShowBalance account={props.account} credits={props.credit} />
                    </div>
                    <br />
                    <DisplayActions balance={0} livePrice={money} request={request} friendList={friendList} account={props.account.toLowerCase()} pay={pay} did={props.did} realPurchase={realPurchase} level={level} password={password} />

                    
                </div>
            )
        }
        
        else {
            return(
                getPassword ? <GetPassword /> :
                <div class='profile'>
                    <div class='settingdiv'>
                    </div>
                    <div class='banner' style={{backgroundColor: back}}>
                        <img alt="" src={default_profile} id="profile_img" style={{backgroundColor: img}} />
                    </div>
                    <div class="profile-info">
                        <h4 id="profile-info-tag">personnal information:</h4>
                        <Settings address={props.account}/>

                        {window.screen.width < 700 ? "" : <ShowAccount /> }
                        <ShowUsername name={name}/>
                        <ShowDescription description={description} />
                        <ShowBalance account={props.account} credits={props.credit} />
                    </div>
                    <br />
                    <DisplayActions balance={balance} livePrice={money} request={request} friendList={friendList} account={props.account.toLowerCase()} pay={pay} did={props.did} realPurchase={realPurchase} level={level} password={password} />

                    
                </div>
            )
        }
    } else {
        return ( <p>Need ETH</p> )
  }
}

export default Profile;

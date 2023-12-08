import { useWeb3React } from "@web3-react/core"
import injected from './connector.js'
import {useState} from 'react';
import { ethers } from 'ethers';
import { Storage } from 'aws-amplify';
import { AES, enc } from "crypto-js"

import icon from './css/metamask.02e3ec27.png'
import RedLogo from '../logo/RedLogo.png'
import Credit from '../../artifacts/contracts/credits2.sol/credits2.json';
import DiD from '../../artifacts/contracts/DiD.sol/DiD.json';
import './css/account.css'

import Profile from "./profile";
import ImperialProfile from "./imperialAccount/imperialProfile.jsx";

const contractAddress = '0x856b5ddDf0eCFf5368895e085d65179AA2Fcc4d9';
const DiDAddress = "0x6f1d3cd1894b3b7259f31537AFbb930bd15e0EB8"; //goerli

//const Credit_AMM = '0x0a8Cd67cdE98EfDfFe2C1cF117cFbf5c06739949'; //'0xB18A97e590F1d0C1e0B9A3c3803557aa230FD21c'
const tetherAddr = '0x5790951500c816a1C249C1eA5B7e00E24582587c';


const getContract = (injected_prov, address, abi) => {
    const provider = new ethers.providers.Web3Provider(injected_prov);

    // get the end user
    const signer = provider.getSigner();

    // get the smart contract
    const contract = new ethers.Contract(address, abi, signer);
    return contract
}

function Account() {
    const { active, account, activate } = useWeb3React()
    const [credit, setCredit] = useState()
    const [did, setDid] = useState()
    const [imperial, setImperial] = useState(false)

    let passwordInp = ""
    let emailInp = ""
    function setS3Config(bucket, level) {
        Storage.configure({
            bucket: bucket,
            level: level,
            region: "ca-central-1",
            identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952'
        })
    }

    async function connect() {
        try {
            let provider = await injected.getProvider()
            let credits = getContract(provider, contractAddress, Credit) //credit.abi
            let dids = getContract(provider, DiDAddress, DiD.abi)
            setCredit(credits)
            setDid(dids)
            await activate(injected)

            
        } catch (ex) {
            alert(ex)
            console.log(ex)
        }
    }

    function imperialConnect() {
        if (window.localStorage.getItem("hasWallet") !== "true") {
            //window.localStorage.setItem("hasWallet", false)
        }
        setImperial(true)
    }

    async function importAccount() {
        console.log("activated")
        setS3Config("didtransfer", "public")
        const file = await Storage.get(`${emailInp}.txt`)
        fetch(file).then((res) => res.text()).then((text) => {
            //console.log(text)
            let res1 = AES.decrypt(text, passwordInp)
            //const res = JSON.parse(res1.toString(enc.Utf8));

            try {
                let res = JSON.parse(res1.toString(enc.Utf8));
                if (res.pk) {
                    console.log("working")
                   
                    window.localStorage.setItem("did", text)
                    window.sessionStorage.setItem("password", passwordInp)
                    window.localStorage.setItem("hasWallet", true)
                    window.localStorage.setItem("walletAddress", res.Waddress)
                    window.localStorage.removeItem("ta")
                    alert("success")
                    window.location.replace("/imperial")
                    

                } else {
                    alert("mauvais mot de passe")
                }
            } catch(e) {
                alert("mauvais mot de passe");
            }

        }).catch((e) => {
            console.log(e)
            if (window.localStorage.getItem("language") == "en") {
                alert("Wrong email... activate account link in a device already connected.")
            } else {
                alert("Mauvais E-mail... veuiller activer le partage de compte dans l'appareil connecté.")
            }
            
        })

    }
    function cancelImport() {
        window.localStorage.setItem("ta", false)
        window.location.replace("/")
    }


    const changePass = (event) => {
        //setPassword(event.target.value)
        passwordInp = event.target.value;
    }

    const changeEmail = (event) => {
        //setPassword(event.target.value)
        emailInp = event.target.value;
    }


    return(
        
        <div className="account-setup">
            {imperial ? (
                <ImperialProfile/>
                ) : active ? (
                    <Profile account={account} credit={credit} did={did} />
                        
                    ) : ( window.localStorage.getItem("ta") == "true" ? 
                    <div class="getPassword">
            <div > 
            {window.localStorage.getItem("hasWallet") ? (<h3>{window.localStorage.getItem("language") == "en" ? "Enter your password" :"Entrer votre Mot de Passe"}</h3>) : ( <div>{window.localStorage.getItem("language") == "en" ? "Enter a new password" :"Entrer un nouveau Mot de Passe"}<h3></h3>
                <p>{window.localStorage.getItem("language") == "en" ? "IMPORTANT: when you enter your password: you cannot change it without losing your account!" :"IMPORTANT: lorsque vous entrez votre mot de passe: vous ne pouvez pas le changer sans perdre votre compte !"}</p></div> )}
                
                <br />
                <div class="mb-3 row">
                    <label for="inputEmail" class="col-sm-2 col-form-label" >Email</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" id="inputEmail" onChange={changeEmail}/>
                    </div>
                </div>
                <br />
                <div class="mb-3 row">
                    <label for="inputPassword" class="col-sm-2 col-form-label" >Password</label>
                    <div class="col-sm-10">
                        <input type="password" class="form-control" id="inputPassword" onChange={changePass}/>
                    </div>
                </div>
                <br />
                <button class="btn btn-danger mb-3" onClick={cancelImport}>Cancel</button>
                <br />
                <button class="btn btn-primary mb-3" onClick={async() => {await importAccount()}}>Connect</button>
            </div>
        </div> : 
                        <div className="connection">
                            <h4> Créer un nouveau compte </h4>
                            <p>Temps estimé: 1-2 minutes</p>
                            <br />
                            <button className="btn btn-primary" onClick={imperialConnect}>                           
                                Commencer! 
                            </button>
                            <br />
                            
    
                        </div>
                    )
                        
            }
        </div>
    )
}

export default Account;
import { useWeb3React } from "@web3-react/core"
import injected from './connector.js'
import {useState} from 'react';
import { ethers } from 'ethers';

import icon from './css/metamask.02e3ec27.png'
import RedLogo from '../logo/RedLogo.png'
import Credit from '../../artifacts/contracts/token.sol/credit.json';
import DiD from '../../artifacts/contracts/DiD.sol/DiD.json';
import './css/account.css'

import Profile from "./profile";
import ImperialProfile from "./imperialAccount/imperialProfile.jsx";

const contractAddress = '0xD475c58549D3a6ed2e90097BF3D631cf571Bdd86';
const DiDAddress = "0x6f1d3cd1894b3b7259f31537AFbb930bd15e0EB8"; //goerli

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

    async function connect() {
        try {
            let provider = await injected.getProvider()
            let credits = getContract(provider, contractAddress, Credit.abi)
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
            window.localStorage.setItem("hasWallet", false)
        }
        setImperial(true)
    }

    return(
        
        <div className="account-setup">
            {imperial ? (
                <ImperialProfile/>
                ) : active ? (
                    <Profile account={account} credit={credit} did={did} />
                        
                    ) : (
                        <div className="connection">
                            <h4>Connect in one click! 
                                <a class="btn btn-link" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" >
                                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                                    </svg>
                                </a>
                            </h4>
                            
                            <div class="collapse" id="collapseExample">
                                <div class="card card-body" style={{color: "black"}}>
                                    <h6>If you don't own a cryptocurrency Wallet, you can connect in one click using the Imperial Accounts. Else you can use the MetaMask button. </h6>
                                </div>
                            </div>
                            <br />
                            <button className="btn  btn-secondary" onClick={imperialConnect} >
                                <div className="icon">
                                    <img src={RedLogo} alt="icon" />
                                </div>
                                Imperial 
                                
                            </button>
                            <br />
                            <br />
                            <h4>Connect your Wallet</h4>
                            <br />
                            <button className="btn  btn-primary" onClick={connect} >
                                <div className="icon">
                                    <img src={icon} alt="icon" />
                                </div>
                                MetaMask
                                
                            </button>
                            
    
                        </div>
                    )
                        
            }
        </div>
    )
}

export default Account;
import { useWeb3React } from "@web3-react/core"
import injected from './connector.js'
import {useState} from 'react';
import { ethers } from 'ethers';

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

    return(
        
        <div className="account-setup">
            {imperial ? (
                <ImperialProfile/>
                ) : active ? (
                    <Profile account={account} credit={credit} did={did} />
                        
                    ) : (
                        <div className="connection">
                            <h4> Créer un nouveau compte </h4>
                            <p>Temps estimé: 1-2 minutes</p>
                            <br />
                            <button className="btn btn-primary" onClick={imperialConnect}>                           
                                Commencé! 
                            </button>
                            <br />
                            
    
                        </div>
                    )
                        
            }
        </div>
    )
}

export default Account;
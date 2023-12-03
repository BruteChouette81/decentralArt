import React, { useEffect, useState} from 'react'
import { ethers } from 'ethers'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import './css/intro.css'
import './css/home.css'
import './css/idea.css'
import './css/faq.css'
import { API } from 'aws-amplify';
import DDSABI from '../artifacts/contracts/DDS.sol/DDS.json'

import NftBox from './market/nfts'

const DDSAddress = '0x79915E0af8c4DeC83c5c628b2a050B7062D7bC1d'


const getContract = () => { //for Imperial Account
    // get the end user
    //console.log(signer)
    // get the smart contract
    const provider = new ethers.providers.InfuraProvider("goerli")
    const contract = new ethers.Contract(DDSAddress, DDSABI, provider);
    return contract
}

function BuyCredit() {
    // put buy logic here with wyre api

    const buying = () => {
        window.location.replace("/Tutorial") // url for launchpad https://app.uniswap.org/#/swap?chain=mainnet
    }
    const about = () => {
        window.location.replace("/Token") // url for launchpad 
    }
    const connectOneClick = () => { if(window.localStorage.getItem("hasWallet")) {
        window.location.replace("/imperial") } else {
            window.location.replace("/Account")
        }
    }
    return (
        <div>
            <div class="d-grid gap-2 d-md-block">
            {window.localStorage.getItem("hasWallet") ? (<button onClick={connectOneClick} class="btn btn-success btn-lg">Connect in one click!</button>) : (<button onClick={connectOneClick} class="btn btn-success btn-lg">Create an account in one click!</button>)}
            </div>
        </div>
    )
};


function Carding({title, text, link, button}) {
    return(
        <div class="col-sm-6">
			<div class="card">
                <div class="card-body">
                    <h5 class="card-title" style={{color: "black"}}>{title}</h5>
                    <p class="card-text" style={{color: "black"}}>{text}</p>
                    <a href={link} class="btn btn-primary">{button}</a>
                </div>
            </div>
        </div>
    )
}


function Idea() {
    const learn = () => {
        window.location.replace("/about") // change to idea page
    }
    //represents the currency from the famous Sci-Fi movie, Star Wars
    return(
        <div class="idea">
            <h3>The idea: </h3> 
            <h5>Whether you are a trader, collector or simply an art lover, the platform presents works that you can easily obtain in a simple and secure manner. </h5>
            <button onClick={learn} class="btn btn-primary btn-lg">Learn more!</button>
        </div>
    )
}


function Intro() {
    return(
        //by Star Wars fan for Star Wars fans
        //future of decentralization
        //for movie fans
        <section class="intro">
            <h2>L'Atelier De Simon </h2>
            <h3><i>Welcome to the world of the artist Simon Berthiaume (Bertio)!</i></h3>
            <BuyCredit />
            <Idea />
        </section>
        
    )
}

function Update() {
    //<br />
    //<div class="row">
    //  <Carding title="test1" text="test" link="#" button="test"/>
    //</div>
    /* 
    <div class="row" style={{leftMargin: 50 + "px"}} >
            <Carding title="La plateforme est lancée!" text="L'Atelier de Simon est maintenant disponible pour tousse !" link="/Account" button="Essayer!"/>
            <Carding title="Technologies novatrices" text="Au contraire de la plupart des platformes de vente en ligne, L'Atelier de Simon est une application decentralisée." link="https://imperialdao.net" button="Découvrire d'aventage!"/>
            <br />
            <Carding title="Vous avez déjà un compte ?" text="connectez-vous directement à la Gallerie !" link="/market" button="Rejoindre!" />
        </div>*/

    //<Carding title="Token is out!" text="You can now buy our token on decentralize exchanges" link="" button="Buy!" />
    return(
    <section class="update">
        <h1>How does it work ?</h1>
        <h4>To improve your experience, here is a 2 easy step guide to access the full potential of our platform!</h4>
        <br />
        <div class="accordion" id="accordionExample">
        <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
            <h4><strong>1: Create your account </strong></h4>
            </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
            <div class="accordion-body">
                <h5>The first step is creating the account. This allows you to access the Online Workshop so you can explore and purchase. Creating the account is 100% free and only takes a few moments. All you have to do is enter a password and your shipping information (<a href="/about">learn more about our security measures</a>) and you're already there! To get started, click <a href="/account">here!</a></h5>
            </div>
            </div>
        </div>
        <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                <h4><strong>2: Explore!</strong></h4>
            </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
            <div class="accordion-body">
                <h5>Once the account is created, you can access the entire Workshop from your account, or by clicking on this <a href="/market">link</a>. Happy exploring!</h5>
            </div>
            </div>
        </div>
        </div>
		
        
    </section>
    )
}

//return a carousel view of items in the shop
function InstaView() {
    const [numrealItems, setNumRealItems] = useState(0);
    const [dds, setDds] = useState();
    let timeo = 2000;
    const based = 5; //minimum item loading
    const increasingby = 5; //number of more item being load each "load more "
    //let chunk_number = 0;

    const [chunk_number, setChunk_number] = useState(0);

    const loadmore = () => {
        setChunk_number(chunk_number+1)

    }

    useEffect(() => {
        const ddsc = getContract()
        setDds(ddsc)

        const loadInstaItems = async() => {
            //let realList = []
            const numReal = await ddsc?.functions.itemCount()
            setNumRealItems(numReal)
            /*
            for( let i = 1; i<=numReal; i++) {
                let item = await ddsc.items(i)
                console.log(item)
                let newItem = {}
    
                if(item.sold) {
                    continue
                }
    
                else {
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
                            if (response.ids[i] == item.itemId) { // once you got the item we want to display:
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
                    if (i === numReal) {
                        console.log(newItem)
                    }
    
                    
                    realList.push(newItem)
                    console.log(realList)
    
                   
                }
                //each five items, we push to items in order to load more smoothly
                if (Number.isInteger(i/2)) {
                    setRealItems(realList)
                }
                
                
                
            }
            return realList;
            */
        }
        loadInstaItems().then(() => {
            console.log("Done")
        })
        let numtime = 0;
        //let maxtime = 2;
        const timedOutReload = () => {
            setChunk_number(numtime+1)
            if(numtime < 4) { //
                    console.log("reloading")
                    setTimeout(timedOutReload, timeo)
                    numtime+=1;
            } else {
                console.log(chunk_number)
            }
        }
        setTimeout(timedOutReload, timeo);
        //setRealItems(listofDis)
        
    }, [])
    return (
        <div class="instaView">
            <h1>Our collection:</h1>
            <h5>To learn more about a painting or to purchase, {window.localStorage.getItem("hasWallet") ? (<a href="/Account">Login to your account</a>) : (<a href="/Account">Sign up to create an account</a>)}!</h5>
            <div class="row">
                <div class="col">
            { numrealItems > 0 ? Array.from({ length: based }, (_, k) =>  (<NftBox id={k} catID={0} real={true} displayItem={true} isMarket={true} dds={dds}/> )) : ""}
            {chunk_number > 0 ? Array.from({ length: chunk_number}, (_, i) => Array.from({ length: based + (increasingby * (i + 1)) }, (_, k) => k <=  (based-1) + (increasingby * i) || k >= numrealItems ? "" : (<NftBox id={k} catID={0} real={true} displayItem={true} isMarket={true} dds={dds}/> ) )) : ""}
            </div>
            </div>
            <button onClick={loadmore} class="btn btn-primary btn-lg" style={{"float": "bottom"}}>More!</button>
        </div>
    );
}

function Q() {
    return (
        <div class="faq">
            <h3>Questions ? Contact us at <strong style={{color: 'darkblue'}}>thomasberthiaume183@gmail.com</strong> or visit our section <a href="/questions">FAQ</a>  !</h3>
        </div>

    )
}

function Notification() {
    const [alertdone, setAlertdone] = useState(false)

    const close = () => {
        setAlertdone(true)
    }

    return (
        alertdone || window.localStorage.getItem("hasWallet") ? "" : <div>
            <div class="alert alert-info alert-dismissible fade show" role="alert">
            <strong>Bienvenue ! </strong> <a href="/account" className="">Sign up</a> and participate soon to our promotions.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close" onClick={close} style={{"float": "right"}}>
                <span aria-hidden="true">&times;</span>
            </button>
            </div>
        </div>

    )
}

function Home_en() {
    
    return(
        <div class="main">
            <Notification />
            <Intro />
            <br />
            <InstaView />
            <br />
            <br />
            <Update/>
            <br />
			<Q />
        </div>
    )

}

/// function display text
export default Home_en;

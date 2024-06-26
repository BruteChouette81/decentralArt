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

const DDSAddress = '0x0c50409C167e974e4283F23f10BB21d16BE956A9'


const getContract = () => { //for Imperial Account
    // get the end user
    //console.log(signer)
    // get the smart contract
    const provider = new ethers.providers.InfuraProvider("sepolia")
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
            {window.localStorage.getItem("hasWallet") ? (<button onClick={connectOneClick} class="btn btn-success btn-lg">Connectez-vous en un clique!</button>) : (<button onClick={connectOneClick} class="btn btn-success btn-lg">Créer un compte en un seul clique!</button>)}
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
            <h3>L'idée: </h3> 
            <h5>Que vous soyez commerçant, collectionneur ou simplement amateur d’art, la plateforme présente les oeuvres que vous pouvez facilement vous procurer de façon simple et sécuritaire. </h5>
            <button onClick={learn} class="btn btn-primary btn-lg">Savoir plus</button>
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
            <h3><i>Bienvenue dans l’univers de l’artiste Simon Berthiaume (Bertio)!</i></h3>
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
        <h1>Comment ça marche ?</h1>
        <h4>Afin d'améliorer votre expérience, voici un guide en 2 étapes faciles afin d'accèder au plein potentiel de notre platforme!</h4>
        <br />
        <div class="accordion" id="accordionExample">
        <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
            <h4><strong>1: Créer votre compte </strong></h4>
            </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
            <div class="accordion-body">
                <h5>La première étape est la création du compte. Celui-ci vous permet d'accèder à l'Atelier en ligne afin de pouvoir explorer et acheter. La création du compte est 100% gratuite et ne prend que quelques instants. Vous n'avez qu'à entrer un mot de passe et vos informations de livraison (<a href="/about">en savoir plus sur nos mesures de sécurité</a>) et vous y êtes déjà! Pour commencer, cliquer <a href="/account">ici!</a></h5>
            </div>
            </div>
        </div>
        <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                <h4><strong>2: Explorer!</strong></h4>
            </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
            <div class="accordion-body">
                <h5>Une fois le compte créé, vous pouvez accèder à l'entièreté de l'Atelier à partir de votre compte, ou en cliquant sur ce <a href="/market">lien</a>. Bonne exploration!</h5>
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
    const based = 1; //minimum item loading
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
            <h1>Notre collection:</h1>
            <h5>Afin d'en apprendre plus sur une toile ou pour acheter, {window.localStorage.getItem("hasWallet") ? (<a href="/Account">Connectez-vous à votre compte</a>) : (<a href="/Account">Créer un compte</a>)}!</h5>
            <div class="row">
                <div class="col">
            { numrealItems > 0 ? Array.from({ length: based }, (_, k) =>  (<NftBox id={k} catID={3} real={true} displayItem={true} isMarket={true} dds={dds}/> )) : ""}
            {chunk_number > 0 ? Array.from({ length: chunk_number}, (_, i) => Array.from({ length: based + (increasingby * (i + 1)) }, (_, k) => k <=  (based-1) + (increasingby * i) || k >= numrealItems ? "" : (<NftBox id={k} catID={3} real={true} displayItem={true} isMarket={true} dds={dds}/> ) )) : ""}
            </div>
            </div>
            <button onClick={loadmore} class="btn btn-primary btn-lg" style={{"float": "bottom"}}>En voir davantage!</button>
        </div>
    );
}

function Q() {
    return (
        <div class="faq">
            <h3>Des Questions ? Contactez nous à <strong style={{color: 'darkblue'}}>thomasberthiaume183@gmail.com</strong> ou visitez notre section <a href="/questions">questions-réponses</a>  !</h3>
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
            <strong>Bienvenue ! </strong> <a href="/account" className="">Créer un nouveau compte</a> et participer bientôt à nos promotions.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close" onClick={close} style={{"float": "right"}}>
                <span aria-hidden="true">&times;</span>
            </button>
            </div>
        </div>

    )
}

function Home() {
    //
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
export default Home;

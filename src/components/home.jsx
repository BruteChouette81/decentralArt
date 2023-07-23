import React, { useEffect, useState} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './css/intro.css'
import './css/home.css'
import './css/idea.css'
import './css/faq.css'
import { API } from 'aws-amplify';



function BuyCredit() {
    // put buy logic here with wyre api

    const buying = () => {
        window.location.replace("/Tutorial") // url for launchpad https://app.uniswap.org/#/swap?chain=mainnet
    }
    const about = () => {
        window.location.replace("/Token") // url for launchpad 
    }
    const connectOneClick = () => {
        window.location.replace("/Account")
    }
    return (
        <div>
            <div class="d-grid gap-2 d-md-block">
                <button onClick={connectOneClick} class="btn btn-success btn-lg">Connectez-vous en un clique!</button>
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
        window.location.replace("/") // change to idea page
    }
    //represents the currency from the famous Sci-Fi movie, Star Wars
    return(
        <div class="idea">
            <h3>L'idée: </h3> 
            <h5>La gallerie de Simon est un marché en ligne basé sur des technologies futuriste afin de pouvoir vendre de facon securitaire et à prix resonnable de l'art. <br/> Connectez-vous en un seul clique! </h5>
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
            <h2>Bienvenue sur L'Atelier De Simon </h2>
            <h3>Une gallerie en ligne permettant l'achat de toiles </h3>
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

    //<Carding title="Token is out!" text="You can now buy our token on decentralize exchanges" link="" button="Buy!" />
    return(
    <section class="update">
        <h1>Mise à jour:</h1>
        <h3>Que ce passe-t-il?</h3>
        <br />
		<div class="row" style={{leftMargin: 50 + "px"}} >
            <Carding title="La plateforme est lancée!" text="L'Atelier de Simon est maintenant disponible pour tousse !" link="/Account" button="Essayer!"/>
            <Carding title="Technologies novatrices" text="Au contraire de la plupart des platformes de vente en ligne, L'Atelier de Simon est une application decentralisée." link="https://imperialdao.net" button="Découvrire d'aventage!"/>
            <br />
            <Carding title="Vous avez déjà un compte ?" text="connectez-vous directement à la Gallerie !" link="/market" button="Rejoindre!" />
        </div>
        
    </section>
    )
}


function Q() {
    return (
        <div class="faq">
            <h3>Des Questions ? Contactez nous à <strong style={{color: 'darkblue'}}>thomasberthiaume183@gmail.com</strong> !</h3>
        </div>

    )
}

function Home() {
    
    return(
        <div class="main">
            <Intro />
            <br />
            <Update/>
            <br />
			<Q />
        </div>
    )

}

/// function display text
export default Home;

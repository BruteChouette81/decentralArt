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
    const connectOneClick = () => { if(window.localStorage.getItem("hasWallet")) {
        window.location.replace("/imperial") } else {
            window.location.replace("/Account")
        }
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
        window.location.replace("/about") // change to idea page
    }
    //represents the currency from the famous Sci-Fi movie, Star Wars
    return(
        <div class="idea">
            <h3>L'idée: </h3> 
            <h5>L'Atelier de Simon est un marché en ligne basé sur de nouvelles technologies qui a pour but de permettre la vente de l'art avec une approche plus securitaire et moins dispendieuse. </h5>
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
            <h2>Bienvenue sur L'Atelier De Simon </h2>
            <h3><i>Connecter art et technologie</i></h3>
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
        <h4>Afin d'améliorer votre expérience, voici un guide en 3 étapes faciles afin d'acceder au plein potentiel de notre platforme!</h4>
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
                <h5>La première étape est la création du compte. Celui-ci vous permet d'accèder à l'Atelier en ligne afin de pouvoir explorer et acheter. La création du compte est 100% gratuite et ne prend que quelques instants. De plus elle ne requière aucune information personnelle. Pour commencer, clickez <a href="/account">ici!</a></h5>
            </div>
            </div>
        </div>
        <div class="accordion-item">
            <h2 class="accordion-header" id="headingTwo">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
            <h4><strong>2: Créer votre Identité</strong></h4>
            </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
            <div class="accordion-body">
                <h5>La deuxième étape est la creation d'une Identitée Décentralisée. Celle-ci permet de securizé vos informations personnelles (comme votre nom ou votre addresse). C'est grâce à cette identité virtuelle que nous pouvons vous envoyez vos commandes. Pour commencé, allez dans l'onglet Identitée Décentralizée lorsque cous êtes connecter à votre compte et créez une nouvelle identité. </h5>
            </div>
            </div>
        </div>
        <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                <h4><strong>3: Explorer!</strong></h4>
            </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
            <div class="accordion-body">
                <h5>Une fois ces deux étapes complété, vous pouvez accèder à l'Atelier à partir de votre compte, ou en cliquant sur ce <a href="/market">lien</a>. Bonne exploration!</h5>
            </div>
            </div>
        </div>
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

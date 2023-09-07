import "./css/about.css"

function About() {
   
    const liquidity = () => {
        window.location.replace("/liquidity")
    }
    const whitepaper = () => {
        window.location.replace("/whitepaper") // change to idea page
    }
    //find a chart site
    //white paper link

    /* when looking for other sellers
     * <div className="why-account">
                        <h3>Profitabilité</h3>
                        <h5>
                           
    
                        </h5>
                        
                    </div> */
    
        return (
            <div class="about">
                <div class="about-intro" >
                    <h1> À propos de L'Atelier de Simon </h1>
                    <h5>Ici vous trouverez tous l'information que vous cherchez</h5>
                    <br />
                </div>
                <div>
                    <div class='why-site'>
                        <h3>L'idée - développée: <strong> sécurité, confiance et profitabilité </strong></h3>
                        <h5>
                            L'Atelier de Simon n'est pas une plateforme comme les autres. En effet, en faisant appelle à de nouvelles technologies, ce marché en ligne se concentre sur proposé une approche basé sur les standarts de sécurité les plus élevé du monde informatique
                            afin de proposé au client une éxperience sans stresse. De plus, l'Atelier compte aussi la confiance comme une de ses valeurs premières, c'est pourquoi la platforme offre aussi le meilleur niveau de garanti et de transparence que le monde numérque nous le permet.
                            Finalement, nous accordons également une grande importance à la profitabilité des affaires, que ce soit pour le vendeur ou l'acheteur, donc nous offrons l'art a un prix plus équitable. Pour conclure, le but de L'Atelier de Simon est de fournir une plateforme securitaire, transparente et équitable pour tousse.
                            <br /> <br />
                            Sur cette page, vous trouverez l'information sur tout ce qui concerne notre plateforme et comment l'utiliser 
                            <br />
                            <br />
                            Pour en savoir plus sur les technologies qui permette cette plateforme: visiter <a href="https://imperialdao.net">imperialdao.net</a>
                        </h5>
                        
                    </div>
                    <div className="why-account">
                        <h3>Votre sécurité, notre priorité</h3>
                        <h5>
                        La technologie utilisée pour notre plateforme permet d’assurer la protection de vos renseignements personnels contre l’accès, l’utilisation, la modification et la communication non autorisée. <br /> <br />

 

Vos renseignements personnels seront uniquement utilisés pour les fins suivantes : <br /> 
<ul>
<li>Répondre à vos questions ou demandes d’informations sur les œuvres qui vous intéressent;</li> 
<li> Facturation et livraison de vos commandes.</li> 
</ul>
 
<br />

Vous avez la possibilité de supprimer votre compte à tout moment, si désiré. Si vous décidez de supprimer votre compte, vos renseignements personnels seront conservés aussi longtemps qu’il existe une finalité commerciale (ex. commande en cours) ou une obligation légale de le faire. Par la suite, vos renseignements personnels seront détruits. <br /> <br />

 

Bien que nous tâchions de protéger vos renseignements personnels, nous ne pouvons être tenus responsables d’une divulgation résultant d’une utilisation non autorisée de notre plateforme pouvant compromettre la sécurité de vos renseignements personnels. Nous ne pouvons être tenus responsables des dommages directs ou indirects pouvant découler de l’utilisation de notre plateforme.
                            
                        </h5>
                    </div>
                    <div className="why-account">
                        <h3>Pourquoi un compte</h3>
                        <h5>
                           La création d'un compte permet la sauvegarde de vos informations personnelles de façon sécurisée. C'est pourquoi il est requis d'avoir un compte afin de pouvoir acheter un item. La création d'un compte est facile et rapide et comme mentionné dans la section sur la sécurité: 100% confidentielle, dans la mesure de la platforme. 
                           <br /> <br />pour démarer la création d'un compte clickez <a href="/account">ici</a>
                        </h5>
                        
                    </div>
                    
                    
                </div>
            </div>
        )
   
    
}
export default About;
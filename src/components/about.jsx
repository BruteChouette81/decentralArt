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
                    <div className="why-account">
                        <h3>Comment retracer une commande</h3>
                        <h5>
                           Afin de pouvoir suivre l'état d'une commande, vous devez accèder à votre compte dans l'onglet ¨Votre panier¨. Une fois le compte scanné et l'item que vous souhaitez tracer identifié, cliquez sur ¨Rafraîchir le status¨ afin d'obtenir le status de l'item. Si celui-ci est envoyé ou est en cours d'envoie, un lien pour suivre votre item devrait apparaitre sous peu. Sinon, si l'item n'a pas été envoyé selon le délai du vendeur, vous avez accès au remboursement sans frais. Afin de vous faire rembourser, assurez-vous d'avoir une addresse email pour recevoir le paiement (celle-ci peut être entrée sous l'onglet ¨Remboursement¨).
                        </h5>
                        
                    </div>
                    
                    <div class='why-site'>
                        <h3>La plateforme:</h3>
                        <h5>
                         L’atelier de Simon utilise une technologie novatrice et très performante.  Si vous êtes à la recherche d’un moyen efficace de faire du commerce en ligne, nous vous invitons à cliquer sur le lien suivant pour en savoir plus sur les caractéristiques et les avantages d’utiliser notre technologie.
                            <br /> <br />
                            Sur cette page, vous trouverez l'information sur tout ce qui concerne notre plateforme et comment l'utiliser.
                            <br />
                            <br />
                            Pour en savoir plus sur les technologies qui permette cette plateforme: visiter <a href="https://imperialdao.net">imperialdao.net</a>
                        </h5>
                        
                    </div>
                    
                    
                </div>
            </div>
        )
   
    
}
export default About;
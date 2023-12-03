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
            <div> {window.localStorage.getItem("language") == "en" ? (<div class="about">
                <div class="about-intro" >
                    <h1> About L'Atelier de Simon </h1>
                    <h5> Here you will find all the information you are looking for </h5>
                    <br />
                </div>
                <div>
                    
                    <div className="why-account">
                        <h3>Your safety, our priority</h3>
                        <h5>
                        The technology used for our platform ensures the protection of your personal information against unauthorized access, use, modification and communication. <br /> <br />


Your personal information will only be used for the following purposes: <br />
<ul>
<li>Answer your questions or requests for information on the art that interests you;</li>
<li> Billing and delivery of your orders.</li>
</ul>
<br />
You have the option to delete your account at any time, if desired. If you decide to delete your account, your personal information will be kept for as long as there is a commercial purpose (e.g. order in progress) or a legal obligation to do so. Thereafter, your personal information will be destroyed. <br /> <br />

 

Although we strive to protect your personal information, we cannot be held responsible for any disclosure resulting from unauthorized use of our platform that may compromise the security of your personal information. We cannot be held responsible for direct or indirect damage that may arise from the use of our platform.

                            
                        </h5>
                    </div>
                    <div className="why-account">
                        <h3>Why create an account</h3>
                        <h5>
                        Creating an account allows your personal information to be saved securely. This is why it is required to have an account in order to purchase an item. Creating an account is quick and easy and as mentioned in the security section: 100% confidential, to the extent of the platform.
                           <br /> <br />to start creating an account click <a href="/account">here</a>
                        </h5>
                        
                    </div>
                    <div className="why-account">
                        <h3>How to track an order</h3>
                        <h5>
                        In order to track the status of an order, you must access your account in the ¨Your cart¨ tab. Once the account has been scanned and the item you wish to track identified, click on ¨Refresh Status¨ to obtain the status of the item. If it has been sent or is being sent, a link to track your item should appear shortly. Otherwise, if the item was not sent within the seller's deadline, you have access to a free refund. In order to receive a refund, make sure you have an email address to receive payment (this can be entered under the ¨Refunds¨ tab).
                        </h5>
                        
                    </div>
                    
                    <div class='why-site'>
                        <h3>The software:</h3>
                        <h5>
                        L’Atelier de Simon uses innovative and high-performance technology. If you are looking for an efficient way to do business online, we invite you to click on the following link to learn more about the features and benefits of using our technology.
                            <br /> <br />
                            On this page you will find information about everything about our software and how to use it.
                            <br />
                            <br />
                            To learn more about the technologies that enable this platform: visit <a href="https://imperialdao.net">imperialdao.net</a>
                        </h5>
                        
                    </div>
                    
                    
                </div>
            </div>) : (<div class="about">
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
            </div>)} </div>
        )
   
    
}
export default About;
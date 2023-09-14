import "./css/about.css";


function Questions() {
    //Contactez nous au besoin d'une commande spéciale au E-mail suivant: <strong style={{color: 'darkblue'}}>thomasberthiaume183@gmail.com</strong> .
        return (
            <div class="about">
                <div class="about-intro" >
                    <h1> Questions populaires  </h1>
                    
                    <br />
                </div>
                <div>
                    <div class='why-site'>
                        <h3><strong>1</strong> - Est-ce que les oeuvres sont encadrées? </h3>
                        <h5>
                        À moins de spécifications contraires, les oeuvres sont livrées non encadrées. 
                        </h5>
                        
                    </div>
                    <div className="why-account">
                        <h3><strong>2</strong> - Est-il possible de voir les oeuvres en réalité avant d’acheter?</h3>
                        <h5>
                        Oui, il est possible de visiter l’Atelier en prenant rendez vous avec moi.  Contactez moi au 418-564-3962 pour fixer une rencontre.
                        </h5>
                    </div>
                    <div className="why-account">
                        <h3><strong>3</strong> - Comment savoir si l’oeuvre que j’ai achetée a été expédiée? </h3>
                        <h5>
                        Votre compte vous donne accès au numéro d’enregistrement de l’envoi de votre oeuvre.  Vous pouvez alors suivre votre colis a partir du site de poste Canada (ou autre expéditeur selon le cas). Pour la procédure de suivie d'une commande, visitez la page <a href="/about">à propos</a> afin d'en savoir plus. Dans certains cas (courte distance) c’est l’artiste lui même qui va vous livrer l’oeuvre en personne. 
                        </h5>
                        
                    </div>
                    <div className="why-account">
                        <h3><strong>4</strong> - Qui paye les frais d’envoi et les taxes?</h3>
                        <h5>
                        Ces couts sont inclus dans le prix de vente.
                        </h5>
                        
                    </div>
                    
                    
                </div>
            </div>
        )
   
    
}
export default Questions;
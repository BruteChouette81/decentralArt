import "./css/about.css";


function Questions() {
    //Contactez nous au besoin d'une commande spéciale au E-mail suivant: <strong style={{color: 'darkblue'}}>thomasberthiaume183@gmail.com</strong> .
        return (
            <div> {window.localStorage.getItem("language") == "en" ? (<div class="about">
                <div class="about-intro" >
                    <h1> Frequently Asked Questions  </h1>
                    
                    <br />
                </div>
                <div>
                    <div class='why-site'>
                        <h3><strong>1</strong> - is the art framed? </h3>
                        <h5>
                        Unless otherwise specified, art is delivered unframed.
                        </h5>
                        
                    </div>
                    <div className="why-account">
                        <h3><strong>2</strong> - Is it possible to see art in reality before buying?</h3>
                        <h5>
                        Yes, it is possible to visit the Workshop by making an appointment with me. Contact me at 418-564-3962 to schedule a meeting.
                        </h5>
                    </div>
                    <div className="why-account">
                        <h3><strong>3</strong> - How do I know if the art I purchased has been shipped? </h3>
                        <h5>
                        Your account gives you access to the shipping registration number of the art you purchased. You can then track your package from the Canada Post website (or other sender as the case may be). For more information, visit the <a href="/about">about</a> page to learn more. In some cases (short distance) it is the artist himself who will deliver the art to you in person.
                        </h5>
                        
                    </div>
                    <div className="why-account">
                        <h3><strong>4</strong> - Who pays shipping costs and taxes?</h3>
                        <h5>
                        These costs are included in the sale price.
                        </h5>
                        
                    </div>
                    
                    
                </div>
            </div>) : (<div class="about">
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
            </div>)}
            </div>
        )
   
    
}
export default Questions;
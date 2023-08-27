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
                            
                        </h5>
                    </div>
                    <div className="why-account">
                        <h3>Pourquoi un compte</h3>
                        <h5>
                           
    
                        </h5>
                        
                    </div>
                    <div className="why-account">
                        <h3>Profitabilité</h3>
                        <h5>
                           
    
                        </h5>
                        
                    </div>
                    
                </div>
            </div>
        )
   
    
}
export default About;
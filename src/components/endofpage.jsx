import './css/endofpage.css'

function EndOfPage() {
    return(
        <div className="endofpage">
            <div class="siteinfo" style={{float: "left"}}>
                
                    <h4>Nous Contacter:</h4>
                    <p>+1 418-906-6360 <br /> 
                    thomasberthiaume183@gmail.com</p>
                    

                    <h6>Créé par <strong>Thomas Berthiaume</strong></h6>
                    <p>License MIT - Thomas Berthiaume</p>
                
            </div>
            <div class="container">
                <div class="row">
                    <ul>
                    <li><a href="/market">Atelier</a></li>
                   
                    
                    <li><a href="https://imperialdao.net">CPL - Technologies</a></li>
                    
                    
                    <li><a href="">Facebook</a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default EndOfPage;
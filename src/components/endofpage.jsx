import './css/endofpage.css'

function EndOfPage() {
    return(
        <div className="endofpage">
            <div class="siteinfo" style={{float: "left"}}>
                
                    <h4>Simon Berthiaume Inc.</h4>
                    <p>+1 418-906-6360 <br />
                    3998 Chemin de Tilly, St-Antoine de Tilly, Québec. G0S 2C0 </p>

                    <h6>Créé par <strong>Thomas Berthiaume</strong></h6>
                    <p>License: Imperial Technologies</p>
                
            </div>
            <div class="container">
                <div class="row">
                    <ul>
                    <li><a href="/market">Gallerie</a></li>
                   
                    
                    <li><a href="https://imperialdao.net">Imperial Technologies</a></li>
                    
                    
                    <li><a href="">Facebook</a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default EndOfPage;
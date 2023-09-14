import { useState } from 'react';
import logo from './logo/Art-PNG.png'
import logo2 from './logo/RedLogo.png'
import icon from './logo/thjpg.jpg'
import menu from './css/menu.png'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import './css/navbar.css'




function NewNavBar() {
  const [sortedby, setSortedby] = useState(0)

  function imperialConnect() {
    if (window.localStorage.getItem("hasWallet") !== "true") {
        //window.localStorage.setItem("hasWallet", false)
    }
    window.location.replace("/Imperial")
  }

  const onChangeSortedMeta = () => {
    setSortedby(1)
    alert("Redirecting to Wallet selector! Select your wallet once in the page!")
    window.location.replace("/Account")
  }
  
  const onChangeSortedImp = () => {
    setSortedby(2)
    imperialConnect()
  }
  
  
  return ( //style={{"background-color": "#090945"}}
    <nav class="navbar navbar-expand-lg navbar-light " style={{"background-color": "white"}} >
      <div class="container-fluid">
        <a className="navbar-brand" href="/">
          <img src={logo} alt="" width="20" height="25" className="d-inline-block align-text-top" />
          L'Atelier De Simon
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <img src={menu} alt="" width="30" height="24" />
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="/">Accueil</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="/About" disabled>Questions-réponses</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="/About" disabled>À propos</a>
            </li>
            <li class="nav-item">
              <a class="btn btn-outline-success me-2" type="button" href='/Market'>L'Atelier</a>
            </li>
            
          </ul>
          <ul class="navbar-nav ms-auto" style={{"paddingRight": 200 + "px"}}>
          <li class="nav-item">
            {window.localStorage.getItem("hasWallet") ? <a class="btn btn-outline-info me-2" type="button" href='/imperial'>Connection</a> : <a class="btn btn-outline-info me-2" type="button" href='/account'>Connection</a> }
              
            </li>
          </ul>
        </div>
      </div>
    </nav>
  ) //Q&A = /Blog

}
  

export default NewNavBar;

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

  const clear = () => {
    window.sessionStorage.setItem("password", "")
    window.location.replace("/")
    alert("vous êtes déconnecté")

  }

  const setFrench = () => {
    window.localStorage.setItem("language", "fr")
    window.location.reload()
  }
  const setEnglish = () => {
    window.localStorage.setItem("language", "en")
    window.location.reload()
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
              <a class="nav-link active" aria-current="page" href="/">{window.localStorage.getItem("language") == "en" ? "Home" : "Accueil"}</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="/questions" disabled>{window.localStorage.getItem("language") == "en" ? "FAQ" : "Questions-réponses"}</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="/About" disabled>{window.localStorage.getItem("language") == "en" ? "About" : "À propos"}</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="/Compare" disabled>{window.localStorage.getItem("language") == "en" ? "Compare dimensions" : "Comparer les tailles"}</a>
            </li>
            <li class="nav-item">
              {window.sessionStorage.getItem("password") ? <a class="btn btn-outline-info me-2" type="button" href='/myItems'>{window.localStorage.getItem("language") == "en" ? "My purchases" : "Mes achats"}</a> : "" }
            </li>
            <li class="nav-item">
              <a class="btn btn-outline-success me-2" type="button" href='/Market'>{window.localStorage.getItem("language") == "en" ? "Market" : "L'Atelier"}</a>
            </li>
            
            
          </ul>
          <ul class="navbar-nav ms-auto" style={{"paddingRight": 200 + "px"}}>
            <li class="nav-item">
              {window.localStorage.getItem("hasWallet") ? window.sessionStorage.getItem("password") ? <div><a href="/imperial" style={{color: "green", float:"left", paddingRight: 20 + "px"}}>{window.localStorage.getItem("language") == "en" ? "Connected" : "Vous êtes connecté"}</a> <button onClick={() => {clear()}} class="btn btn-outline-danger me-2">{window.localStorage.getItem("language") == "en" ? "Disconnect" : "Se déconnecter"}</button></div> : <a class="btn btn-outline-info me-2" type="button" href='/imperial'>{window.localStorage.getItem("language") == "en" ? "My account" : "Mon compte"}</a> : <a class="btn btn-outline-info me-2" type="button" href='/account'>{window.localStorage.getItem("language") == "en" ? "Create an account" : "Créer un compte"}</a> }
            </li>
            <li class="nav-item">
            <div><button onClick={setFrench} class="btn btn-outline-dark me-2" style={{ float:"left", paddingLeft: 20 + "px", paddingRight: 20 + "px"}}>Français</button> <button onClick={setEnglish} class="btn btn-outline-dark me-2">English</button></div> 
              
            </li>
          </ul>
        </div>
      </div>
    </nav>
  ) //Q&A = /Blog

}
  

export default NewNavBar;

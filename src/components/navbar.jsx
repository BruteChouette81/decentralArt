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
        window.localStorage.setItem("hasWallet", false)
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
              <a class="nav-link active" aria-current="page" href="/">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="/About">About</a>
            </li>
            <li class="nav-item">
              <a class="btn btn-outline-success me-2" type="button" href='/Market'>Gallery</a>
            </li>
            
          </ul>
          <ul class="navbar-nav ms-auto" style={{"paddingRight": 200 + "px"}}>
            <li class="nav-item dropdown">
              <button class="btn btn-outline-info" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {sortedby===0 ? "Connection"  : sortedby === 1 ? <div><div className="icon-2"><img src={icon} alt="icon" /> </div> <p style={{"float": "right"}}>Metamask</p> </div>  : (<div><div className="icon-2"><img src={logo2} alt="icon" /></div> <p style={{"float": "right"}}>Imperial</p> </div> )}
              </button>
              <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDropdownMenuLink">
                <li><button class="dropdown-item" onClick={onChangeSortedImp}> <div className="icon-2"><img src={logo2} alt="icon" /> </div> Imperial</button></li>
                <li><button class="dropdown-item" onClick={onChangeSortedMeta}> <div className="icon-2"><img src={icon} alt="icon" /> </div> MetaMask</button></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  ) //Q&A = /Blog

}
  

export default NewNavBar;

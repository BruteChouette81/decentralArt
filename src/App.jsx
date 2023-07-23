import React from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'

import Account from './components/account/account';

import ImperialProfile from './components/account/imperialAccount/imperialProfile';
import Home from './components/home';

import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css'
import NewNavBar from './components/navbar';
import EndOfPage from './components/endofpage'

import Market from './components/market/market'

import Item from './components/market/item'


//Amplify
import { Amplify, Auth, Storage} from 'aws-amplify'; //import { Amplify, Auth, Storage } from 'aws-amplify'; - see manual config using auth and storage
import awsmobile from './aws-exports';

Amplify.configure(awsmobile);
//
Amplify.configure({
  Auth: {
    identityPoolId: 'ca-central-1:85ca7a33-46b1-4827-ae75-694463376952',
    region: 'ca-central-1',
    userPoolId: 'ca-central-1_PpgocuiOa',
    userPoolWebClientId: '3e5qk8i1f53cp415ou2h26lpn9'
    
  },
  Storage: {
    AWSS3: {
      bucket: "clientbc6cabec04d84d318144798d9000b9b3205313-dev",
      region: "ca-central-1",
    }
    
  }
})

function getLibrary(provider) {
  return new Web3(provider)
}


function App() {
    //<Market />
    // <Whitepaper />
    return(
      <div>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Router>
            <NewNavBar />  
            <Routes>
              <Route path="/" element={<Home />}/>
              <Route path="/Account" element={<Account />} />
              <Route path="/Market" element={<Market />}/>
              <Route path="/Imperial" element={<ImperialProfile/>} />
              <Route path="/item/:id" element={<Item/>} />

            </Routes>
            <EndOfPage />
          </Router>
        </Web3ReactProvider>
        
      </div>
    ); //home

     
}

export default App;

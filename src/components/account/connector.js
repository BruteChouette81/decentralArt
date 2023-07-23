import { InjectedConnector } from '@web3-react/injected-connector'

const injected = new InjectedConnector({
  supportedChainIds: [1, 5], //change for 1 in production mode
  
})

export default injected;
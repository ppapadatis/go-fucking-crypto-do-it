export const NETWORKS = {
  '1': 'Main Net',
  '2': 'Deprecated Morden test network',
  '3': 'Ropsten test network',
  '4': 'Rinkeby test network',
  '42': 'Kovan test network',
  '4447': 'Truffle Develop Network',
  '5777': 'Ganache Blockchain'
}

export const APPROVED_NETWORK_ID = '4'

export const MUTATION_TYPES = {
  CHANGE_CURRENT_ROUTE_TO: 'changeCurrentRouteTo',
  UPDATE_USER_BLOCKCHAIN_STATUS: 'updateUserBlockchainStatus',
  SET_CURRENT_VIEW: 'setCurrentView',
  REGISTER_WEB3_INSTANCE: 'registerWeb3Instance',
  UPDATE_WEB3_PROPERTIES: 'updateWeb3Properties',
  UPDATE_DAPP_READINESS: 'updateDAppReadiness'
}

export const ACTION_TYPES = MUTATION_TYPES

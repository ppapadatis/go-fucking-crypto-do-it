import BcExplorer from './BcExplorer'
import TaskContract from '../../build/contracts/TaskCore.json'

let mixinViews = {
  data() {
    return {
      bcConnected: false,
      bcConnectionError: false,
      bcSmartContractAddressError: false,
      filter: {},
      userIsConnected: false,
      serviceOwner: ''
    }
  },

  mounted() {
    if (typeof window.bc === 'undefined') {
      window.bc = new BcExplorer()
    }

    window.bc
      .initWithContractJson(
        TaskContract,
        `https://${process.env.INFURA_NETWORK}.infura.io/v3/${
          process.env.INFURA_API_KEY
        }`,
        4
      )
      .then(error => {
        if (error) {
          this.bcConnectionError = true
          this.bcConnected = false
          window.bc.log(error, 'error')
        } else {
          try {
            window.bc.contract().serviceOwner.call((errorReg, res) => {
              if (errorReg) {
                this.bcConnectionError = true
                this.bcSmartContractAddressError = true
                window.bc.log(errorReg, 'error')
              } else if (res) {
                this.userIsConnected = true
                this.serviceOwner = res
                Event.$emit('userConnected')
              }
            })
          } catch (err) {
            this.bcConnectionError = true
            window.bc.log(err, 'error')
          } finally {
            this.bcConnected = this.blockchainIsConnected()
          }
        }
      })
  },

  computed: {
    etherscanAddress() {
      if (process.env.INFURA_NETWORK === 'mainnet') {
        return 'https://etherscan.io'
      }

      return `https://${process.env.INFURA_NETWORK}.etherscan.io`
    },

    userIsContractOwner() {
      return (
        window.web3.eth.coinbase.toLowerCase() ===
        this.serviceOwner.toLowerCase()
      )
    }
  },

  methods: {
    blockchainIsConnected() {
      this.bcConnected =
        typeof window.bc !== 'undefined' && window.web3.isConnected()
      return this.bcConnected
    },

    subscribeContractEvent(eventName, eventParams, filters, callback) {
      try {
        this.filter[eventName] = window.bc
          .contract()[eventName](eventParams, filters)
        this.filter[eventName].watch(callback)
      } catch (err) {
        throw err
      }
    },

    unsubscribeContractEvent(eventName) {
      if (this.filter[eventName]) {
        this.filter[eventName].stopWatching()
      }
    }
  }
}

export default mixinViews

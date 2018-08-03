import BcExplorer from './BcExplorer'
import TaskContract from '../../build/contracts/TaskCore.json'

let mixinViews = {
  data() {
    return {
      initConnection: true,
      bcConnected: false, // true when the connection with the blockchain is established, plus the contract ABI + address is correctly initialized
      bcConnectionError: false,
      bcSmartContractAddressError: false,
      filter: {}
    }
  },

  created() {
    if (window.bc === undefined) {
      window.bc = new BcExplorer()

      window.bc
        .initWithContractJson(
          TaskContract,
          `https://${process.env.INFURA_NETWORK}.infura.io/v3/${
            process.env.INFURA_API_KEY
          }`
        )
        .then(error => {
          this.initConnection = false
          // handling the connection error
          if (error) {
            this.bcConnectionError = true
            this.bcConnected = false
            this.$message.error(error)
          } else {
            try {
              window.bc.contract().serviceOwner.call((errorReg, res) => {
                if (errorReg) {
                  this.bcConnectionError = true
                  this.bcSmartContractAddressError = true
                  this.$message.error(errorReg)
                }
              })
            } catch (err) {
              this.bcConnectionError = true
              this.$message.error(err.message)
            } finally {
              this.bcConnected = this.blockchainIsConnected()
            }
          }
        })
    }
  },

  methods: {
    getEtherscan() {
      if (process.env.INFURA_NETWORK === 'mainnet') {
        return 'https://etherscan.io'
      }

      return `https://${process.env.INFURA_NETWORK}.etherscan.io`
    },

    blockchainIsConnected() {
      this.bcConnected = window.bc !== undefined && window.bc.isConnected()

      return this.bcConnected
    },

    subscribeContractEvent(eventName, eventParams, filters, callback) {
      try {
        this.filter[eventName] = window.bc.contract()[eventName](eventParams, filters)
        this.filter[eventName].watch(callback)
      } catch (err) {
        throw err
      }
    },

    unsubscribeContractEvent(eventName) {
      if (this.filter[eventName]) {
        this.filter[eventName].stopWatching()
      }
    },

    toAscii(bytesStr) {
      return window.bc.toAscii(bytesStr)
    },

    toDate(timestamp) {
      return new Date(timestamp * 1000).toISOString()
    }
  }
}

export default mixinViews

import BcExplorer from './BcExplorer'
import TaskContract from '../../build/contracts/TaskCore.json'

let mixinViews = {
  data() {
    return {
      bcConnected: false, // true when the connection with the blockchain is established, plus the contract ABI + address is correctly initialized
      bcConnectionError: false,
      bcSmartContractAddressError: false
    }
  },

  created() {
    // when this file is imported to other component it checks if the BcExplorer
    // is instatiated.
    if (window.bc === undefined) {
      window.bc = new BcExplorer()

      // connecting to the blockchain and intializing the Users smart contract
      window.bc
        .initWithContractJson(
          TaskContract,
          `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`
        )
        .then(error => {
          // handling the connection error
          if (error) {
            this.bcConnectionError = true
            this.bcConnected = false
            this.$message.error(error)
          } else {
            // calling a smart contract function in order to check the contract address
            // is correct. NOTE: here you might be connected successfully.
            // TODO: the check of the smart contract address validity it should be BcExplorer duty
            try {
              window.bc.contract().serviceOwner.call((errorReg, res) => {
                if (errorReg) {
                  this.bcConnectionError = true
                  this.bcSmartContractAddressError = true
                  this.$message.error(errorReg)
                } else {
                  this.bcConnectionError = false
                }
              })
            } catch (err) {
              this.bcConnectionError = false
              this.$message.error(err.message)
            }

            this.bcConnected = this.blockchainIsConnected()
          }
        })
    }
  },

  methods: {
    /**
     * Check if the connection with the blockchain is established and if the smart
     * contract ABI + address are correctly initialized.
     */
    blockchainIsConnected() {
      this.bcConnected = window.bc !== undefined && window.bc.isConnected()

      return this.bcConnected
    },

    /**
     * Transform the parameter from bytes to string.
     */
    toAscii(bytesStr) {
      return window.bc.toAscii(bytesStr)
    },

    /**
     * Transform a timestamp number to date.
     */
    toDate(timestamp) {
      return new Date(timestamp * 1000).toISOString()
    }
  }
}

export default mixinViews

<template>
    <el-menu :default-active="$route.path" mode="horizontal" router>
        <template v-for="rule in $router.options.routes">
          <el-menu-item :index="rule.path" :key="rule.name">{{ rule.name }}</el-menu-item>
        </template>
    </el-menu>
</template>

<script>
import mixin from '../utils/mixinViews'

export default {
  name: 'Header',
  mixins: [mixin],
  data() {
    return {
      tmoConn: null, // contain the intervalID given by setInterval
      tmoReg: null, // contain the intervalID given by setInterval
      userIsConnected: false // true when the user that is visiting the page is Connected
    }
  },
  methods: {
    /**
     * It checks if the visiting user is regitered calling every 500ms the function isConnected
     * from the smart contract until the connection with the smart contract is established.
     */
    checkUserIsConnected() {
      this.tmoConn = setInterval(() => {
        // checking first if the connection with the blockchain is established
        if (this.blockchainIsConnected()) {
          // stopping the setInterval
          clearInterval(this.tmoConn)
          window.bc.contract().serviceOwner.call((error, res) => {
            if (error) {
              this.$message.error(error)
            } else {
              this.userIsConnected = true
            }
          })
        }
      }, 500)
    },
    /**
     * Check if the user is Connected calling the function of the smart contract isConnected.
     * This function is used when the user is signing up.
     * The difference with the previous function is:
     *      - the function checkUserIsConnected tries to check if the user is Connected
     *        until the connection with the blockchain is established.
     *      - the function checkUntilUserIsConnected tries to check if the user is Connected
     *        until the user is Connected.
     *
     * NOTE: in order to check if the user has been Connected successfully the function has to check
     * several time because the block can take several minutes in order to be mined (depending on the
     * configuration of the blockchain you are using).
     */
    checkUntilUserIsConnected() {
      this.tmoReg = setInterval(() => {
        if (this.blockchainIsConnected()) {
          window.bc.contract().serviceOwner.call((error, res) => {
            if (error) {
              this.$message.error(error)
            } else if (res) {
              // stopping the setInterval
              clearInterval(this.tmoReg)
              this.userIsConnected = true
            }
          })
        }
      }, 1000)
    }
  },
  created() {
    // when the event userConnected is fired (from the view Register.vue)
    // it runs the function checkUntilUserIsConnected
    Event.$on('userConnected', this.checkUntilUserIsConnected)
    this.checkUserIsConnected()
  }
}
</script>

<style>
</style>

<template>
  <v-app>
    <app-header v-if="!bcConnectionError"></app-header>
    <v-content>
      <v-container fluid>
        <div v-if="bcConnectionError">
          <v-alert :value="bcConnectionError" type="error">
            <h3>Can't establish connection to the network</h3>
            <p>Please check:
              <ul>
                <li>The blockchain is running.</li>
                <li>The port in your settings match with the blockchain configuration.</li>
                <li>The smart contract compiled JSON exists and is updated.</li>
                <li>Your MetaMask runs in the appropriate network.</li>
              </ul>
            </p>
            <p v-if="bcSmartContractAddressError">It seems like the address of the smart contract is wrong!</p>
          </v-alert>
        </div>
        <router-view v-else></router-view>
      </v-container>
    </v-content>
    <app-footer></app-footer>
  </v-app>
</template>

<script>
import mixin from './utils/mixinViews'

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  mixins: [mixin],
  components: {
    appHeader: Header,
    appFooter: Footer
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Quicksand:300,400,500,700');

* {
  font-family: 'Quicksand', sans-serif;
}
</style>

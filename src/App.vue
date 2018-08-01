<template>
    <el-container>
        <template v-show="!bcConnected && !bcConnectionError" v-loading="bcConnected" element-loading-text="Connecting..." >
            <div v-show="bcConnectionError">
                <h2>Error connecting to the blockchain!</h2>
                <h3 v-show="bcSmartContractAddressError">
                    It seems like the address of the smart contract is wrong!
                </h3>
                <p>
                    Please check:
                </p>
                <ul>
                    <li>The blockchain is running.</li>
                    <li>The port in your settings (file: <b>libs/mixinViews.js</b>) match with the blockchain configuration.</li>
                    <li>The smart contract compiled JSON (file: <b>assets/UsersContract.json</b>) is updated.</li>
                </ul>
            </div>
        </template>
        <template v-show="bcConnected && !bcConnectionError">
            <el-header>
                <app-header></app-header>
            </el-header>
            <el-container>
                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
            <el-footer>
                <app-footer></app-footer>
            </el-footer>
        </template>
    </el-container>
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

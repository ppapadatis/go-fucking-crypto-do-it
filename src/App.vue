<template>
    <el-container v-loading.fullscreen.lock="initConnection" element-loading-text="Connecting...">
        <el-header>
            <app-header></app-header>
        </el-header>
        <el-main>
            <el-row v-if="bcConnectionError">
                <el-col :span="16" :offset="4">
                    <p v-if="!bcConnected">
                        <el-alert
                            title="Can't establish connection to the network"
                            type="error"
                            :closable="false"
                            show-icon>
                                <p>
                                    Please check:
                                    <ul>
                                        <li>The blockchain is running.</li>
                                        <li>The port in your settings match with the blockchain configuration.</li>
                                        <li>The smart contract compiled JSON exists and is updated.</li>
                                        <li>Your MetaMask runs in the appropriate network.</li>
                                    </ul>
                                </p>
                        </el-alert>
                    </p>
                    <p v-if="bcSmartContractAddressError">
                        <el-alert
                            title="Can't call the smart contract"
                            type="warning"
                            :closable="false"
                            description="It seems like the address of the smart contract is wrong!"
                            show-icon>
                        </el-alert>
                    </p>
                </el-col>
            </el-row>
            <router-view v-else></router-view>
        </el-main>
        <el-footer>
            <app-footer></app-footer>
        </el-footer>
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

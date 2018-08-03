<template>
    <el-row>
      <el-col>
        <p>Status: {{ info.isConnected ? 'Connected' : 'Disconnected' }}</p>
      </el-col>
    </el-row>
</template>

<script>
import mixin from '../utils/mixinViews'

export default {
  name: 'Footer',
  mixins: [mixin],
  data() {
    return {
      info: {
        isConnected: false,
        networkId: 0,
        coinbase: null,
        balance: 0,
        addressUrl: null
      }
    }
  },
  created() {
    Event.$on('userConnected', async () => {
      this.info = await window.bc.getInfo()
    })
  }
}
</script>

<style>
</style>

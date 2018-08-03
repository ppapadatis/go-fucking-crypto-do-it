<template>
  <el-row>
    <el-col>
      <el-menu :default-active="$route.path" mode="horizontal" router>
        <template v-for="rule in $router.options.routes">
          <el-menu-item v-if="rule.name" :index="rule.path" :key="rule.name">{{ rule.name }}</el-menu-item>
        </template>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script>
import mixin from '../utils/mixinViews'

export default {
  name: 'Header',
  mixins: [mixin],
  data() {
    return {
      tmoConn: null,
      userIsConnected: false
    }
  },

  methods: {
    checkUserIsConnected() {
      this.tmoConn = setInterval(() => {
        if (this.blockchainIsConnected()) {
          clearInterval(this.tmoConn)
          window.bc.contract().serviceOwner.call((error, res) => {
            if (error) {
              this.$message.error(error)
            } else {
              this.userIsConnected = true
              Event.$emit('userConnected')
            }
          })
        }
      }, 500)
    }
  },

  created() {
    this.checkUserIsConnected()
  }
}
</script>

<style>
</style>

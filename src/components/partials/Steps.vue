<template>
  <el-steps :active="active" finish-status="success">
    <el-step title="Step 1" description="Set your goal"></el-step>
    <el-step title="Step 2" description="Set a deadline"></el-step>
    <el-step title="Step 3" description="Set supervisors"></el-step>
    <el-step title="Step 4" description="Summary" :status="lastStep"></el-step>
  </el-steps>
</template>

<script>
import mixin from '../../utils/mixinViews'

export default {
  name: 'Steps',
  mixins: [mixin],
  props: {
    active: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      lastStep: 'wait'
    }
  },
  created() {
    Event.$on('lastStepUpdated', status => {
      this.lastStep = status
    })
  }
}
</script>

<style>
</style>

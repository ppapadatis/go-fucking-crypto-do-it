<template>
  <el-steps :active="active" finish-status="success">
    <el-step title="Step 1" description="Set your goal"></el-step>
    <el-step title="Step 2" description="Set a deadline"></el-step>
    <el-step title="Step 3" description="Set supervisors"></el-step>
  </el-steps>
</template>

<script>
export default {
  name: 'Steps',
  props: {
    active: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style>
</style>

<template>
    <el-menu :default-active="activeIndex" mode="horizontal">
        <el-menu-item index="1">Home</el-menu-item>
        <el-menu-item index="2">My Tasks</el-menu-item>
    </el-menu>
</template>

<script>
    export default {
        data() {
          return {
              activeIndex: '1'
          }
        }
    }
</script>

<style>
    
</style>

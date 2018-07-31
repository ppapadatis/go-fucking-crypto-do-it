<template>
    <el-container>
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
    </el-container>
</template>

<script>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
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

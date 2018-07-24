<template>
    <el-container>    
        <el-header>
            <app-header></app-header>
        </el-header>
        <el-main>
            <router-view></router-view>
        </el-main>
        <el-footer></el-footer>
    </el-container>
</template>

<script>
    import Header from './components/Header.vue';

    export default {
        components: {
            appHeader: Header
        }
    }
</script>

<style>
    #app {
        font-family: brown, -apple-system, BlinkMacSystemFont, avenir, "lucida grande", "gill sans", "helvetica neue", helvetica, sans-serif;
    }
</style>


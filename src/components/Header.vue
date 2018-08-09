<template>
  <v-toolbar app dark color="light-blue darken-3">
    <v-toolbar-title>Go Fucking -Crypto- Do It</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <router-link :to="{ name: 'Home' }" class="v-btn v-btn--flat v-btn--router" active-clas="v-btn--active" exact>
        <div class="v-btn__content">Home</div>
      </router-link>
      <router-link :to="{ name: 'TaskList' }" class="v-btn v-btn--flat v-btn--router" active-clas="v-btn--active">
        <div class="v-btn__content">My Tasks</div>
      </router-link>
      <router-link :to="{ name: 'SuperviseTasks' }" class="v-btn v-btn--flat v-btn--router" active-clas="v-btn--active" exact>
        <div class="v-btn__content">Watch Tasks</div>
      </router-link>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
import mixin from '../utils/mixinViews'

export default {
  name: 'Header',
  mixins: [mixin]
}
</script>

<style>
</style>

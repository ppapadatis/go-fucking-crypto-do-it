<template>
  <v-footer app dark height="auto">
    <v-card class="flex" flat tile>
      <v-card-title class="grey darken-2">
        <v-tooltip top>
          <v-badge slot="activator" overlap :color="status ? 'green' : 'red'">
            <v-icon slot="badge" dark small>fas fa-{{ status ? 'plug' : 'power-off' }}</v-icon>
            <v-icon large color="blue lighten-1">fas fa-globe</v-icon>
          </v-badge>
          <span>{{ status ? 'Connected' : 'Disconneted' }}</span>
        </v-tooltip>
        &nbsp;&nbsp;&copy;2018
        <v-spacer></v-spacer>
        <v-btn v-for="service in icons" :key="service.link" class="mx-3" :href="service.link" target="_blank" rel="noopener noreferrer" dark icon>
          <v-icon size="24px">{{ service.icon }}</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-actions class="grey darken-4 justify-center">
        <strong class="subheading">Donation Jar: 0x03d4566d13ca7c7b30c39666b1f21ff97bee3f97</strong>
      </v-card-actions>
    </v-card>
  </v-footer>
</template>

<script>
import mixin from '../utils/mixinViews'

export default {
  name: 'Footer',
  mixins: [mixin],
  data() {
    return {
      status: false,
      icons: {
        gh: { icon: 'fab fa-github', link: 'https://github.com/ppapadatis' },
        li: {
          icon: 'fab fa-linkedin',
          link: 'https://www.linkedin.com/in/papadatispanagiotis/'
        },
        tw: { icon: 'fab fa-twitter', link: 'https://twitter.com/ppapadatis' }
      }
    }
  },
  mounted() {
    Event.$on('userConnected', () => {
      this.status = true
    })
  }
}
</script>

<style>
</style>

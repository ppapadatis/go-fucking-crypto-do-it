<template>
  <router-view></router-view>
</template>

<script>
import mixin from '../../utils/mixinViews'

export default {
  name: 'TaskBase',
  mixins: [mixin]
}
</script>

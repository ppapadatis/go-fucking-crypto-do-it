<template>
  <el-row v-loading="loading" :element-loading-text="loadingText">
    <el-col :span="16" :offset="4">
      <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>Task Details:</span>
          </div>
          <p class="preview-goal">Goal: {{ task.goal }}</p>
          <p>Deadline: {{ task.deadline | moment('dddd, MMMM Do YYYY') }}</p>
          <p>Supervisor: <a :href="'https://etherscan.io/address/' + task.supervisor" target="_blank" rel="noopener noreferrer">{{ task.supervisor }}</a></p>
          <hr/>
          <p>Staked value: {{ task.stake }}</p>
          <hr/>
          <p>View on etherscan: <a :href="'https://etherscan.io/address/' + task.txHash" target="_blank" rel="noopener noreferrer">{{ task.txHash }}</a></p>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import mixin from '../../utils/mixinViews'

export default {
  name: 'Single Task',
  mixins: [mixin],
  props: ['txHash'],
  data() {
    return {
      loading: true,
      loadingText: 'Please wait while fetching contract data',
      task: {
        goal: '',
        deadline: '',
        supervisor: '',
        stake: 0,
        txHash: ''
      }
    }
  },
  mounted() {
    Event.$on('', () => {})
  },
  created() {
    window.bc
      .contract()
      .getTask()
      .call((error, res) => {
        this.minimumStake = error
          ? window.web3.toWei('2', 'finney')
          : res.toNumber()
        this.task.stake = this.minimumStake
      })
  }
}
</script>

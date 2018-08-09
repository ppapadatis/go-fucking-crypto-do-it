<template>
  <v-layout align-center row fill-height wrap>
      <v-flex lg8 offset-lg2 md10 offset-md1 sm12>
        <h3 class="headline mb-0">Task Details:</h3>
        <p class="preview-goal">Goal: {{ task.goal }}</p>
        <p>Deadline: {{ task.deadline | moment('dddd, MMMM Do YYYY') }}<br/>{{ task.deadline | moment('from') }}</p>
        <p>Owner: <a :href="`${etherscanAddress}/address/${task.owner}`" target="_blank" rel="noopener noreferrer">{{ task.owner }}</a></p>
        <p>Stake: {{ task.stake | etherprice }}</p>
        <p>Status: {{ status }}</p>

        <v-btn color="success" v-if="userIsTaskSupervisor" :disabled="disableConfirm" @click="confirmTask">Confirm</v-btn>
        <v-btn color="success" v-if="userIsContractOwner" :disabled="disableClaim" @click="claimStake">Claim</v-btn>
      </v-flex>
  </v-layout>
</template>

<script>
import mixin from '../../utils/mixinViews'
import { TASK_STATUSES } from '../../utils/constants'

export default {
  name: 'WatchTask',
  mixins: [mixin],
  data() {
    return {
      task: {
        owner: '',
        goal: '',
        deadline: new Date(),
        supervisor: '',
        stake: 0,
        status: 0
      }
    }
  },
  computed: {
    status() {
      return TASK_STATUSES[this.task.status]
    },
    userIsTaskSupervisor() {
      return (
        window.web3.eth.coinbase.toLowerCase() ===
        this.task.supervisor.toLowerCase()
      )
    },
    disableConfirm() {
      if (!this.userIsTaskSupervisor) {
        return true
      }

      return (
        this.task.status !== 0 ||
        this.task.deadline <
          this.$moment()
            .endOf('day')
            .unix()
      )
    },
    disableClaim() {
      if (!this.userIsContractOwner) {
        return true
      }

      return (
        this.task.status > 0 ||
        this.task.deadline >
          this.$moment()
            .endOf('day')
            .unix()
      )
    }
  },
  mounted() {
    Event.$on('userConnected', () => {
      window.bc
        .contract()
        .getTask.call(
          this.$route.params.id,
          { from: window.web3.eth.coinbase },
          (err, res) => {
            if (err) {
              window.bc.log(err, 'error')
            } else if (res) {
              this.task.goal = res[0]
              this.task.deadline = res[1].toNumber()
              this.task.supervisor = res[2]
              this.task.stake = res[3].toNumber()
              this.task.status = res[4].toNumber()

              window.bc
                .contract()
                .getOwnerOfTask.call(
                  this.$route.params.id,
                  { from: window.web3.eth.coinbase },
                  (err, res) => {
                    if (err) {
                      window.bc.log(err, 'error')
                    } else if (res) {
                      this.task.owner = res
                    }
                  }
                )
            }
          }
        )
    })
  },
  methods: {
    confirmTask() {
      window.bc
        .contract()
        .confirmTask(
          this.$route.params.id,
          { from: window.web3.eth.coinbase },
          (err, res) => {
            if (err) {
              window.bc.log(err, 'error')
            } else {
              this.task.status = 1
            }
          }
        )
    },
    claimStake() {
      window.bc
        .contract()
        .claimStake(
          this.$route.params.id,
          { from: window.web3.eth.coinbase },
          (err, res) => {
            if (err) {
              window.bc.log(err, 'error')
            } else {
              this.task.status = 3
            }
          }
        )
    }
  }
}
</script>

<style scoped>
.preview-goal {
  white-space: pre-line;
}
</style>

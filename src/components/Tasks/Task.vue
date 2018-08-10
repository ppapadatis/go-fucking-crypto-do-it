<template>
  <v-layout align-center row fill-height wrap>
      <v-flex lg8 offset-lg2 md10 offset-md1 sm12>
        <v-dialog v-model="loading" persistent width="300">
          <v-card color="primary" dark>
            <v-card-text>
              <p>Please wait until the process is finished successully.</p>
              <p><strong>Do not close or reload this tab!</strong></p>
              <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-dialog>
        <template v-if="!loading">
          <h2>Task Details</h2>
          <v-card>
            <v-list two-line>
              <v-subheader class="preview-goal">Goal: {{ task.goal }}</v-subheader>
              <v-divider></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-sub-title class="text--primary">Supervisor: <a :href="`${etherscanAddress}/address/${task.supervisor}`" target="_blank" rel="noopener noreferrer">{{ task.supervisor }}</a></v-list-tile-sub-title>
                  <v-list-tile-sub-title>Stake: {{ task.stake | etherprice }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-list-tile-action-text>
                    <v-tooltip top>
                      <span slot="activator">{{ task.deadline | moment('from') }}</span>
                      <span>{{ task.deadline | moment('dddd, MMMM Do YYYY') }}</span>
                    </v-tooltip>
                  </v-list-tile-action-text>
                  <v-tooltip top>
                      <span slot="activator"><v-icon color="grey lighten-1">fas fa-{{ icon }}</v-icon></span>
                      <span>{{ status }}</span>
                    </v-tooltip>
                </v-list-tile-action>
              </v-list-tile>
              <v-divider></v-divider>
              <div class="text-xs-right">
                <v-btn color="primary" v-if="userIsTaskOwner" :disabled="disableWithdraw" @click="withdrawStake">Withdraw</v-btn>
                <v-btn color="primary" v-if="userIsContractOwner" :disabled="disableClaim" @click="claimStake">Claim</v-btn>
              </div>
            </v-list>
          </v-card>
        </template>
      </v-flex>
  </v-layout>
</template>

<script>
import mixin from '../../utils/mixinViews'
import { TASK_STATUSES } from '../../utils/constants'

export default {
  name: 'SingleTask',
  mixins: [mixin],
  data() {
    return {
      loading: true,
      task: {
        owner: '',
        goal: '',
        deadline: new Date(),
        supervisor: '',
        stake: 0,
        status: 0
      },
      statusIcons: ['ellipsis-h', 'check', 'check-double', 'times']
    }
  },
  computed: {
    status() {
      return TASK_STATUSES[this.task.status]
    },
    icon() {
      return this.statusIcons[this.task.status]
    },
    userIsTaskOwner() {
      return (
        window.web3.eth.coinbase.toLowerCase() === this.task.owner.toLowerCase()
      )
    },
    disableWithdraw() {
      if (!this.userIsContractOwner) {
        return true
      }

      return this.task.status !== 1
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
  unmounted() {
    Event.$off('contractStatusUpdate')
  },
  mounted() {
    Event.$on('contractStatusUpdate', (taskId, status) => {
      if (typeof this.$route.params.id === 'undefined') {
        return false
      }

      if (parseInt(taskId) === parseInt(this.$route.params.id)) {
        this.task.status = status
      }
    })

    Event.$on('userConnected', () => {
      if (typeof this.$route.params.id === 'undefined') {
        return false
      }

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

                    this.loading = false
                  }
                )
            }
          }
        )
    })
  },
  methods: {
    withdrawStake() {
      this.loading = true

      window.bc
        .contract()
        .withdrawStake(
          this.$route.params.id,
          { from: window.web3.eth.coinbase },
          (err, res) => {
            if (err) {
              window.bc.log(err, 'error')
            } else {
              Event.$emit('contractStatusUpdate', {
                taskId: this.$route.params.id,
                status: 2
              })
            }

            this.loading = false
          }
        )
    },
    claimStake() {
      this.loading = true

      window.bc
        .contract()
        .claimStake(
          this.$route.params.id,
          { from: window.web3.eth.coinbase },
          (err, res) => {
            if (err) {
              window.bc.log(err, 'error')
            } else {
              Event.$emit('contractStatusUpdate', {
                taskId: this.$route.params.id,
                status: 3
              })
            }

            this.loading = false
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

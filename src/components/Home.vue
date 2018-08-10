<template>
  <v-layout align-center row fill-height wrap>
    <v-flex lg8 offset-lg2 md10 offset-md1 sm12>
      <v-form ref="form" v-model="valid">
        <v-stepper v-model="step">
          <v-stepper-header>
            <v-stepper-step :complete="step > 1" step="1">Step 1 <small>Set Goal</small></v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 2" step="2">Step 2 <small>Set Deadline</small></v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 3" step="3">Step 3 <small>Set Supervisor</small></v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="transaction" step="4">Step 4 <small>Summary</small></v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content step="1">
              <v-textarea
                label="What's your goal?"
                no-resize
                placeholder="Enter your goal"
                minlength="1"
                maxlength="140"
                rows="2"
                v-model="task.goal"
                :counter="140"
                :rules="goalRules"
              ></v-textarea>
              <v-flex right>
                <v-btn color="secondary" disabled><v-icon left dark>keyboard_arrow_left</v-icon> Previous</v-btn>
                <v-btn color="primary" @click="step = 2" :disabled="!task.goal">Set Goal <v-icon right dark>edit</v-icon></v-btn>
              </v-flex>
            </v-stepper-content>
            <v-stepper-content step="2">
              <v-menu
                ref="deadlineInput"
                :close-on-content-click="false"
                :nudge-right="40"
                :return-value.sync="task.deadline"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="task.deadline"
                  label="Pick a date"
                  prepend-icon="event"
                  :rules="deadlineRules"
                  readonly
                ></v-text-field>
                <v-date-picker :allowed-dates="allowedDates" v-model="task.deadline" @input="$refs.deadlineInput.save(task.deadline)" no-title></v-date-picker>
              </v-menu>
              <v-flex right>
                <v-btn color="secondary" @click="step = 1"><v-icon left dark>keyboard_arrow_left</v-icon> Previous</v-btn>
                <v-btn color="primary" @click="step = 3" :disabled="!task.deadline">Set Deadline <v-icon right dark>event</v-icon></v-btn>
              </v-flex>
            </v-stepper-content>
            <v-stepper-content step="3">
              <v-text-field
                label="Set a supervisor"
                placeholder="Enter an ethereum address"
                v-model="task.supervisor"
                maxlength="42"
                :counter="42"
                required
                :rules="supervisorRules"
              ></v-text-field>
              <v-flex right>
                <v-btn color="secondary" @click="step = 2"><v-icon left dark>keyboard_arrow_left</v-icon> Previous</v-btn>
                <v-btn color="primary" @click="step = 4" :disabled="!supervisorIsValid">Set Supervisor <v-icon right dark>gavel</v-icon></v-btn>
              </v-flex>
            </v-stepper-content>
            <v-stepper-content step="4">
              <div v-if="task.deadline">
                <h3 class="headline mb-0">A task will be created with the following details:</h3>
                <p class="preview-goal">Goal: {{ task.goal }}</p>
                <p>Deadline: {{ task.deadline | moment('dddd, MMMM Do YYYY') }}</p>
                <p>Supervisor: <a :href="`${etherscanAddress}/address/${task.supervisor}`" target="_blank" rel="noopener noreferrer">{{ task.supervisor }}</a></p>
                <p>
                  Set Price
                  <v-text-field
                    type="number"
                    v-model.number="task.stake"
                    :min="minimumStake"
                    label="Set a price"
                    placeholder="Enter a price to pay"
                  ></v-text-field>
                </p>
              </div>
              <v-flex right>
                <v-btn color="secondary" @click="step = 3"><v-icon left dark>keyboard_arrow_left</v-icon> Previous</v-btn>
                <v-btn color="success" class="white--text" :disabled="!valid" @click.prevent="submitForm">Set Task <v-icon right dark>cloud_upload</v-icon></v-btn>
              </v-flex>
              <v-dialog v-model="transaction" persistent width="300">
                <v-card color="primary" dark>
                  <v-card-text>
                    <p>Please wait until the process is finished successully.</p>
                    <p><strong>Do not close or reload this tab!</strong></p>
                    <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                  </v-card-text>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialog" persistent max-width="380">
                <v-card>
                  <v-card-title class="headline">Transaction Complete!</v-card-title>
                  <v-card-text>
                    Congratulations, your task has been set!
                    <br/>
                    You can manually check the transaction progress <a :href="`${etherscanAddress}/tx/${txHash}`" target="_blank" rel="noopener noreferrer">here</a>.
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat @click.native="dialog = false">Close</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-form>
    </v-flex>
  </v-layout>
</template>

<script>
import mixin from '../utils/mixinViews'

export default {
  name: 'Home',
  mixins: [mixin],
  data() {
    return {
      step: 1,
      dialog: false,
      transaction: false,
      txHash: '',
      minimumStake: 0,
      valid: false,
      deadlineInput: false,
      task: {
        goal: '',
        deadline: '',
        supervisor: '',
        stake: 0
      },
      goalRules: [v => !!v || 'Goal is required'],
      deadlineRules: [v => !!v || 'Deadline is required'],
      supervisorRules: [
        v => !!v || 'Supervisor is required',
        v =>
          v.toLowerCase() !== '0x0000000000000000000000000000000000000000' ||
          'Not a valid Ethereum address',
        v =>
          !!window.web3.eth.coinbase ||
          'Unlock your MetaMask account to enable further validation',
        v =>
          v.toLowerCase() !== window.web3.eth.coinbase ||
          'You cannot set yourself as a supervisor',
        v => window.web3.isAddress(v) || 'Not a valid Ethereum address'
      ]
    }
  },
  computed: {
    supervisorIsValid() {
      return (
        this.task.supervisor &&
        window.web3.eth.coinbase &&
        this.task.supervisor.toLowerCase !==
          '0x0000000000000000000000000000000000000000' &&
        this.task.supervisor.toLowerCase !== window.web3.eth.coinbase &&
        window.web3.isAddress(this.task.supervisor)
      )
    }
  },
  methods: {
    allowedDates(val) {
      return this.$moment(val) > new Date()
    },
    submitForm() {
      this.transaction = true

      if (this.$refs.form.validate()) {
        window.bc.contract().createTask(
          this.task.goal,
          this.$moment(this.task.deadline).unix(),
          this.task.supervisor,
          {
            from: window.bc.web3().eth.coinbase,
            value: this.task.stake
          },
          (err, txHash) => {
            if (err) {
              window.bc.log(JSON.stringify(err), 'error')
              this.transaction = false
            } else {
              this.dialog = true
              this.txHash = txHash
            }
          }
        )
      } else {
        window.bc.log('Form could not be submitted due to errors', 'error')
        this.transaction = false
      }
    }
  },
  mounted() {
    Event.$on('userConnected', () => {
      window.bc
        .contract()
        .minimumStake.call({ from: window.web3.eth.coinbase }, (err, res) => {
          if (err) {
            window.bc.log(JSON.stringify(err), 'error')
          } else {
            this.minimumStake = res.toNumber()
            this.task.stake = this.minimumStake
          }
        })

      this.subscribeContractEvent(
        'Created',
        { owner: window.web3.eth.coinbase },
        { fromBlock: 'latest' },
        (err, response) => {
          if (err) {
            window.bc.log(JSON.stringify(err), 'error')
          } else {
            window.bc.log(JSON.stringify(response))
          }

          this.transaction = false
          this.$router.push({ name: 'TaskList' })
        }
      )
    })
  },
  unmounted() {
    this.unsubscribeContractEvent('Created')
  }
}
</script>

<style scoped>
.preview-goal {
  white-space: pre-line;
}
</style>

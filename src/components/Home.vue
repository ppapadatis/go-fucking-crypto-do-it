<template>
    <el-row>
        <el-col :span="16" :offset="4">
            <el-form ref="task" :model="task" v-loading="loading" :element-loading-text="loadingText" :rules="rules" @validate="onValidate">
                <el-form-item>
                  <app-steps :active="active"></app-steps>
                </el-form-item>
                <el-form-item label="Goal Description" v-show="active === 0" prop="goal">
                    <el-input
                        autofocus
                        minlength="1"
                        maxlength="140"
                        type="textarea"
                        resize="none"
                        :rows="2"
                        placeholder="Enter your goal's description here..."
                        v-model="task.goal">
                    </el-input>
                    <span class="text-smaller">{{charactersLeft}} characters left.</span>
                </el-form-item>
                <el-form-item label="Pick Deadline" v-show="active === 1" prop="deadline">
                    <el-date-picker
                        :picker-options="datePickerOptions"
                        v-model="task.deadline"
                        type="date"
                        placeholder="Pick a day"
                        :editable="false">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="Supervisor Address" v-show="active === 2" prop="supervisor">
                  <el-input
                    placeholder="Enter a supervisor (eth) address"
                    v-model="task.supervisor">
                  </el-input>
                </el-form-item>
                <el-form-item v-show="active >= 3">
                  <el-card class="box-card">
                    <div slot="header" class="clearfix">
                      <span>A task will be created with the following data:</span>
                    </div>
                    <p class="preview-goal">Goal: {{ task.goal }}</p>
                    <p>Deadline: {{ task.deadline | moment('dddd, MMMM Do YYYY') }}</p>
                    <p>Supervisor: <a :href="'https://etherscan.io/address/' + task.supervisor" target="_blank" rel="noopener noreferrer">{{ task.supervisor }}</a></p>
                    <hr/>
                    <p>
                      Please enter the value to stake:
                      <el-input-number v-model="task.stake" :min="minimumStake"></el-input-number>
                    </p>
                </el-card>
                </el-form-item>
                <el-form-item>
                    <el-button native-type="button" type="primary" @click="prev" :disabled="active < 1 || loading" plain round>Previous step</el-button>
                    <el-button native-type="submit" type="primary" @click.prevent="next('task')" name="submit" :disabled="disabledButton" :loading="loading" round>
                      Next step
                    </el-button>
                    <el-button native-type="button" type="warning" @click="reset('task')" :disabled="task.goal.length < 1 || loading" plain round>Reset</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>
import mixin from '../utils/mixinViews'
import Steps from './partials/Steps.vue'

export default {
  name: 'Home',

  mixins: [mixin],

  data() {
    const checkEthereumAddress = (rule, value, callback) => {
      if (!value.length) {
        callback(new Error('Supervisor address cannot be null'))
      } else if (
        value.toLowerCase() === '0x0000000000000000000000000000000000000000'
      ) {
        callback(new Error('Not a valid Ethereum address'))
      } else if (
        value.toLowerCase() === window.web3.eth.coinbase.toLowerCase()
      ) {
        callback(new Error('You cannot set yourself as a supervisor'))
      } else if (!window.web3.isAddress(value)) {
        callback(new Error('Not a valid Ethereum address'))
      } else {
        callback()
      }
    }
    return {
      minimumStake: 0,
      active: 0,
      loading: false,
      loadingText:
        'Please wait until the process is finished successully.\nDo not close or reload this tab!',
      datePickerOptions: {
        disabledDate(date) {
          return date <= new Date()
        }
      },
      valid: {
        goal: false,
        deadline: false,
        supervisor: false
      },
      task: {
        goal: '',
        deadline: '',
        supervisor: '',
        stake: 0
      },
      rules: {
        goal: [
          { required: true, message: 'Please input Goal', trigger: 'blur' },
          {
            min: 1,
            max: 140,
            message: 'Length should be 1 to 140',
            trigger: 'blur'
          }
        ],
        deadline: [
          {
            type: 'date',
            required: true,
            message: 'Please pick a date',
            trigger: 'change'
          }
        ],
        supervisor: [
          {
            required: true,
            message: 'Supervisor address can not be null',
            trigger: 'blur'
          },
          { validator: checkEthereumAddress, trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    charactersLeft() {
      return 140 - this.task.goal.length
    },
    disabledButton() {
      if (this.active === 0 && !this.valid['goal']) {
        return true
      }

      if (this.active === 1 && !this.valid['deadline']) {
        return true
      }

      if (this.active > 1 && !this.valid['supervisor']) {
        return true
      }

      return false
    }
  },

  created() {
    Event.$on('userConnected', () => {
      this.subscribeToEvents()
      this.updateMinimumStake()
    })
  },

  methods: {
    onValidate(prop, valid) {
      this.valid[prop] = valid
    },
    prev() {
      if (this.active > 2) {
        Event.$emit('lastStepUpdated', 'wait')
        this.active = 2
      } else if (this.active > 0) {
        this.active--
      }

      document.getElementsByName('submit')[0].innerHTML = 'Next step'
    },
    next() {
      if (this.active >= 4) {
        Event.$emit('lastStepUpdated', 'success')
        this.loading = true
        this.submitForm('task')
        return false
      }

      if (this.active < 3) {
        this.active++
      }

      if (this.active > 2 && !this.disabledButton) {
        this.active = 4
        Event.$emit('lastStepUpdated', 'process')
        event.target.innerHTML = 'Create Goal'
      }
    },
    reset(formName) {
      this.active = 0
      this.loading = false
      Event.$emit('lastStepUpdated', 'wait')
      this.valid = {
        goal: false,
        deadline: false,
        supervisor: false
      }
      this.task = {
        goal: '',
        deadline: '',
        supervisor: ''
      }
      document.getElementsByName('submit')[0].innerHTML = 'Next step'
      this.$refs[formName].resetFields()
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          try {
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
                  this.$message.error(err.message)
                  this.loading = false
                  return false
                } else {
                  Event.$emit('taskCreated', txHash)
                  this.reset('task')
                }
              }
            )
          } catch (error) {
            this.$message.error(error.message)
            this.loading = false
            return false
          }
        } else {
          this.$message.error('Form could not be submitted due to errors')
          this.loading = false
          return false
        }
      })
    },
    updateMinimumStake() {
      window.bc.contract().minimumStake.call((error, res) => {
        this.minimumStake = error
          ? window.web3.toWei('2', 'finney')
          : res.toNumber()
        this.task.stake = this.minimumStake
      })
    },
    subscribeToEvents() {
      window.bc
        .contract()
        .Created({}, { fromBlock: 0, toBlock: 'latest' })
        .watch((err, response) => {
          if (err) {
            console.error(err)
          } else {
            console.log('created event', response)
          }
        })
    }
  },

  components: {
    appSteps: Steps
  }
}
</script>

<style>
.el-loading-mask,
.preview-goal {
  white-space: pre-line;
}
</style>

<template>
    <el-row>
        <el-col :span="16" :offset="4">
            <el-form ref="task" :model="task" v-loading="loading" :element-loading-text="loadingText" :rules="rules">
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
                <el-form-item
                  v-show="active === 2"
                  v-for="(supervisor, index) in task.supervisors"
                  :label="'Supervisor Address #' + (index + 1)"
                  :key="supervisor.key"
                  :prop="'supervisors.' + index + '.address'"
                  :rules="[
                    { required: true, message: 'Supervisor address can not be null', trigger: 'blur' },
                    { validator: checkEthereumAddress, trigger: 'blur' }
                  ]">
                    <el-input
                        placeholder="Enter a supervisor (eth) address"
                        v-model="supervisor.address">
                        </el-input>
                    <el-button @click="removeSupervisor(supervisor)" type="danger" :disabled="task.supervisors.length <= 1" plain round>Remove</el-button>
                </el-form-item>
                <el-form-item v-show="active === 2">
                    <el-button @click="addSupervisor" type="success" plain round>Add Supervisor</el-button>
                </el-form-item>
                <el-form-item v-show="active >= 3">
                  <el-card class="box-card">
                    <div slot="header" class="clearfix">
                      <span>A task will be created with the following data:</span>
                    </div>
                    <p class="preview-goal">Goal: {{ task.goal }}</p>
                    <p>Deadline: {{ task.deadline | moment('dddd, MMMM Do YYYY') }}</p>
                    <p v-for="(supervisor, index) in task.supervisors" :key="index">Supervisor {{ index }}: <a :href="'https://etherscan.io/address/' + supervisor.address" target="_blank" rel="noopener noreferrer">{{ supervisor.address }}</a></p>
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
import { filter, map } from 'lodash'

export default {
  name: 'Home',

  mixins: [mixin],

  data() {
    return {
      active: 0,
      loading: false,
      loadingText:
        'Please wait until the process is finished successully.\nDo not close or reload this tab!',
      datePickerOptions: {
        disabledDate(date) {
          return date <= new Date()
        }
      },
      task: {
        goal: '',
        deadline: '',
        supervisors: [{ key: 1, address: '' }]
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
        ]
      },
      checkEthereumAddress: (rule, value, callback) => {
        if (this.isAddressAllowed(value)) {
          callback()
        } else {
          callback(new Error('Not a valid Ethereum address'))
        }
      }
    }
  },

  computed: {
    charactersLeft() {
      return 140 - this.task.goal.length
    },
    disabledButton() {
      if (this.active === 0 && this.task.goal.length < 1) {
        return true
      }

      if (this.active === 1 && this.task.deadline.length < 1) {
        return true
      }

      if (
        this.active > 1 &&
        this.task.supervisors.filter(
          supervisor => !this.isAddressAllowed(supervisor.address)
        ).length > 0
      ) {
        return true
      }

      return false
    }
  },

  methods: {
    isAddressAllowed(address) {
      if (!address.length) {
        return false
      }

      address = address.toLowerCase()

      if (address === '0x0000000000000000000000000000000000000000') {
        return false
      }

      if (address === window.web3.eth.coinbase.toLowerCase()) {
        return false
      }

      if (!window.web3.isAddress(address)) {
        return false
      }

      const result = filter(this.task.supervisors, { address: address }).length
      return result === 1
    },
    addSupervisor() {
      this.task.supervisors.push({ key: Date.now(), address: '' })
    },
    removeSupervisor(item) {
      let index = this.task.supervisors.indexOf(item)
      if (index !== -1) {
        this.task.supervisors.splice(index, 1)
      }
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
      this.task = {
        goal: '',
        deadline: '',
        supervisors: [{ key: 1, address: '' }]
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
              //map(this.task.supervisors, 'address'),
              {
                from: window.bc.web3().eth.coinbase,
                value: window.web3.toWei('2', 'finney'),
                gas: 21000
              },
              (err, txHash) => {
                if (err) {
                  this.$message.error(err.message)
                  this.loading = false
                  return false
                } else {
                  Event.$emit('taskCreated', txHash)
                  this.redirectWhenBlockMined()
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
    /**
     * Once the user submitted his registration this funciton checks every 1000 ms
     * if the registration is successfully. Once the user is registered he will be
     * redirected to the profile page.
     *
     * NOTE: in order to check if the user has been registered successfully the
     * function has to check several time because the block can take several
     * minutes to be mined (depending on the configuration of the blockchain you
     * are using).
     */
    redirectWhenBlockMined() {
      this.tmoReg = setInterval(() => {
        if (this.blockchainIsConnected()) {
          window.bc.contract().getContractAddress.call((error, res) => {
            if (error) {
              this.$message.error(error)
            } else if (res) {
              // stopping the setInterval
              clearInterval(this.tmoReg)
              this.reset('task')
              this.$router.push('profile')
            }
          })
        }
      }, 1000)
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

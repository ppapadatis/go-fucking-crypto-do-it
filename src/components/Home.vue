<template>
    <el-row>
        <el-col :span="16" :offset="4">
            <el-form ref="task" :model="task" v-loading="loading" :element-loading-text="loadingText" :rules="rules" @validate="onValidate">
                <el-form-item>
                  <el-steps :active="active" finish-status="success">
                    <el-step title="Step 1" description="Set Goal"></el-step>
                    <el-step title="Step 2" description="Set Deadline"></el-step>
                    <el-step title="Step 3" description="Set Supervisor"></el-step>
                    <el-step title="Step 4" description="Summary"></el-step>
                </el-steps>
                </el-form-item>
                <el-form-item label="What's your goal?" v-show="active === 0" prop="goal">
                    <el-input
                        autofocus
                        minlength="1"
                        maxlength="140"
                        type="textarea"
                        resize="none"
                        :rows="2"
                        placeholder="Enter your goal"
                        v-model="task.goal">
                    </el-input>
                </el-form-item>
                <el-form-item v-show="active === 0">
                  <span class="text-smaller">{{charactersLeft}} characters left.</span>
                </el-form-item>
                <el-form-item label="Set Deadline" v-show="active === 1" prop="deadline">
                    <el-date-picker
                        :picker-options="datePickerOptions"
                        v-model="task.deadline"
                        type="date"
                        placeholder="Pick a date"
                        :editable="false">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="Set a supervisor" v-show="active === 2" prop="supervisor">
                  <el-input
                    placeholder="Enter an ethereum address"
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
                    <p>Supervisor: <a :href="`${this.getEtherscan()}/address/${task.supervisor}`" target="_blank" rel="noopener noreferrer">{{ task.supervisor }}</a></p>
                    <hr/>
                    <p>
                      Set Price
                      <el-input-number v-model="task.stake" :min="minimumStake"></el-input-number>
                    </p>
                </el-card>
                </el-form-item>
                <el-form-item>
                    <el-button native-type="button" type="primary" @click="prev" :disabled="active < 1 || loading" plain round>Previous step</el-button>
                    <el-button :icon="buttonState[active].icon" native-type="submit" type="primary" @click.prevent="next('task')" name="submit" :disabled="disabledButton" :loading="loading" round>
                      {{ buttonState[active].title }}
                    </el-button>
                    <el-button native-type="button" type="warning" @click="reset('task')" :disabled="!task.goal || loading" plain round>Reset</el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>
import mixin from '../utils/mixinViews'

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
      } else if (!window.web3.eth.coinbase) {
        callback(
          new Error('Unlock your metamask account to enable further validation')
        )
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
      buttonState: [
        { icon: 'el-icon-edit', title: 'Set Goal' },
        { icon: 'el-icon-date', title: 'Set Deadline' },
        { icon: 'el-icon-view', title: 'Set Supervisor' },
        { icon: 'el-icon-check', title: 'Go Fucking -Crypto- Do It' },
        { icon: 'el-icon-loading', title: 'Creating Task...' }
      ],
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
          { required: true, message: 'Please input Goal', trigger: 'change' },
          {
            min: 1,
            max: 140,
            message: 'Length should be 1 to 140',
            trigger: 'change'
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
            trigger: 'change'
          },
          { validator: checkEthereumAddress, trigger: 'change' }
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

      if (this.active === 2 && !this.valid['supervisor']) {
        return true
      }

      if (
        this.active === 3 &&
        (!this.task.stake || this.task.stake < this.minimumStake)
      ) {
        return true
      }

      return false
    }
  },

  methods: {
    onValidate(prop, valid) {
      this.valid[prop] = valid
    },
    prev() {
      if (this.active > 0) {
        this.active--
      }
    },
    next() {
      if (this.active < 4) {
        this.active++
      }

      if (this.active === 4) {
        this.loading = true
        this.submitForm('task')
      }
    },
    reset(formName) {
      this.active = 0
      this.loading = false
      this.valid = {
        goal: false,
        deadline: false,
        supervisor: false
      }
      this.$refs[formName].resetFields()
      this.task.stake = this.minimumStake
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
                  this.active = 3
                  return false
                } else {
                  this.$message({
                    message: 'Congrats, this is a success message.',
                    type: 'success'
                  })
                  this.$message({
                    dangerouslyUseHTMLString: true,
                    message: `Congratulations, your task has been set!<br/>You can manually check the transaction progress <a href="${this.getEtherscan()}/tx/${txHash}" target="_blank" rel="noopener noreferrer">here</a>.`,
                    type: 'success'
                  })
                  this.reset('task')
                }
              }
            )
          } catch (error) {
            this.$message.error(error.message)
            this.loading = false
            this.active = 3
            return false
          }
        } else {
          this.$message.error('Form could not be submitted due to errors')
          this.loading = false
          this.active = 3
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
    }
  },

  created() {
    Event.$on('userConnected', this.updateMinimumStake)
    Event.$on('userConnected', () => {
      this.subscribeContractEvent(
        'Created',
        {},
        { fromBlock: 'latest' },
        (err, response) => {
          if (err) {
            console.error(err)
          } else {
            console.log('created event', response)
          }
        }
      )
    })
  }
}
</script>

<style>
.el-loading-mask,
.preview-goal {
  white-space: pre-line;
}
</style>

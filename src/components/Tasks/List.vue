<template>
  <el-row>
    <el-col :span="16" :offset="4" v-loading="fetching" element-loading-text="Please wait while we fetch your tasks...">
      <el-table :data="userTasks" style="width: 100%" :row-class-name="tableRowClassName">
        <el-table-column prop="goal" label="Goal"></el-table-column>
        <el-table-column prop="deadline" label="Deadline"></el-table-column>
        <el-table-column prop="supervisor" label="Supervisor"></el-table-column>
        <el-table-column prop="stake" label="Stake"></el-table-column>
        <el-table-column prop="state" label="State"></el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<script>
import mixin from '../../utils/mixinViews'
import { map } from 'lodash'

export default {
  name: 'TaskList',
  mixins: [mixin],
  data() {
    return {
      fetching: true,
      userTasks: []
    }
  },
  created() {
    Event.$on('userConnected', () => {
      this.getUserTasks('0xA21c5268FA25f7E8EBb54b36329B0F225A292343')
    })
  },
  methods: {
    tableRowClassName({ row, rowIndex }) {
      if ('state' in row && row.state < 2) {
        return 'warning-row'
      } else if ('state' in row && row.state === 2) {
        return 'success-row'
      }
      return ''
    },
    getUserTasks(coinbase) {
      if (!coinbase) {
        this.fetching = false
        return []
      }
      window.bc.contract().getTasksOfOwner.call(coinbase, (err, res) => {
        if (err) {
          this.$message(err.message)
        } else {
          try {
            map(res, (item, index) => {
              window.bc.contract().getTask.call(item.toNumber(), (err, res) => {
                if (!err) {
                  this.userTasks.push({
                    goal: res[0],
                    deadline: res[1].toNumber(),
                    supervisor: res[2],
                    stake: res[3].toNumber(),
                    state: res[4].toNumber()
                  })
                }
              })
            })
          } catch (err) {
            this.$message.error(err)
          } finally {
            this.fetching = false
          }
        }
      })
    }
  }
}
</script>

<style>
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
</style>

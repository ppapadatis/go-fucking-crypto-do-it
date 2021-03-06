<template>
  <v-layout align-center row fill-height wrap>
    <v-flex lg8 offset-lg2 md10 offset-md1 sm12>
      <v-card>
        <v-card-title>
          Watch Tasks
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="userTasks" :search="search" :loading="fetching" :pagination.sync="pagination">
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="items" slot-scope="props">
            <td>
              <router-link :to="{ name: 'WatchTask', params: { id: props.item.taskId }}">{{ props.item.goal }}</router-link>
            </td>
            <td class="text-xs-right">
              {{ props.item.deadline | moment('dddd, MMMM Do YYYY') }}
              <br/>
              {{ props.item.deadline | moment('from') }}
            </td>
            <td class="text-xs-right">
              <a :href="`${etherscanAddress}/address/${props.item.owner}`" target="_blank" rel="noopener noreferrer">
                {{ props.item.owner }}
              </a>
            </td>
            <td class="text-xs-right">{{ props.item.stake | etherprice }}</td>
          </template>
          <v-alert slot="no-results" :value="true" color="warning" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
          <template slot="no-data">
            <v-alert :value="true" color="warning" icon="warning">
              You do not supervise any tasks yet.
            </v-alert>
          </template>
          <template slot="pageText" slot-scope="props">
            Showing {{ props.pageStart }} to {{ props.pageStop }} of {{ props.itemsLength }} entries.
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import mixin from '../../utils/mixinViews'
import { find } from 'lodash'

export default {
  name: 'SuperviseTasks',
  mixins: [mixin],
  data() {
    return {
      fetching: false,
      search: '',
      pagination: {
        rowsPerPage: 10,
        sortBy: 'deadline'
      },
      headers: [
        { text: 'Goal', align: 'left', value: 'goal' },
        { text: 'Deadline', value: 'deadline' },
        { text: 'Owner', value: 'owner' },
        { text: 'Stake', value: 'stake' }
      ],
      userTasks: []
    }
  },
  mounted() {
    Event.$on('userConnected', () => {
      this.subscribeContractEvent(
        'Created',
        { supervisor: window.web3.eth.coinbase },
        { fromBlock: 0, toBlock: 'latest' },
        (err, res) => {
          this.fetching = true

          if (err) {
            window.bc.log(JSON.stringify(err), 'error')
          } else if (res && typeof res.args.taskId !== 'undefined') {
            let taskId = res.args.taskId.toNumber()

            if (!find(this.userTasks, { taskId: taskId })) {
              this.userTasks.push({
                taskId: taskId,
                goal: res.args.goal,
                deadline: res.args.deadline.toNumber(),
                owner: res.args.owner,
                stake: res.args.stake.toNumber()
              })
            }
          }

          this.fetching = false
        }
      )
    })
  },
  unmounted() {
    this.unsubscribeContractEvent('Created')
  }
}
</script>

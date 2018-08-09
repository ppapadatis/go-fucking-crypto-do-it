import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import TaskBase from '@/components/Tasks/Base'
import TaskList from '@/components/Tasks/List'
import SingleTask from '@/components/Tasks/Task'
import SuperviseTasks from '@/components/Tasks/Supervise'
import WatchTask from '@/components/Tasks/Watch'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/my-tasks',
      component: TaskBase,
      children: [
        { path: '', name: 'TaskList', component: TaskList },
        { path: ':id', name: 'SingleTask', component: SingleTask }
      ]
    },
    {
      path: '/watch-tasks',
      component: TaskBase,
      children: [
        { path: '', name: 'SuperviseTasks', component: SuperviseTasks },
        { path: ':id', name: 'WatchTask', component: WatchTask }
      ]
    },
    { path: '*', redirect: '/' }
  ]
})

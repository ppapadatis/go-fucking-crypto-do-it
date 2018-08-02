import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import TaskList from '@/components/Tasks/List'
import SingleTask from '@/components/Tasks/Task'
import PageNotFound from '@/components/PageNotFound'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '',
      name: 'Home',
      component: Home
    },
    {
      path: 'my-tasks',
      name: 'My Tasks',
      component: TaskList,
      children: [{ path: ':id', name: 'Task', component: SingleTask }]
    },
    {
      path: '*',
      component: PageNotFound
    }
  ]
})

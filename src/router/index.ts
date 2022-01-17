import { createRouter, createWebHashHistory, RouteRecordRaw, RouteLocation} from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:tx?',
    name: 'HomeLoadContract',
    component: Home,
    props: route => {
      return { 
        tx: route.params.tx,
        hideToolbar: !!route.query.hideToolbar,
        theme: route.query.theme
      }
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

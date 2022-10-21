import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import GalleryPage from '../views/GalleryPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:tx?',
    name: 'HomeLoadContract',
    component: HomePage,
    props: route => {
      return { 
        tx: route.params.tx,
        hideToolbar: !!route.query.hideToolbar,
        theme: route.query.theme,
        networkParam: route.query.network,
        workspaceParam: route.query.workspace
      }
    }
  },
  {
    path: '/gallery',
    name: 'GalleryPage',
    component: GalleryPage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
